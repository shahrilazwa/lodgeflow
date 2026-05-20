<?php

namespace App\Modules\Unit\Services;

use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use App\Modules\Unit\Models\UnitBed;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UnitService
{
    /**
     * List all units for a property owned by the given owner.
     */
    public function listForProperty(int $propertyId, int $ownerId): Collection
    {
        return Unit::where('property_id', $propertyId)
            ->where('owner_id', $ownerId)
            ->with(['beds', 'facilities', 'coverPhoto'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Find the property and verify it belongs to the owner.
     */
    public function findPropertyForOwner(int $propertyId, int $ownerId): ?Property
    {
        return Property::where('id', $propertyId)
            ->where('owner_id', $ownerId)
            ->first();
    }

    /**
     * Create a new unit under a property.
     */
    public function create(array $data, int $propertyId, int $ownerId): Unit
    {
        return DB::transaction(function () use ($data, $propertyId, $ownerId): Unit {
            $bedData = $this->normalizeBeds($data['beds'] ?? []);
            $occupancy = $this->resolveOccupancy($data, $bedData);

            $unit = Unit::create([
                'owner_id' => $ownerId,
                'property_id' => $propertyId,
                'name' => $data['name'],
                'type' => $data['type'],
                'description' => $data['description'] ?? null,
                'price_per_night' => $data['price_per_night'] ?? null,
                'max_occupancy' => $occupancy['max_occupancy'],
                'occupancy_source' => $occupancy['occupancy_source'],
            ]);

            $this->syncBeds($unit, $bedData);

            if (array_key_exists('facility_ids', $data)) {
                $unit->facilities()->sync($data['facility_ids'] ?? []);
            }

            return $unit->fresh(['beds', 'facilities', 'photos', 'coverPhoto']);
        });
    }

    /**
     * Find a unit by ID, scoped to the given owner.
     */
    public function findForOwner(int $unitId, int $ownerId): ?Unit
    {
        return Unit::where('id', $unitId)
            ->where('owner_id', $ownerId)
            ->with(['beds', 'facilities', 'photos', 'coverPhoto'])
            ->first();
    }

    /**
     * Update an existing unit.
     */
    public function update(Unit $unit, array $data): Unit
    {
        return DB::transaction(function () use ($unit, $data): Unit {
            $bedData = array_key_exists('beds', $data)
                ? $this->normalizeBeds($data['beds'] ?? [])
                : $this->existingBedsToArray($unit);

            $occupancy = $this->resolveOccupancy($data, $bedData, $unit);

            $unit->update(array_filter([
                'name' => $data['name'] ?? null,
                'type' => $data['type'] ?? null,
                'description' => array_key_exists('description', $data) ? $data['description'] : null,
                'price_per_night' => array_key_exists('price_per_night', $data) ? $data['price_per_night'] : null,
                'max_occupancy' => $occupancy['max_occupancy'],
                'occupancy_source' => $occupancy['occupancy_source'],
            ], fn ($value, $key) => in_array($key, ['description', 'price_per_night', 'max_occupancy', 'occupancy_source'], true) ? array_key_exists($key, $data) || in_array($key, ['max_occupancy', 'occupancy_source'], true) : $value !== null, ARRAY_FILTER_USE_BOTH));

            if (array_key_exists('beds', $data)) {
                $this->syncBeds($unit, $bedData);
            }

            if (array_key_exists('facility_ids', $data)) {
                $unit->facilities()->sync($data['facility_ids'] ?? []);
            }

            return $unit->fresh(['beds', 'facilities', 'photos', 'coverPhoto']);
        });
    }

    /**
     * Deactivate a unit.
     */
    public function deactivate(Unit $unit): Unit
    {
        $unit->update(['is_active' => false]);

        return $unit->fresh(['beds', 'facilities', 'photos', 'coverPhoto']);
    }

    /**
     * Activate a unit.
     */
    public function activate(Unit $unit): Unit
    {
        $unit->update(['is_active' => true]);

        return $unit->fresh(['beds', 'facilities', 'photos', 'coverPhoto']);
    }

    /**
     * @param  array<int, array<string, mixed>>  $beds
     * @return array<int, array{bed_type: string, quantity: int, capacity_per_bed: int}>
     */
    private function normalizeBeds(array $beds): array
    {
        return collect($beds)
            ->map(fn (array $bed): array => [
                'bed_type' => (string) $bed['bed_type'],
                'quantity' => (int) $bed['quantity'],
                'capacity_per_bed' => (int) ($bed['capacity_per_bed'] ?? UnitBed::DEFAULT_CAPACITY[$bed['bed_type']] ?? 1),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{bed_type: string, quantity: int, capacity_per_bed: int}>
     */
    private function existingBedsToArray(Unit $unit): array
    {
        $beds = [];

        foreach ($unit->beds as $bed) {
            if (! $bed instanceof UnitBed) {
                continue;
            }

            $beds[] = [
                'bed_type' => $bed->bed_type,
                'quantity' => $bed->quantity,
                'capacity_per_bed' => $bed->capacity_per_bed,
            ];
        }

        return $beds;
    }

    /**
     * @param  array<int, array{bed_type: string, quantity: int, capacity_per_bed: int}>  $beds
     */
    private function syncBeds(Unit $unit, array $beds): void
    {
        $unit->beds()->delete();

        foreach ($beds as $bed) {
            $unit->beds()->create($bed);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, array{bed_type: string, quantity: int, capacity_per_bed: int}>  $beds
     * @return array{max_occupancy: int|null, occupancy_source: string}
     */
    private function resolveOccupancy(array $data, array $beds, ?Unit $existing = null): array
    {
        $source = $data['occupancy_source'] ?? $existing->occupancy_source ?? Unit::OCCUPANCY_SOURCE_CALCULATED;

        if ($source === Unit::OCCUPANCY_SOURCE_MANUAL) {
            return [
                'max_occupancy' => isset($data['max_occupancy']) ? (int) $data['max_occupancy'] : $existing?->max_occupancy,
                'occupancy_source' => Unit::OCCUPANCY_SOURCE_MANUAL,
            ];
        }

        $calculated = collect($beds)->sum(fn (array $bed): int => $bed['quantity'] * $bed['capacity_per_bed']);

        return [
            'max_occupancy' => $calculated > 0 ? $calculated : null,
            'occupancy_source' => Unit::OCCUPANCY_SOURCE_CALCULATED,
        ];
    }
}

<?php

namespace App\Modules\Unit\Services;

use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Database\Eloquent\Collection;

class UnitService
{
    /**
     * List all units for a property owned by the given owner.
     */
    public function listForProperty(int $propertyId, int $ownerId): Collection
    {
        return Unit::where('property_id', $propertyId)
            ->where('owner_id', $ownerId)
            ->with('facilities')
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
        $unit = Unit::create([
            'owner_id' => $ownerId,
            'property_id' => $propertyId,
            'name' => $data['name'],
            'type' => $data['type'],
            'description' => $data['description'] ?? null,
            'price_per_night' => $data['price_per_night'] ?? null,
        ]);

        if (array_key_exists('facility_ids', $data)) {
            $unit->facilities()->sync($data['facility_ids'] ?? []);
        }

        return $unit->fresh(['facilities']);
    }

    /**
     * Find a unit by ID, scoped to the given owner.
     */
    public function findForOwner(int $unitId, int $ownerId): ?Unit
    {
        return Unit::where('id', $unitId)
            ->where('owner_id', $ownerId)
            ->with('facilities')
            ->first();
    }

    /**
     * Update an existing unit.
     */
    public function update(Unit $unit, array $data): Unit
    {
        $unit->update(array_filter([
            'name' => $data['name'] ?? null,
            'type' => $data['type'] ?? null,
            'description' => array_key_exists('description', $data) ? $data['description'] : null,
            'price_per_night' => array_key_exists('price_per_night', $data) ? $data['price_per_night'] : null,
        ], fn ($value, $key) => in_array($key, ['description', 'price_per_night'], true) ? array_key_exists($key, $data) : $value !== null, ARRAY_FILTER_USE_BOTH));

        if (array_key_exists('facility_ids', $data)) {
            $unit->facilities()->sync($data['facility_ids'] ?? []);
        }

        return $unit->fresh(['facilities']);
    }

    /**
     * Deactivate a unit.
     */
    public function deactivate(Unit $unit): Unit
    {
        $unit->update(['is_active' => false]);

        return $unit->fresh(['facilities']);
    }

    /**
     * Activate a unit.
     */
    public function activate(Unit $unit): Unit
    {
        $unit->update(['is_active' => true]);

        return $unit->fresh(['facilities']);
    }
}

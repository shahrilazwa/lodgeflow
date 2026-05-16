<?php

namespace App\Modules\Property\Services;

use App\Modules\Property\Models\Property;
use Illuminate\Database\Eloquent\Collection;

class PropertyService
{
    /**
     * List all properties for the given owner.
     */
    public function listForOwner(int $ownerId): Collection
    {
        return Property::where('owner_id', $ownerId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create a new property for the given owner.
     */
    public function create(array $data, int $ownerId): Property
    {
        $property = Property::create([
            'owner_id' => $ownerId,
            'name' => $data['name'],
            'address' => $data['address'],
            'description' => $data['description'] ?? null,
        ]);

        return $property->fresh();
    }

    /**
     * Find a property by ID, scoped to the given owner.
     * Returns null if not found or not owned by this owner.
     */
    public function findForOwner(int $propertyId, int $ownerId): ?Property
    {
        return Property::where('id', $propertyId)
            ->where('owner_id', $ownerId)
            ->first();
    }

    /**
     * Update an existing property.
     */
    public function update(Property $property, array $data): Property
    {
        $property->update([
            'name' => $data['name'] ?? $property->name,
            'address' => $data['address'] ?? $property->address,
            'description' => array_key_exists('description', $data) ? $data['description'] : $property->description,
        ]);

        return $property->fresh();
    }

    /**
     * Delete a property.
     */
    public function delete(Property $property): void
    {
        $property->delete();
    }

    /**
     * Deactivate a property.
     */
    public function deactivate(Property $property): Property
    {
        $property->update(['is_active' => false]);

        return $property->fresh();
    }

    /**
     * Activate a property.
     */
    public function activate(Property $property): Property
    {
        $property->update(['is_active' => true]);

        return $property->fresh();
    }
}

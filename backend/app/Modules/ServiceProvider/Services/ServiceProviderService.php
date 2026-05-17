<?php

namespace App\Modules\ServiceProvider\Services;

use App\Modules\ServiceProvider\Models\ServiceProvider;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ServiceProviderService
{
    /**
     * List all service providers for the given owner.
     */
    public function listForOwner(int $ownerId): Collection
    {
        return ServiceProvider::where('owner_id', $ownerId)
            ->orderBy('name')
            ->get();
    }

    /**
     * Create a new service provider for the given owner.
     */
    public function create(array $data, int $ownerId): ServiceProvider
    {
        $provider = ServiceProvider::create([
            'owner_id' => $ownerId,
            'name' => $data['name'],
            'service_type' => $data['service_type'],
            'phone' => $data['phone'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return $provider->fresh();
    }

    /**
     * Find a service provider by ID, scoped to the given owner.
     */
    public function findForOwner(int $id, int $ownerId): ?ServiceProvider
    {
        return ServiceProvider::where('id', $id)
            ->where('owner_id', $ownerId)
            ->first();
    }

    /**
     * Update an existing service provider.
     */
    public function update(ServiceProvider $provider, array $data): ServiceProvider
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }
        if (isset($data['service_type'])) {
            $updateData['service_type'] = $data['service_type'];
        }
        if (array_key_exists('phone', $data)) {
            $updateData['phone'] = $data['phone'];
        }
        if (array_key_exists('notes', $data)) {
            $updateData['notes'] = $data['notes'];
        }

        if (! empty($updateData)) {
            $provider->update($updateData);
        }

        return $provider->fresh();
    }

    /**
     * Delete a service provider.
     * Returns false if the provider has linked expenses.
     */
    public function delete(ServiceProvider $provider): bool
    {
        // Check for linked expenses (will be implemented when Expense module exists)
        // For now, check if the expenses table exists and has linked records
        if (Schema::hasTable('expenses')) {
            $hasExpenses = DB::table('expenses')
                ->where('service_provider_id', $provider->id)
                ->exists();

            if ($hasExpenses) {
                return false;
            }
        }

        $provider->delete();

        return true;
    }
}

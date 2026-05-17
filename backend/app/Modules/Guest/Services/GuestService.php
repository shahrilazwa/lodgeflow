<?php

namespace App\Modules\Guest\Services;

use App\Modules\Guest\Models\Guest;
use Illuminate\Database\Eloquent\Collection;

class GuestService
{
    /**
     * List/search guests for the given owner.
     */
    public function listForOwner(int $ownerId, ?string $search = null): Collection
    {
        $query = Guest::where('owner_id', $ownerId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        return $query->orderBy('full_name')->get();
    }

    /**
     * Create a new guest for the given owner.
     */
    public function create(array $data, int $ownerId): Guest
    {
        $guest = Guest::create([
            'owner_id' => $ownerId,
            'full_name' => $data['full_name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'identification_number' => $data['identification_number'] ?? null,
        ]);

        return $guest->fresh();
    }

    /**
     * Find a guest by ID, scoped to the given owner.
     */
    public function findForOwner(int $guestId, int $ownerId): ?Guest
    {
        return Guest::where('id', $guestId)
            ->where('owner_id', $ownerId)
            ->first();
    }

    /**
     * Update an existing guest.
     */
    public function update(Guest $guest, array $data): Guest
    {
        $updateData = [];

        if (isset($data['full_name'])) {
            $updateData['full_name'] = $data['full_name'];
        }
        if (isset($data['phone'])) {
            $updateData['phone'] = $data['phone'];
        }
        if (array_key_exists('email', $data)) {
            $updateData['email'] = $data['email'];
        }
        if (array_key_exists('identification_number', $data)) {
            $updateData['identification_number'] = $data['identification_number'];
        }

        if (! empty($updateData)) {
            $guest->update($updateData);
        }

        return $guest->fresh();
    }
}

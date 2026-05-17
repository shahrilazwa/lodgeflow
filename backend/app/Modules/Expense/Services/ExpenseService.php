<?php

namespace App\Modules\Expense\Services;

use App\Modules\Booking\Models\Booking;
use App\Modules\Expense\Models\Expense;
use App\Modules\Property\Models\Property;
use App\Modules\ServiceProvider\Models\ServiceProvider;
use App\Modules\Unit\Models\Unit;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class ExpenseService
{
    /**
     * List expenses for the given owner with optional filters.
     */
    public function listForOwner(int $ownerId, array $filters = []): Collection
    {
        $query = Expense::where('owner_id', $ownerId);

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (! empty($filters['property_id'])) {
            $query->where('property_id', $filters['property_id']);
        }
        if (! empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }
        if (! empty($filters['from_date'])) {
            $query->where('date', '>=', $filters['from_date']);
        }
        if (! empty($filters['to_date'])) {
            $query->where('date', '<=', $filters['to_date']);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    /**
     * Create a new expense. Validates all linked entities belong to the same owner.
     */
    public function create(array $data, int $ownerId): Expense|JsonResponse
    {
        // Validate property belongs to owner (required)
        $property = Property::where('id', $data['property_id'])
            ->where('owner_id', $ownerId)
            ->first();

        if (! $property) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => ['property_id' => ['The selected property does not belong to you.']],
            ], 422);
        }

        // Validate optional links
        $validationError = $this->validateOptionalLinks($data, $ownerId, $property->id);
        if ($validationError) {
            return $validationError;
        }

        $expense = Expense::create([
            'owner_id' => $ownerId,
            'property_id' => $data['property_id'],
            'unit_id' => $data['unit_id'] ?? null,
            'booking_id' => $data['booking_id'] ?? null,
            'service_provider_id' => $data['service_provider_id'] ?? null,
            'cleaning_task_id' => $data['cleaning_task_id'] ?? null,
            'maintenance_task_id' => $data['maintenance_task_id'] ?? null,
            'amount' => $data['amount'],
            'date' => $data['date'],
            'category' => $data['category'],
            'description' => $data['description'] ?? null,
        ]);

        return $expense->fresh();
    }

    /**
     * Find an expense by ID, scoped to the given owner.
     */
    public function findForOwner(int $id, int $ownerId): ?Expense
    {
        return Expense::where('id', $id)
            ->where('owner_id', $ownerId)
            ->first();
    }

    /**
     * Update an existing expense.
     */
    public function update(Expense $expense, array $data, int $ownerId): Expense|JsonResponse
    {
        // If property_id is being changed, validate it
        if (isset($data['property_id']) && $data['property_id'] != $expense->property_id) {
            $property = Property::where('id', $data['property_id'])
                ->where('owner_id', $ownerId)
                ->first();

            if (! $property) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => ['property_id' => ['The selected property does not belong to you.']],
                ], 422);
            }
        }

        $propertyId = $data['property_id'] ?? $expense->property_id;

        // Validate optional links if any are being changed
        $validationError = $this->validateOptionalLinks($data, $ownerId, $propertyId);
        if ($validationError) {
            return $validationError;
        }

        $updateData = [];
        if (isset($data['property_id'])) {
            $updateData['property_id'] = $data['property_id'];
        }
        if (isset($data['amount'])) {
            $updateData['amount'] = $data['amount'];
        }
        if (isset($data['date'])) {
            $updateData['date'] = $data['date'];
        }
        if (isset($data['category'])) {
            $updateData['category'] = $data['category'];
        }
        if (array_key_exists('description', $data)) {
            $updateData['description'] = $data['description'];
        }
        if (array_key_exists('unit_id', $data)) {
            $updateData['unit_id'] = $data['unit_id'];
        }
        if (array_key_exists('booking_id', $data)) {
            $updateData['booking_id'] = $data['booking_id'];
        }
        if (array_key_exists('service_provider_id', $data)) {
            $updateData['service_provider_id'] = $data['service_provider_id'];
        }
        if (array_key_exists('cleaning_task_id', $data)) {
            $updateData['cleaning_task_id'] = $data['cleaning_task_id'];
        }
        if (array_key_exists('maintenance_task_id', $data)) {
            $updateData['maintenance_task_id'] = $data['maintenance_task_id'];
        }

        if (! empty($updateData)) {
            $expense->update($updateData);
        }

        return $expense->fresh();
    }

    /**
     * Delete an expense.
     */
    public function delete(Expense $expense): void
    {
        $expense->delete();
    }

    /**
     * Validate optional linked entities belong to the same owner and property hierarchy.
     */
    private function validateOptionalLinks(array $data, int $ownerId, int $propertyId): ?JsonResponse
    {
        $errors = [];

        // Validate unit belongs to the linked property and owner
        if (! empty($data['unit_id'])) {
            $unit = Unit::where('id', $data['unit_id'])
                ->where('owner_id', $ownerId)
                ->where('property_id', $propertyId)
                ->first();

            if (! $unit) {
                $errors['unit_id'] = ['The selected unit does not belong to the linked property.'];
            }
        }

        // Validate booking belongs to owner
        if (! empty($data['booking_id'])) {
            $booking = Booking::where('id', $data['booking_id'])
                ->where('owner_id', $ownerId)
                ->first();

            if (! $booking) {
                $errors['booking_id'] = ['The selected booking does not belong to you.'];
            }
        }

        // Validate service provider belongs to owner
        if (! empty($data['service_provider_id'])) {
            $provider = ServiceProvider::where('id', $data['service_provider_id'])
                ->where('owner_id', $ownerId)
                ->first();

            if (! $provider) {
                $errors['service_provider_id'] = ['The selected service provider does not belong to you.'];
            }
        }

        // cleaning_task_id and maintenance_task_id validation will be added in v0.5.0
        // when those tables exist. For now, these columns accept any integer or null.

        if (! empty($errors)) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $errors,
            ], 422);
        }

        return null;
    }
}

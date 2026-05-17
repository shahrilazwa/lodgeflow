<?php

namespace App\Modules\Booking\Services;

use App\Modules\Booking\Models\Booking;
use App\Modules\CleaningTask\Jobs\CreateCleaningTaskJob;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class BookingService
{
    /**
     * List bookings for the given owner with optional filters.
     */
    public function listForOwner(int $ownerId, array $filters = []): Collection
    {
        $query = Booking::where('owner_id', $ownerId)
            ->with(['unit', 'guest']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (! empty($filters['from_date'])) {
            $query->where('check_in_date', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->where('check_in_date', '<=', $filters['to_date']);
        }

        return $query->orderBy('check_in_date', 'desc')->get();
    }

    /**
     * Create a new booking. Validates unit is active and no date overlap.
     * Returns the booking or an error response.
     */
    public function create(array $data, int $ownerId): Booking|JsonResponse
    {
        // Verify unit belongs to owner and is active
        $unit = Unit::where('id', $data['unit_id'])
            ->where('owner_id', $ownerId)
            ->first();

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        if (! $unit->is_active) {
            return response()->json([
                'message' => 'Unit is not available for booking.',
                'errors' => ['unit_id' => ['The selected unit is inactive.']],
            ], 422);
        }

        // Verify unit's property is active
        $property = Property::where('id', $unit->property_id)
            ->where('owner_id', $ownerId)
            ->first();

        if ($property && ! $property->is_active) {
            return response()->json([
                'message' => 'Unit is not available for booking.',
                'errors' => ['unit_id' => ['The unit belongs to an inactive property.']],
            ], 422);
        }

        // Verify guest belongs to owner
        $guestExists = \App\Modules\Guest\Models\Guest::where('id', $data['guest_id'])
            ->where('owner_id', $ownerId)
            ->exists();

        if (! $guestExists) {
            return response()->json(['message' => 'Guest not found.'], 404);
        }

        // Check date overlap
        $overlap = $this->findOverlap(
            $data['unit_id'],
            $data['check_in_date'],
            $data['check_out_date'],
            null,
        );

        if ($overlap) {
            return response()->json([
                'message' => 'Booking dates overlap with an existing booking.',
                'conflicting_booking' => [
                    'id' => $overlap->id,
                    'check_in_date' => $overlap->check_in_date->format('Y-m-d'),
                    'check_out_date' => $overlap->check_out_date->format('Y-m-d'),
                ],
            ], 409);
        }

        $booking = Booking::create([
            'owner_id' => $ownerId,
            'unit_id' => $data['unit_id'],
            'guest_id' => $data['guest_id'],
            'check_in_date' => $data['check_in_date'],
            'check_out_date' => $data['check_out_date'],
            'total_amount' => $data['total_amount'],
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => 'unpaid',
            'net_paid_amount' => 0.00,
        ]);

        return $booking->fresh()->load(['unit', 'guest']);
    }

    /**
     * Find a booking by ID, scoped to the given owner.
     */
    public function findForOwner(int $bookingId, int $ownerId): ?Booking
    {
        return Booking::where('id', $bookingId)
            ->where('owner_id', $ownerId)
            ->with(['unit', 'guest'])
            ->first();
    }

    /**
     * Update a booking (only when status is confirmed).
     */
    public function update(Booking $booking, array $data, int $ownerId): Booking|JsonResponse
    {
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return response()->json([
                'message' => 'Booking can only be updated when status is confirmed.',
                'current_status' => $booking->status,
            ], 422);
        }

        $checkIn = $data['check_in_date'] ?? $booking->check_in_date->format('Y-m-d');
        $checkOut = $data['check_out_date'] ?? $booking->check_out_date->format('Y-m-d');

        // Check date overlap if dates changed
        if (isset($data['check_in_date']) || isset($data['check_out_date'])) {
            $overlap = $this->findOverlap(
                $booking->unit_id,
                $checkIn,
                $checkOut,
                $booking->id,
            );

            if ($overlap) {
                return response()->json([
                    'message' => 'Booking dates overlap with an existing booking.',
                    'conflicting_booking' => [
                        'id' => $overlap->id,
                        'check_in_date' => $overlap->check_in_date->format('Y-m-d'),
                        'check_out_date' => $overlap->check_out_date->format('Y-m-d'),
                    ],
                ], 409);
            }
        }

        $updateData = [];
        if (isset($data['check_in_date'])) {
            $updateData['check_in_date'] = $data['check_in_date'];
        }
        if (isset($data['check_out_date'])) {
            $updateData['check_out_date'] = $data['check_out_date'];
        }
        if (isset($data['total_amount'])) {
            $updateData['total_amount'] = $data['total_amount'];
        }

        if (! empty($updateData)) {
            $booking->update($updateData);
        }

        return $booking->fresh()->load(['unit', 'guest']);
    }

    /**
     * Check in a booking (confirmed → checked_in).
     */
    public function checkIn(Booking $booking): Booking|JsonResponse
    {
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return response()->json([
                'message' => 'Booking can only be checked in from confirmed status.',
                'current_status' => $booking->status,
            ], 422);
        }

        $booking->update(['status' => Booking::STATUS_CHECKED_IN]);

        return $booking->fresh()->load(['unit', 'guest']);
    }

    /**
     * Check out a booking (checked_in → checked_out).
     * Dispatches CreateCleaningTaskJob (placeholder for now until Task 5.1).
     */
    public function checkOut(Booking $booking): Booking|JsonResponse
    {
        if ($booking->status !== Booking::STATUS_CHECKED_IN) {
            return response()->json([
                'message' => 'Booking can only be checked out from checked_in status.',
                'current_status' => $booking->status,
            ], 422);
        }

        $booking->update(['status' => Booking::STATUS_CHECKED_OUT]);

        // Dispatch background job to create cleaning task
        CreateCleaningTaskJob::dispatch($booking->id, $booking->unit_id, $booking->owner_id)
            ->onQueue('cleaning-tasks');

        return $booking->fresh()->load(['unit', 'guest']);
    }

    /**
     * Cancel a booking (confirmed or checked_in → cancelled).
     */
    public function cancel(Booking $booking): Booking|JsonResponse
    {
        if (! in_array($booking->status, [Booking::STATUS_CONFIRMED, Booking::STATUS_CHECKED_IN])) {
            return response()->json([
                'message' => 'Booking can only be cancelled from confirmed or checked_in status.',
                'current_status' => $booking->status,
            ], 422);
        }

        $booking->update(['status' => Booking::STATUS_CANCELLED]);

        return $booking->fresh()->load(['unit', 'guest']);
    }

    /**
     * Find an overlapping booking for the given unit and date range.
     * Excludes the given booking ID (for updates).
     */
    private function findOverlap(int $unitId, string $checkIn, string $checkOut, ?int $excludeId): ?Booking
    {
        $query = Booking::where('unit_id', $unitId)
            ->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_CHECKED_IN])
            ->where('check_in_date', '<', $checkOut)
            ->where('check_out_date', '>', $checkIn);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->first();
    }
}

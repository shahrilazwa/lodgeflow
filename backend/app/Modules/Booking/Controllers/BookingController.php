<?php

namespace App\Modules\Booking\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Requests\StoreBookingRequest;
use App\Modules\Booking\Requests\UpdateBookingRequest;
use App\Modules\Booking\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
    ) {}

    /**
     * List bookings for the authenticated owner.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->query('status'),
            'unit_id' => $request->query('unit_id'),
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
        ];

        $bookings = $this->bookingService->listForOwner($request->user()->id, $filters);

        return response()->json(['data' => $bookings]);
    }

    /**
     * Create a new booking.
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $result = $this->bookingService->create(
            $request->validated(),
            $request->user()->id,
        );

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result], 201);
    }

    /**
     * Show a single booking.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $booking = $this->bookingService->findForOwner($id, $request->user()->id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json(['data' => $booking]);
    }

    /**
     * Update a booking (only when confirmed).
     */
    public function update(UpdateBookingRequest $request, int $id): JsonResponse
    {
        $booking = $this->bookingService->findForOwner($id, $request->user()->id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $result = $this->bookingService->update($booking, $request->validated(), $request->user()->id);

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result]);
    }

    /**
     * Check in a booking.
     */
    public function checkIn(Request $request, int $id): JsonResponse
    {
        $booking = $this->bookingService->findForOwner($id, $request->user()->id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $result = $this->bookingService->checkIn($booking);

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result]);
    }

    /**
     * Check out a booking.
     */
    public function checkOut(Request $request, int $id): JsonResponse
    {
        $booking = $this->bookingService->findForOwner($id, $request->user()->id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $result = $this->bookingService->checkOut($booking);

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result]);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $booking = $this->bookingService->findForOwner($id, $request->user()->id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $result = $this->bookingService->cancel($booking);

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result]);
    }
}

<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payment\Requests\StorePaymentRequest;
use App\Modules\Payment\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    /**
     * List all payments for a booking.
     */
    public function index(Request $request, int $bookingId): JsonResponse
    {
        $booking = $this->paymentService->findBookingForOwner($bookingId, $request->user()->id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $payments = $this->paymentService->listForBooking($bookingId, $request->user()->id);

        return response()->json(['data' => $payments]);
    }

    /**
     * Record a payment or refund against a booking.
     */
    public function store(StorePaymentRequest $request, int $bookingId): JsonResponse
    {
        $booking = $this->paymentService->findBookingForOwner($bookingId, $request->user()->id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $payment = $this->paymentService->create(
            $request->validated(),
            $bookingId,
            $request->user()->id,
        );

        return response()->json(['data' => $payment], 201);
    }

    /**
     * Delete a payment record.
     */
    public function destroy(Request $request, int $bookingId, int $id): JsonResponse
    {
        $booking = $this->paymentService->findBookingForOwner($bookingId, $request->user()->id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $payment = $this->paymentService->findForOwner($id, $request->user()->id);

        if (! $payment || $payment->booking_id !== $bookingId) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        $this->paymentService->delete($payment);

        return response()->json(['message' => 'Payment deleted.']);
    }
}

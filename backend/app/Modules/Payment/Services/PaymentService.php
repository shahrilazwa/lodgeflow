<?php

namespace App\Modules\Payment\Services;

use App\Modules\Booking\Models\Booking;
use App\Modules\Payment\Models\Payment;
use Illuminate\Database\Eloquent\Collection;

class PaymentService
{
    /**
     * List all payments for an owner with optional filters.
     */
    public function listForOwner(int $ownerId, array $filters = []): Collection
    {
        $query = Payment::where('owner_id', $ownerId)
            ->with(['booking.guest', 'booking.unit']);

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (! empty($filters['booking_id'])) {
            $query->where('booking_id', $filters['booking_id']);
        }

        if (! empty($filters['from_date'])) {
            $query->where('payment_date', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->where('payment_date', '<=', $filters['to_date']);
        }

        return $query->orderBy('payment_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * List all payments for a booking, scoped to the given owner.
     */
    public function listForBooking(int $bookingId, int $ownerId): Collection
    {
        return Payment::where('booking_id', $bookingId)
            ->where('owner_id', $ownerId)
            ->orderBy('payment_date', 'desc')
            ->get();
    }

    /**
     * Record a payment or refund against a booking.
     */
    public function create(array $data, int $bookingId, int $ownerId): Payment
    {
        $payment = Payment::create([
            'owner_id' => $ownerId,
            'booking_id' => $bookingId,
            'type' => $data['type'],
            'amount' => $data['amount'],
            'payment_date' => $data['payment_date'],
            'payment_method' => $data['payment_method'],
        ]);

        $this->recalculateBookingPaymentStatus($bookingId);

        return $payment->fresh();
    }

    /**
     * Delete a payment record and recalculate booking status.
     */
    public function delete(Payment $payment): void
    {
        $bookingId = $payment->booking_id;
        $payment->delete();
        $this->recalculateBookingPaymentStatus($bookingId);
    }

    /**
     * Find a payment by ID, scoped to the given owner.
     */
    public function findForOwner(int $paymentId, int $ownerId): ?Payment
    {
        return Payment::where('id', $paymentId)
            ->where('owner_id', $ownerId)
            ->first();
    }

    /**
     * Find a booking by ID, scoped to the given owner.
     */
    public function findBookingForOwner(int $bookingId, int $ownerId): ?Booking
    {
        return Booking::where('id', $bookingId)
            ->where('owner_id', $ownerId)
            ->first();
    }

    /**
     * Recalculate the booking's net_paid_amount and payment_status.
     *
     * net_paid_amount = SUM(payment amounts) - SUM(refund amounts)
     *
     * Payment status rules:
     * - net = 0 → unpaid
     * - 0 < net < total → partial
     * - net = total → paid
     * - net > total → overpaid
     * - net < 0 → refunded
     */
    public function recalculateBookingPaymentStatus(int $bookingId): void
    {
        $booking = Booking::find($bookingId);
        if (! $booking) {
            return;
        }

        $payments = Payment::where('booking_id', $bookingId)->get();

        $totalPayments = $payments
            ->where('type', Payment::TYPE_PAYMENT)
            ->sum('amount');

        $totalRefunds = $payments
            ->where('type', Payment::TYPE_REFUND)
            ->sum('amount');

        $netPaid = bccomp((string) $totalPayments, (string) $totalRefunds, 2) >= 0
            ? bcsub((string) $totalPayments, (string) $totalRefunds, 2)
            : '-'.bcsub((string) $totalRefunds, (string) $totalPayments, 2);

        $netPaidFloat = (float) $netPaid;
        $totalAmount = (float) $booking->total_amount;

        // Determine payment status
        if ($netPaidFloat < 0) {
            $paymentStatus = 'refunded';
        } elseif (bccomp($netPaid, '0.00', 2) === 0) {
            $paymentStatus = 'unpaid';
        } elseif (bccomp($netPaid, (string) $totalAmount, 2) < 0) {
            $paymentStatus = 'partial';
        } elseif (bccomp($netPaid, (string) $totalAmount, 2) === 0) {
            $paymentStatus = 'paid';
        } else {
            $paymentStatus = 'overpaid';
        }

        $booking->update([
            'net_paid_amount' => $netPaidFloat,
            'payment_status' => $paymentStatus,
        ]);
    }
}

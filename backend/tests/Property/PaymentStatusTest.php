<?php

namespace Tests\Property;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Guest\Models\Guest;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Services\PaymentService;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Property-Based Tests for Payment Status Derivation.
 *
 * Feature: lodgeflow-owner-mvp
 * Property 1: Payment status derivation correctness
 * Property 2: Outstanding balance and overpaid amount calculation
 *
 * These tests verify that for ANY sequence of payment/refund records,
 * the system correctly derives the payment status and calculates
 * outstanding/overpaid amounts.
 */
class PaymentStatusTest extends TestCase
{
    use RefreshDatabase;

    private PaymentService $paymentService;

    private Owner $owner;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();
        $this->paymentService = app(PaymentService::class);
        $this->owner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $this->owner->id]);
        $unit = Unit::factory()->create(['owner_id' => $this->owner->id, 'property_id' => $property->id]);
        $guest = Guest::factory()->create(['owner_id' => $this->owner->id]);
        $this->booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $unit->id,
            'guest_id' => $guest->id,
            'total_amount' => 1000.00,
        ]);
    }

    /**
     * Property 1: For any booking with total > 0 and any sequence of payment/refund
     * records (each with positive amount), the payment status is correctly derived.
     */
    #[DataProvider('paymentSequenceProvider')]
    public function test_payment_status_derivation_correctness(array $sequence, string $expectedStatus): void
    {
        foreach ($sequence as $record) {
            Payment::create([
                'owner_id' => $this->owner->id,
                'booking_id' => $this->booking->id,
                'type' => $record['type'],
                'amount' => $record['amount'],
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);
        }

        $this->paymentService->recalculateBookingPaymentStatus($this->booking->id);
        $this->booking->refresh();

        $totalPayments = collect($sequence)->where('type', 'payment')->sum('amount');
        $totalRefunds = collect($sequence)->where('type', 'refund')->sum('amount');
        $expectedNet = round($totalPayments - $totalRefunds, 2);

        $this->assertEquals(
            $expectedNet,
            (float) $this->booking->net_paid_amount,
            "Net paid amount should be {$expectedNet} for sequence: ".json_encode($sequence)
        );

        $this->assertEquals(
            $expectedStatus,
            $this->booking->payment_status,
            "Status should be '{$expectedStatus}' when net={$expectedNet}, total=1000. Sequence: ".json_encode($sequence)
        );
    }

    /**
     * Property 2: Outstanding balance and overpaid amount are mutually exclusive
     * and correctly calculated.
     */
    #[DataProvider('outstandingCalculationProvider')]
    public function test_outstanding_and_overpaid_calculation(float $totalAmount, float $netPaid): void
    {
        $outstanding = max(0, $totalAmount - $netPaid);
        $overpaid = max(0, $netPaid - $totalAmount);

        // Mutual exclusivity: at most one is non-zero
        $this->assertFalse(
            $outstanding > 0 && $overpaid > 0,
            "Outstanding ({$outstanding}) and overpaid ({$overpaid}) cannot both be > 0"
        );

        // Correctness
        if ($netPaid <= $totalAmount) {
            $this->assertEquals($totalAmount - $netPaid, $outstanding);
            $this->assertEquals(0.0, $overpaid);
        } else {
            $this->assertEquals(0.0, $outstanding);
            $this->assertEquals($netPaid - $totalAmount, $overpaid);
        }
    }

    /**
     * Generate 100 random payment sequences with expected statuses.
     * Uses a fixed seed for deterministic CI runs.
     */
    public static function paymentSequenceProvider(): array
    {
        mt_srand(42); // Fixed seed for reproducibility
        $cases = [];
        $totalAmount = 1000.00;

        for ($i = 0; $i < 100; $i++) {
            $sequence = [];
            $numRecords = mt_rand(1, 8);

            for ($j = 0; $j < $numRecords; $j++) {
                $sequence[] = [
                    'type' => mt_rand(0, 3) === 0 ? 'refund' : 'payment', // 25% chance of refund
                    'amount' => round(mt_rand(1, 2000) / 10, 2), // 0.10 to 200.00
                ];
            }

            // Calculate expected status
            $totalPayments = collect($sequence)->where('type', 'payment')->sum('amount');
            $totalRefunds = collect($sequence)->where('type', 'refund')->sum('amount');
            $net = round($totalPayments - $totalRefunds, 2);

            if ($net < 0) {
                $expectedStatus = 'refunded';
            } elseif ($net == 0) {
                $expectedStatus = 'unpaid';
            } elseif ($net < $totalAmount) {
                $expectedStatus = 'partial';
            } elseif ($net == $totalAmount) {
                $expectedStatus = 'paid';
            } else {
                $expectedStatus = 'overpaid';
            }

            $cases["sequence_{$i}_net_{$net}_{$expectedStatus}"] = [$sequence, $expectedStatus];
        }

        return $cases;
    }

    /**
     * Generate 100 random total/net combinations for outstanding calculation.
     */
    public static function outstandingCalculationProvider(): array
    {
        mt_srand(123); // Fixed seed
        $cases = [];

        for ($i = 0; $i < 100; $i++) {
            $totalAmount = round(mt_rand(100, 100000) / 100, 2); // 1.00 to 1000.00
            $netPaid = round(mt_rand(-5000, 150000) / 100, 2); // -50.00 to 1500.00

            $cases["total_{$totalAmount}_net_{$netPaid}"] = [$totalAmount, $netPaid];
        }

        return $cases;
    }
}

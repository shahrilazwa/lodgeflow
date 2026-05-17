<?php

namespace Tests\Feature\Payment;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Guest\Models\Guest;
use App\Modules\Payment\Models\Payment;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;
    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $this->owner->id]);
        $unit = Unit::factory()->create(['owner_id' => $this->owner->id, 'property_id' => $property->id]);
        $guest = Guest::factory()->create(['owner_id' => $this->owner->id]);
        $this->booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $unit->id,
            'guest_id' => $guest->id,
            'total_amount' => 500.00,
        ]);
    }

    // -------------------------------------------------------------------------
    // Record Payment
    // -------------------------------------------------------------------------

    public function test_owner_can_record_payment(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 200.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'payment')
            ->assertJsonPath('data.amount', '200.00')
            ->assertJsonPath('data.payment_method', 'cash');

        $this->assertDatabaseHas('payments', [
            'booking_id' => $this->booking->id,
            'type' => 'payment',
            'amount' => 200.00,
        ]);
    }

    public function test_owner_can_record_refund(): void
    {
        // First record a payment
        Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $this->booking->id,
            'type' => 'payment',
            'amount' => 300.00,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'refund',
                'amount' => 100.00,
                'payment_date' => '2026-06-02',
                'payment_method' => 'bank_transfer',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'refund')
            ->assertJsonPath('data.amount', '100.00');
    }

    public function test_record_payment_requires_valid_data(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type', 'amount', 'payment_date', 'payment_method']);
    }

    public function test_record_payment_rejects_zero_amount(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 0,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_record_payment_rejects_negative_amount(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => -50.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_record_payment_rejects_invalid_type(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'invalid',
                'amount' => 100.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_record_payment_rejects_invalid_method(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 100.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'bitcoin',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['payment_method']);
    }

    public function test_cannot_record_payment_on_other_owners_booking(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        $otherGuest = Guest::factory()->create(['owner_id' => $otherOwner->id]);
        $otherBooking = Booking::factory()->create([
            'owner_id' => $otherOwner->id,
            'unit_id' => $otherUnit->id,
            'guest_id' => $otherGuest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$otherBooking->id}/payments", [
                'type' => 'payment',
                'amount' => 100.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Payment Status Recalculation
    // -------------------------------------------------------------------------

    public function test_payment_sets_status_to_partial(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 200.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $this->booking->refresh();
        $this->assertEquals('partial', $this->booking->payment_status);
        $this->assertEquals('200.00', $this->booking->net_paid_amount);
    }

    public function test_full_payment_sets_status_to_paid(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 500.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $this->booking->refresh();
        $this->assertEquals('paid', $this->booking->payment_status);
        $this->assertEquals('500.00', $this->booking->net_paid_amount);
    }

    public function test_overpayment_sets_status_to_overpaid(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 600.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $this->booking->refresh();
        $this->assertEquals('overpaid', $this->booking->payment_status);
        $this->assertEquals('600.00', $this->booking->net_paid_amount);
    }

    public function test_refund_exceeding_payments_sets_status_to_refunded(): void
    {
        // Record a payment of 100
        Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $this->booking->id,
            'type' => 'payment',
            'amount' => 100.00,
        ]);

        // Record a refund of 200 (net = -100)
        $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'refund',
                'amount' => 200.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $this->booking->refresh();
        $this->assertEquals('refunded', $this->booking->payment_status);
        $this->assertTrue((float) $this->booking->net_paid_amount < 0);
    }

    public function test_multiple_payments_accumulate_correctly(): void
    {
        // Two payments totaling 500 (full amount)
        $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 300.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 200.00,
                'payment_date' => '2026-06-02',
                'payment_method' => 'bank_transfer',
            ]);

        $this->booking->refresh();
        $this->assertEquals('paid', $this->booking->payment_status);
        $this->assertEquals('500.00', $this->booking->net_paid_amount);
    }

    public function test_payment_then_refund_recalculates_correctly(): void
    {
        // Pay 500 (full), then refund 200 → net = 300 (partial)
        $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'payment',
                'amount' => 500.00,
                'payment_date' => '2026-06-01',
                'payment_method' => 'cash',
            ]);

        $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/bookings/{$this->booking->id}/payments", [
                'type' => 'refund',
                'amount' => 200.00,
                'payment_date' => '2026-06-02',
                'payment_method' => 'cash',
            ]);

        $this->booking->refresh();
        $this->assertEquals('partial', $this->booking->payment_status);
        $this->assertEquals('300.00', $this->booking->net_paid_amount);
    }

    // -------------------------------------------------------------------------
    // List Payments
    // -------------------------------------------------------------------------

    public function test_owner_can_list_payments_for_booking(): void
    {
        Payment::factory()->count(3)->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $this->booking->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/bookings/{$this->booking->id}/payments");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_cannot_list_payments_for_other_owners_booking(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        $otherGuest = Guest::factory()->create(['owner_id' => $otherOwner->id]);
        $otherBooking = Booking::factory()->create([
            'owner_id' => $otherOwner->id,
            'unit_id' => $otherUnit->id,
            'guest_id' => $otherGuest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/bookings/{$otherBooking->id}/payments");

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Delete Payment
    // -------------------------------------------------------------------------

    public function test_owner_can_delete_payment(): void
    {
        $payment = Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $this->booking->id,
            'type' => 'payment',
            'amount' => 200.00,
        ]);

        // Manually trigger recalculation so booking has partial status
        app(\App\Modules\Payment\Services\PaymentService::class)
            ->recalculateBookingPaymentStatus($this->booking->id);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/bookings/{$this->booking->id}/payments/{$payment->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Payment deleted.');

        $this->assertDatabaseMissing('payments', ['id' => $payment->id]);

        // After deletion, booking should be back to unpaid
        $this->booking->refresh();
        $this->assertEquals('unpaid', $this->booking->payment_status);
        $this->assertEquals('0.00', $this->booking->net_paid_amount);
    }

    public function test_cannot_delete_other_owners_payment(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        $otherGuest = Guest::factory()->create(['owner_id' => $otherOwner->id]);
        $otherBooking = Booking::factory()->create([
            'owner_id' => $otherOwner->id,
            'unit_id' => $otherUnit->id,
            'guest_id' => $otherGuest->id,
        ]);
        $payment = Payment::factory()->create([
            'owner_id' => $otherOwner->id,
            'booking_id' => $otherBooking->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/bookings/{$otherBooking->id}/payments/{$payment->id}");

        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_payments(): void
    {
        $response = $this->getJson("/api/v1/bookings/{$this->booking->id}/payments");

        $response->assertStatus(401);
    }
}

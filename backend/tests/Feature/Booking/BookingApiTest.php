<?php

namespace Tests\Feature\Booking;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Guest\Models\Guest;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    private Property $property;

    private Unit $unit;

    private Guest $guest;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = Owner::factory()->create();
        $this->property = Property::factory()->create(['owner_id' => $this->owner->id]);
        $this->unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);
        $this->guest = Guest::factory()->create(['owner_id' => $this->owner->id]);
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_owner_can_create_booking(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-01',
                'check_out_date' => '2026-06-03',
                'total_amount' => 200.00,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', Booking::STATUS_PENDING_CUSTOMER_CONFIRMATION)
            ->assertJsonPath('data.payment_status', 'unpaid')
            ->assertJsonPath('data.unit_id', $this->unit->id)
            ->assertJsonPath('data.guest_id', $this->guest->id)
            ->assertJsonPath('data.allow_customer_cancellation', false)
            ->assertJsonPath('data.allow_customer_modification', false);
    }

    public function test_owner_can_create_booking_with_customer_policy_flags(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-01',
                'check_out_date' => '2026-06-03',
                'total_amount' => 200.00,
                'allow_customer_cancellation' => true,
                'allow_customer_modification' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.allow_customer_cancellation', true)
            ->assertJsonPath('data.allow_customer_modification', true);
    }

    public function test_create_booking_requires_valid_data(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['unit_id', 'guest_id', 'check_in_date', 'check_out_date', 'total_amount']);
    }

    public function test_create_booking_rejects_checkout_before_checkin(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-05',
                'check_out_date' => '2026-06-03',
                'total_amount' => 200.00,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['check_out_date']);
    }

    public function test_create_booking_rejects_same_day_checkout(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-05',
                'check_out_date' => '2026-06-05',
                'total_amount' => 200.00,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['check_out_date']);
    }

    public function test_create_booking_rejects_overlapping_dates(): void
    {
        Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'check_in_date' => '2026-06-01',
            'check_out_date' => '2026-06-05',
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-03',
                'check_out_date' => '2026-06-07',
                'total_amount' => 300.00,
            ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Booking dates overlap with an existing booking.');
    }

    public function test_create_booking_rejects_overlap_with_pending_customer_confirmation_booking(): void
    {
        Booking::factory()->pendingCustomerConfirmation()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'check_in_date' => '2026-06-01',
            'check_out_date' => '2026-06-05',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-03',
                'check_out_date' => '2026-06-07',
                'total_amount' => 300.00,
            ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Booking dates overlap with an existing booking.');
    }

    public function test_create_booking_allows_adjacent_dates(): void
    {
        Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'check_in_date' => '2026-06-01',
            'check_out_date' => '2026-06-03',
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        // New booking starts on the day the previous one ends — no overlap
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-03',
                'check_out_date' => '2026-06-05',
                'total_amount' => 200.00,
            ]);

        $response->assertStatus(201);
    }

    public function test_create_booking_for_inactive_unit_returns_422(): void
    {
        $inactiveUnit = Unit::factory()->inactive()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $inactiveUnit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-01',
                'check_out_date' => '2026-06-03',
                'total_amount' => 200.00,
            ]);

        $response->assertStatus(422);
    }

    public function test_create_booking_for_inactive_property_returns_422(): void
    {
        $inactiveProperty = Property::factory()->create([
            'owner_id' => $this->owner->id,
            'is_active' => false,
        ]);
        $unitUnderInactive = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $inactiveProperty->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $unitUnderInactive->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => '2026-06-01',
                'check_out_date' => '2026-06-03',
                'total_amount' => 200.00,
            ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_user_cannot_create_booking(): void
    {
        $response = $this->postJson('/api/v1/bookings', []);

        $response->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------

    public function test_owner_can_list_their_bookings(): void
    {
        Booking::factory()->count(3)->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/bookings');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_cannot_see_other_owners_bookings(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        $otherGuest = Guest::factory()->create(['owner_id' => $otherOwner->id]);
        Booking::factory()->create([
            'owner_id' => $otherOwner->id,
            'unit_id' => $otherUnit->id,
            'guest_id' => $otherGuest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/bookings');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_list_bookings_with_status_filter(): void
    {
        Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'status' => Booking::STATUS_CONFIRMED,
        ]);
        Booking::factory()->checkedIn()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'check_in_date' => '2026-07-01',
            'check_out_date' => '2026-07-05',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/bookings?status=confirmed');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_owner_can_show_their_booking(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/bookings/{$booking->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $booking->id);
    }

    public function test_owner_cannot_show_other_owners_booking(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        $otherGuest = Guest::factory()->create(['owner_id' => $otherOwner->id]);
        $booking = Booking::factory()->create([
            'owner_id' => $otherOwner->id,
            'unit_id' => $otherUnit->id,
            'guest_id' => $otherGuest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/bookings/{$booking->id}");

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_owner_can_update_confirmed_booking(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'status' => Booking::STATUS_CONFIRMED,
            'total_amount' => 200.00,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/bookings/{$booking->id}", [
                'total_amount' => 350.00,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.total_amount', '350.00');
    }

    public function test_owner_can_update_pending_customer_confirmation_booking(): void
    {
        $booking = Booking::factory()->pendingCustomerConfirmation()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'total_amount' => 200.00,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/bookings/{$booking->id}", [
                'total_amount' => 350.00,
                'allow_customer_cancellation' => true,
                'allow_customer_modification' => true,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.total_amount', '350.00')
            ->assertJsonPath('data.allow_customer_cancellation', true)
            ->assertJsonPath('data.allow_customer_modification', true);
    }

    public function test_owner_cannot_update_checked_in_booking(): void
    {
        $booking = Booking::factory()->checkedIn()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/bookings/{$booking->id}", [
                'total_amount' => 500.00,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('current_status', 'checked_in');
    }

    // -------------------------------------------------------------------------
    // Status Transitions
    // -------------------------------------------------------------------------

    public function test_confirm_from_pending_customer_confirmation_succeeds(): void
    {
        $booking = Booking::factory()->pendingCustomerConfirmation()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/confirm");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Booking::STATUS_CONFIRMED);
    }

    public function test_confirm_from_checked_in_fails(): void
    {
        $booking = Booking::factory()->checkedIn()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/confirm");

        $response->assertStatus(422)
            ->assertJsonPath('current_status', Booking::STATUS_CHECKED_IN);
    }

    public function test_check_in_from_pending_customer_confirmation_fails(): void
    {
        $booking = Booking::factory()->pendingCustomerConfirmation()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/check-in");

        $response->assertStatus(422)
            ->assertJsonPath('current_status', Booking::STATUS_PENDING_CUSTOMER_CONFIRMATION);
    }

    public function test_check_in_from_confirmed_succeeds(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/check-in");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Booking::STATUS_CHECKED_IN);
    }

    public function test_check_in_from_checked_out_fails(): void
    {
        $booking = Booking::factory()->checkedOut()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/check-in");

        $response->assertStatus(422)
            ->assertJsonPath('current_status', Booking::STATUS_CHECKED_OUT);
    }

    public function test_check_out_from_checked_in_succeeds(): void
    {
        $booking = Booking::factory()->checkedIn()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/check-out");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Booking::STATUS_CHECKED_OUT);
    }

    public function test_check_out_from_confirmed_fails(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/check-out");

        $response->assertStatus(422)
            ->assertJsonPath('current_status', Booking::STATUS_CONFIRMED);
    }

    public function test_cancel_from_pending_customer_confirmation_succeeds(): void
    {
        $booking = Booking::factory()->pendingCustomerConfirmation()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/cancel");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Booking::STATUS_CANCELLED);
    }

    public function test_cancel_from_confirmed_succeeds(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/cancel");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Booking::STATUS_CANCELLED);
    }

    public function test_cancel_from_checked_in_succeeds(): void
    {
        $booking = Booking::factory()->checkedIn()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/cancel");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', Booking::STATUS_CANCELLED);
    }

    public function test_cancel_from_checked_out_fails(): void
    {
        $booking = Booking::factory()->checkedOut()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/cancel");

        $response->assertStatus(422)
            ->assertJsonPath('current_status', Booking::STATUS_CHECKED_OUT);
    }

    // -------------------------------------------------------------------------
    // Owner Scoping on Transitions
    // -------------------------------------------------------------------------

    public function test_owner_cannot_check_in_other_owners_booking(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        $otherGuest = Guest::factory()->create(['owner_id' => $otherOwner->id]);
        $booking = Booking::factory()->create([
            'owner_id' => $otherOwner->id,
            'unit_id' => $otherUnit->id,
            'guest_id' => $otherGuest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/check-in");

        $response->assertStatus(404);
    }

    public function test_owner_cannot_confirm_other_owners_booking(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        $otherGuest = Guest::factory()->create(['owner_id' => $otherOwner->id]);
        $booking = Booking::factory()->pendingCustomerConfirmation()->create([
            'owner_id' => $otherOwner->id,
            'unit_id' => $otherUnit->id,
            'guest_id' => $otherGuest->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/confirm");

        $response->assertStatus(404);
    }
}

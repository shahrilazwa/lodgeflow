<?php

namespace Tests\Feature\Dashboard;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\CleaningTask\Models\CleaningTask;
use App\Modules\Expense\Models\Expense;
use App\Modules\Guest\Models\Guest;
use App\Modules\MaintenanceTask\Models\MaintenanceTask;
use App\Modules\Payment\Models\Payment;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class DashboardApiTest extends TestCase
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
    // Income
    // -------------------------------------------------------------------------

    public function test_income_sums_payment_type_amounts_for_current_month(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        // Current month payments
        Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $booking->id,
            'type' => 'payment',
            'amount' => 300.00,
            'payment_date' => Carbon::now()->startOfMonth()->addDays(5)->toDateString(),
        ]);
        Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $booking->id,
            'type' => 'payment',
            'amount' => 200.00,
            'payment_date' => Carbon::now()->startOfMonth()->addDays(10)->toDateString(),
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/income');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 500);
    }

    public function test_income_excludes_refund_type_amounts(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $booking->id,
            'type' => 'payment',
            'amount' => 500.00,
            'payment_date' => Carbon::now()->toDateString(),
        ]);
        Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $booking->id,
            'type' => 'refund',
            'amount' => 100.00,
            'payment_date' => Carbon::now()->toDateString(),
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/income');

        // Income only counts payment-type, not refunds
        $response->assertStatus(200)
            ->assertJsonPath('data.total', 500);
    }

    public function test_income_excludes_other_months(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        // Last month payment
        Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $booking->id,
            'type' => 'payment',
            'amount' => 1000.00,
            'payment_date' => Carbon::now()->subMonth()->toDateString(),
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/income');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 0);
    }

    // -------------------------------------------------------------------------
    // Expenses
    // -------------------------------------------------------------------------

    public function test_expenses_sums_current_month_expenses(): void
    {
        Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'amount' => 150.00,
            'date' => Carbon::now()->toDateString(),
        ]);
        Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'amount' => 75.50,
            'date' => Carbon::now()->toDateString(),
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/expenses');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 225.5);
    }

    // -------------------------------------------------------------------------
    // Net Profit
    // -------------------------------------------------------------------------

    public function test_net_profit_equals_income_minus_expenses(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        Payment::factory()->create([
            'owner_id' => $this->owner->id,
            'booking_id' => $booking->id,
            'type' => 'payment',
            'amount' => 800.00,
            'payment_date' => Carbon::now()->toDateString(),
        ]);

        Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'amount' => 200.00,
            'date' => Carbon::now()->toDateString(),
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/net-profit');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 600);
    }

    // -------------------------------------------------------------------------
    // Outstanding
    // -------------------------------------------------------------------------

    public function test_outstanding_sums_across_unpaid_and_partial_bookings(): void
    {
        // Unpaid booking: total 500, net paid 0 → outstanding 500
        Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'total_amount' => 500.00,
            'net_paid_amount' => 0.00,
            'payment_status' => 'unpaid',
        ]);

        // Partial booking: total 300, net paid 100 → outstanding 200
        Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'total_amount' => 300.00,
            'net_paid_amount' => 100.00,
            'payment_status' => 'partial',
            'check_in_date' => '2026-07-01',
            'check_out_date' => '2026-07-03',
        ]);

        // Paid booking: should not be included
        Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'total_amount' => 400.00,
            'net_paid_amount' => 400.00,
            'payment_status' => 'paid',
            'check_in_date' => '2026-08-01',
            'check_out_date' => '2026-08-03',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/outstanding');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 700);
    }

    // -------------------------------------------------------------------------
    // Booking Counts
    // -------------------------------------------------------------------------

    public function test_booking_counts_by_status_for_current_month(): void
    {
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();

        Booking::factory()->count(2)->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'status' => 'confirmed',
            'check_in_date' => $startOfMonth,
            'check_out_date' => Carbon::now()->startOfMonth()->addDays(2)->toDateString(),
        ]);
        Booking::factory()->checkedIn()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'check_in_date' => Carbon::now()->startOfMonth()->addDays(3)->toDateString(),
            'check_out_date' => Carbon::now()->startOfMonth()->addDays(5)->toDateString(),
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/booking-counts');

        $response->assertStatus(200)
            ->assertJsonPath('data.confirmed', 2)
            ->assertJsonPath('data.checked_in', 1)
            ->assertJsonPath('data.checked_out', 0)
            ->assertJsonPath('data.cancelled', 0);
    }

    // -------------------------------------------------------------------------
    // Pending Cleaning
    // -------------------------------------------------------------------------

    public function test_pending_cleaning_returns_pending_and_in_progress(): void
    {
        CleaningTask::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'status' => 'pending',
        ]);
        CleaningTask::factory()->inProgress()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
        ]);
        CleaningTask::factory()->completed()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/pending-cleaning');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    // -------------------------------------------------------------------------
    // Pending Maintenance
    // -------------------------------------------------------------------------

    public function test_pending_maintenance_returns_open_and_in_progress(): void
    {
        MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'status' => 'open',
        ]);
        MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'status' => 'in_progress',
        ]);
        MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/pending-maintenance');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    // -------------------------------------------------------------------------
    // Owner Scoping
    // -------------------------------------------------------------------------

    public function test_dashboard_only_shows_authenticated_owners_data(): void
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

        Payment::factory()->create([
            'owner_id' => $otherOwner->id,
            'booking_id' => $otherBooking->id,
            'type' => 'payment',
            'amount' => 9999.00,
            'payment_date' => Carbon::now()->toDateString(),
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/income');

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 0);
    }

    // -------------------------------------------------------------------------
    // Empty State
    // -------------------------------------------------------------------------

    public function test_dashboard_returns_zeros_when_no_data(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/income')
            ->assertJsonPath('data.total', 0);

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/expenses')
            ->assertJsonPath('data.total', 0);

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/net-profit')
            ->assertJsonPath('data.total', 0);

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/outstanding')
            ->assertJsonPath('data.total', 0);

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/pending-cleaning')
            ->assertJsonCount(0, 'data');

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/dashboard/pending-maintenance')
            ->assertJsonCount(0, 'data');
    }

    // -------------------------------------------------------------------------
    // Unauthenticated
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $this->getJson('/api/v1/dashboard/income')->assertStatus(401);
        $this->getJson('/api/v1/dashboard/expenses')->assertStatus(401);
        $this->getJson('/api/v1/dashboard/net-profit')->assertStatus(401);
        $this->getJson('/api/v1/dashboard/outstanding')->assertStatus(401);
        $this->getJson('/api/v1/dashboard/booking-counts')->assertStatus(401);
        $this->getJson('/api/v1/dashboard/pending-cleaning')->assertStatus(401);
        $this->getJson('/api/v1/dashboard/pending-maintenance')->assertStatus(401);
    }
}

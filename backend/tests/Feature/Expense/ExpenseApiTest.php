<?php

namespace Tests\Feature\Expense;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Expense\Models\Expense;
use App\Modules\Guest\Models\Guest;
use App\Modules\Property\Models\Property;
use App\Modules\ServiceProvider\Models\ServiceProvider;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    private Property $property;

    private Unit $unit;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = Owner::factory()->create();
        $this->property = Property::factory()->create(['owner_id' => $this->owner->id]);
        $this->unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_owner_can_create_expense_with_required_fields(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => 150.00,
                'date' => '2026-06-01',
                'category' => 'utility_bills',
                'property_id' => $this->property->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.amount', '150.00')
            ->assertJsonPath('data.category', 'utility_bills')
            ->assertJsonPath('data.property_id', $this->property->id)
            ->assertJsonPath('data.owner_id', $this->owner->id);
    }

    public function test_owner_can_create_expense_with_all_optional_links(): void
    {
        $guest = Guest::factory()->create(['owner_id' => $this->owner->id]);
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $guest->id,
        ]);
        $provider = ServiceProvider::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => 200.00,
                'date' => '2026-06-01',
                'category' => 'cleaning_services',
                'property_id' => $this->property->id,
                'unit_id' => $this->unit->id,
                'booking_id' => $booking->id,
                'service_provider_id' => $provider->id,
                'description' => 'Monthly cleaning fee.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.unit_id', $this->unit->id)
            ->assertJsonPath('data.booking_id', $booking->id)
            ->assertJsonPath('data.service_provider_id', $provider->id)
            ->assertJsonPath('data.description', 'Monthly cleaning fee.');
    }

    public function test_create_expense_requires_amount_date_category_property(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount', 'date', 'category', 'property_id']);
    }

    public function test_create_expense_rejects_zero_amount(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => 0,
                'date' => '2026-06-01',
                'category' => 'utility_bills',
                'property_id' => $this->property->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_create_expense_rejects_negative_amount(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => -50.00,
                'date' => '2026-06-01',
                'category' => 'utility_bills',
                'property_id' => $this->property->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_create_expense_rejects_invalid_category(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => 100.00,
                'date' => '2026-06-01',
                'category' => 'invalid_category',
                'property_id' => $this->property->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    public function test_create_expense_rejects_other_owners_property(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => 100.00,
                'date' => '2026-06-01',
                'category' => 'utility_bills',
                'property_id' => $otherProperty->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_create_expense_rejects_unit_not_belonging_to_property(): void
    {
        $otherProperty = Property::factory()->create(['owner_id' => $this->owner->id]);
        $unitUnderOtherProperty = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $otherProperty->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => 100.00,
                'date' => '2026-06-01',
                'category' => 'maintenance',
                'property_id' => $this->property->id,
                'unit_id' => $unitUnderOtherProperty->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.unit_id.0', 'The selected unit does not belong to the linked property.');
    }

    public function test_create_expense_rejects_other_owners_booking(): void
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
            ->postJson('/api/v1/expenses', [
                'amount' => 100.00,
                'date' => '2026-06-01',
                'category' => 'platform_fees',
                'property_id' => $this->property->id,
                'booking_id' => $otherBooking->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.booking_id.0', 'The selected booking does not belong to you.');
    }

    public function test_create_expense_rejects_other_owners_service_provider(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProvider = ServiceProvider::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => 100.00,
                'date' => '2026-06-01',
                'category' => 'cleaning_services',
                'property_id' => $this->property->id,
                'service_provider_id' => $otherProvider->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.service_provider_id.0', 'The selected service provider does not belong to you.');
    }

    public function test_create_expense_validates_description_max_length(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/expenses', [
                'amount' => 100.00,
                'date' => '2026-06-01',
                'category' => 'utility_bills',
                'property_id' => $this->property->id,
                'description' => str_repeat('a', 501),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['description']);
    }

    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------

    public function test_owner_can_list_their_expenses(): void
    {
        Expense::factory()->count(3)->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/expenses');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_cannot_see_other_owners_expenses(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        Expense::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        Expense::factory()->create(['owner_id' => $this->owner->id, 'property_id' => $this->property->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/expenses');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_list_expenses_with_category_filter(): void
    {
        Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'category' => 'utility_bills',
        ]);
        Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'category' => 'maintenance',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/expenses?category=utility_bills');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_list_expenses_with_date_range_filter(): void
    {
        Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'date' => '2026-06-01',
        ]);
        Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'date' => '2026-07-15',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/expenses?from_date=2026-06-01&to_date=2026-06-30');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_owner_can_show_their_expense(): void
    {
        $expense = Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/expenses/{$expense->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $expense->id);
    }

    public function test_owner_cannot_show_other_owners_expense(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $expense = Expense::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/expenses/{$expense->id}");

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_owner_can_update_their_expense(): void
    {
        $expense = Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'amount' => 100.00,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/expenses/{$expense->id}", [
                'amount' => 250.00,
                'category' => 'repairs',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.amount', '250.00')
            ->assertJsonPath('data.category', 'repairs');
    }

    public function test_owner_cannot_update_other_owners_expense(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $expense = Expense::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/expenses/{$expense->id}", [
                'amount' => 999.00,
            ]);

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_owner_can_delete_their_expense(): void
    {
        $expense = Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/expenses/{$expense->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Expense deleted.');

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    }

    public function test_owner_cannot_delete_other_owners_expense(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $expense = Expense::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/expenses/{$expense->id}");

        $response->assertStatus(404);
    }

    public function test_delete_nonexistent_expense_returns_404(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson('/api/v1/expenses/99999');

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Service Provider deletion protection
    // -------------------------------------------------------------------------

    public function test_service_provider_with_linked_expense_cannot_be_deleted(): void
    {
        $provider = ServiceProvider::factory()->create(['owner_id' => $this->owner->id]);
        Expense::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'service_provider_id' => $provider->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/service-providers/{$provider->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('service_providers', ['id' => $provider->id]);
    }

    // -------------------------------------------------------------------------
    // Unauthenticated
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_expenses(): void
    {
        $response = $this->getJson('/api/v1/expenses');

        $response->assertStatus(401);
    }
}

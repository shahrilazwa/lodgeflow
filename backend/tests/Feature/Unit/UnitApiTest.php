<?php

namespace Tests\Feature\Unit;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnitApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    private Property $property;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = Owner::factory()->create();
        $this->property = Property::factory()->create(['owner_id' => $this->owner->id]);
    }

    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------

    public function test_owner_can_list_units_for_their_property(): void
    {
        Unit::factory()->count(3)->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/properties/{$this->property->id}/units");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_cannot_list_units_for_other_owners_property(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/properties/{$otherProperty->id}/units");

        $response->assertStatus(404);
    }

    public function test_list_units_for_nonexistent_property_returns_404(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/properties/99999/units');

        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_list_units(): void
    {
        $response = $this->getJson("/api/v1/properties/{$this->property->id}/units");

        $response->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_owner_can_create_unit(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", [
                'name' => 'Room 101',
                'type' => 'room',
                'description' => 'A standard room.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Room 101')
            ->assertJsonPath('data.type', 'room')
            ->assertJsonPath('data.property_id', $this->property->id)
            ->assertJsonPath('data.owner_id', $this->owner->id)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('units', [
            'name' => 'Room 101',
            'property_id' => $this->property->id,
        ]);
    }

    public function test_owner_can_create_unit_without_description(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", [
                'name' => 'Room 102',
                'type' => 'suite',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.description', null);
    }

    public function test_create_unit_requires_name_and_type(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'type']);
    }

    public function test_create_unit_validates_type_enum(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", [
                'name' => 'Room 103',
                'type' => 'invalid_type',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_create_unit_validates_max_lengths(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", [
                'name' => str_repeat('a', 101),
                'type' => 'room',
                'description' => str_repeat('b', 501),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'description']);
    }

    public function test_create_unit_rejects_duplicate_name_in_same_property(): void
    {
        Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'name' => 'Room 101',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", [
                'name' => 'Room 101',
                'type' => 'room',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_same_unit_name_in_different_properties_succeeds(): void
    {
        $otherProperty = Property::factory()->create(['owner_id' => $this->owner->id]);

        Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'name' => 'Room 101',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$otherProperty->id}/units", [
                'name' => 'Room 101',
                'type' => 'room',
            ]);

        $response->assertStatus(201);
    }

    public function test_owner_cannot_create_unit_under_other_owners_property(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$otherProperty->id}/units", [
                'name' => 'Room 101',
                'type' => 'room',
            ]);

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_owner_can_show_their_unit(): void
    {
        $unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/units/{$unit->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $unit->id)
            ->assertJsonPath('data.name', $unit->name);
    }

    public function test_owner_cannot_show_other_owners_unit(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $unit = Unit::factory()->create([
            'owner_id' => $otherOwner->id,
            'property_id' => $otherProperty->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/units/{$unit->id}");

        $response->assertStatus(404);
    }

    public function test_show_nonexistent_unit_returns_404(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/units/99999');

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_owner_can_update_their_unit(): void
    {
        $unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/units/{$unit->id}", [
                'name' => 'Updated Room',
                'type' => 'suite',
                'description' => 'Updated description.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Room')
            ->assertJsonPath('data.type', 'suite')
            ->assertJsonPath('data.description', 'Updated description.');
    }

    public function test_owner_can_partially_update_unit(): void
    {
        $unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'name' => 'Original Name',
            'type' => 'room',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/units/{$unit->id}", [
                'name' => 'New Name',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.type', 'room');
    }

    public function test_owner_cannot_update_other_owners_unit(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $unit = Unit::factory()->create([
            'owner_id' => $otherOwner->id,
            'property_id' => $otherProperty->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/units/{$unit->id}", [
                'name' => 'Hacked',
                'type' => 'room',
            ]);

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Deactivate / Activate
    // -------------------------------------------------------------------------

    public function test_owner_can_deactivate_unit(): void
    {
        $unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/units/{$unit->id}/deactivate");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', false);
    }

    public function test_owner_can_activate_unit(): void
    {
        $unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/units/{$unit->id}/activate");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', true);
    }

    public function test_owner_cannot_deactivate_other_owners_unit(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $unit = Unit::factory()->create([
            'owner_id' => $otherOwner->id,
            'property_id' => $otherProperty->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/units/{$unit->id}/deactivate");

        $response->assertStatus(404);
    }
}

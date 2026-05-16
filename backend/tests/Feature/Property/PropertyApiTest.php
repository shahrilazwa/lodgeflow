<?php

namespace Tests\Feature\Property;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = Owner::factory()->create();
    }

    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------

    public function test_owner_can_list_their_properties(): void
    {
        Property::factory()->count(3)->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/properties');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_cannot_see_other_owners_properties(): void
    {
        $otherOwner = Owner::factory()->create();
        Property::factory()->count(2)->create(['owner_id' => $otherOwner->id]);
        Property::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/properties');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_unauthenticated_user_cannot_list_properties(): void
    {
        $response = $this->getJson('/api/v1/properties');

        $response->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_owner_can_create_property(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/properties', [
                'name' => 'Sunrise Homestay',
                'address' => '123 Jalan Bunga, Kuala Lumpur',
                'description' => 'A cozy homestay near the city center.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Sunrise Homestay')
            ->assertJsonPath('data.address', '123 Jalan Bunga, Kuala Lumpur')
            ->assertJsonPath('data.description', 'A cozy homestay near the city center.')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.owner_id', $this->owner->id);

        $this->assertDatabaseHas('properties', [
            'name' => 'Sunrise Homestay',
            'owner_id' => $this->owner->id,
        ]);
    }

    public function test_owner_can_create_property_without_description(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/properties', [
                'name' => 'Minimal Property',
                'address' => '456 Jalan Raya',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.description', null);
    }

    public function test_create_property_requires_name_and_address(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/properties', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'address']);
    }

    public function test_create_property_validates_max_lengths(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/properties', [
                'name' => str_repeat('a', 101),
                'address' => str_repeat('b', 256),
                'description' => str_repeat('c', 1001),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'address', 'description']);
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_owner_can_show_their_property(): void
    {
        $property = Property::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/properties/{$property->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $property->id)
            ->assertJsonPath('data.name', $property->name);
    }

    public function test_owner_cannot_show_other_owners_property(): void
    {
        $otherOwner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/properties/{$property->id}");

        $response->assertStatus(404);
    }

    public function test_show_nonexistent_property_returns_404(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/properties/99999');

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_owner_can_update_their_property(): void
    {
        $property = Property::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", [
                'name' => 'Updated Name',
                'address' => 'Updated Address',
                'description' => 'Updated description.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.address', 'Updated Address')
            ->assertJsonPath('data.description', 'Updated description.');
    }

    public function test_owner_can_partially_update_property(): void
    {
        $property = Property::factory()->create([
            'owner_id' => $this->owner->id,
            'name' => 'Original Name',
            'address' => 'Original Address',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/properties/{$property->id}", [
                'name' => 'New Name Only',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'New Name Only')
            ->assertJsonPath('data.address', 'Original Address');
    }

    public function test_owner_cannot_update_other_owners_property(): void
    {
        $otherOwner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", [
                'name' => 'Hacked Name',
                'address' => 'Hacked Address',
            ]);

        $response->assertStatus(404);
    }

    public function test_update_property_validates_max_lengths(): void
    {
        $property = Property::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", [
                'name' => str_repeat('a', 101),
                'address' => str_repeat('b', 256),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'address']);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_owner_can_delete_their_property(): void
    {
        $property = Property::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/properties/{$property->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Property deleted.');

        $this->assertDatabaseMissing('properties', ['id' => $property->id]);
    }

    public function test_owner_cannot_delete_other_owners_property(): void
    {
        $otherOwner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/properties/{$property->id}");

        $response->assertStatus(404);

        $this->assertDatabaseHas('properties', ['id' => $property->id]);
    }

    public function test_delete_nonexistent_property_returns_404(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson('/api/v1/properties/99999');

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Deactivate / Activate
    // -------------------------------------------------------------------------

    public function test_owner_can_deactivate_property(): void
    {
        $property = Property::factory()->create([
            'owner_id' => $this->owner->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/properties/{$property->id}/deactivate");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('properties', [
            'id' => $property->id,
            'is_active' => false,
        ]);
    }

    public function test_owner_can_activate_property(): void
    {
        $property = Property::factory()->create([
            'owner_id' => $this->owner->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/properties/{$property->id}/activate");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('properties', [
            'id' => $property->id,
            'is_active' => true,
        ]);
    }

    public function test_owner_cannot_deactivate_other_owners_property(): void
    {
        $otherOwner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/properties/{$property->id}/deactivate");

        $response->assertStatus(404);
    }
}

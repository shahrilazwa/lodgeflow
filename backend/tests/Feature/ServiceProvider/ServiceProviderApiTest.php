<?php

namespace Tests\Feature\ServiceProvider;

use App\Models\Owner;
use App\Modules\ServiceProvider\Models\ServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceProviderApiTest extends TestCase
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

    public function test_owner_can_list_their_service_providers(): void
    {
        ServiceProvider::factory()->count(3)->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/service-providers');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_cannot_see_other_owners_service_providers(): void
    {
        $otherOwner = Owner::factory()->create();
        ServiceProvider::factory()->count(2)->create(['owner_id' => $otherOwner->id]);
        ServiceProvider::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/service-providers');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_unauthenticated_user_cannot_list_service_providers(): void
    {
        $response = $this->getJson('/api/v1/service-providers');

        $response->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_owner_can_create_service_provider(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/service-providers', [
                'name' => 'CleanPro Services',
                'service_type' => 'cleaning',
                'phone' => '0123456789',
                'notes' => 'Reliable cleaning service.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'CleanPro Services')
            ->assertJsonPath('data.service_type', 'cleaning')
            ->assertJsonPath('data.phone', '0123456789')
            ->assertJsonPath('data.notes', 'Reliable cleaning service.')
            ->assertJsonPath('data.owner_id', $this->owner->id);

        $this->assertDatabaseHas('service_providers', [
            'name' => 'CleanPro Services',
            'owner_id' => $this->owner->id,
        ]);
    }

    public function test_owner_can_create_service_provider_with_minimal_fields(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/service-providers', [
                'name' => 'Basic Provider',
                'service_type' => 'plumbing',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.phone', null)
            ->assertJsonPath('data.notes', null);
    }

    public function test_create_service_provider_requires_name_and_service_type(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/service-providers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'service_type']);
    }

    public function test_create_service_provider_validates_max_lengths(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/service-providers', [
                'name' => str_repeat('a', 101),
                'service_type' => str_repeat('b', 101),
                'phone' => str_repeat('c', 21),
                'notes' => str_repeat('d', 1001),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'service_type', 'phone', 'notes']);
    }

    public function test_create_service_provider_rejects_duplicate_name_for_same_owner(): void
    {
        ServiceProvider::factory()->create([
            'owner_id' => $this->owner->id,
            'name' => 'CleanPro Services',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/service-providers', [
                'name' => 'CleanPro Services',
                'service_type' => 'cleaning',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_same_name_for_different_owners_succeeds(): void
    {
        $otherOwner = Owner::factory()->create();
        ServiceProvider::factory()->create([
            'owner_id' => $otherOwner->id,
            'name' => 'CleanPro Services',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/service-providers', [
                'name' => 'CleanPro Services',
                'service_type' => 'cleaning',
            ]);

        $response->assertStatus(201);
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_owner_can_show_their_service_provider(): void
    {
        $provider = ServiceProvider::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/service-providers/{$provider->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $provider->id)
            ->assertJsonPath('data.name', $provider->name);
    }

    public function test_owner_cannot_show_other_owners_service_provider(): void
    {
        $otherOwner = Owner::factory()->create();
        $provider = ServiceProvider::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/service-providers/{$provider->id}");

        $response->assertStatus(404);
    }

    public function test_show_nonexistent_service_provider_returns_404(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/service-providers/99999');

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_owner_can_update_their_service_provider(): void
    {
        $provider = ServiceProvider::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/service-providers/{$provider->id}", [
                'name' => 'Updated Name',
                'service_type' => 'electrical',
                'phone' => '9876543210',
                'notes' => 'Updated notes.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.service_type', 'electrical')
            ->assertJsonPath('data.phone', '9876543210')
            ->assertJsonPath('data.notes', 'Updated notes.');
    }

    public function test_owner_can_partially_update_service_provider(): void
    {
        $provider = ServiceProvider::factory()->create([
            'owner_id' => $this->owner->id,
            'name' => 'Original Name',
            'service_type' => 'cleaning',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/service-providers/{$provider->id}", [
                'service_type' => 'laundry',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Original Name')
            ->assertJsonPath('data.service_type', 'laundry');
    }

    public function test_owner_cannot_update_other_owners_service_provider(): void
    {
        $otherOwner = Owner::factory()->create();
        $provider = ServiceProvider::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/service-providers/{$provider->id}", [
                'name' => 'Hacked',
                'service_type' => 'hacking',
            ]);

        $response->assertStatus(404);
    }

    public function test_update_rejects_duplicate_name(): void
    {
        ServiceProvider::factory()->create([
            'owner_id' => $this->owner->id,
            'name' => 'Existing Provider',
        ]);
        $provider = ServiceProvider::factory()->create([
            'owner_id' => $this->owner->id,
            'name' => 'Another Provider',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/service-providers/{$provider->id}", [
                'name' => 'Existing Provider',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_update_allows_keeping_same_name(): void
    {
        $provider = ServiceProvider::factory()->create([
            'owner_id' => $this->owner->id,
            'name' => 'My Provider',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/service-providers/{$provider->id}", [
                'name' => 'My Provider',
                'service_type' => 'updated type',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'My Provider');
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public function test_owner_can_delete_service_provider_with_no_expenses(): void
    {
        $provider = ServiceProvider::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/service-providers/{$provider->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Service provider deleted.');

        $this->assertDatabaseMissing('service_providers', ['id' => $provider->id]);
    }

    public function test_owner_cannot_delete_other_owners_service_provider(): void
    {
        $otherOwner = Owner::factory()->create();
        $provider = ServiceProvider::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/service-providers/{$provider->id}");

        $response->assertStatus(404);
    }

    public function test_delete_nonexistent_service_provider_returns_404(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson('/api/v1/service-providers/99999');

        $response->assertStatus(404);
    }
}

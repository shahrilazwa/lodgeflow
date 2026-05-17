<?php

namespace Tests\Feature\Guest;

use App\Models\Owner;
use App\Modules\Guest\Models\Guest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = Owner::factory()->create();
    }

    // -------------------------------------------------------------------------
    // List / Search
    // -------------------------------------------------------------------------

    public function test_owner_can_list_their_guests(): void
    {
        Guest::factory()->count(3)->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/guests');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_cannot_see_other_owners_guests(): void
    {
        $otherOwner = Owner::factory()->create();
        Guest::factory()->count(2)->create(['owner_id' => $otherOwner->id]);
        Guest::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/guests');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_owner_can_search_guests_by_name(): void
    {
        Guest::factory()->create(['owner_id' => $this->owner->id, 'full_name' => 'Ahmad bin Ali']);
        Guest::factory()->create(['owner_id' => $this->owner->id, 'full_name' => 'Siti Aminah']);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/guests?search=Ahmad');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.full_name', 'Ahmad bin Ali');
    }

    public function test_owner_can_search_guests_by_phone(): void
    {
        Guest::factory()->create(['owner_id' => $this->owner->id, 'phone' => '0123456789']);
        Guest::factory()->create(['owner_id' => $this->owner->id, 'phone' => '0198765432']);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/guests?search=01234');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_search_with_no_matches_returns_empty(): void
    {
        Guest::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/guests?search=nonexistent');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_unauthenticated_user_cannot_list_guests(): void
    {
        $response = $this->getJson('/api/v1/guests');

        $response->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_owner_can_create_guest(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', [
                'full_name' => 'Ahmad bin Ali',
                'phone' => '0123456789',
                'email' => 'ahmad@example.com',
                'identification_number' => '901234567890',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.full_name', 'Ahmad bin Ali')
            ->assertJsonPath('data.phone', '0123456789')
            ->assertJsonPath('data.email', 'ahmad@example.com')
            ->assertJsonPath('data.identification_number', '901234567890')
            ->assertJsonPath('data.owner_id', $this->owner->id);

        $this->assertDatabaseHas('guests', [
            'full_name' => 'Ahmad bin Ali',
            'phone' => '0123456789',
            'owner_id' => $this->owner->id,
        ]);
    }

    public function test_owner_can_create_guest_with_minimal_fields(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', [
                'full_name' => 'Minimal Guest',
                'phone' => '9876543',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', null)
            ->assertJsonPath('data.identification_number', null);
    }

    public function test_create_guest_requires_name_and_phone(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['full_name', 'phone']);
    }

    public function test_create_guest_validates_phone_format(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', [
                'full_name' => 'Test Guest',
                'phone' => 'abc123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_create_guest_validates_phone_too_short(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', [
                'full_name' => 'Test Guest',
                'phone' => '123456',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_create_guest_validates_phone_too_long(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', [
                'full_name' => 'Test Guest',
                'phone' => '1234567890123456',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_create_guest_validates_max_lengths(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', [
                'full_name' => str_repeat('a', 101),
                'phone' => '0123456789',
                'email' => str_repeat('a', 250).'@b.co',
                'identification_number' => str_repeat('c', 51),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['full_name', 'email', 'identification_number']);
    }

    public function test_create_guest_rejects_duplicate_phone_for_same_owner(): void
    {
        Guest::factory()->create([
            'owner_id' => $this->owner->id,
            'phone' => '0123456789',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', [
                'full_name' => 'Another Guest',
                'phone' => '0123456789',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_same_phone_for_different_owners_succeeds(): void
    {
        $otherOwner = Owner::factory()->create();
        Guest::factory()->create([
            'owner_id' => $otherOwner->id,
            'phone' => '0123456789',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/guests', [
                'full_name' => 'My Guest',
                'phone' => '0123456789',
            ]);

        $response->assertStatus(201);
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_owner_can_show_their_guest(): void
    {
        $guest = Guest::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/guests/{$guest->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $guest->id)
            ->assertJsonPath('data.full_name', $guest->full_name);
    }

    public function test_owner_cannot_show_other_owners_guest(): void
    {
        $otherOwner = Owner::factory()->create();
        $guest = Guest::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/guests/{$guest->id}");

        $response->assertStatus(404);
    }

    public function test_show_nonexistent_guest_returns_404(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/guests/99999');

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_owner_can_update_their_guest(): void
    {
        $guest = Guest::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/guests/{$guest->id}", [
                'full_name' => 'Updated Name',
                'phone' => '9999999999',
                'email' => 'updated@example.com',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.full_name', 'Updated Name')
            ->assertJsonPath('data.phone', '9999999999')
            ->assertJsonPath('data.email', 'updated@example.com');
    }

    public function test_owner_can_partially_update_guest(): void
    {
        $guest = Guest::factory()->create([
            'owner_id' => $this->owner->id,
            'full_name' => 'Original Name',
            'phone' => '1234567890',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/guests/{$guest->id}", [
                'full_name' => 'New Name Only',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.full_name', 'New Name Only')
            ->assertJsonPath('data.phone', '1234567890');
    }

    public function test_owner_cannot_update_other_owners_guest(): void
    {
        $otherOwner = Owner::factory()->create();
        $guest = Guest::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/guests/{$guest->id}", [
                'full_name' => 'Hacked Name',
                'phone' => '1111111111',
            ]);

        $response->assertStatus(404);
    }

    public function test_update_guest_rejects_duplicate_phone(): void
    {
        Guest::factory()->create([
            'owner_id' => $this->owner->id,
            'phone' => '1111111111',
        ]);
        $guest = Guest::factory()->create([
            'owner_id' => $this->owner->id,
            'phone' => '2222222222',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/guests/{$guest->id}", [
                'phone' => '1111111111',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_update_guest_allows_keeping_same_phone(): void
    {
        $guest = Guest::factory()->create([
            'owner_id' => $this->owner->id,
            'phone' => '1234567890',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/guests/{$guest->id}", [
                'full_name' => 'Updated Name',
                'phone' => '1234567890',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.full_name', 'Updated Name');
    }
}

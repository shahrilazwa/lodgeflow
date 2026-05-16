<?php

namespace Tests\Feature\Auth;

use App\Models\Owner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Register
    // -------------------------------------------------------------------------

    public function test_owner_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Owner',
            'email' => 'owner@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'owner' => ['id', 'name', 'email'],
                    'token',
                ],
            ])
            ->assertJsonPath('data.owner.name', 'Test Owner')
            ->assertJsonPath('data.owner.email', 'owner@example.com')
            ->assertJsonMissing(['password', 'remember_token']);

        $this->assertDatabaseHas('owners', [
            'email' => 'owner@example.com',
            'name' => 'Test Owner',
        ]);
    }

    public function test_register_requires_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_register_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Owner',
            'email' => 'owner@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_register_requires_minimum_password_length(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Owner',
            'email' => 'owner@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_duplicate_email_cannot_register(): void
    {
        Owner::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Another Owner',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    public function test_owner_can_login_with_valid_credentials(): void
    {
        Owner::factory()->create([
            'email' => 'owner@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'owner@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'owner' => ['id', 'name', 'email'],
                    'token',
                ],
            ])
            ->assertJsonPath('data.owner.email', 'owner@example.com');
    }

    public function test_login_fails_with_invalid_password(): void
    {
        Owner::factory()->create([
            'email' => 'owner@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'owner@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'The provided credentials are incorrect.');
    }

    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'The provided credentials are incorrect.');
    }

    public function test_login_requires_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    // -------------------------------------------------------------------------
    // Me
    // -------------------------------------------------------------------------

    public function test_authenticated_owner_can_call_me(): void
    {
        $owner = Owner::factory()->create();

        $response = $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $owner->id)
            ->assertJsonPath('data.name', $owner->name)
            ->assertJsonPath('data.email', $owner->email)
            ->assertJsonMissing(['password', 'remember_token']);
    }

    public function test_unauthenticated_user_cannot_call_me(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // Logout
    // -------------------------------------------------------------------------

    public function test_authenticated_owner_can_logout(): void
    {
        $owner = Owner::factory()->create();
        $token = $owner->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Logged out successfully.');
    }

    public function test_token_is_revoked_after_logout(): void
    {
        $owner = Owner::factory()->create();
        $token = $owner->createToken('auth-token')->plainTextToken;

        // Logout — revokes the token
        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200);

        // Verify token was deleted from database
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_unauthenticated_user_cannot_logout(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401);
    }
}

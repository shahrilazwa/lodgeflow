<?php

namespace Tests\Feature\MaintenanceTask;

use App\Models\Owner;
use App\Modules\MaintenanceTask\Models\MaintenanceTask;
use App\Modules\Property\Models\Property;
use App\Modules\ServiceProvider\Models\ServiceProvider;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceTaskApiTest extends TestCase
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

    public function test_owner_can_create_maintenance_task_with_property(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/maintenance-tasks', [
                'title' => 'Fix leaking pipe',
                'priority' => 'high',
                'property_id' => $this->property->id,
                'description' => 'Bathroom pipe is leaking.',
                'scheduled_date' => '2026-07-01',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Fix leaking pipe')
            ->assertJsonPath('data.priority', 'high')
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.property_id', $this->property->id)
            ->assertJsonPath('data.owner_id', $this->owner->id);
    }

    public function test_owner_can_create_maintenance_task_with_unit(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/maintenance-tasks', [
                'title' => 'Replace air conditioner',
                'priority' => 'medium',
                'unit_id' => $this->unit->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.unit_id', $this->unit->id);
    }

    public function test_owner_can_create_maintenance_task_with_service_provider(): void
    {
        $sp = ServiceProvider::factory()->create(['owner_id' => $this->owner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/maintenance-tasks', [
                'title' => 'Electrical repair',
                'priority' => 'low',
                'property_id' => $this->property->id,
                'service_provider_id' => $sp->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.service_provider_id', $sp->id);
    }

    public function test_create_requires_title_and_priority(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/maintenance-tasks', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'priority']);
    }

    public function test_create_requires_property_or_unit(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/maintenance-tasks', [
                'title' => 'No location',
                'priority' => 'low',
            ]);

        $response->assertStatus(422);
    }

    public function test_create_rejects_invalid_priority(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/maintenance-tasks', [
                'title' => 'Test',
                'priority' => 'urgent',
                'property_id' => $this->property->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['priority']);
    }

    public function test_create_rejects_other_owners_property(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/maintenance-tasks', [
                'title' => 'Test',
                'priority' => 'low',
                'property_id' => $otherProperty->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_create_rejects_other_owners_service_provider(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherSp = ServiceProvider::factory()->create(['owner_id' => $otherOwner->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/maintenance-tasks', [
                'title' => 'Test',
                'priority' => 'low',
                'property_id' => $this->property->id,
                'service_provider_id' => $otherSp->id,
            ]);

        $response->assertStatus(422);
    }

    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------

    public function test_owner_can_list_their_maintenance_tasks(): void
    {
        MaintenanceTask::factory()->count(3)->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/maintenance-tasks');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_cannot_see_other_owners_maintenance_tasks(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        MaintenanceTask::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/maintenance-tasks');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_list_with_status_filter(): void
    {
        MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'status' => 'open',
        ]);
        MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/maintenance-tasks?status=open');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_list_with_priority_filter(): void
    {
        MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'priority' => 'high',
        ]);
        MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'priority' => 'low',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/maintenance-tasks?priority=high');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_owner_can_show_their_maintenance_task(): void
    {
        $task = MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/maintenance-tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $task->id);
    }

    public function test_owner_cannot_show_other_owners_maintenance_task(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $task = MaintenanceTask::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/maintenance-tasks/{$task->id}");

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_owner_can_update_maintenance_task(): void
    {
        $task = MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/maintenance-tasks/{$task->id}", [
                'title' => 'Updated title',
                'status' => 'in_progress',
                'priority' => 'high',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated title')
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.priority', 'high');
    }

    public function test_owner_can_complete_maintenance_task(): void
    {
        $task = MaintenanceTask::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/maintenance-tasks/{$task->id}", [
                'status' => 'completed',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_owner_cannot_update_other_owners_maintenance_task(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $task = MaintenanceTask::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/maintenance-tasks/{$task->id}", [
                'title' => 'Hacked',
                'priority' => 'low',
            ]);

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Unauthenticated
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_maintenance_tasks(): void
    {
        $response = $this->getJson('/api/v1/maintenance-tasks');

        $response->assertStatus(401);
    }
}

<?php

namespace Tests\Feature\CleaningTask;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\CleaningTask\Jobs\CreateCleaningTaskJob;
use App\Modules\CleaningTask\Models\CleaningTask;
use App\Modules\Guest\Models\Guest;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CleaningTaskApiTest extends TestCase
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
    // Job Dispatch on Checkout
    // -------------------------------------------------------------------------

    public function test_checkout_dispatches_cleaning_task_job(): void
    {
        Queue::fake();

        $booking = Booking::factory()->checkedIn()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/bookings/{$booking->id}/check-out")
            ->assertStatus(200);

        Queue::assertPushedOn('cleaning-tasks', CreateCleaningTaskJob::class, function ($job) use ($booking) {
            return $job->bookingId === $booking->id
                && $job->unitId === $this->unit->id
                && $job->ownerId === $this->owner->id;
        });
    }

    // -------------------------------------------------------------------------
    // Job Execution
    // -------------------------------------------------------------------------

    public function test_job_creates_cleaning_task(): void
    {
        $booking = Booking::factory()->checkedOut()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        $job = new CreateCleaningTaskJob($booking->id, $this->unit->id, $this->owner->id);
        $job->handle();

        $this->assertDatabaseHas('cleaning_tasks', [
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'booking_id' => $booking->id,
            'status' => 'pending',
        ]);
    }

    public function test_job_does_not_create_duplicate_cleaning_task(): void
    {
        $booking = Booking::factory()->checkedOut()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
        ]);

        // Create one manually first
        CleaningTask::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'booking_id' => $booking->id,
        ]);

        $job = new CreateCleaningTaskJob($booking->id, $this->unit->id, $this->owner->id);
        $job->handle();

        // Should still be only 1
        $this->assertDatabaseCount('cleaning_tasks', 1);
    }

    public function test_job_skips_if_booking_not_checked_out(): void
    {
        $booking = Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'status' => 'confirmed',
        ]);

        $job = new CreateCleaningTaskJob($booking->id, $this->unit->id, $this->owner->id);
        $job->handle();

        $this->assertDatabaseCount('cleaning_tasks', 0);
    }

    // -------------------------------------------------------------------------
    // Manual Create
    // -------------------------------------------------------------------------

    public function test_owner_can_manually_create_cleaning_task(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/cleaning-tasks', [
                'unit_id' => $this->unit->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.unit_id', $this->unit->id)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.owner_id', $this->owner->id);
    }

    public function test_manual_create_with_nonexistent_unit_returns_422(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/cleaning-tasks', [
                'unit_id' => 99999,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['unit_id']);
    }

    public function test_manual_create_with_other_owners_unit_returns_404(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/cleaning-tasks', [
                'unit_id' => $otherUnit->id,
            ]);

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------

    public function test_owner_can_list_their_cleaning_tasks(): void
    {
        CleaningTask::factory()->count(3)->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/cleaning-tasks');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_cannot_see_other_owners_cleaning_tasks(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        CleaningTask::factory()->create(['owner_id' => $otherOwner->id, 'unit_id' => $otherUnit->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/cleaning-tasks');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_list_cleaning_tasks_with_status_filter(): void
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

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/cleaning-tasks?status=pending');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    // -------------------------------------------------------------------------
    // Show
    // -------------------------------------------------------------------------

    public function test_owner_can_show_their_cleaning_task(): void
    {
        $task = CleaningTask::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/cleaning-tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $task->id);
    }

    public function test_owner_cannot_show_other_owners_cleaning_task(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create(['owner_id' => $otherOwner->id, 'property_id' => $otherProperty->id]);
        $task = CleaningTask::factory()->create(['owner_id' => $otherOwner->id, 'unit_id' => $otherUnit->id]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/cleaning-tasks/{$task->id}");

        $response->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // Status Transitions
    // -------------------------------------------------------------------------

    public function test_pending_to_in_progress_succeeds(): void
    {
        $task = CleaningTask::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/cleaning-tasks/{$task->id}/status", [
                'status' => 'in_progress',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');
    }

    public function test_in_progress_to_completed_succeeds(): void
    {
        $task = CleaningTask::factory()->inProgress()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/cleaning-tasks/{$task->id}/status", [
                'status' => 'completed',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_pending_to_completed_fails(): void
    {
        $task = CleaningTask::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/cleaning-tasks/{$task->id}/status", [
                'status' => 'completed',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('current_status', 'pending');
    }

    public function test_completed_to_pending_fails(): void
    {
        $task = CleaningTask::factory()->completed()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/cleaning-tasks/{$task->id}/status", [
                'status' => 'pending',
            ]);

        $response->assertStatus(422);
    }

    // -------------------------------------------------------------------------
    // Notes
    // -------------------------------------------------------------------------

    public function test_owner_can_update_notes(): void
    {
        $task = CleaningTask::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/cleaning-tasks/{$task->id}/notes", [
                'notes' => 'Please clean the bathroom thoroughly.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.notes', 'Please clean the bathroom thoroughly.');
    }

    public function test_notes_max_length_validated(): void
    {
        $task = CleaningTask::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/cleaning-tasks/{$task->id}/notes", [
                'notes' => str_repeat('a', 1001),
            ]);

        $response->assertStatus(422);
    }

    // -------------------------------------------------------------------------
    // Unauthenticated
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_cleaning_tasks(): void
    {
        $response = $this->getJson('/api/v1/cleaning-tasks');

        $response->assertStatus(401);
    }
}

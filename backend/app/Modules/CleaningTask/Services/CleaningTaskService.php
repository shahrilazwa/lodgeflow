<?php

namespace App\Modules\CleaningTask\Services;

use App\Modules\CleaningTask\Models\CleaningTask;
use App\Modules\Unit\Models\Unit;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class CleaningTaskService
{
    /**
     * List cleaning tasks for the given owner with optional filters.
     */
    public function listForOwner(int $ownerId, array $filters = []): Collection
    {
        $query = CleaningTask::where('owner_id', $ownerId)
            ->with(['unit', 'booking']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Manually create a cleaning task.
     */
    public function create(array $data, int $ownerId): CleaningTask|JsonResponse
    {
        // Validate unit belongs to owner
        $unit = Unit::where('id', $data['unit_id'])
            ->where('owner_id', $ownerId)
            ->first();

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        $task = CleaningTask::create([
            'owner_id' => $ownerId,
            'unit_id' => $data['unit_id'],
            'booking_id' => $data['booking_id'] ?? null,
            'status' => CleaningTask::STATUS_PENDING,
        ]);

        return $task->fresh()->load(['unit', 'booking']);
    }

    /**
     * Find a cleaning task by ID, scoped to the given owner.
     */
    public function findForOwner(int $id, int $ownerId): ?CleaningTask
    {
        return CleaningTask::where('id', $id)
            ->where('owner_id', $ownerId)
            ->with(['unit', 'booking'])
            ->first();
    }

    /**
     * Update the status of a cleaning task.
     * Only allows: pending → in_progress, in_progress → completed.
     */
    public function updateStatus(CleaningTask $task, string $newStatus): CleaningTask|JsonResponse
    {
        $allowedTransitions = CleaningTask::TRANSITIONS[$task->status] ?? [];

        if (! in_array($newStatus, $allowedTransitions)) {
            return response()->json([
                'message' => "Cannot transition from '{$task->status}' to '{$newStatus}'.",
                'current_status' => $task->status,
                'allowed_transitions' => $allowedTransitions,
            ], 422);
        }

        $task->update(['status' => $newStatus]);

        return $task->fresh()->load(['unit', 'booking']);
    }

    /**
     * Update notes on a cleaning task.
     */
    public function updateNotes(CleaningTask $task, ?string $notes): CleaningTask
    {
        $task->update(['notes' => $notes]);

        return $task->fresh()->load(['unit', 'booking']);
    }
}

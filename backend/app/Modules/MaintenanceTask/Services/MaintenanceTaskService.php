<?php

namespace App\Modules\MaintenanceTask\Services;

use App\Modules\MaintenanceTask\Models\MaintenanceTask;
use App\Modules\Property\Models\Property;
use App\Modules\ServiceProvider\Models\ServiceProvider;
use App\Modules\Unit\Models\Unit;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class MaintenanceTaskService
{
    /**
     * List maintenance tasks for the given owner with optional filters.
     */
    public function listForOwner(int $ownerId, array $filters = []): Collection
    {
        $query = MaintenanceTask::where('owner_id', $ownerId)
            ->with(['property', 'unit', 'serviceProvider']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (! empty($filters['property_id'])) {
            $query->where('property_id', $filters['property_id']);
        }
        if (! empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Create a new maintenance task.
     */
    public function create(array $data, int $ownerId): MaintenanceTask|JsonResponse
    {
        // At least one of property_id or unit_id must be provided
        if (empty($data['property_id']) && empty($data['unit_id'])) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => [
                    'property_id' => ['A property or unit must be linked.'],
                    'unit_id' => ['A property or unit must be linked.'],
                ],
            ], 422);
        }

        // Validate property belongs to owner
        if (! empty($data['property_id'])) {
            $property = Property::where('id', $data['property_id'])
                ->where('owner_id', $ownerId)
                ->first();
            if (! $property) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => ['property_id' => ['The selected property does not belong to you.']],
                ], 422);
            }
        }

        // Validate unit belongs to owner
        if (! empty($data['unit_id'])) {
            $unit = Unit::where('id', $data['unit_id'])
                ->where('owner_id', $ownerId)
                ->first();
            if (! $unit) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => ['unit_id' => ['The selected unit does not belong to you.']],
                ], 422);
            }
        }

        // Validate service provider belongs to owner
        if (! empty($data['service_provider_id'])) {
            $sp = ServiceProvider::where('id', $data['service_provider_id'])
                ->where('owner_id', $ownerId)
                ->first();
            if (! $sp) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => ['service_provider_id' => ['The selected service provider does not belong to you.']],
                ], 422);
            }
        }

        $task = MaintenanceTask::create([
            'owner_id' => $ownerId,
            'property_id' => $data['property_id'] ?? null,
            'unit_id' => $data['unit_id'] ?? null,
            'service_provider_id' => $data['service_provider_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'priority' => $data['priority'],
            'status' => MaintenanceTask::STATUS_OPEN,
            'scheduled_date' => $data['scheduled_date'] ?? null,
        ]);

        return $task->fresh()->load(['property', 'unit', 'serviceProvider']);
    }

    /**
     * Find a maintenance task by ID, scoped to the given owner.
     */
    public function findForOwner(int $id, int $ownerId): ?MaintenanceTask
    {
        return MaintenanceTask::where('id', $id)
            ->where('owner_id', $ownerId)
            ->with(['property', 'unit', 'serviceProvider'])
            ->first();
    }

    /**
     * Update an existing maintenance task.
     */
    public function update(MaintenanceTask $task, array $data, int $ownerId): MaintenanceTask|JsonResponse
    {
        // Validate optional links if changed
        if (! empty($data['property_id'])) {
            $property = Property::where('id', $data['property_id'])->where('owner_id', $ownerId)->first();
            if (! $property) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => ['property_id' => ['The selected property does not belong to you.']],
                ], 422);
            }
        }

        if (! empty($data['unit_id'])) {
            $unit = Unit::where('id', $data['unit_id'])->where('owner_id', $ownerId)->first();
            if (! $unit) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => ['unit_id' => ['The selected unit does not belong to you.']],
                ], 422);
            }
        }

        if (! empty($data['service_provider_id'])) {
            $sp = ServiceProvider::where('id', $data['service_provider_id'])->where('owner_id', $ownerId)->first();
            if (! $sp) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => ['service_provider_id' => ['The selected service provider does not belong to you.']],
                ], 422);
            }
        }

        $updateData = [];
        if (isset($data['title'])) {
            $updateData['title'] = $data['title'];
        }
        if (array_key_exists('description', $data)) {
            $updateData['description'] = $data['description'];
        }
        if (isset($data['priority'])) {
            $updateData['priority'] = $data['priority'];
        }
        if (isset($data['status'])) {
            $updateData['status'] = $data['status'];
        }
        if (array_key_exists('scheduled_date', $data)) {
            $updateData['scheduled_date'] = $data['scheduled_date'];
        }
        if (array_key_exists('property_id', $data)) {
            $updateData['property_id'] = $data['property_id'];
        }
        if (array_key_exists('unit_id', $data)) {
            $updateData['unit_id'] = $data['unit_id'];
        }
        if (array_key_exists('service_provider_id', $data)) {
            $updateData['service_provider_id'] = $data['service_provider_id'];
        }

        if (! empty($updateData)) {
            $task->update($updateData);
        }

        return $task->fresh()->load(['property', 'unit', 'serviceProvider']);
    }
}

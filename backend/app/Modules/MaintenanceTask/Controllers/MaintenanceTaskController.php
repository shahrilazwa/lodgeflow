<?php

namespace App\Modules\MaintenanceTask\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\MaintenanceTask\Requests\StoreMaintenanceTaskRequest;
use App\Modules\MaintenanceTask\Requests\UpdateMaintenanceTaskRequest;
use App\Modules\MaintenanceTask\Services\MaintenanceTaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceTaskController extends Controller
{
    public function __construct(
        private readonly MaintenanceTaskService $maintenanceTaskService,
    ) {}

    /**
     * List maintenance tasks for the authenticated owner.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->query('status'),
            'priority' => $request->query('priority'),
            'property_id' => $request->query('property_id'),
            'unit_id' => $request->query('unit_id'),
        ];

        $tasks = $this->maintenanceTaskService->listForOwner($request->user()->id, $filters);

        return response()->json(['data' => $tasks]);
    }

    /**
     * Create a new maintenance task.
     */
    public function store(StoreMaintenanceTaskRequest $request): JsonResponse
    {
        $result = $this->maintenanceTaskService->create(
            $request->validated(),
            $request->user()->id,
        );

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result], 201);
    }

    /**
     * Show a single maintenance task.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $task = $this->maintenanceTaskService->findForOwner($id, $request->user()->id);

        if (! $task) {
            return response()->json(['message' => 'Maintenance task not found.'], 404);
        }

        return response()->json(['data' => $task]);
    }

    /**
     * Update an existing maintenance task.
     */
    public function update(UpdateMaintenanceTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->maintenanceTaskService->findForOwner($id, $request->user()->id);

        if (! $task) {
            return response()->json(['message' => 'Maintenance task not found.'], 404);
        }

        $result = $this->maintenanceTaskService->update($task, $request->validated(), $request->user()->id);

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result]);
    }
}

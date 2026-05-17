<?php

namespace App\Modules\CleaningTask\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CleaningTask\Models\CleaningTask;
use App\Modules\CleaningTask\Requests\StoreCleaningTaskRequest;
use App\Modules\CleaningTask\Services\CleaningTaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CleaningTaskController extends Controller
{
    public function __construct(
        private readonly CleaningTaskService $cleaningTaskService,
    ) {}

    /**
     * List cleaning tasks for the authenticated owner.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->query('status'),
            'unit_id' => $request->query('unit_id'),
        ];

        $tasks = $this->cleaningTaskService->listForOwner($request->user()->id, $filters);

        return response()->json(['data' => $tasks]);
    }

    /**
     * Manually create a cleaning task.
     */
    public function store(StoreCleaningTaskRequest $request): JsonResponse
    {
        $result = $this->cleaningTaskService->create(
            $request->validated(),
            $request->user()->id,
        );

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result], 201);
    }

    /**
     * Show a single cleaning task.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $task = $this->cleaningTaskService->findForOwner($id, $request->user()->id);

        if (! $task) {
            return response()->json(['message' => 'Cleaning task not found.'], 404);
        }

        return response()->json(['data' => $task]);
    }

    /**
     * Update the status of a cleaning task.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $task = $this->cleaningTaskService->findForOwner($id, $request->user()->id);

        if (! $task) {
            return response()->json(['message' => 'Cleaning task not found.'], 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(CleaningTask::STATUSES)],
        ]);

        $result = $this->cleaningTaskService->updateStatus($task, $validated['status']);

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result]);
    }

    /**
     * Update notes on a cleaning task.
     */
    public function updateNotes(Request $request, int $id): JsonResponse
    {
        $task = $this->cleaningTaskService->findForOwner($id, $request->user()->id);

        if (! $task) {
            return response()->json(['message' => 'Cleaning task not found.'], 404);
        }

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = $this->cleaningTaskService->updateNotes($task, $validated['notes'] ?? null);

        return response()->json(['data' => $result]);
    }
}

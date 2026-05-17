<?php

namespace App\Modules\Expense\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Expense\Requests\StoreExpenseRequest;
use App\Modules\Expense\Requests\UpdateExpenseRequest;
use App\Modules\Expense\Services\ExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(
        private readonly ExpenseService $expenseService,
    ) {}

    /**
     * List expenses for the authenticated owner.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'category' => $request->query('category'),
            'property_id' => $request->query('property_id'),
            'unit_id' => $request->query('unit_id'),
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
        ];

        $expenses = $this->expenseService->listForOwner($request->user()->id, $filters);

        return response()->json(['data' => $expenses]);
    }

    /**
     * Create a new expense.
     */
    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $result = $this->expenseService->create(
            $request->validated(),
            $request->user()->id,
        );

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result], 201);
    }

    /**
     * Show a single expense.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $expense = $this->expenseService->findForOwner($id, $request->user()->id);

        if (! $expense) {
            return response()->json(['message' => 'Expense not found.'], 404);
        }

        return response()->json(['data' => $expense]);
    }

    /**
     * Update an existing expense.
     */
    public function update(UpdateExpenseRequest $request, int $id): JsonResponse
    {
        $expense = $this->expenseService->findForOwner($id, $request->user()->id);

        if (! $expense) {
            return response()->json(['message' => 'Expense not found.'], 404);
        }

        $result = $this->expenseService->update($expense, $request->validated(), $request->user()->id);

        if ($result instanceof JsonResponse) {
            return $result;
        }

        return response()->json(['data' => $result]);
    }

    /**
     * Delete an expense.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $expense = $this->expenseService->findForOwner($id, $request->user()->id);

        if (! $expense) {
            return response()->json(['message' => 'Expense not found.'], 404);
        }

        $this->expenseService->delete($expense);

        return response()->json(['message' => 'Expense deleted.']);
    }
}

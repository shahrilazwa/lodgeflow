<?php

namespace App\Modules\Unit\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Unit\Requests\StoreUnitRequest;
use App\Modules\Unit\Requests\UpdateUnitRequest;
use App\Modules\Unit\Services\UnitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function __construct(
        private readonly UnitService $unitService,
    ) {}

    /**
     * List all units for a property.
     */
    public function index(Request $request, int $propertyId): JsonResponse
    {
        $property = $this->unitService->findPropertyForOwner($propertyId, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $units = $this->unitService->listForProperty($propertyId, $request->user()->id);

        return response()->json(['data' => $units]);
    }

    /**
     * Create a new unit under a property.
     */
    public function store(StoreUnitRequest $request, int $propertyId): JsonResponse
    {
        $property = $this->unitService->findPropertyForOwner($propertyId, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $unit = $this->unitService->create(
            $request->validated(),
            $propertyId,
            $request->user()->id,
        );

        return response()->json(['data' => $unit], 201);
    }

    /**
     * Show a single unit.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $unit = $this->unitService->findForOwner($id, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        return response()->json(['data' => $unit]);
    }

    /**
     * Update an existing unit.
     */
    public function update(UpdateUnitRequest $request, int $id): JsonResponse
    {
        $unit = $this->unitService->findForOwner($id, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        $updated = $this->unitService->update($unit, $request->validated());

        return response()->json(['data' => $updated]);
    }

    /**
     * Deactivate a unit.
     */
    public function deactivate(Request $request, int $id): JsonResponse
    {
        $unit = $this->unitService->findForOwner($id, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        $updated = $this->unitService->deactivate($unit);

        return response()->json(['data' => $updated]);
    }

    /**
     * Activate a unit.
     */
    public function activate(Request $request, int $id): JsonResponse
    {
        $unit = $this->unitService->findForOwner($id, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        $updated = $this->unitService->activate($unit);

        return response()->json(['data' => $updated]);
    }
}

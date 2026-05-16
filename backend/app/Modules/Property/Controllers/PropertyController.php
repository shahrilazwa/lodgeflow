<?php

namespace App\Modules\Property\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Property\Requests\StorePropertyRequest;
use App\Modules\Property\Requests\UpdatePropertyRequest;
use App\Modules\Property\Services\PropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function __construct(
        private readonly PropertyService $propertyService,
    ) {}

    /**
     * List all properties for the authenticated owner.
     */
    public function index(Request $request): JsonResponse
    {
        $properties = $this->propertyService->listForOwner($request->user()->id);

        return response()->json(['data' => $properties]);
    }

    /**
     * Create a new property.
     */
    public function store(StorePropertyRequest $request): JsonResponse
    {
        $property = $this->propertyService->create(
            $request->validated(),
            $request->user()->id,
        );

        return response()->json(['data' => $property], 201);
    }

    /**
     * Show a single property.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $property = $this->propertyService->findForOwner($id, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        return response()->json(['data' => $property]);
    }

    /**
     * Update an existing property.
     */
    public function update(UpdatePropertyRequest $request, int $id): JsonResponse
    {
        $property = $this->propertyService->findForOwner($id, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $updated = $this->propertyService->update($property, $request->validated());

        return response()->json(['data' => $updated]);
    }

    /**
     * Delete a property.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $property = $this->propertyService->findForOwner($id, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $this->propertyService->delete($property);

        return response()->json(['message' => 'Property deleted.'], 200);
    }

    /**
     * Deactivate a property.
     */
    public function deactivate(Request $request, int $id): JsonResponse
    {
        $property = $this->propertyService->findForOwner($id, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $updated = $this->propertyService->deactivate($property);

        return response()->json(['data' => $updated]);
    }

    /**
     * Activate a property.
     */
    public function activate(Request $request, int $id): JsonResponse
    {
        $property = $this->propertyService->findForOwner($id, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $updated = $this->propertyService->activate($property);

        return response()->json(['data' => $updated]);
    }
}

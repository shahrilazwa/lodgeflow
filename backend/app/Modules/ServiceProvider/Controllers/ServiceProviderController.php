<?php

namespace App\Modules\ServiceProvider\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\ServiceProvider\Requests\StoreServiceProviderRequest;
use App\Modules\ServiceProvider\Requests\UpdateServiceProviderRequest;
use App\Modules\ServiceProvider\Services\ServiceProviderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceProviderController extends Controller
{
    public function __construct(
        private readonly ServiceProviderService $serviceProviderService,
    ) {}

    /**
     * List all service providers for the authenticated owner.
     */
    public function index(Request $request): JsonResponse
    {
        $providers = $this->serviceProviderService->listForOwner($request->user()->id);

        return response()->json(['data' => $providers]);
    }

    /**
     * Create a new service provider.
     */
    public function store(StoreServiceProviderRequest $request): JsonResponse
    {
        $provider = $this->serviceProviderService->create(
            $request->validated(),
            $request->user()->id,
        );

        return response()->json(['data' => $provider], 201);
    }

    /**
     * Show a single service provider.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $provider = $this->serviceProviderService->findForOwner($id, $request->user()->id);

        if (! $provider) {
            return response()->json(['message' => 'Service provider not found.'], 404);
        }

        return response()->json(['data' => $provider]);
    }

    /**
     * Update an existing service provider.
     */
    public function update(UpdateServiceProviderRequest $request, int $id): JsonResponse
    {
        $provider = $this->serviceProviderService->findForOwner($id, $request->user()->id);

        if (! $provider) {
            return response()->json(['message' => 'Service provider not found.'], 404);
        }

        $updated = $this->serviceProviderService->update($provider, $request->validated());

        return response()->json(['data' => $updated]);
    }

    /**
     * Delete a service provider.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $provider = $this->serviceProviderService->findForOwner($id, $request->user()->id);

        if (! $provider) {
            return response()->json(['message' => 'Service provider not found.'], 404);
        }

        $deleted = $this->serviceProviderService->delete($provider);

        if (! $deleted) {
            return response()->json([
                'message' => 'Cannot delete service provider while linked expenses exist.',
            ], 409);
        }

        return response()->json(['message' => 'Service provider deleted.']);
    }
}

<?php

namespace App\Modules\Guest\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Guest\Requests\StoreGuestRequest;
use App\Modules\Guest\Requests\UpdateGuestRequest;
use App\Modules\Guest\Services\GuestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function __construct(
        private readonly GuestService $guestService,
    ) {}

    /**
     * List/search guests for the authenticated owner.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $guests = $this->guestService->listForOwner(
            $request->user()->id,
            is_string($search) ? $search : null,
        );

        return response()->json(['data' => $guests]);
    }

    /**
     * Create a new guest.
     */
    public function store(StoreGuestRequest $request): JsonResponse
    {
        $guest = $this->guestService->create(
            $request->validated(),
            $request->user()->id,
        );

        return response()->json(['data' => $guest], 201);
    }

    /**
     * Show a single guest.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $guest = $this->guestService->findForOwner($id, $request->user()->id);

        if (! $guest) {
            return response()->json(['message' => 'Guest not found.'], 404);
        }

        return response()->json(['data' => $guest]);
    }

    /**
     * Update an existing guest.
     */
    public function update(UpdateGuestRequest $request, int $id): JsonResponse
    {
        $guest = $this->guestService->findForOwner($id, $request->user()->id);

        if (! $guest) {
            return response()->json(['message' => 'Guest not found.'], 404);
        }

        $updated = $this->guestService->update($guest, $request->validated());

        return response()->json(['data' => $updated]);
    }
}

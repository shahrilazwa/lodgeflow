<?php

namespace App\Modules\Unit\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Unit\Models\UnitPhoto;
use App\Modules\Unit\Services\UnitPhotoService;
use App\Modules\Unit\Services\UnitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitPhotoController extends Controller
{
    public function __construct(
        private readonly UnitService $unitService,
        private readonly UnitPhotoService $photoService,
    ) {}

    public function index(Request $request, int $unitId): JsonResponse
    {
        $unit = $this->unitService->findForOwner($unitId, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        return response()->json(['data' => $unit->photos()->get()]);
    }

    public function store(Request $request, int $unitId): JsonResponse
    {
        $unit = $this->unitService->findForOwner($unitId, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        $data = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'caption' => ['nullable', 'string', 'max:150'],
        ]);

        $photo = $this->photoService->store(
            $unit,
            $request->file('photo'),
            $data['caption'] ?? null,
        );

        return response()->json(['data' => $photo], 201);
    }

    public function update(Request $request, int $unitId, int $photoId): JsonResponse
    {
        $unit = $this->unitService->findForOwner($unitId, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        $photo = $this->findPhoto($photoId, $unit->id, $request->user()->id);

        if (! $photo) {
            return response()->json(['message' => 'Photo not found.'], 404);
        }

        $data = $request->validate([
            'caption' => ['nullable', 'string', 'max:150'],
        ]);

        $updated = $this->photoService->updateCaption($photo, $data['caption'] ?? null);

        return response()->json(['data' => $updated]);
    }

    public function destroy(Request $request, int $unitId, int $photoId): JsonResponse
    {
        $unit = $this->unitService->findForOwner($unitId, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        $photo = $this->findPhoto($photoId, $unit->id, $request->user()->id);

        if (! $photo) {
            return response()->json(['message' => 'Photo not found.'], 404);
        }

        $this->photoService->delete($photo);

        return response()->json(['message' => 'Unit photo deleted.']);
    }

    public function setCover(Request $request, int $unitId, int $photoId): JsonResponse
    {
        $unit = $this->unitService->findForOwner($unitId, $request->user()->id);

        if (! $unit) {
            return response()->json(['message' => 'Unit not found.'], 404);
        }

        $photo = $this->findPhoto($photoId, $unit->id, $request->user()->id);

        if (! $photo) {
            return response()->json(['message' => 'Photo not found.'], 404);
        }

        $updated = $this->photoService->setCover($photo);

        return response()->json(['data' => $updated]);
    }

    private function findPhoto(int $photoId, int $unitId, int $ownerId): ?UnitPhoto
    {
        return UnitPhoto::where('id', $photoId)
            ->where('unit_id', $unitId)
            ->where('owner_id', $ownerId)
            ->first();
    }
}

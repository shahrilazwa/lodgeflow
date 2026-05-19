<?php

namespace App\Modules\Property\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Property\Models\PropertyPhoto;
use App\Modules\Property\Services\PropertyPhotoService;
use App\Modules\Property\Services\PropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyPhotoController extends Controller
{
    public function __construct(
        private readonly PropertyService $propertyService,
        private readonly PropertyPhotoService $photoService,
    ) {}

    public function index(Request $request, int $propertyId): JsonResponse
    {
        $property = $this->propertyService->findForOwner($propertyId, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        return response()->json(['data' => $property->photos()->get()]);
    }

    public function store(Request $request, int $propertyId): JsonResponse
    {
        $property = $this->propertyService->findForOwner($propertyId, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $data = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'caption' => ['nullable', 'string', 'max:150'],
        ]);

        $photo = $this->photoService->store(
            $property,
            $request->file('photo'),
            $data['caption'] ?? null,
        );

        return response()->json(['data' => $photo], 201);
    }

    public function destroy(Request $request, int $propertyId, int $photoId): JsonResponse
    {
        $property = $this->propertyService->findForOwner($propertyId, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $photo = PropertyPhoto::where('id', $photoId)
            ->where('property_id', $property->id)
            ->where('owner_id', $request->user()->id)
            ->first();

        if (! $photo) {
            return response()->json(['message' => 'Photo not found.'], 404);
        }

        $this->photoService->delete($photo);

        return response()->json(['message' => 'Property photo deleted.']);
    }

    public function setCover(Request $request, int $propertyId, int $photoId): JsonResponse
    {
        $property = $this->propertyService->findForOwner($propertyId, $request->user()->id);

        if (! $property) {
            return response()->json(['message' => 'Property not found.'], 404);
        }

        $photo = PropertyPhoto::where('id', $photoId)
            ->where('property_id', $property->id)
            ->where('owner_id', $request->user()->id)
            ->first();

        if (! $photo) {
            return response()->json(['message' => 'Photo not found.'], 404);
        }

        $updated = $this->photoService->setCover($photo);

        return response()->json(['data' => $updated]);
    }
}

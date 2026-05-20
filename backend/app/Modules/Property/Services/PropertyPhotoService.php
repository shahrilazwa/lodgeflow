<?php

namespace App\Modules\Property\Services;

use App\Modules\Property\Models\Property;
use App\Modules\Property\Models\PropertyPhoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PropertyPhotoService
{
    public function store(Property $property, UploadedFile $file, ?string $caption = null): PropertyPhoto
    {
        return DB::transaction(function () use ($property, $file, $caption): PropertyPhoto {
            $path = $file->store("properties/{$property->id}/photos", 'public');
            $hasCover = PropertyPhoto::where('property_id', $property->id)->where('is_cover', true)->exists();
            $nextSortOrder = (int) PropertyPhoto::where('property_id', $property->id)->max('sort_order') + 1;

            return PropertyPhoto::create([
                'owner_id' => $property->owner_id,
                'property_id' => $property->id,
                'path' => $path,
                'caption' => $caption,
                'sort_order' => $nextSortOrder,
                'is_cover' => ! $hasCover,
            ]);
        });
    }

    public function delete(PropertyPhoto $photo): void
    {
        DB::transaction(function () use ($photo): void {
            $wasCover = $photo->is_cover;
            $propertyId = $photo->property_id;

            Storage::disk('public')->delete($photo->path);
            $photo->delete();

            if ($wasCover) {
                $nextPhoto = PropertyPhoto::where('property_id', $propertyId)
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->first();

                if ($nextPhoto) {
                    $nextPhoto->update(['is_cover' => true]);
                }
            }
        });
    }

    public function setCover(PropertyPhoto $photo): PropertyPhoto
    {
        return DB::transaction(function () use ($photo): PropertyPhoto {
            PropertyPhoto::where('property_id', $photo->property_id)->update(['is_cover' => false]);
            $photo->update(['is_cover' => true]);

            return $photo->fresh();
        });
    }
}

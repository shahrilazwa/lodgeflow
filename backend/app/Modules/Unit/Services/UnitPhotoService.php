<?php

namespace App\Modules\Unit\Services;

use App\Modules\Unit\Models\Unit;
use App\Modules\Unit\Models\UnitPhoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UnitPhotoService
{
    public function store(Unit $unit, UploadedFile $file, ?string $caption = null): UnitPhoto
    {
        return DB::transaction(function () use ($unit, $file, $caption): UnitPhoto {
            $path = $file->store("units/{$unit->id}/photos", 'public');
            $hasCover = UnitPhoto::where('unit_id', $unit->id)->where('is_cover', true)->exists();
            $nextSortOrder = (int) UnitPhoto::where('unit_id', $unit->id)->max('sort_order') + 1;

            return UnitPhoto::create([
                'owner_id' => $unit->owner_id,
                'unit_id' => $unit->id,
                'path' => $path,
                'caption' => $caption,
                'sort_order' => $nextSortOrder,
                'is_cover' => ! $hasCover,
            ]);
        });
    }

    public function updateCaption(UnitPhoto $photo, ?string $caption): UnitPhoto
    {
        $photo->update(['caption' => $caption]);

        return $photo->fresh();
    }

    public function delete(UnitPhoto $photo): void
    {
        DB::transaction(function () use ($photo): void {
            $wasCover = $photo->is_cover;
            $unitId = $photo->unit_id;

            Storage::disk('public')->delete($photo->path);
            $photo->delete();

            if ($wasCover) {
                $nextPhoto = UnitPhoto::where('unit_id', $unitId)
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->first();

                if ($nextPhoto) {
                    $nextPhoto->update(['is_cover' => true]);
                }
            }
        });
    }

    public function setCover(UnitPhoto $photo): UnitPhoto
    {
        return DB::transaction(function () use ($photo): UnitPhoto {
            UnitPhoto::where('unit_id', $photo->unit_id)->update(['is_cover' => false]);
            $photo->update(['is_cover' => true]);

            return $photo->fresh();
        });
    }
}

<?php

namespace Tests\Feature\Unit;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use App\Modules\Unit\Models\UnitPhoto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UnitPhotoApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    private Unit $unit;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->owner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $this->owner->id]);
        $this->unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $property->id,
        ]);
    }

    public function test_owner_can_upload_unit_photo(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/units/{$this->unit->id}/photos", [
                'photo' => $this->fakePng('bedroom.png'),
                'caption' => 'Bedroom view',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.caption', 'Bedroom view')
            ->assertJsonPath('data.is_cover', true)
            ->assertJsonStructure(['data' => ['id', 'path', 'url']]);

        $photo = UnitPhoto::firstOrFail();
        Storage::disk('public')->assertExists($photo->path);
    }

    public function test_second_uploaded_photo_is_not_cover_by_default(): void
    {
        UnitPhoto::create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'path' => 'units/1/photos/cover.png',
            'is_cover' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/units/{$this->unit->id}/photos", [
                'photo' => $this->fakePng('bathroom.png'),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_cover', false);
    }

    public function test_owner_can_list_unit_photos(): void
    {
        UnitPhoto::create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'path' => 'units/1/photos/bedroom.png',
            'is_cover' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/units/{$this->unit->id}/photos");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_cover', true);
    }

    public function test_owner_can_update_unit_photo_caption(): void
    {
        $photo = UnitPhoto::create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'path' => 'units/1/photos/bedroom.png',
            'caption' => null,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/units/{$this->unit->id}/photos/{$photo->id}", [
                'caption' => 'Bedroom view',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.caption', 'Bedroom view');

        $this->assertSame('Bedroom view', $photo->fresh()->caption);
    }

    public function test_owner_can_set_unit_photo_as_cover(): void
    {
        $cover = UnitPhoto::create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'path' => 'units/1/photos/front.png',
            'is_cover' => true,
        ]);

        $newCover = UnitPhoto::create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'path' => 'units/1/photos/room.png',
            'is_cover' => false,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/units/{$this->unit->id}/photos/{$newCover->id}/cover");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $newCover->id)
            ->assertJsonPath('data.is_cover', true);

        $this->assertFalse($cover->fresh()->is_cover);
        $this->assertTrue($newCover->fresh()->is_cover);
    }

    public function test_owner_can_delete_unit_photo(): void
    {
        Storage::disk('public')->put('units/1/photos/bedroom.png', 'fake-image');

        $photo = UnitPhoto::create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'path' => 'units/1/photos/bedroom.png',
            'is_cover' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/units/{$this->unit->id}/photos/{$photo->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Unit photo deleted.');

        $this->assertDatabaseMissing('unit_photos', ['id' => $photo->id]);
        Storage::disk('public')->assertMissing('units/1/photos/bedroom.png');
    }

    public function test_owner_cannot_manage_other_owners_unit_photo(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $otherUnit = Unit::factory()->create([
            'owner_id' => $otherOwner->id,
            'property_id' => $otherProperty->id,
        ]);
        $photo = UnitPhoto::create([
            'owner_id' => $otherOwner->id,
            'unit_id' => $otherUnit->id,
            'path' => 'units/2/photos/bedroom.png',
        ]);

        $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/units/{$otherUnit->id}/photos/{$photo->id}")
            ->assertStatus(404);
    }

    public function test_upload_requires_valid_image(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/units/{$this->unit->id}/photos", [
                'photo' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photo']);
    }

    private function fakePng(string $name): UploadedFile
    {
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        );

        return UploadedFile::fake()->createWithContent($name, $png ?: '');
    }
}

<?php

namespace Tests\Feature\Property;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use App\Modules\Property\Models\PropertyPhoto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PropertyPhotoApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    private Property $property;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->owner = Owner::factory()->create();
        $this->property = Property::factory()->create(['owner_id' => $this->owner->id]);
    }

    public function test_owner_can_upload_property_photo(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/photos", [
                'photo' => $this->fakePng('front.png'),
                'caption' => 'Front view',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.caption', 'Front view')
            ->assertJsonPath('data.is_cover', true)
            ->assertJsonStructure(['data' => ['id', 'path', 'url']]);

        $photo = PropertyPhoto::firstOrFail();
        Storage::disk('public')->assertExists($photo->path);
    }

    public function test_second_uploaded_photo_is_not_cover_by_default(): void
    {
        PropertyPhoto::create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'path' => 'properties/1/photos/cover.png',
            'is_cover' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/photos", [
                'photo' => $this->fakePng('kitchen.png'),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_cover', false);
    }

    public function test_owner_can_list_property_photos(): void
    {
        PropertyPhoto::create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'path' => 'properties/1/photos/front.png',
            'is_cover' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson("/api/v1/properties/{$this->property->id}/photos");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_cover', true);
    }

    public function test_owner_can_set_property_photo_as_cover(): void
    {
        $cover = PropertyPhoto::create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'path' => 'properties/1/photos/front.png',
            'is_cover' => true,
        ]);

        $newCover = PropertyPhoto::create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'path' => 'properties/1/photos/room.png',
            'is_cover' => false,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/v1/properties/{$this->property->id}/photos/{$newCover->id}/cover");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $newCover->id)
            ->assertJsonPath('data.is_cover', true);

        $this->assertFalse($cover->fresh()->is_cover);
        $this->assertTrue($newCover->fresh()->is_cover);
    }

    public function test_owner_can_delete_property_photo(): void
    {
        Storage::disk('public')->put('properties/1/photos/front.png', 'fake-image');

        $photo = PropertyPhoto::create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'path' => 'properties/1/photos/front.png',
            'is_cover' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/properties/{$this->property->id}/photos/{$photo->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Property photo deleted.');

        $this->assertDatabaseMissing('property_photos', ['id' => $photo->id]);
        Storage::disk('public')->assertMissing('properties/1/photos/front.png');
    }

    public function test_owner_cannot_manage_other_owners_property_photo(): void
    {
        $otherOwner = Owner::factory()->create();
        $otherProperty = Property::factory()->create(['owner_id' => $otherOwner->id]);
        $photo = PropertyPhoto::create([
            'owner_id' => $otherOwner->id,
            'property_id' => $otherProperty->id,
            'path' => 'properties/2/photos/front.png',
        ]);

        $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/properties/{$otherProperty->id}/photos/{$photo->id}")
            ->assertStatus(404);
    }

    public function test_upload_requires_valid_image(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/photos", [
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

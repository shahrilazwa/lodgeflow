<?php

namespace Tests\Feature\Unit;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use App\Modules\Unit\Models\UnitBed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnitBedOccupancyApiTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    private Property $property;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = Owner::factory()->create();
        $this->property = Property::factory()->create(['owner_id' => $this->owner->id]);
    }

    public function test_owner_can_create_unit_with_bed_setup_and_calculated_occupancy(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", [
                'name' => 'Family Room',
                'type' => 'room',
                'price_per_night' => 250.00,
                'occupancy_source' => Unit::OCCUPANCY_SOURCE_CALCULATED,
                'beds' => [
                    ['bed_type' => UnitBed::TYPE_QUEEN, 'quantity' => 1],
                    ['bed_type' => UnitBed::TYPE_BUNK, 'quantity' => 1],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.max_occupancy', 4)
            ->assertJsonPath('data.occupancy_source', Unit::OCCUPANCY_SOURCE_CALCULATED)
            ->assertJsonCount(2, 'data.beds');

        $this->assertDatabaseHas('unit_beds', [
            'bed_type' => UnitBed::TYPE_QUEEN,
            'quantity' => 1,
            'capacity_per_bed' => 2,
        ]);
    }

    public function test_owner_can_create_unit_with_manual_occupancy_override(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", [
                'name' => 'Whole House',
                'type' => 'whole_house',
                'occupancy_source' => Unit::OCCUPANCY_SOURCE_MANUAL,
                'max_occupancy' => 8,
                'beds' => [
                    ['bed_type' => UnitBed::TYPE_QUEEN, 'quantity' => 2],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.max_occupancy', 8)
            ->assertJsonPath('data.occupancy_source', Unit::OCCUPANCY_SOURCE_MANUAL)
            ->assertJsonCount(1, 'data.beds');
    }

    public function test_owner_can_update_unit_bed_setup_and_recalculate_occupancy(): void
    {
        $unit = Unit::factory()->create([
            'owner_id' => $this->owner->id,
            'property_id' => $this->property->id,
            'name' => 'Original Unit',
            'type' => 'room',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/units/{$unit->id}", [
                'name' => 'Updated Unit',
                'type' => 'room',
                'occupancy_source' => Unit::OCCUPANCY_SOURCE_CALCULATED,
                'beds' => [
                    ['bed_type' => UnitBed::TYPE_SINGLE, 'quantity' => 2],
                    ['bed_type' => UnitBed::TYPE_FLOOR_MATTRESS, 'quantity' => 1],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.max_occupancy', 3)
            ->assertJsonCount(2, 'data.beds');
    }

    public function test_unit_bed_setup_validates_bed_type(): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson("/api/v1/properties/{$this->property->id}/units", [
                'name' => 'Invalid Bed Unit',
                'type' => 'room',
                'beds' => [
                    ['bed_type' => 'water_bed', 'quantity' => 1],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['beds.0.bed_type']);
    }
}

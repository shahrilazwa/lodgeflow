<?php

namespace Tests\Unit;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_property_has_many_units(): void
    {
        $owner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $owner->id]);

        Unit::factory()->count(2)->create([
            'owner_id' => $owner->id,
            'property_id' => $property->id,
        ]);

        $this->assertCount(2, $property->units);
        $this->assertInstanceOf(Unit::class, $property->units->first());
    }
}

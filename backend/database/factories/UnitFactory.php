<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    protected $model = Unit::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => Owner::factory(),
            'property_id' => Property::factory(),
            'name' => 'Room ' . fake()->unique()->numberBetween(1, 999),
            'type' => fake()->randomElement(Unit::TYPES),
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the unit is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}

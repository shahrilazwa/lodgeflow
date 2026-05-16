<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    protected $model = Property::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => Owner::factory(),
            'name' => fake()->company() . ' Homestay',
            'address' => fake()->address(),
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the property is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}

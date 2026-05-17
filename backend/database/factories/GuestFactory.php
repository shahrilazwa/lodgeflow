<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\Guest\Models\Guest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Guest>
 */
class GuestFactory extends Factory
{
    protected $model = Guest::class;

    public function definition(): array
    {
        return [
            'owner_id' => Owner::factory(),
            'full_name' => fake()->name(),
            'phone' => fake()->numerify('#########'),
            'email' => fake()->optional()->safeEmail(),
            'identification_number' => fake()->optional()->numerify('############'),
        ];
    }
}

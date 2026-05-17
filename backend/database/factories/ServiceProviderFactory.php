<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\ServiceProvider\Models\ServiceProvider;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceProvider>
 */
class ServiceProviderFactory extends Factory
{
    protected $model = ServiceProvider::class;

    public function definition(): array
    {
        return [
            'owner_id' => Owner::factory(),
            'name' => fake()->company(),
            'service_type' => fake()->randomElement(['cleaning', 'plumbing', 'electrical', 'laundry', 'maintenance']),
            'phone' => fake()->optional()->phoneNumber(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}

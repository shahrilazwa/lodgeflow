<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\MaintenanceTask\Models\MaintenanceTask;
use App\Modules\Property\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MaintenanceTask>
 */
class MaintenanceTaskFactory extends Factory
{
    protected $model = MaintenanceTask::class;

    public function definition(): array
    {
        return [
            'owner_id' => Owner::factory(),
            'property_id' => Property::factory(),
            'unit_id' => null,
            'service_provider_id' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'priority' => fake()->randomElement(MaintenanceTask::PRIORITIES),
            'status' => MaintenanceTask::STATUS_OPEN,
            'scheduled_date' => fake()->optional()->date(),
        ];
    }
}

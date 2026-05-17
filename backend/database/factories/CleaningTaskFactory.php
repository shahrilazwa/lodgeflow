<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\CleaningTask\Models\CleaningTask;
use App\Modules\Unit\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CleaningTask>
 */
class CleaningTaskFactory extends Factory
{
    protected $model = CleaningTask::class;

    public function definition(): array
    {
        return [
            'owner_id' => Owner::factory(),
            'unit_id' => Unit::factory(),
            'booking_id' => null,
            'status' => CleaningTask::STATUS_PENDING,
            'notes' => null,
        ];
    }

    public function inProgress(): static
    {
        return $this->state(fn () => ['status' => CleaningTask::STATUS_IN_PROGRESS]);
    }

    public function completed(): static
    {
        return $this->state(fn () => ['status' => CleaningTask::STATUS_COMPLETED]);
    }
}

<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\Expense\Models\Expense;
use App\Modules\Property\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'owner_id' => Owner::factory(),
            'property_id' => Property::factory(),
            'unit_id' => null,
            'booking_id' => null,
            'service_provider_id' => null,
            'cleaning_task_id' => null,
            'maintenance_task_id' => null,
            'amount' => fake()->randomFloat(2, 10, 5000),
            'date' => fake()->date(),
            'category' => fake()->randomElement(Expense::CATEGORIES),
            'description' => fake()->optional()->sentence(),
        ];
    }
}

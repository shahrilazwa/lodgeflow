<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Payment\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'owner_id' => Owner::factory(),
            'booking_id' => Booking::factory(),
            'type' => Payment::TYPE_PAYMENT,
            'amount' => fake()->randomFloat(2, 50, 1000),
            'payment_date' => fake()->date(),
            'payment_method' => fake()->randomElement(Payment::METHODS),
        ];
    }

    public function refund(): static
    {
        return $this->state(fn () => ['type' => Payment::TYPE_REFUND]);
    }
}

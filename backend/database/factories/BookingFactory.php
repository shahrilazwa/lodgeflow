<?php

namespace Database\Factories;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Guest\Models\Guest;
use App\Modules\Unit\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('+1 day', '+30 days');
        $checkOut = (clone $checkIn)->modify('+' . fake()->numberBetween(1, 7) . ' days');

        return [
            'owner_id' => Owner::factory(),
            'unit_id' => Unit::factory(),
            'guest_id' => Guest::factory(),
            'check_in_date' => $checkIn->format('Y-m-d'),
            'check_out_date' => $checkOut->format('Y-m-d'),
            'total_amount' => fake()->randomFloat(2, 50, 5000),
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => 'unpaid',
            'net_paid_amount' => 0.00,
        ];
    }

    public function checkedIn(): static
    {
        return $this->state(fn () => ['status' => Booking::STATUS_CHECKED_IN]);
    }

    public function checkedOut(): static
    {
        return $this->state(fn () => ['status' => Booking::STATUS_CHECKED_OUT]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => Booking::STATUS_CANCELLED]);
    }
}

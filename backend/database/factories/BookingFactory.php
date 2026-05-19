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
        $checkIn = now()->toDateString();
        $checkOut = now()->addDay()->toDateString();

        return [
            'owner_id' => Owner::factory(),
            'unit_id' => Unit::factory(),
            'guest_id' => Guest::factory(),
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'total_amount' => fake()->randomFloat(2, 50, 5000),
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => 'unpaid',
            'net_paid_amount' => 0.00,
        ];
    }

    public function pendingCustomerConfirmation(): static
    {
        return $this->state(fn () => ['status' => Booking::STATUS_PENDING_CUSTOMER_CONFIRMATION]);
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

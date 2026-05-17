<?php

namespace Tests\Property;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Guest\Models\Guest;
use App\Modules\Property\Models\Property;
use App\Modules\Unit\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Property-Based Tests for Booking Date Overlap Logic.
 *
 * Feature: lodgeflow-owner-mvp
 * Property 3: Booking date overlap rejection
 * Property 4: Invalid date range rejection
 *
 * These tests verify that for ANY pair of date ranges on the same unit,
 * overlaps are correctly detected and non-overlapping bookings are accepted.
 */
class BookingOverlapTest extends TestCase
{
    use RefreshDatabase;

    private Owner $owner;

    private Unit $unit;

    private Guest $guest;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = Owner::factory()->create();
        $property = Property::factory()->create(['owner_id' => $this->owner->id]);
        $this->unit = Unit::factory()->create(['owner_id' => $this->owner->id, 'property_id' => $property->id]);
        $this->guest = Guest::factory()->create(['owner_id' => $this->owner->id]);
    }

    /**
     * Property 3: Overlapping bookings are always rejected with 409.
     *
     * Two bookings overlap if: booking1.check_in < booking2.check_out AND booking1.check_out > booking2.check_in
     */
    #[DataProvider('overlappingDatesProvider')]
    public function test_overlapping_bookings_are_rejected(string $existingIn, string $existingOut, string $newIn, string $newOut): void
    {
        // Create existing confirmed booking
        Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'check_in_date' => $existingIn,
            'check_out_date' => $existingOut,
            'status' => 'confirmed',
        ]);

        // Attempt to create overlapping booking
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => $newIn,
                'check_out_date' => $newOut,
                'total_amount' => 100.00,
            ]);

        $response->assertStatus(409, "Expected 409 for overlap: existing [{$existingIn}, {$existingOut}), new [{$newIn}, {$newOut})");
    }

    /**
     * Property 3 (inverse): Non-overlapping bookings are always accepted.
     */
    #[DataProvider('nonOverlappingDatesProvider')]
    public function test_non_overlapping_bookings_are_accepted(string $existingIn, string $existingOut, string $newIn, string $newOut): void
    {
        // Create existing confirmed booking
        Booking::factory()->create([
            'owner_id' => $this->owner->id,
            'unit_id' => $this->unit->id,
            'guest_id' => $this->guest->id,
            'check_in_date' => $existingIn,
            'check_out_date' => $existingOut,
            'status' => 'confirmed',
        ]);

        // Attempt to create non-overlapping booking
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => $newIn,
                'check_out_date' => $newOut,
                'total_amount' => 100.00,
            ]);

        $response->assertStatus(201, "Expected 201 for non-overlap: existing [{$existingIn}, {$existingOut}), new [{$newIn}, {$newOut})");
    }

    /**
     * Property 4: Any booking with check_out <= check_in is rejected.
     */
    #[DataProvider('invalidDateRangeProvider')]
    public function test_invalid_date_ranges_are_rejected(string $checkIn, string $checkOut): void
    {
        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'unit_id' => $this->unit->id,
                'guest_id' => $this->guest->id,
                'check_in_date' => $checkIn,
                'check_out_date' => $checkOut,
                'total_amount' => 100.00,
            ]);

        $response->assertStatus(422, "Expected 422 for invalid range: check_in={$checkIn}, check_out={$checkOut}");
    }

    /**
     * Generate 50 overlapping date pairs.
     * Two ranges [A,B) and [C,D) overlap when C < B AND D > A.
     */
    public static function overlappingDatesProvider(): array
    {
        mt_srand(77); // Fixed seed
        $cases = [];
        $baseDate = strtotime('2026-06-01');

        for ($i = 0; $i < 50; $i++) {
            // Existing booking: random start, 1-7 day duration
            $existStart = $baseDate + (mt_rand(0, 60) * 86400);
            $existDuration = mt_rand(1, 7);
            $existEnd = $existStart + ($existDuration * 86400);

            // New booking that overlaps: starts before existing ends, ends after existing starts
            $overlapType = mt_rand(0, 3);
            switch ($overlapType) {
                case 0: // New starts during existing
                    $newStart = $existStart + (mt_rand(0, $existDuration - 1) * 86400);
                    $newEnd = $newStart + (mt_rand(1, 5) * 86400);
                    break;
                case 1: // New ends during existing
                    $newEnd = $existStart + (mt_rand(1, $existDuration) * 86400);
                    $newStart = $newEnd - (mt_rand(1, 5) * 86400);
                    break;
                case 2: // New contains existing
                    $newStart = $existStart - (mt_rand(0, 3) * 86400);
                    $newEnd = $existEnd + (mt_rand(0, 3) * 86400);
                    break;
                default: // New is contained by existing
                    if ($existDuration >= 3) {
                        $newStart = $existStart + 86400;
                        $newEnd = $existEnd - 86400;
                    } else {
                        $newStart = $existStart;
                        $newEnd = $existEnd;
                    }
                    break;
            }

            // Ensure new range is valid (check_out > check_in)
            if ($newEnd <= $newStart) {
                $newEnd = $newStart + 86400;
            }

            $existIn = date('Y-m-d', $existStart);
            $existOut = date('Y-m-d', $existEnd);
            $newIn = date('Y-m-d', $newStart);
            $newOut = date('Y-m-d', $newEnd);

            $cases["overlap_{$i}"] = [$existIn, $existOut, $newIn, $newOut];
        }

        return $cases;
    }

    /**
     * Generate 50 non-overlapping date pairs.
     * Non-overlapping: new starts on or after existing ends, OR new ends on or before existing starts.
     */
    public static function nonOverlappingDatesProvider(): array
    {
        mt_srand(88); // Fixed seed
        $cases = [];
        $baseDate = strtotime('2026-06-01');

        for ($i = 0; $i < 50; $i++) {
            // Existing booking
            $existStart = $baseDate + (mt_rand(10, 50) * 86400);
            $existDuration = mt_rand(1, 7);
            $existEnd = $existStart + ($existDuration * 86400);

            if (mt_rand(0, 1) === 0) {
                // New booking AFTER existing (starts on or after existing check_out)
                $gap = mt_rand(0, 5); // 0 = adjacent (same day), 1+ = gap
                $newStart = $existEnd + ($gap * 86400);
                $newEnd = $newStart + (mt_rand(1, 5) * 86400);
            } else {
                // New booking BEFORE existing (ends on or before existing check_in)
                $gap = mt_rand(0, 5);
                $newEnd = $existStart - ($gap * 86400);
                $newStart = $newEnd - (mt_rand(1, 5) * 86400);
            }

            // Ensure valid range
            if ($newEnd <= $newStart) {
                continue;
            }

            $existIn = date('Y-m-d', $existStart);
            $existOut = date('Y-m-d', $existEnd);
            $newIn = date('Y-m-d', $newStart);
            $newOut = date('Y-m-d', $newEnd);

            $cases["non_overlap_{$i}"] = [$existIn, $existOut, $newIn, $newOut];
        }

        return $cases;
    }

    /**
     * Generate 50 invalid date ranges (check_out <= check_in).
     */
    public static function invalidDateRangeProvider(): array
    {
        mt_srand(99); // Fixed seed
        $cases = [];
        $baseDate = strtotime('2026-06-01');

        for ($i = 0; $i < 50; $i++) {
            $checkIn = $baseDate + (mt_rand(0, 90) * 86400);

            if (mt_rand(0, 1) === 0) {
                // Same day (check_out = check_in)
                $checkOut = $checkIn;
            } else {
                // check_out before check_in
                $checkOut = $checkIn - (mt_rand(1, 10) * 86400);
            }

            $cases["invalid_{$i}"] = [date('Y-m-d', $checkIn), date('Y-m-d', $checkOut)];
        }

        return $cases;
    }
}

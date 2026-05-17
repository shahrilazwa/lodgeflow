<?php

namespace App\Modules\CleaningTask\Jobs;

use App\Modules\Booking\Models\Booking;
use App\Modules\CleaningTask\Models\CleaningTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class CreateCleaningTaskJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Max retry attempts: 3
     */
    public int $tries = 3;

    /**
     * Backoff between retries: 60 seconds
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     * owner_id is passed explicitly — do NOT use auth()->id() in queue context.
     */
    public function __construct(
        public readonly int $bookingId,
        public readonly int $unitId,
        public readonly int $ownerId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Validate booking exists and is in checked_out status
        $booking = Booking::find($this->bookingId);

        if (! $booking) {
            Log::warning('CreateCleaningTaskJob: booking not found, skipping.', [
                'booking_id' => $this->bookingId,
            ]);

            return;
        }

        if ($booking->status !== Booking::STATUS_CHECKED_OUT) {
            Log::warning('CreateCleaningTaskJob: booking not in checked_out status, skipping.', [
                'booking_id' => $this->bookingId,
                'status' => $booking->status,
            ]);

            return;
        }

        // Prevent duplicate: check if a cleaning task already exists for this booking
        $exists = CleaningTask::where('booking_id', $this->bookingId)->exists();

        if ($exists) {
            Log::info('CreateCleaningTaskJob: cleaning task already exists for booking, skipping.', [
                'booking_id' => $this->bookingId,
            ]);

            return;
        }

        // Create the cleaning task
        CleaningTask::create([
            'owner_id' => $this->ownerId,
            'unit_id' => $this->unitId,
            'booking_id' => $this->bookingId,
            'status' => CleaningTask::STATUS_PENDING,
        ]);

        Log::info('CreateCleaningTaskJob: cleaning task created.', [
            'booking_id' => $this->bookingId,
            'unit_id' => $this->unitId,
            'owner_id' => $this->ownerId,
        ]);
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('CreateCleaningTaskJob: permanent failure after all retries.', [
            'booking_id' => $this->bookingId,
            'unit_id' => $this->unitId,
            'owner_id' => $this->ownerId,
            'error' => $exception->getMessage(),
        ]);
    }
}

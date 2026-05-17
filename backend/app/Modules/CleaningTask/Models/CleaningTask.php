<?php

namespace App\Modules\CleaningTask\Models;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Unit\Models\Unit;
use Database\Factories\CleaningTaskFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CleaningTask extends Model
{
    /** @use HasFactory<CleaningTaskFactory> */
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_IN_PROGRESS,
        self::STATUS_COMPLETED,
    ];

    /**
     * Valid status transitions: from => [allowed targets]
     */
    public const TRANSITIONS = [
        self::STATUS_PENDING => [self::STATUS_IN_PROGRESS],
        self::STATUS_IN_PROGRESS => [self::STATUS_COMPLETED],
        self::STATUS_COMPLETED => [],
    ];

    protected $fillable = [
        'owner_id',
        'unit_id',
        'booking_id',
        'status',
        'notes',
    ];

    protected static function newFactory(): CleaningTaskFactory
    {
        return CleaningTaskFactory::new();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}

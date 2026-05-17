<?php

namespace App\Modules\Booking\Models;

use App\Models\Owner;
use App\Modules\Guest\Models\Guest;
use App\Modules\Payment\Models\Payment;
use App\Modules\Unit\Models\Unit;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_CHECKED_IN = 'checked_in';

    public const STATUS_CHECKED_OUT = 'checked_out';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_CONFIRMED,
        self::STATUS_CHECKED_IN,
        self::STATUS_CHECKED_OUT,
        self::STATUS_CANCELLED,
    ];

    public const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'overpaid', 'refunded'];

    protected $fillable = [
        'owner_id',
        'unit_id',
        'guest_id',
        'check_in_date',
        'check_out_date',
        'total_amount',
        'status',
        'payment_status',
        'net_paid_amount',
    ];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'date',
            'check_out_date' => 'date',
            'total_amount' => 'decimal:2',
            'net_paid_amount' => 'decimal:2',
        ];
    }

    protected static function newFactory(): BookingFactory
    {
        return BookingFactory::new();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}

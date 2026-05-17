<?php

namespace App\Modules\Expense\Models;

use App\Models\Owner;
use App\Modules\Booking\Models\Booking;
use App\Modules\Property\Models\Property;
use App\Modules\ServiceProvider\Models\ServiceProvider;
use App\Modules\Unit\Models\Unit;
use Database\Factories\ExpenseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    /** @use HasFactory<ExpenseFactory> */
    use HasFactory;

    public const CATEGORIES = [
        'utility_bills',
        'maintenance',
        'cleaning_services',
        'laundry_services',
        'supplies',
        'internet',
        'platform_fees',
        'repairs',
        'insurance',
        'tax',
        'other',
    ];

    protected $fillable = [
        'owner_id',
        'property_id',
        'unit_id',
        'booking_id',
        'service_provider_id',
        'cleaning_task_id',
        'maintenance_task_id',
        'amount',
        'date',
        'category',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'date' => 'date',
        ];
    }

    protected static function newFactory(): ExpenseFactory
    {
        return ExpenseFactory::new();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function serviceProvider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class);
    }

    // CleaningTask and MaintenanceTask relationships will be added in v0.5.0
}

<?php

namespace App\Modules\Unit\Models;

use App\Models\Owner;
use App\Modules\Facility\Models\Facility;
use App\Modules\Property\Models\Property;
use Database\Factories\UnitFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    /** @use HasFactory<UnitFactory> */
    use HasFactory;

    /**
     * Valid unit types.
     */
    public const TYPES = ['room', 'suite', 'dormitory_bed', 'entire_unit', 'whole_house'];

    public const OCCUPANCY_SOURCE_CALCULATED = 'calculated';

    public const OCCUPANCY_SOURCE_MANUAL = 'manual';

    public const OCCUPANCY_SOURCES = [self::OCCUPANCY_SOURCE_CALCULATED, self::OCCUPANCY_SOURCE_MANUAL];

    protected $fillable = [
        'owner_id',
        'property_id',
        'name',
        'type',
        'description',
        'price_per_night',
        'max_occupancy',
        'occupancy_source',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_per_night' => 'decimal:2',
            'max_occupancy' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function newFactory(): UnitFactory
    {
        return UnitFactory::new();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(Facility::class, 'facility_unit');
    }

    public function beds(): HasMany
    {
        return $this->hasMany(UnitBed::class);
    }
}

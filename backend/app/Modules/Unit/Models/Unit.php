<?php

namespace App\Modules\Unit\Models;

use App\Models\Owner;
use App\Modules\Property\Models\Property;
use Database\Factories\UnitFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Unit extends Model
{
    /** @use HasFactory<UnitFactory> */
    use HasFactory;

    /**
     * Valid unit types.
     */
    public const TYPES = ['room', 'suite', 'dormitory_bed', 'entire_unit', 'whole_house'];

    protected $fillable = [
        'owner_id',
        'property_id',
        'name',
        'type',
        'description',
        'price_per_night',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_per_night' => 'decimal:2',
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
}

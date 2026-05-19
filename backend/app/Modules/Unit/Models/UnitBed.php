<?php

namespace App\Modules\Unit\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitBed extends Model
{
    public const TYPE_SINGLE = 'single';

    public const TYPE_DOUBLE = 'double';

    public const TYPE_QUEEN = 'queen';

    public const TYPE_KING = 'king';

    public const TYPE_BUNK = 'bunk';

    public const TYPE_SOFA_BED = 'sofa_bed';

    public const TYPE_FLOOR_MATTRESS = 'floor_mattress';

    public const TYPES = [
        self::TYPE_SINGLE,
        self::TYPE_DOUBLE,
        self::TYPE_QUEEN,
        self::TYPE_KING,
        self::TYPE_BUNK,
        self::TYPE_SOFA_BED,
        self::TYPE_FLOOR_MATTRESS,
    ];

    public const DEFAULT_CAPACITY = [
        self::TYPE_SINGLE => 1,
        self::TYPE_DOUBLE => 2,
        self::TYPE_QUEEN => 2,
        self::TYPE_KING => 2,
        self::TYPE_BUNK => 2,
        self::TYPE_SOFA_BED => 1,
        self::TYPE_FLOOR_MATTRESS => 1,
    ];

    protected $fillable = [
        'unit_id',
        'bed_type',
        'quantity',
        'capacity_per_bed',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'capacity_per_bed' => 'integer',
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}

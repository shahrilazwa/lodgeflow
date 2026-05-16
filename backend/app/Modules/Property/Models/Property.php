<?php

namespace App\Modules\Property\Models;

use App\Models\Owner;
use Database\Factories\PropertyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    /** @use HasFactory<PropertyFactory> */
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'address',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): PropertyFactory
    {
        return PropertyFactory::new();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }
}

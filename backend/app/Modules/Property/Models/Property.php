<?php

namespace App\Modules\Property\Models;

use App\Models\Owner;
use App\Modules\Facility\Models\Facility;
use App\Modules\Unit\Models\Unit;
use Database\Factories\PropertyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(Facility::class, 'property_facility');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(PropertyPhoto::class)->orderByDesc('is_cover')->orderBy('sort_order')->orderBy('id');
    }

    public function coverPhoto(): HasOne
    {
        return $this->hasOne(PropertyPhoto::class)->where('is_cover', true);
    }
}

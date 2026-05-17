<?php

namespace App\Modules\ServiceProvider\Models;

use App\Models\Owner;
use Database\Factories\ServiceProviderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceProvider extends Model
{
    /** @use HasFactory<ServiceProviderFactory> */
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'service_type',
        'phone',
        'notes',
    ];

    protected static function newFactory(): ServiceProviderFactory
    {
        return ServiceProviderFactory::new();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }
}

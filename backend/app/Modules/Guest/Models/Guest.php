<?php

namespace App\Modules\Guest\Models;

use App\Models\Owner;
use Database\Factories\GuestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guest extends Model
{
    /** @use HasFactory<GuestFactory> */
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'full_name',
        'phone',
        'email',
        'identification_number',
    ];

    protected static function newFactory(): GuestFactory
    {
        return GuestFactory::new();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }
}

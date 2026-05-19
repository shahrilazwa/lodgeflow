<?php

namespace App\Modules\Facility\Models;

use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    public const SCOPE_PROPERTY = 'property';

    public const SCOPE_UNIT = 'unit';

    public const SCOPE_BOTH = 'both';

    public const SCOPES = [self::SCOPE_PROPERTY, self::SCOPE_UNIT, self::SCOPE_BOTH];

    protected $fillable = [
        'name',
        'icon',
        'category',
        'scope',
    ];
}

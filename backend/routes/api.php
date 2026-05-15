<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All API routes are prefixed with /api/v1 via the bootstrap/app.php config.
|
*/

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

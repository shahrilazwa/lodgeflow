<?php

use App\Http\Controllers\Auth\AuthController;
use App\Modules\Property\Controllers\PropertyController;
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

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

/*
|--------------------------------------------------------------------------
| Protected Routes (require auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Properties
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::get('/properties/{id}', [PropertyController::class, 'show']);
    Route::put('/properties/{id}', [PropertyController::class, 'update']);
    Route::patch('/properties/{id}', [PropertyController::class, 'update']);
    Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);
    Route::patch('/properties/{id}/deactivate', [PropertyController::class, 'deactivate']);
    Route::patch('/properties/{id}/activate', [PropertyController::class, 'activate']);
});

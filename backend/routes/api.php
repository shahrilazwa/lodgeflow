<?php

use App\Http\Controllers\Auth\AuthController;
use App\Modules\Booking\Controllers\BookingController;
use App\Modules\CleaningTask\Controllers\CleaningTaskController;
use App\Modules\Dashboard\Controllers\DashboardController;
use App\Modules\Expense\Controllers\ExpenseController;
use App\Modules\Facility\Controllers\FacilityController;
use App\Modules\Guest\Controllers\GuestController;
use App\Modules\MaintenanceTask\Controllers\MaintenanceTaskController;
use App\Modules\Payment\Controllers\PaymentController;
use App\Modules\Property\Controllers\PropertyController;
use App\Modules\Property\Controllers\PropertyPhotoController;
use App\Modules\ServiceProvider\Controllers\ServiceProviderController;
use App\Modules\Unit\Controllers\UnitController;
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
    // Facilities
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::post('/facilities', [FacilityController::class, 'store']);

    // Properties
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::get('/properties/{id}', [PropertyController::class, 'show']);
    Route::put('/properties/{id}', [PropertyController::class, 'update']);
    Route::patch('/properties/{id}', [PropertyController::class, 'update']);
    Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);
    Route::patch('/properties/{id}/deactivate', [PropertyController::class, 'deactivate']);
    Route::patch('/properties/{id}/activate', [PropertyController::class, 'activate']);

    // Property Photos
    Route::get('/properties/{propertyId}/photos', [PropertyPhotoController::class, 'index']);
    Route::post('/properties/{propertyId}/photos', [PropertyPhotoController::class, 'store']);
    Route::delete('/properties/{propertyId}/photos/{photoId}', [PropertyPhotoController::class, 'destroy']);
    Route::patch('/properties/{propertyId}/photos/{photoId}/cover', [PropertyPhotoController::class, 'setCover']);

    // Units (nested under properties for creation/listing)
    Route::get('/properties/{propertyId}/units', [UnitController::class, 'index']);
    Route::post('/properties/{propertyId}/units', [UnitController::class, 'store']);

    // Units (standalone for show/update/deactivate/activate)
    Route::get('/units/{id}', [UnitController::class, 'show']);
    Route::put('/units/{id}', [UnitController::class, 'update']);
    Route::patch('/units/{id}', [UnitController::class, 'update']);
    Route::patch('/units/{id}/deactivate', [UnitController::class, 'deactivate']);
    Route::patch('/units/{id}/activate', [UnitController::class, 'activate']);

    // Guests
    Route::get('/guests', [GuestController::class, 'index']);
    Route::post('/guests', [GuestController::class, 'store']);
    Route::get('/guests/{id}', [GuestController::class, 'show']);
    Route::put('/guests/{id}', [GuestController::class, 'update']);
    Route::patch('/guests/{id}', [GuestController::class, 'update']);

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::patch('/bookings/{id}', [BookingController::class, 'update']);
    Route::patch('/bookings/{id}/confirm', [BookingController::class, 'confirm']);
    Route::patch('/bookings/{id}/check-in', [BookingController::class, 'checkIn']);
    Route::patch('/bookings/{id}/check-out', [BookingController::class, 'checkOut']);
    Route::patch('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Payments ledger
    Route::get('/payments', [PaymentController::class, 'ledger']);

    // Payments (nested under bookings)
    Route::get('/bookings/{bookingId}/payments', [PaymentController::class, 'index']);
    Route::post('/bookings/{bookingId}/payments', [PaymentController::class, 'store']);
    Route::delete('/bookings/{bookingId}/payments/{id}', [PaymentController::class, 'destroy']);

    // Service Providers
    Route::get('/service-providers', [ServiceProviderController::class, 'index']);
    Route::post('/service-providers', [ServiceProviderController::class, 'store']);
    Route::get('/service-providers/{id}', [ServiceProviderController::class, 'show']);
    Route::put('/service-providers/{id}', [ServiceProviderController::class, 'update']);
    Route::patch('/service-providers/{id}', [ServiceProviderController::class, 'update']);
    Route::delete('/service-providers/{id}', [ServiceProviderController::class, 'destroy']);

    // Expenses
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
    Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
    Route::patch('/expenses/{id}', [ExpenseController::class, 'update']);
    Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

    // Cleaning Tasks
    Route::get('/cleaning-tasks', [CleaningTaskController::class, 'index']);
    Route::post('/cleaning-tasks', [CleaningTaskController::class, 'store']);
    Route::get('/cleaning-tasks/{id}', [CleaningTaskController::class, 'show']);
    Route::patch('/cleaning-tasks/{id}/status', [CleaningTaskController::class, 'updateStatus']);
    Route::patch('/cleaning-tasks/{id}/notes', [CleaningTaskController::class, 'updateNotes']);

    // Maintenance Tasks
    Route::get('/maintenance-tasks', [MaintenanceTaskController::class, 'index']);
    Route::post('/maintenance-tasks', [MaintenanceTaskController::class, 'store']);
    Route::get('/maintenance-tasks/{id}', [MaintenanceTaskController::class, 'show']);
    Route::put('/maintenance-tasks/{id}', [MaintenanceTaskController::class, 'update']);
    Route::patch('/maintenance-tasks/{id}', [MaintenanceTaskController::class, 'update']);

    // Dashboard
    Route::get('/dashboard/front-desk-overview', [DashboardController::class, 'frontDeskOverview']);
    Route::get('/dashboard/booking-queue', [DashboardController::class, 'bookingQueue']);
    Route::get('/dashboard/income', [DashboardController::class, 'income']);
    Route::get('/dashboard/expenses', [DashboardController::class, 'expenses']);
    Route::get('/dashboard/net-profit', [DashboardController::class, 'netProfit']);
    Route::get('/dashboard/outstanding', [DashboardController::class, 'outstanding']);
    Route::get('/dashboard/booking-counts', [DashboardController::class, 'bookingCounts']);
    Route::get('/dashboard/pending-cleaning', [DashboardController::class, 'pendingCleaning']);
    Route::get('/dashboard/pending-maintenance', [DashboardController::class, 'pendingMaintenance']);
});

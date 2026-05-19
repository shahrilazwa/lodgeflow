<?php

namespace App\Modules\Dashboard\Services;

use App\Modules\Booking\Models\Booking;
use App\Modules\CleaningTask\Models\CleaningTask;
use App\Modules\Expense\Models\Expense;
use App\Modules\MaintenanceTask\Models\MaintenanceTask;
use App\Modules\Payment\Models\Payment;
use App\Modules\Unit\Models\Unit;
use Illuminate\Support\Carbon;

class DashboardService
{
    /**
     * Get today's front desk operating metrics.
     */
    public function getFrontDeskOverview(int $ownerId): array
    {
        $today = Carbon::today()->toDateString();

        $activeUnits = Unit::where('owner_id', $ownerId)
            ->where('is_active', true)
            ->count();

        $occupiedUnits = Booking::where('owner_id', $ownerId)
            ->where('status', Booking::STATUS_CHECKED_IN)
            ->whereDate('check_in_date', '<=', $today)
            ->whereDate('check_out_date', '>', $today)
            ->distinct('unit_id')
            ->count('unit_id');

        $checkInsToday = Booking::where('owner_id', $ownerId)
            ->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_CHECKED_IN])
            ->whereDate('check_in_date', $today)
            ->count();

        $checkOutsToday = Booking::where('owner_id', $ownerId)
            ->whereIn('status', [Booking::STATUS_CHECKED_IN, Booking::STATUS_CHECKED_OUT])
            ->whereDate('check_out_date', $today)
            ->count();

        $pendingPayments = Booking::where('owner_id', $ownerId)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_CHECKED_IN])
            ->count();

        $pendingCleaning = CleaningTask::where('owner_id', $ownerId)
            ->whereIn('status', [CleaningTask::STATUS_PENDING, CleaningTask::STATUS_IN_PROGRESS])
            ->count();

        $openMaintenance = MaintenanceTask::where('owner_id', $ownerId)
            ->whereIn('status', [MaintenanceTask::STATUS_OPEN, MaintenanceTask::STATUS_IN_PROGRESS])
            ->count();

        return [
            'date' => $today,
            'active_units' => $activeUnits,
            'occupied_units' => $occupiedUnits,
            'occupancy_rate' => $activeUnits > 0 ? round(($occupiedUnits / $activeUnits) * 100) : 0,
            'check_ins_today' => $checkInsToday,
            'check_outs_today' => $checkOutsToday,
            'pending_payments' => $pendingPayments,
            'pending_cleaning' => $pendingCleaning,
            'open_maintenance' => $openMaintenance,
        ];
    }

    /**
     * Get total income (sum of payment-type amounts) for the current calendar month.
     */
    public function getMonthlyIncome(int $ownerId): float
    {
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        return (float) Payment::where('owner_id', $ownerId)
            ->where('type', Payment::TYPE_PAYMENT)
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');
    }

    /**
     * Get total expenses for the current calendar month.
     */
    public function getMonthlyExpenses(int $ownerId): float
    {
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        return (float) Expense::where('owner_id', $ownerId)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');
    }

    /**
     * Get net profit for the current calendar month (income - expenses).
     */
    public function getMonthlyNetProfit(int $ownerId): float
    {
        $income = $this->getMonthlyIncome($ownerId);
        $expenses = $this->getMonthlyExpenses($ownerId);

        return $income - $expenses;
    }

    /**
     * Get total outstanding balance across all bookings with payment_status unpaid or partial.
     */
    public function getTotalOutstanding(int $ownerId): float
    {
        $bookings = Booking::where('owner_id', $ownerId)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->get(['total_amount', 'net_paid_amount']);

        $outstanding = 0.0;
        foreach ($bookings as $booking) {
            $outstanding += max(0, (float) $booking->total_amount - (float) $booking->net_paid_amount);
        }

        return $outstanding;
    }

    /**
     * Get booking counts by status for the current calendar month (based on check_in_date).
     */
    public function getBookingCountsByStatus(int $ownerId): array
    {
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        $counts = Booking::where('owner_id', $ownerId)
            ->whereBetween('check_in_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'confirmed' => $counts['confirmed'] ?? 0,
            'checked_in' => $counts['checked_in'] ?? 0,
            'checked_out' => $counts['checked_out'] ?? 0,
            'cancelled' => $counts['cancelled'] ?? 0,
        ];
    }

    /**
     * Get cleaning tasks with status pending or in_progress.
     */
    public function getPendingCleaningTasks(int $ownerId): array
    {
        return CleaningTask::where('owner_id', $ownerId)
            ->whereIn('status', [CleaningTask::STATUS_PENDING, CleaningTask::STATUS_IN_PROGRESS])
            ->with('unit')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get maintenance tasks with status open or in_progress.
     */
    public function getPendingMaintenanceTasks(int $ownerId): array
    {
        return MaintenanceTask::where('owner_id', $ownerId)
            ->whereIn('status', [MaintenanceTask::STATUS_OPEN, MaintenanceTask::STATUS_IN_PROGRESS])
            ->with(['property', 'unit'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }
}

<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Dashboard\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {}

    /**
     * Today's front desk operating metrics.
     */
    public function frontDeskOverview(Request $request): JsonResponse
    {
        $overview = $this->dashboardService->getFrontDeskOverview($request->user()->id);

        return response()->json(['data' => $overview]);
    }

    /**
     * Near-term booking queue for front desk work.
     */
    public function bookingQueue(Request $request): JsonResponse
    {
        $queue = $this->dashboardService->getBookingQueue($request->user()->id);

        return response()->json(['data' => $queue]);
    }

    /**
     * Monthly income total (sum of payment-type amounts for current month).
     */
    public function income(Request $request): JsonResponse
    {
        $total = $this->dashboardService->getMonthlyIncome($request->user()->id);

        return response()->json(['data' => ['total' => $total]]);
    }

    /**
     * Monthly expenses total.
     */
    public function expenses(Request $request): JsonResponse
    {
        $total = $this->dashboardService->getMonthlyExpenses($request->user()->id);

        return response()->json(['data' => ['total' => $total]]);
    }

    /**
     * Monthly net profit (income - expenses).
     */
    public function netProfit(Request $request): JsonResponse
    {
        $netProfit = $this->dashboardService->getMonthlyNetProfit($request->user()->id);

        return response()->json(['data' => ['total' => $netProfit]]);
    }

    /**
     * Total outstanding balance across unpaid/partial bookings.
     */
    public function outstanding(Request $request): JsonResponse
    {
        $total = $this->dashboardService->getTotalOutstanding($request->user()->id);

        return response()->json(['data' => ['total' => $total]]);
    }

    /**
     * Booking counts by status for current month.
     */
    public function bookingCounts(Request $request): JsonResponse
    {
        $counts = $this->dashboardService->getBookingCountsByStatus($request->user()->id);

        return response()->json(['data' => $counts]);
    }

    /**
     * Pending/in-progress cleaning tasks.
     */
    public function pendingCleaning(Request $request): JsonResponse
    {
        $tasks = $this->dashboardService->getPendingCleaningTasks($request->user()->id);

        return response()->json(['data' => $tasks]);
    }

    /**
     * Open/in-progress maintenance tasks.
     */
    public function pendingMaintenance(Request $request): JsonResponse
    {
        $tasks = $this->dashboardService->getPendingMaintenanceTasks($request->user()->id);

        return response()->json(['data' => $tasks]);
    }
}

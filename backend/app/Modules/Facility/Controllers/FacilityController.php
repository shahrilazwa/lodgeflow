<?php

namespace App\Modules\Facility\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Facility\Models\Facility;
use Illuminate\Http\JsonResponse;

class FacilityController extends Controller
{
    public function index(): JsonResponse
    {
        $facilities = Facility::orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $facilities]);
    }
}

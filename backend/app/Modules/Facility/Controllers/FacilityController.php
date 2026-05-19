<?php

namespace App\Modules\Facility\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Facility\Models\Facility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FacilityController extends Controller
{
    public function index(): JsonResponse
    {
        $facilities = Facility::orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $facilities]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:facilities,name'],
            'category' => ['required', 'string', 'max:100'],
            'scope' => ['required', 'string', Rule::in(Facility::SCOPES)],
            'icon' => ['nullable', 'string', 'max:100'],
        ]);

        $facility = Facility::create([
            'name' => $data['name'],
            'category' => $data['category'],
            'scope' => $data['scope'],
            'icon' => $data['icon'] ?? null,
        ]);

        return response()->json(['data' => $facility], 201);
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginOwnerRequest;
use App\Http\Requests\Auth\RegisterOwnerRequest;
use App\Models\Owner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new owner account.
     */
    public function register(RegisterOwnerRequest $request): JsonResponse
    {
        $owner = Owner::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        $token = $owner->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'owner' => [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'email' => $owner->email,
                ],
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login with existing owner credentials.
     */
    public function login(LoginOwnerRequest $request): JsonResponse
    {
        $owner = Owner::where('email', $request->validated('email'))->first();

        if (! $owner || ! Hash::check($request->validated('password'), $owner->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $token = $owner->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'owner' => [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'email' => $owner->email,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout the authenticated owner (revoke current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get the authenticated owner's profile.
     */
    public function me(Request $request): JsonResponse
    {
        $owner = $request->user();

        return response()->json([
            'data' => [
                'id' => $owner->id,
                'name' => $owner->name,
                'email' => $owner->email,
            ],
        ]);
    }
}

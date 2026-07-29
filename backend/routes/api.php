<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'story-point-poker-api',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Public — no session required yet
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Requires an authenticated session (Sanctum SPA cookie auth, via statefulApi())
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
});

// Rooms — deliberately public, no account needed (see RoomController's docblock). The
// moderator_token returned at creation, not a Sanctum session, is what authorizes updates.
Route::post('/rooms', [RoomController::class, 'store'])->middleware('throttle:10,1');
Route::get('/rooms/{code}', [RoomController::class, 'show']);
Route::patch('/rooms/{code}', [RoomController::class, 'update']);

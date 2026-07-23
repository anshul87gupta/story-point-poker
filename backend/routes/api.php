<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Phase 0: just a health check to confirm the container, database connection
| (indirectly, once migrations run), and CI wiring all actually work before
| any real feature is built on top.
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'story-point-poker-api',
        'timestamp' => now()->toIso8601String(),
    ]);
});

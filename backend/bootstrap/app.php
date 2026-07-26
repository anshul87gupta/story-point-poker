<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Enables Sanctum's SPA (cookie-based) authentication for the api group —
        // no bearer tokens, the React app authenticates via same-site cookies.
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Without this, an unauthenticated request to an api/* route that doesn't send
        // Accept: application/json (e.g. a raw curl or a browser address-bar hit) tries to
        // redirect to a `login` named route — which doesn't exist in this API-only app —
        // and crashes with RouteNotFoundException instead of a clean 401.
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });
    })->create();

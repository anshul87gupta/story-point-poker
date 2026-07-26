<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Sanctum's EnsureFrontendRequestsAreStateful only starts a session for requests it
// recognizes as coming from the SPA (matched against SANCTUM_STATEFUL_DOMAINS via the
// Referer/Origin header). Without this, $request->session() throws "Session store not
// set on request" and every request here 500s.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:5173');
});

it('logs out an authenticated user', function () {
    $user = User::factory()->create();
    $token = csrfToken();

    $response = $this->actingAs($user)
    ->withHeader('X-XSRF-TOKEN', $token)
    ->postJson('/api/logout');

    $response->assertNoContent();
    $this->assertGuest();
});

it('rejects logout when not authenticated', function () {
    $token = csrfToken();
    $response = $this->withHeader('X-XSRF-TOKEN', $token)->postJson('/api/logout');

    $response->assertUnauthorized();
});

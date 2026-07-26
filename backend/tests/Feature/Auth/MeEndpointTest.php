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

it('returns the current user when authenticated', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/user');

    $response->assertOk()->assertJsonPath('user.email', $user->email);
});

it('returns 401 when not authenticated', function () {
    $response = $this->getJson('/api/user');

    $response->assertUnauthorized();
});

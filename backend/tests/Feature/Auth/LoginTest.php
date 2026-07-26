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

it('logs in with correct credentials', function () {
    $user = User::factory()->create(['password' => bcrypt('password123')]);

    $response = $this->postJsonWithCsrf('/api/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $response->assertOk()->assertJsonPath('user.email', $user->email);
    $this->assertAuthenticatedAs($user);
});

it('rejects incorrect credentials', function () {
    $user = User::factory()->create(['password' => bcrypt('password123')]);

    $response = $this->postJsonWithCsrf('/api/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

it('rejects login for an email that does not exist', function () {
    $response = $this->postJsonWithCsrf('/api/login', [
        'email' => 'nobody@example.com',
        'password' => 'password123',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

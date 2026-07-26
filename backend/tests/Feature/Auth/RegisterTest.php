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

it('registers a new user and logs them in', function () {
    $token = csrfToken();

    $response = $this->withHeader('X-XSRF-TOKEN', $token)
        ->postJson('/api/register', [
            'name' => 'Alex',
            'email' => 'alex@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

    $response->assertCreated()->assertJsonPath('user.email', 'alex@example.com');
    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', ['email' => 'alex@example.com']);
});

it('rejects a name shorter than the minimum', function () {
    $token = csrfToken();

    $response = $this->withHeader('X-XSRF-TOKEN', $token)
        ->postJson('/api/register', [
            'name' => 'A',
            'email' => 'short@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('name');
});

it('rejects a duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $token = csrfToken();

    $response = $this->withHeader('X-XSRF-TOKEN', $token)
        ->postJson('/api/register', [
            'name' => 'Alex',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
});

it('rejects a mismatched password confirmation', function () {
    $token = csrfToken();

    $response = $this->withHeader('X-XSRF-TOKEN', $token)
        ->postJson('/api/register', [
            'name' => 'Alex',
            'email' => 'alex2@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('password');
});

it('rejects a password shorter than the minimum', function () {
    $token = csrfToken();

    $response = $this->withHeader('X-XSRF-TOKEN', $token)
        ->postJson('/api/register', [
            'name' => 'Alex',
            'email' => 'alex3@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('password');
});

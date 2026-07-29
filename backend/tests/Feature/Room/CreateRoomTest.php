<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Sanctum's EnsureFrontendRequestsAreStateful only starts a session for requests it
// recognizes as coming from the SPA (matched against SANCTUM_STATEFUL_DOMAINS via the
// Referer/Origin header). Without this, $request->session() throws "Session store not
// set on request" and every request here 500s.
beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:5173');
});

it('creates a room and returns a moderator token, without requiring an account', function () {
    $response = $this->postJsonWithCsrf('/api/rooms', ['name' => 'Alex']);

    $response->assertCreated()
        ->assertJsonPath('room.moderatorName', 'Alex')
        ->assertJsonPath('room.deckType', 'scrum')
        ->assertJsonPath('room.disabledCards', [])
        ->assertJsonPath('room.sprintGoal', null)
        ->assertJsonPath('room.maxPlayers', 10)
        ->assertJsonPath('room.started', false)
        ->assertJsonStructure(['room' => ['code'], 'moderatorToken']);

    $this->assertDatabaseHas('rooms', ['moderator_name' => 'Alex']);
});

it('never returns the moderator token as part of the room object itself', function () {
    $response = $this->postJsonWithCsrf('/api/rooms', ['name' => 'Alex']);

    $response->assertJsonMissingPath('room.moderatorToken')
        ->assertJsonMissingPath('room.moderator_token');
});

it('generates a unique code per room', function () {
    $first = $this->postJsonWithCsrf('/api/rooms', ['name' => 'Alex'])->json('room.code');
    $second = $this->postJsonWithCsrf('/api/rooms', ['name' => 'Sam'])->json('room.code');

    expect($first)->not->toBe($second);
});

it('rejects a name shorter than the minimum', function () {
    $response = $this->postJsonWithCsrf('/api/rooms', ['name' => 'A']);

    $response->assertUnprocessable()->assertJsonValidationErrors('name');
});

it('rejects an empty name', function () {
    $response = $this->postJsonWithCsrf('/api/rooms', ['name' => '']);

    $response->assertUnprocessable()->assertJsonValidationErrors('name');
});

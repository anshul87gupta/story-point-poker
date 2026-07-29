<?php

use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:5173');
});

it('updates deck settings when the correct moderator token is provided', function () {
    $room = Room::factory()->create(['moderator_token' => 'the-real-token']);

    $response = $this->patchJsonWithCsrf(
        "/api/rooms/{$room->code}",
        ['deck_type' => 'fibonacci', 'disabled_cards' => ['1/2']],
        ['X-Moderator-Token' => 'the-real-token']
    );

    $response->assertOk()
        ->assertJsonPath('room.deckType', 'fibonacci')
        ->assertJsonPath('room.disabledCards', ['1/2']);

    expect($room->fresh()->deck_type)->toBe('fibonacci');
});

it('updates the sprint goal when the correct moderator token is provided', function () {
    $room = Room::factory()->create(['moderator_token' => 'the-real-token']);

    $response = $this->patchJsonWithCsrf(
        "/api/rooms/{$room->code}",
        ['sprint_goal' => 'Ship the login flow'],
        ['X-Moderator-Token' => 'the-real-token']
    );

    $response->assertOk()->assertJsonPath('room.sprintGoal', 'Ship the login flow');
});

it('marks a room as started', function () {
    $room = Room::factory()->create(['moderator_token' => 'the-real-token', 'started' => false]);

    $response = $this->patchJsonWithCsrf(
        "/api/rooms/{$room->code}",
        ['started' => true],
        ['X-Moderator-Token' => 'the-real-token']
    );

    $response->assertOk()->assertJsonPath('room.started', true);
});

it('rejects an update with a missing moderator token', function () {
    $room = Room::factory()->create(['moderator_token' => 'the-real-token', 'deck_type' => 'scrum']);

    $response = $this->patchJsonWithCsrf("/api/rooms/{$room->code}", ['deck_type' => 'fibonacci']);

    $response->assertForbidden();
    expect($room->fresh()->deck_type)->toBe('scrum');
});

it('rejects an update with an incorrect moderator token', function () {
    $room = Room::factory()->create(['moderator_token' => 'the-real-token', 'deck_type' => 'scrum']);

    $response = $this->patchJsonWithCsrf(
        "/api/rooms/{$room->code}",
        ['deck_type' => 'fibonacci'],
        ['X-Moderator-Token' => 'someone-elses-guess']
    );

    $response->assertForbidden();
    expect($room->fresh()->deck_type)->toBe('scrum');
});

it('rejects an invalid deck type', function () {
    $room = Room::factory()->create(['moderator_token' => 'the-real-token']);

    $response = $this->patchJsonWithCsrf(
        "/api/rooms/{$room->code}",
        ['deck_type' => 'not-a-real-deck'],
        ['X-Moderator-Token' => 'the-real-token']
    );

    $response->assertUnprocessable()->assertJsonValidationErrors('deck_type');
});

it('rejects a sprint goal over the character limit', function () {
    $room = Room::factory()->create(['moderator_token' => 'the-real-token']);

    $response = $this->patchJsonWithCsrf(
        "/api/rooms/{$room->code}",
        ['sprint_goal' => str_repeat('a', 251)],
        ['X-Moderator-Token' => 'the-real-token']
    );

    $response->assertUnprocessable()->assertJsonValidationErrors('sprint_goal');
});

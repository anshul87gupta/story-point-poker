<?php

use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withHeader('Referer', 'http://localhost:5173');
});

it('returns a room\'s public settings by its code, for anyone with the link', function () {
    $room = Room::factory()->create(['moderator_name' => 'Alex', 'sprint_goal' => 'Ship the login flow']);

    $response = $this->getJson("/api/rooms/{$room->code}");

    $response->assertOk()
        ->assertJsonPath('room.code', $room->code)
        ->assertJsonPath('room.moderatorName', 'Alex')
        ->assertJsonPath('room.sprintGoal', 'Ship the login flow');
});

it('never leaks the moderator token when showing a room', function () {
    $room = Room::factory()->create();

    $response = $this->getJson("/api/rooms/{$room->code}");

    $response->assertJsonMissingPath('room.moderatorToken')
        ->assertJsonMissingPath('room.moderator_token');
});

it('returns 404 for a room code that does not exist', function () {
    $response = $this->getJson('/api/rooms/doesnotexist');

    $response->assertNotFound();
});

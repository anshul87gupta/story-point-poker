<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;

/*
  Rooms deliberately don't require a user account to create or moderate — that mirrors the
  original prototype's frictionless "just type a name" flow, and Phase 1's real auth stays a
  fully separate, optional concern (see AuthMenu.jsx). Instead, the moderator_token returned
  once at creation is the sole proof of moderator identity for this room, sent back as the
  X-Moderator-Token header on every settings-changing request.

  What's persisted here is intentionally narrow — room-level settings only (deck, sprint goal,
  capacity, started-or-not). The players list, votes, timer, and alignment history all stay
  client-side/ephemeral for now; that's Phase 3's job (Reverb presence + real multi-user sync).
*/
class RoomController extends Controller
{
    public function store(CreateRoomRequest $request)
    {
        $room = Room::create([
            'code' => Room::generateUniqueCode(),
            'moderator_token' => bin2hex(random_bytes(24)),
            'moderator_name' => $request->validated('name'),
            'deck_type' => 'scrum',
            'disabled_cards' => [],
            'sprint_goal' => null,
            'max_players' => config('limits.max_players_default'),
            'started' => false,
        ]);

        return response()->json([
            'room' => new RoomResource($room),
            // Only ever returned here, at creation — the frontend stores this (sessionStorage)
            // and must present it again to authorize any future update to this room.
            'moderatorToken' => $room->moderator_token,
        ], 201);
    }

    public function show(string $code)
    {
        $room = Room::where('code', $code)->firstOrFail();

        return response()->json(['room' => new RoomResource($room)]);
    }

    public function update(UpdateRoomRequest $request, string $code)
    {
        $room = Room::where('code', $code)->firstOrFail();

        $providedToken = (string) $request->header('X-Moderator-Token');
        if ($providedToken === '' || ! hash_equals($room->moderator_token, $providedToken)) {
            abort(403, 'Only this room\'s moderator can change its settings.');
        }

        $room->update($request->validated());

        return response()->json(['room' => new RoomResource($room)]);
    }
}

<?php

/* ---------------------------------------------------------------------------
   Centralized field-length limits — mirrors src/config/limits.js on the frontend.
   Server-side validation must always match client-side rules; this is that mirror,
   not a duplicate source of truth to keep manually in sync by memory.
--------------------------------------------------------------------------- */

return [
    // Matches NAME_MIN_LENGTH / NAME_MAX_LENGTH in the frontend's config/limits.js
    'name_min' => 2,
    'name_max' => 30,

    // Not yet enforced client-side (AuthMenu has no password rules today) —
    // this is the server being the source of truth until the frontend catches up.
    'password_min' => 8,

    // Matches SPRINT_GOAL_MAX_LENGTH in the frontend's config/limits.js
    'sprint_goal_max' => 250,

    // Matches MAX_PLAYERS_PER_ROOM in the frontend's config/limits.js. Stored on each room
    // at creation time (a snapshot, not read live) so changing this later doesn't retroactively
    // alter already-created rooms.
    'max_players_default' => 10,
];

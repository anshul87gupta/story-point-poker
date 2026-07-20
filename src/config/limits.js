/* ---------------------------------------------------------------------------
   Centralized field-length limits. Change a value here and every field that
   uses it (validation + the input's maxLength) updates automatically —
   nothing else in the codebase needs to change.
--------------------------------------------------------------------------- */

// Player display name (room creator + inline rename)
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 30;

// Sprint Goal — optional, no minimum
export const SPRINT_GOAL_MAX_LENGTH = 250;

// Definition of Done — optional, no minimum (kept here so it's the obvious
// next thing to set a limit on if/when needed)
export const DOD_MAX_LENGTH = 250;

// Max players allowed in a single room. Enforced client-side here for now —
// once the real backend exists, the server must enforce this too (a client-side
// cap alone is never sufficient, since it's trivially bypassable).
export const MAX_PLAYERS_PER_ROOM = 10;

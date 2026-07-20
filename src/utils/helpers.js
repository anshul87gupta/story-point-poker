import { NAME_MIN_LENGTH, NAME_MAX_LENGTH, MAX_PLAYERS_PER_ROOM } from "../config/limits";

export function avatarEmoji(name) {
  const pool = ["🤖", "🎮", "🐼", "🦊", "🐸", "🐧"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % pool.length;
  return pool[hash];
}

export function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/* feature: Moderator Insights averages — "1/2" is treated as 0.5, non-numeric decks (e.g. T-shirt sizes) fall back to null */
export function cardToNumber(v) {
  if (v === "1/2") return 0.5;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

/* Shared name validation (room creator name, inline player rename). Returns a translation
   key on failure, or null when the name is valid, so callers can look up the right message.
   Length limits live in config/limits.js — that's the file to edit, not this one. */
export function validateName(name) {
  const trimmed = (name || "").trim();
  if (trimmed.length === 0) return "nameRequired";
  if (trimmed.length < NAME_MIN_LENGTH) return "nameTooShort";
  if (trimmed.length > NAME_MAX_LENGTH) return "nameTooLong";
  return null;
}

/* Room capacity — see MAX_PLAYERS_PER_ROOM in config/limits.js to change the cap. */
export function isRoomFull(players, max = MAX_PLAYERS_PER_ROOM) {
  return players.length >= max;
}

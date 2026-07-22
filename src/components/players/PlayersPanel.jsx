import React, { useState } from "react";
import { Settings2, Gamepad2, Eye, Check, Clock, MoreVertical, Pencil, UserPlus } from "lucide-react";
import { C } from "../../theme";
import { validateName, isRoomFull } from "../../utils/helpers";
import { NAME_MAX_LENGTH, MAX_PLAYERS_PER_ROOM } from "../../config/limits";
import PlayerMenu from "./PlayerMenu";
import DeckSettingsPanel from "../deck/DeckSettingsPanel";

export default function PlayersPanel({
  t,
  players,
  revealed,
  openMenuFor,
  setOpenMenuFor,
  onToggleModerator,
  onToggleObserver,
  onRename,
  onLeave,
  isModerator,
  deckType,
  onChangeDeckType,
  disabledCards,
  onToggleCard,
  deckSettingsOpen,
  setDeckSettingsOpen,
  onSimulateJoin,
}) {
  const [inlineEditing, setInlineEditing] = useState(false);
  const [inlineValue, setInlineValue] = useState("");
  const [inlineError, setInlineError] = useState(null);

  function commitInlineRename(id) {
    const error = validateName(inlineValue);
    if (error) {
      setInlineError(error);
      return;
    }
    onRename(id, inlineValue.trim());
    setInlineEditing(false);
    setInlineError(null);
  }

  return (
    <div className="w-full">
      <div
        className="relative rounded-t px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderBottom: "none" }}
      >
        <span className="font-semibold text-sm" style={{ color: C.navy }}>
          {t.players} ({players.length}/{MAX_PLAYERS_PER_ROOM})
        </span>
        <div className="flex items-center gap-1">
          {isModerator && onSimulateJoin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSimulateJoin();
              }}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200"
              style={{ color: isRoomFull(players) ? C.alarmText : C.textMuted }}
              aria-label={t.simulateJoin}
              title={t.simulateJoin}
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
          {isModerator && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeckSettingsOpen(!deckSettingsOpen);
              }}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200"
              style={{ color: C.textMuted }}
              aria-label={t.deckSettings}
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {deckSettingsOpen && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stops clicks inside the popover from reaching the page-level click-outside handler; DeckSettingsPanel's own controls are independently keyboard-accessible
          <div onClick={(e) => e.stopPropagation()}>
            <DeckSettingsPanel
              t={t}
              deckType={deckType}
              onChangeDeckType={onChangeDeckType}
              disabledCards={disabledCards}
              onToggleCard={onToggleCard}
              onClose={() => setDeckSettingsOpen(false)}
            />
          </div>
        )}
      </div>
      <div className="rounded-b bg-white" style={{ border: `1px solid ${C.border}`, minHeight: 96 }}>
        {players.map((p, idx) => (
          <div
            key={p.id}
            className="relative flex items-center justify-between px-3 py-2.5"
            style={{ borderTop: idx === 0 ? "none" : `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg leading-none">{p.emoji}</span>
              {p.id === "self" && inlineEditing ? (
                <div className="relative">
                  <input
                    // eslint-disable-next-line jsx-a11y/no-autofocus -- triggered only by the user explicitly clicking the edit (pencil) icon, not on page load
                    autoFocus
                    value={inlineValue}
                    onChange={(e) => {
                      setInlineValue(e.target.value);
                      if (inlineError) setInlineError(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={NAME_MAX_LENGTH}
                    aria-invalid={!!inlineError}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitInlineRename(p.id);
                      } else if (e.key === "Escape") {
                        setInlineEditing(false);
                        setInlineError(null);
                      }
                    }}
                    onBlur={() => commitInlineRename(p.id)}
                    className="text-sm rounded px-1.5 py-0.5 border focus:outline-none"
                    style={{ borderColor: inlineError ? C.alarmBorder : C.primary, color: C.navy, width: 96 }}
                  />
                  {inlineError && (
                    <div
                      className="absolute left-0 top-full mt-1 z-20 rounded px-2 py-1 shadow-lg whitespace-nowrap"
                      style={{ backgroundColor: C.navy, color: "#fff", fontSize: 11 }}
                    >
                      {t[inlineError]}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm truncate" style={{ color: C.navy }}>
                  {p.name}
                </span>
              )}
              {p.id === "self" && !inlineEditing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInlineValue(p.name);
                    setInlineError(null);
                    setInlineEditing(true);
                  }}
                  className="w-4 h-4 flex items-center justify-center shrink-0 hover:opacity-70"
                  style={{ color: C.textMuted }}
                  aria-label={t.renamePlayer}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {p.isModerator && <Gamepad2 className="w-3.5 h-3.5 shrink-0" style={{ color: C.primary }} />}
              {p.isObserver && <Eye className="w-3.5 h-3.5 shrink-0" style={{ color: C.textMuted }} />}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {revealed ? (
                <span className="text-sm font-semibold" style={{ color: C.navy }}>
                  {p.isObserver ? "—" : (p.vote ?? "-")}
                </span>
              ) : (
                !p.isObserver &&
                (p.vote != null ? (
                  <Check className="w-4 h-4" style={{ color: C.green }} />
                ) : (
                  <Clock className="w-4 h-4" style={{ color: C.textMuted }} />
                ))
              )}
              <button
                onClick={() => setOpenMenuFor(openMenuFor === p.id ? null : p.id)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                style={{ color: C.textMuted }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            {openMenuFor === p.id && (
              <PlayerMenu
                t={t}
                player={p}
                onToggleModerator={() => onToggleModerator(p.id)}
                onToggleObserver={() => onToggleObserver(p.id)}
                onLeave={() => onLeave(p.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { C } from "../../theme";
import { DECKS } from "../../config/decks";

export default function DeckSettingsPanel({ t, deckType, onChangeDeckType, disabledCards, onToggleCard, onClose }) {
  const deck = DECKS[deckType];
  return (
    <div className="absolute left-0 top-full mt-1 z-30 w-72 bg-white rounded shadow-lg border p-3" style={{ borderColor: C.border }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm" style={{ color: C.navy }}>
          {t.deckSettings}
        </span>
        <button onClick={onClose} className="text-xs" style={{ color: C.textMuted }}>
          {t.close}
        </button>
      </div>
      <label className="text-xs block mb-1" style={{ color: C.textMuted }}>
        {t.deckType}
      </label>
      <select
        value={deckType}
        onChange={(e) => onChangeDeckType(e.target.value)}
        className="w-full border rounded px-2 py-1.5 text-sm mb-3 focus:outline-none"
        style={{ borderColor: C.border, color: C.navy }}
      >
        {Object.keys(DECKS).map((key) => (
          <option key={key} value={key}>
            {t[DECKS[key].label]}
          </option>
        ))}
      </select>
      <label className="text-xs block mb-1.5" style={{ color: C.textMuted }}>
        {t.cards}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {deck.cards.map((v) => {
          const active = !disabledCards.includes(v);
          return (
            <button
              key={v}
              onClick={() => onToggleCard(v)}
              className="text-xs font-medium rounded px-2 py-1 border"
              style={{
                backgroundColor: active ? C.primaryTint : "#fff",
                borderColor: active ? C.primary : C.border,
                color: active ? C.primary : C.textFaint,
              }}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import { X, Users } from "lucide-react";
import { C } from "../../theme";
import { MAX_PLAYERS_PER_ROOM } from "../../config/limits";

/* Shown to a would-be 11th+ joiner once real room joining exists on the backend.
   For now (no backend yet), this is triggered via the moderator's "simulate a player
   joining" control once the room is at capacity, so the exact blocking message can be
   previewed and tested today. */
export default function RoomFullNotice({ t, roomCreatorName, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(9,30,66,0.54)" }} onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
          <span className="text-xs font-medium" style={{ color: C.textMuted }}>
            {t.roomFullPreview}
          </span>
          <button onClick={onClose} style={{ color: C.textMuted }} aria-label={t.close}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: C.alarmBg }}>
            <Users className="w-6 h-6" style={{ color: C.alarmText }} />
          </div>
          <h3 className="font-semibold text-base mb-2" style={{ color: C.navy }}>
            {t.roomFullHeading}
          </h3>
          <p className="text-sm mb-4" style={{ color: C.textMuted }}>
            {t.roomFullBodyPrefix} {MAX_PLAYERS_PER_ROOM} {t.roomFullBodySuffix}
            <br />
            {t.roomFullConsult}
          </p>
          {roomCreatorName && (
            <p className="text-xs mb-5" style={{ color: C.textFaint }}>
              {t.roomCreatedBy}: <span style={{ color: C.navy, fontWeight: 600 }}>{roomCreatorName}</span>
            </p>
          )}
          <button onClick={onClose} className="font-medium text-sm rounded px-6 py-2.5 text-white" style={{ backgroundColor: C.primary }}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

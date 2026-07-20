import React from "react";
import { Gamepad2, Eye } from "lucide-react";
import { C } from "../../theme";
import Switch from "../common/Switch";

export default function PlayerMenu({ t, player, onToggleModerator, onToggleObserver, onLeave, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white rounded shadow-lg py-1.5 border" style={{ borderColor: C.border }}>
      <div className="flex items-center justify-between px-3 py-2 text-sm" style={{ color: C.navy }}>
        <span className="flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4" style={{ color: C.textMuted }} /> {t.isModerator}
        </span>
        <Switch checked={player.isModerator} onChange={onToggleModerator} label={t.isModerator} />
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-sm" style={{ color: C.navy }}>
        <span className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" style={{ color: C.textMuted }} /> {t.isObserver}
        </span>
        <Switch checked={player.isObserver} onChange={onToggleObserver} label={t.isObserver} />
      </div>
      <div className="h-px my-1" style={{ backgroundColor: C.border }} />
      <button onClick={onLeave} className="w-full text-left px-3 py-2 text-sm" style={{ color: C.alarmText }}>
        {t.leaveRoom}
      </button>
    </div>
  );
}

import React from "react";
import { Target, Pencil } from "lucide-react";
import { C } from "../../theme";
import { SPRINT_GOAL_MAX_LENGTH } from "../../config/limits";
import MicButton from "./MicButton";

/* feature: anchors the "Why" per the Scrum Guide's three Sprint Planning topics.
   Optional field — no minimum length, capped at SPRINT_GOAL_MAX_LENGTH (see config/limits.js). */
export default function SprintGoalBanner({ t, goal, draft, setDraft, editing, isModerator, onStartEdit, onSave, speechLang }) {
  return (
    <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mb-4">
      <div className="rounded px-4 py-3 flex items-start gap-3 bg-white border" style={{ borderColor: C.border }}>
        <Target className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.primary }} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold mb-0.5" style={{ color: C.textMuted }}>
            {t.sprintGoalLabel}
          </div>
          {editing ? (
            <div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSave()}
                  placeholder={t.sprintGoalPlaceholder}
                  maxLength={SPRINT_GOAL_MAX_LENGTH}
                  className="flex-1 rounded px-2 py-1.5 text-sm border focus:outline-none"
                  style={{ borderColor: C.border, color: C.navy }}
                />
                <MicButton speechLang={speechLang} onResult={(text) => setDraft((prev) => (prev ? prev + " " + text : text))} />
                <button onClick={onSave} className="text-xs font-medium rounded px-3 py-1.5 text-white shrink-0" style={{ backgroundColor: C.primary }}>
                  {t.save}
                </button>
              </div>
              <div className="text-right mt-1" style={{ color: C.textFaint, fontSize: 11 }}>
                {draft.length}/{SPRINT_GOAL_MAX_LENGTH}
              </div>
            </div>
          ) : goal ? (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: C.navy }}>
                {goal}
              </span>
              {isModerator && (
                <button onClick={onStartEdit} className="shrink-0" style={{ color: C.textMuted }} aria-label={t.edit}>
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : isModerator ? (
            <button onClick={onStartEdit} className="text-sm underline" style={{ color: C.primary }}>
              {t.addSprintGoal}
            </button>
          ) : (
            <span className="text-sm italic" style={{ color: C.textFaint }}>
              —
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

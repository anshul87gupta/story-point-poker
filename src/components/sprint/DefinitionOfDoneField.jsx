import React from "react";
import { ClipboardList, Pencil } from "lucide-react";
import { C } from "../../theme";
import MicButton from "./MicButton";

/* feature: per-story shared understanding of "done" */
export default function DefinitionOfDoneField({ t, dod, draft, setDraft, editing, isModerator, onStartEdit, onSave, speechLang }) {
  if (!editing && !dod && !isModerator) return null;
  return (
    <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mb-5">
      <div className="rounded px-3 py-2 flex items-start gap-2 bg-white border" style={{ borderColor: C.border }}>
        <ClipboardList className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.textMuted }} />
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSave()}
                placeholder={t.dodPlaceholder}
                className="flex-1 rounded px-2 py-1 text-xs border focus:outline-none"
                style={{ borderColor: C.border, color: C.navy }}
              />
              <MicButton speechLang={speechLang} onResult={(text) => setDraft((prev) => (prev ? prev + " " + text : text))} />
              <button onClick={onSave} className="text-xs font-medium rounded px-2 py-1 text-white shrink-0" style={{ backgroundColor: C.primary }}>
                {t.save}
              </button>
            </div>
          ) : dod ? (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: C.navy }}>
                <span className="font-semibold">{t.definitionOfDoneLabel}: </span>
                {dod}
              </span>
              {isModerator && (
                <button onClick={onStartEdit} className="shrink-0" style={{ color: C.textMuted }} aria-label={t.edit}>
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : isModerator ? (
            <button onClick={onStartEdit} className="text-xs underline" style={{ color: C.primary }}>
              {t.addDefinitionOfDone}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

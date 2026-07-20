import React from "react";
import { Mic } from "lucide-react";
import { C } from "../../theme";
import { useSpeechToText } from "../../hooks/useSpeechToText";

/* Speech-to-text mic button (feature: voice input for Sprint Goal / DoD).
   Gracefully hides itself in browsers that don't support the Web Speech API. */
export default function MicButton({ speechLang, onResult }) {
  const { supported, listening, error, toggleListening } = useSpeechToText({ lang: speechLang, onResult });

  if (!supported) return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={toggleListening}
        className="rounded px-2 h-full flex items-center justify-center border"
        style={{
          borderColor: listening ? C.alarmBorder : C.border,
          color: listening ? C.alarmText : C.textMuted,
          backgroundColor: listening ? C.alarmBg : "#fff",
        }}
        aria-label="Voice input"
        title="Voice input"
      >
        <Mic className="w-3.5 h-3.5" />
      </button>
      {error && (
        <div
          className="absolute left-0 top-full mt-1 z-40 rounded px-2 py-1 shadow-lg whitespace-nowrap"
          style={{ backgroundColor: C.navy, color: "#fff", fontSize: 11 }}
        >
          {error === "mic-blocked"
            ? "Mic permission blocked — try opening this file in a real browser tab, not an embedded preview"
            : `Voice input failed (${error})`}
        </div>
      )}
    </div>
  );
}

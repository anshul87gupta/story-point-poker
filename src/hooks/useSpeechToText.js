import { useState, useRef } from "react";

/* ------------------------------- useSpeechToText -------------------------------
   Wraps the browser's native Web Speech API — no external library needed. Not part of the
   Scrum Guide at all (it's silent on tooling/input methods), so there's no framework rule
   against it; it's purely an accessibility/productivity nicety.

   Returns { supported, listening, error, toggleListening }. `supported` is false in browsers
   without SpeechRecognition (e.g. Firefox), so callers can hide the UI entirely in that case. */
export function useSpeechToText({ lang, onResult }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  function toggleListening() {
    if (!supported) return;
    setError(null);

    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      // Only forward a result once it's final. Some engines still fire onresult multiple
      // times per utterance even with interimResults=false (each call carrying the growing
      // in-progress transcript); forwarding every one of those caused repeated/cascading
      // text ("It" -> "It is" -> "It is not" ...) to pile up in the target field.
      const result = e.results[e.results.length - 1];
      if (result.isFinal) {
        onResult(result[0].transcript.trim());
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      // Surface the real reason instead of failing silently — "not-allowed"/"service-not-allowed"
      // usually means the mic permission was blocked (common in sandboxed iframe previews or file:// pages).
      setError(e.error === "not-allowed" || e.error === "service-not-allowed" ? "mic-blocked" : e.error || "unknown");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      setError("start-failed");
    }
  }

  return { supported, listening, error, toggleListening };
}

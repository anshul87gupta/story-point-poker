import React, { useState, useEffect, useRef, useCallback } from "react";
import { Clock, AlarmClock, Play, Pause, RotateCcw } from "lucide-react";
import { C } from "../../theme";
import { isTypingTarget } from "../../utils/helpers";
import RingTimer from "./RingTimer";

/* Dual timer widget (event/sprint-budget timer + per-story timer), sized for a fixed sidebar column. */
export default function TimerWidget({ t }) {
  const [mode, setMode] = useState("event");

  const [sprintWeeks, setSprintWeeks] = useState(2);
  const [budgetSeconds, setBudgetSeconds] = useState(2 * 2 * 3600);
  const [eventSeconds, setEventSeconds] = useState(0);
  const [eventRunning, setEventRunning] = useState(false);

  const [storyLimitMin, setStoryLimitMin] = useState(3);
  const [storySeconds, setStorySeconds] = useState(3 * 60);
  const [storyRunning, setStoryRunning] = useState(false);
  const [alarm, setAlarm] = useState(false);

  const audioCtxRef = useRef(null);
  const containerRef = useRef(null);

  function changeSprintWeeks(weeks) {
    setSprintWeeks(weeks);
    setBudgetSeconds(weeks * 2 * 3600);
    setEventSeconds(0);
    setEventRunning(false);
  }
  function changeStoryLimit(mins) {
    setStoryLimitMin(mins);
    setStorySeconds(mins * 60);
    setStoryRunning(false);
    setAlarm(false);
  }

  useEffect(() => {
    if (!eventRunning) return;
    const id = setInterval(() => setEventSeconds((s) => Math.min(budgetSeconds, s + 1)), 1000);
    return () => clearInterval(id);
  }, [eventRunning, budgetSeconds]);

  useEffect(() => {
    if (!storyRunning) return;
    const id = setInterval(() => {
      setStorySeconds((s) => {
        if (s <= 1) {
          setStoryRunning(false);
          setAlarm(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [storyRunning]);

  const beep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      /* audio unsupported in this environment — the visual pulse still communicates the alarm */
    }
  }, []);

  useEffect(() => {
    if (!alarm) return;
    beep();
    const id = setInterval(beep, 500);
    return () => clearInterval(id);
  }, [alarm, beep]);

  function stopAlarm() {
    setAlarm(false);
    setStorySeconds(storyLimitMin * 60);
  }
  function toggleRunning() {
    if (mode === "event") setEventRunning((r) => !r);
    else if (!alarm) setStoryRunning((r) => !r);
  }
  function resetActive() {
    if (mode === "event") {
      setEventRunning(false);
      setEventSeconds(0);
    } else {
      setStoryRunning(false);
      setAlarm(false);
      setStorySeconds(storyLimitMin * 60);
    }
  }
  function adjustStory(delta) {
    setStorySeconds((s) => Math.max(0, s + delta));
  }
  function adjustEvent(delta) {
    setBudgetSeconds((b) => Math.max(300, b + delta));
  }

  useEffect(() => {
    function onKey(e) {
      if (isTypingTarget(document.activeElement)) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleRunning();
      } else if (e.code === "Escape") {
        resetActive();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const isRunning = mode === "event" ? eventRunning : storyRunning;
  const eventRemaining = Math.max(0, budgetSeconds - eventSeconds);
  const accent = alarm ? C.alarmBorder : C.focusRing;

  return (
    <div
      ref={containerRef}
      className="rounded p-2.5 w-full"
      style={{ backgroundColor: alarm ? C.alarmDeep : C.navy, boxShadow: alarm ? `0 0 0 2px ${C.alarmBorder}` : "none" }}
    >
      <div className="flex rounded p-0.5 mb-2.5" style={{ backgroundColor: C.navyDeep }}>
        <button
          onClick={() => setMode("event")}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded"
          style={{ backgroundColor: mode === "event" ? C.primary : "transparent", color: mode === "event" ? "#fff" : C.textFaint }}
        >
          <Clock className="w-3 h-3" /> {t.eventTimer}
        </button>
        <button
          onClick={() => setMode("story")}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded"
          style={{ backgroundColor: mode === "story" ? C.primary : "transparent", color: mode === "story" ? "#fff" : C.textFaint }}
        >
          <AlarmClock className="w-3 h-3" /> {t.storyTimer}
        </button>
      </div>

      {alarm ? (
        <div className="flex flex-col items-center gap-2 py-1">
          <RingTimer remainingSeconds={0} totalSeconds={storyLimitMin * 60} accentColor={accent} alarm size="sm" />
          <span className="font-semibold text-xs tracking-wide" style={{ color: C.alarmSoft }}>
            {t.timeUp}
          </span>
          <button onClick={stopAlarm} className="text-white text-xs font-medium rounded-full px-3 py-1.5" style={{ backgroundColor: C.alarmBorder }}>
            {t.stopAlarm}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center">
            <RingTimer
              remainingSeconds={mode === "event" ? eventRemaining : storySeconds}
              totalSeconds={mode === "event" ? budgetSeconds : storyLimitMin * 60}
              accentColor={accent}
              alarm={false}
              size="sm"
            />
            <span className="text-xs mt-1" style={{ color: C.textFaint }}>
              {t.remaining}
            </span>

            <div className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: C.textFaint }}>
              <span>{t.original}:</span>
              {mode === "event" ? (
                <select
                  value={sprintWeeks}
                  onChange={(e) => changeSprintWeeks(Number(e.target.value))}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer"
                  style={{ color: C.focusRing }}
                >
                  {[1, 2, 3, 4].map((w) => (
                    <option key={w} value={w} style={{ color: "#000" }}>
                      {w} {t.weeks} ({w * 2}h)
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={storyLimitMin}
                  onChange={(e) => changeStoryLimit(Number(e.target.value))}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer"
                  style={{ color: C.focusRing }}
                >
                  {[2, 3].map((m) => (
                    <option key={m} value={m} style={{ color: "#000" }}>
                      {m} {t.min}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-1">
            {(mode === "event"
              ? [
                  { label: "+5m", fn: () => adjustEvent(5 * 60) },
                  { label: "+15m", fn: () => adjustEvent(15 * 60) },
                  { label: "+30m", fn: () => adjustEvent(30 * 60) },
                  { label: "-5m", fn: () => adjustEvent(-5 * 60) },
                ]
              : [
                  { label: "+10s", fn: () => adjustStory(10) },
                  { label: "+30s", fn: () => adjustStory(30) },
                  { label: "+1m", fn: () => adjustStory(60) },
                  { label: "-10s", fn: () => adjustStory(-10) },
                ]
            ).map((btn) => (
              <button
                key={btn.label}
                onClick={btn.fn}
                className="text-xs font-medium rounded py-1 border"
                style={{ color: "#B6C2CF", borderColor: C.navyBorder }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex gap-1.5">
            <button
              onClick={toggleRunning}
              className="flex-1 flex items-center justify-center gap-1 font-semibold text-xs rounded-full py-1.5"
              style={{ backgroundColor: C.focusRing, color: C.navy }}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isRunning ? t.pause : t.start}
            </button>
            <button
              onClick={resetActive}
              className="flex-1 flex items-center justify-center gap-1 font-semibold text-xs rounded-full py-1.5 border"
              style={{ color: "#B6C2CF", borderColor: C.navyBorder }}
            >
              <RotateCcw className="w-3 h-3" />
              {t.reset}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { C } from "../../theme";
import { alignmentLabel, alignmentColor } from "../../utils/alignment";

/* Re-estimation Progress chart — right sidebar. Plots Score (Y) against Round (X) across all
   rounds of the current story, with a hover tooltip showing "Round-N, Score-X, Label". */
export default function ScoreTrendChart({ t, history }) {
  const [hover, setHover] = useState(null);
  const W = 220;
  const H = 140;
  const padL = 22;
  const padR = 10;
  const padT = 10;
  const padB = 24;
  const current = history.length ? history[history.length - 1] : null;
  const prev = history.length >= 2 ? history[history.length - 2] : null;
  const delta = prev != null ? current - prev : null;

  const n = history.length;
  const xStep = n > 1 ? (W - padL - padR) / (n - 1) : 0;
  const points = history.map((score, i) => ({
    x: n > 1 ? padL + i * xStep : (padL + (W - padR)) / 2,
    y: padT + (1 - score / 100) * (H - padT - padB),
    score,
    round: i + 1,
  }));
  const pathD = points.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ");

  return (
    <div className="rounded overflow-hidden w-full">
      <div className="px-3 py-2" style={{ backgroundColor: C.navyDeep }}>
        <span className="font-semibold text-sm text-white">{t.reEstimationProgress}</span>
      </div>
      <div className="px-3 py-3" style={{ backgroundColor: C.navy, minHeight: 190 }}>
        {history.length === 0 ? (
          <p className="text-xs" style={{ color: C.textFaint }}>
            {t.noRoundsYet}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div style={{ color: "#8C9BAB", fontSize: 11 }}>{t.currentRound}</div>
                <div className="font-bold text-white text-sm">
                  {t.round} {history.length}
                </div>
              </div>
              <div className="text-right">
                <div style={{ color: "#8C9BAB", fontSize: 11 }}>{t.alignmentScoreLabel}</div>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-lg font-bold" style={{ color: alignmentColor(current) }}>
                    {current}
                  </span>
                  {delta != null && (
                    <span className="flex items-center gap-0.5" style={{ color: delta >= 0 ? C.greenSoft : C.alarmSoft, fontSize: 11 }}>
                      {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {delta >= 0 ? "+" : ""}
                      {delta}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-stretch gap-1">
              <div className="flex items-center justify-center shrink-0" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: "#8C9BAB", fontSize: 9 }}>
                {t.score}
              </div>
              <div className="flex-1 relative">
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
                  {[0, 25, 50, 75, 100].map((v) => {
                    const y = padT + (1 - v / 100) * (H - padT - padB);
                    return (
                      <g key={v}>
                        <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={0} y={y + 3} fontSize="8" fill="#8C9BAB">
                          {v}
                        </text>
                      </g>
                    );
                  })}
                  {n > 1 && <path d={pathD} fill="none" stroke={C.focusRing} strokeWidth="2" />}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hover === i ? 6 : 4.5}
                        fill={C.focusRing}
                        stroke={C.navy}
                        strokeWidth="1.5"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                      />
                      <text x={p.x} y={H - padB + 14} fontSize="8" fill="#8C9BAB" textAnchor="middle">
                        {p.round}
                      </text>
                    </g>
                  ))}
                </svg>
                {hover != null && (
                  <div
                    className="absolute rounded px-2 py-1 shadow-lg pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${(points[hover].x / W) * 100}%`,
                      top: `${(points[hover].y / H) * 100}%`,
                      transform: "translate(-50%, -130%)",
                      backgroundColor: "#000",
                      color: "#fff",
                      zIndex: 10,
                      fontSize: 11,
                    }}
                  >
                    {t.round}-{hover + 1}, {t.score}-{history[hover]}, {alignmentLabel(history[hover], t)}
                  </div>
                )}
              </div>
            </div>
            <div className="text-center mt-1" style={{ color: "#8C9BAB", fontSize: 9 }}>
              {t.round}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

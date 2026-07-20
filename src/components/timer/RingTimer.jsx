import React from "react";
import { C } from "../../theme";
import { formatClock } from "../../utils/helpers";

export default function RingTimer({ remainingSeconds, totalSeconds, accentColor, alarm, size }) {
  const R = size === "sm" ? 52 : 62;
  const SW = size === "sm" ? 8 : 9;
  const box = size === "sm" ? 122 : 144;
  const center = box / 2;
  const Cc = 2 * Math.PI * R;
  const fraction = totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0;
  const dashOffset = Cc * (1 - fraction);

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: box, height: box }}>
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
        <circle cx={center} cy={center} r={R} stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="1 7" fill="none" />
        <circle
          cx={center}
          cy={center}
          r={R}
          stroke={accentColor}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={Cc}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono" style={{ fontSize: size === "sm" ? 16 : 20, color: "#FFFFFF", letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums" }}>
          {formatClock(remainingSeconds)}
        </span>
        <span className="text-xs font-bold mt-1" style={{ color: alarm ? C.alarmSoft : "#FFFFFF" }}>
          {Math.round(fraction * 100)}%
        </span>
      </div>
    </div>
  );
}

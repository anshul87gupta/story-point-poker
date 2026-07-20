import React from "react";
import { SLICE_COLORS } from "../../theme";

export default function PieResult({ votes }) {
  const size = 240;
  const r = size / 2;
  const cx = r;
  const cy = r;
  const n = votes.length;
  if (n === 0) return <div style={{ width: size, height: size }} />;
  const anglePer = (2 * Math.PI) / n;

  const slices = votes.map((v, i) => {
    const start = i * anglePer - Math.PI / 2;
    const end = start + anglePer - (n > 1 ? 0.01 : 0);
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = anglePer > Math.PI ? 1 : 0;
    const path =
      n === 1
        ? `M ${cx} ${cy} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const midAngle = start + anglePer / 2;
    const labelR = r * 0.6;
    return {
      path,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      lx: cx + labelR * Math.cos(midAngle),
      ly: cy + labelR * Math.sin(midAngle),
      value: v.value,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Estimate results split by vote"
      className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80"
    >
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} />
      ))}
      {slices.map((s, i) => (
        <text key={i} x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="22" fontWeight="600">
          {s.value ?? "-"}
        </text>
      ))}
    </svg>
  );
}

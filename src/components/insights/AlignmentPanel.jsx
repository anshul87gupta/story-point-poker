import React from "react";
import { C } from "../../theme";
import { alignmentLabel, alignmentColor } from "../../utils/alignment";

/* Moderator Insights panel — left sidebar, fixed section (always rendered, with a
   placeholder state before the first reveal so the layout doesn't jump). */
export default function AlignmentPanel({ t, history, avgPoints, avgCard }) {
  const current = history.length ? history[history.length - 1] : null;
  const badgeColor = current != null ? alignmentColor(current) : C.textFaint;
  const badgeTextDark = current != null && current >= 45 && current < 100;

  return (
    <div className="rounded overflow-hidden w-full" style={{ minHeight: 132 }}>
      <div className="px-3 py-2" style={{ backgroundColor: C.navyDeep }}>
        <span className="font-semibold text-sm text-white">{t.moderatorInsights}</span>
      </div>
      <div className="px-3 py-3" style={{ backgroundColor: C.navy }}>
        {current == null ? (
          <p className="text-xs" style={{ color: C.textFaint }}>
            {t.noRoundsYet}
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "#B6C2CF" }}>
                {t.alignmentScoreLabel}
              </span>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: badgeColor, color: badgeTextDark ? C.navy : "#fff" }}
              >
                {alignmentLabel(current, t)}
              </span>
            </div>
            {avgPoints != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "#B6C2CF" }}>
                  {t.averagePoints}
                </span>
                <span className="text-sm font-semibold text-white">{avgPoints}</span>
              </div>
            )}
            {avgCard != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "#B6C2CF" }}>
                  {t.averageCard}
                </span>
                <span className="text-sm font-semibold text-white">{avgCard}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { C } from "../theme";

/* ------------------------------- Alignment score -------------------------------
   Approximates storypointpoker's "alignment score" concept: how close the team's votes are,
   measured by ordinal distance within the active deck (not raw numbers, so it also works for
   non-numeric decks like T-shirt sizes). This is our own heuristic, not a published formula. */
export function computeAlignment(playersAtReveal, activeCards) {
  const numericCards = activeCards.filter((v) => v !== "?");
  const indices = playersAtReveal
    .filter((p) => !p.isObserver && p.vote != null && p.vote !== "?")
    .map((p) => numericCards.indexOf(p.vote))
    .filter((i) => i >= 0);
  if (indices.length === 0) return null;
  if (indices.length === 1) return 100;
  const spread = Math.max(...indices) - Math.min(...indices);
  const maxSpread = Math.max(1, numericCards.length - 1);
  return Math.round((1 - spread / maxSpread) * 100);
}

export function alignmentLabel(score, t) {
  if (score === 100) return t.alignPerfect;
  if (score >= 75) return t.alignHigh;
  if (score >= 45) return t.alignMedium;
  return t.alignLow;
}

export function alignmentColor(score) {
  if (score === 100) return C.green;
  if (score >= 75) return C.greenSoft;
  if (score >= 45) return C.orange;
  return C.alarmText;
}

import { describe, it, expect } from "vitest";
import { computeAlignment, alignmentLabel, alignmentColor } from "../alignment";

// Deck used across these tests: a plain numeric-ish deck (order matters — computeAlignment
// measures ordinal distance within this array, not raw numeric value).
const DECK = ["0", "1", "2", "3", "5", "8", "13", "?"];

function player(vote, overrides = {}) {
  return { id: Math.random().toString(36), vote, isObserver: false, ...overrides };
}

describe("computeAlignment", () => {
  it("returns null when nobody has voted yet", () => {
    expect(computeAlignment([player(null)], DECK)).toBeNull();
  });

  it("returns null when every voter is an observer", () => {
    expect(computeAlignment([player("5", { isObserver: true })], DECK)).toBeNull();
  });

  it("returns 100 for a single voter (nothing to disagree with)", () => {
    expect(computeAlignment([player("13")], DECK)).toBe(100);
  });

  it("returns 100 when everyone picks the same card", () => {
    const players = [player("5"), player("5"), player("5")];
    expect(computeAlignment(players, DECK)).toBe(100);
  });

  it("returns a lower score the further apart the votes are", () => {
    const close = computeAlignment([player("3"), player("5")], DECK); // adjacent-ish cards
    const far = computeAlignment([player("0"), player("13")], DECK); // opposite ends of the deck
    expect(close).toBeGreaterThan(far);
  });

  it("scores maximum disagreement (opposite ends of the deck) as 0", () => {
    expect(computeAlignment([player("0"), player("13")], DECK)).toBe(0);
  });

  it("ignores '?' votes and observers when computing the score", () => {
    const players = [player("5"), player("5"), player("?"), player("8", { isObserver: true })];
    expect(computeAlignment(players, DECK)).toBe(100);
  });

  it("works on non-numeric decks (e.g. T-shirt sizes) via ordinal distance", () => {
    const tshirt = ["XS", "S", "M", "L", "XL", "?"];
    expect(computeAlignment([player("S"), player("S")], tshirt)).toBe(100);
    expect(computeAlignment([player("XS"), player("XL")], tshirt)).toBe(0);
  });
});

describe("alignmentLabel", () => {
  const t = { alignPerfect: "Perfect", alignHigh: "High", alignMedium: "Medium", alignLow: "Low" };

  it.each([
    [100, "Perfect"],
    [75, "High"],
    [90, "High"],
    [45, "Medium"],
    [60, "Medium"],
    [44, "Low"],
    [0, "Low"],
  ])("labels a score of %i as %s", (score, expected) => {
    expect(alignmentLabel(score, t)).toBe(expected);
  });
});

describe("alignmentColor", () => {
  it("returns a distinct color for each band, matching alignmentLabel's boundaries", () => {
    const colors = new Set([alignmentColor(100), alignmentColor(80), alignmentColor(50), alignmentColor(10)]);
    expect(colors.size).toBe(4);
  });
});

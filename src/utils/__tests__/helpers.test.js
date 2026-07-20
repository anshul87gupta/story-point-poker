import { describe, it, expect } from "vitest";
import { validateName, isRoomFull, cardToNumber, formatClock, generateRoomCode } from "../helpers";
import { NAME_MIN_LENGTH, NAME_MAX_LENGTH, MAX_PLAYERS_PER_ROOM } from "../../config/limits";

describe("validateName", () => {
  it("rejects empty or whitespace-only names", () => {
    expect(validateName("")).toBe("nameRequired");
    expect(validateName("   ")).toBe("nameRequired");
  });

  it("rejects names shorter than the minimum", () => {
    const tooShort = "a".repeat(NAME_MIN_LENGTH - 1);
    expect(validateName(tooShort)).toBe("nameTooShort");
  });

  it("rejects names longer than the maximum", () => {
    const tooLong = "a".repeat(NAME_MAX_LENGTH + 1);
    expect(validateName(tooLong)).toBe("nameTooLong");
  });

  it("accepts names at exactly the min and max boundaries", () => {
    expect(validateName("a".repeat(NAME_MIN_LENGTH))).toBeNull();
    expect(validateName("a".repeat(NAME_MAX_LENGTH))).toBeNull();
  });

  it("trims surrounding whitespace before validating", () => {
    expect(validateName("  Jo  ")).toBeNull();
    expect(validateName("  a  ")).toBe("nameTooShort");
  });
});

describe("isRoomFull", () => {
  it("is false below capacity and true at/above it", () => {
    const players = (n) => Array.from({ length: n }, (_, i) => ({ id: i }));
    expect(isRoomFull(players(MAX_PLAYERS_PER_ROOM - 1))).toBe(false);
    expect(isRoomFull(players(MAX_PLAYERS_PER_ROOM))).toBe(true);
    expect(isRoomFull(players(MAX_PLAYERS_PER_ROOM + 1))).toBe(true);
  });

  it("respects an explicit override of the max, for future configurability", () => {
    const players = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(isRoomFull(players, 5)).toBe(false);
    expect(isRoomFull(players, 3)).toBe(true);
  });
});

describe("cardToNumber", () => {
  it("treats '1/2' as 0.5", () => {
    expect(cardToNumber("1/2")).toBe(0.5);
  });

  it("parses plain numeric strings", () => {
    expect(cardToNumber("5")).toBe(5);
    expect(cardToNumber("100")).toBe(100);
  });

  it("returns null for non-numeric deck values (e.g. T-shirt sizes or '?')", () => {
    expect(cardToNumber("XS")).toBeNull();
    expect(cardToNumber("?")).toBeNull();
  });
});

describe("formatClock", () => {
  it("formats sub-hour durations as mm:ss", () => {
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(0)).toBe("00:00");
  });

  it("formats durations over an hour as h:mm:ss", () => {
    expect(formatClock(3661)).toBe("1:01:01");
  });

  it("never goes negative, even if given a negative input", () => {
    expect(formatClock(-5)).toBe("00:00");
  });
});

describe("generateRoomCode", () => {
  it("generates an 8-character alphanumeric code", () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[A-Za-z0-9]{8}$/);
  });

  it("generates different codes across calls (not a realistic collision in this sample size)", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateRoomCode()));
    expect(codes.size).toBe(20);
  });
});

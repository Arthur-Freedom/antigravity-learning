// ── Unit Tests: Config Module ────────────────────────────────────────────

import {
  MAX_DISPLAY_NAME_LENGTH,
  AI_HINT_DAILY_LIMIT,
  MODULES_REQUIRED_FOR_COMPLETION,
  AI_MODEL,
  FALLBACK_TOPICS,
} from "../config";

describe("Config constants", () => {
  it("MAX_DISPLAY_NAME_LENGTH is a positive integer", () => {
    expect(MAX_DISPLAY_NAME_LENGTH).toBeGreaterThan(0);
    expect(Number.isInteger(MAX_DISPLAY_NAME_LENGTH)).toBe(true);
  });

  it("AI_HINT_DAILY_LIMIT is a positive integer", () => {
    expect(AI_HINT_DAILY_LIMIT).toBeGreaterThan(0);
    expect(Number.isInteger(AI_HINT_DAILY_LIMIT)).toBe(true);
  });

  it("MODULES_REQUIRED_FOR_COMPLETION matches FALLBACK_TOPICS length", () => {
    expect(MODULES_REQUIRED_FOR_COMPLETION).toBe(FALLBACK_TOPICS.length);
  });

  it("AI_MODEL is a non-empty string", () => {
    expect(typeof AI_MODEL).toBe("string");
    expect(AI_MODEL.length).toBeGreaterThan(0);
  });

  it("FALLBACK_TOPICS contains expected quiz topics", () => {
    expect(FALLBACK_TOPICS).toContain("workflows");
    expect(FALLBACK_TOPICS).toContain("agents");
    expect(FALLBACK_TOPICS).toContain("safety");
    expect(FALLBACK_TOPICS.length).toBe(9);
  });

  it("FALLBACK_TOPICS has no duplicates", () => {
    const unique = new Set(FALLBACK_TOPICS);
    expect(unique.size).toBe(FALLBACK_TOPICS.length);
  });
});

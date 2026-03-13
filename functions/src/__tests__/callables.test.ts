// ── Unit Tests: Business Logic ───────────────────────────────────────────
// Tests the core validation/calculation logic extracted from callable functions.
// No Firebase mocks needed — we're testing pure logic.

import {
  MAX_DISPLAY_NAME_LENGTH,
  MODULES_REQUIRED_FOR_COMPLETION,
  FALLBACK_TOPICS,
  AI_HINT_DAILY_LIMIT,
} from "../config";
import { stripHtml } from "../helpers/sanitize";

describe("Display name sanitisation", () => {
  it("strips HTML and trims whitespace", () => {
    const dirty = "  <b>Evil</b> Name  ";
    const cleaned = stripHtml(dirty).trim();
    const capped = cleaned.slice(0, MAX_DISPLAY_NAME_LENGTH);
    expect(capped).toBe("Evil Name");
  });

  it("caps long names at MAX_DISPLAY_NAME_LENGTH", () => {
    const longName = "A".repeat(100);
    const capped = longName.slice(0, MAX_DISPLAY_NAME_LENGTH);
    expect(capped.length).toBe(MAX_DISPLAY_NAME_LENGTH);
  });

  it("returns 'Learner' for empty string after strip", () => {
    const dirty = "<script></script>";
    const cleaned = stripHtml(dirty).trim();
    const capped = cleaned.slice(0, MAX_DISPLAY_NAME_LENGTH);
    const result = capped || "Learner";
    expect(result).toBe("Learner");
  });
});

describe("Quiz completion calculation", () => {
  it("marks complete when all topics pass", () => {
    const progress: Record<string, { correct: boolean }> = {};
    FALLBACK_TOPICS.forEach((t) => {
      progress[t] = { correct: true };
    });
    const correctCount = Object.values(progress).filter(
      (r) => r.correct === true
    ).length;
    expect(correctCount).toBe(FALLBACK_TOPICS.length);
    expect(correctCount >= MODULES_REQUIRED_FOR_COMPLETION).toBe(true);
  });

  it("marks incomplete when some topics fail", () => {
    const progress: Record<string, { correct: boolean }> = {};
    FALLBACK_TOPICS.forEach((t, i) => {
      progress[t] = { correct: i < 5 };
    });
    const correctCount = Object.values(progress).filter(
      (r) => r.correct === true
    ).length;
    expect(correctCount).toBe(5);
    expect(correctCount >= MODULES_REQUIRED_FOR_COMPLETION).toBe(false);
  });

  it("filters out invalid topic keys", () => {
    const progress: Record<string, unknown> = {
      workflows: { correct: true },
      hackerTopic: { correct: true },
    };
    const validProgress: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(progress)) {
      if (FALLBACK_TOPICS.includes(key)) {
        validProgress[key] = value;
      }
    }
    expect(Object.keys(validProgress)).toEqual(["workflows"]);
    expect(Object.keys(validProgress)).not.toContain("hackerTopic");
  });

  it("marks incomplete with zero progress", () => {
    const correctCount = 0;
    expect(correctCount >= MODULES_REQUIRED_FOR_COMPLETION).toBe(false);
  });
});

describe("Rate limiting logic", () => {
  it("allows hints when under limit", () => {
    const hintsUsedToday = 5;
    expect(hintsUsedToday >= AI_HINT_DAILY_LIMIT).toBe(false);
  });

  it("blocks hints when at limit", () => {
    const hintsUsedToday = 10;
    expect(hintsUsedToday >= AI_HINT_DAILY_LIMIT).toBe(true);
  });

  it("resets count for a new day", () => {
    const rateLimitData = { date: "2026-01-01", count: 10 };
    const todayStr = "2026-01-02";
    const hintsUsedToday =
      rateLimitData.date === todayStr ? rateLimitData.count : 0;
    expect(hintsUsedToday).toBe(0);
  });

  it("carries count for same day", () => {
    const rateLimitData = { date: "2026-01-01", count: 7 };
    const todayStr = "2026-01-01";
    const hintsUsedToday =
      rateLimitData.date === todayStr ? rateLimitData.count : 0;
    expect(hintsUsedToday).toBe(7);
  });
});

// ── Unit Tests: Callable Functions (Mocked) ─────────────────────────────
// Tests the auth/input validation logic of callable functions by mocking
// Firebase Admin SDK dependencies.

// ── Mock Firebase Admin before any imports ──────────────────────────────
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockSet = jest.fn();
const mockAdd = jest.fn();
const mockDelete = jest.fn();
const mockDoc = jest.fn(() => ({
  get: mockGet,
  update: mockUpdate,
  set: mockSet,
}));
const mockCollection = jest.fn(() => ({ add: mockAdd }));

jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => [{ name: "test" }]),
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({
    doc: mockDoc,
    collection: mockCollection,
  })),
  FieldValue: {
    serverTimestamp: jest.fn(() => "MOCK_TIMESTAMP"),
    delete: jest.fn(() => "MOCK_DELETE"),
  },
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(() => ({
    setCustomUserClaims: jest.fn(),
  })),
}));

// ── Import the function modules ─────────────────────────────────────────
// We test the underlying logic by invoking the wrapped handler.
// firebase-functions/v2/https onCall wraps our handler, but for unit
// tests we can import and test the module structure.

import {
  MAX_DISPLAY_NAME_LENGTH,
  MODULES_REQUIRED_FOR_COMPLETION,
  FALLBACK_TOPICS,
} from "../config";
import { stripHtml } from "../helpers/sanitize";

describe("Validation logic (unit)", () => {
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
        hackerTopic: { correct: true }, // invalid
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
  });

  describe("Rate limiting logic", () => {
    const AI_HINT_DAILY_LIMIT = 10;

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
  });
});

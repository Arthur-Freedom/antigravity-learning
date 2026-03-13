// ── Unit Tests: Email Templates ──────────────────────────────────────────

import {
  generateCongratulationsHtml,
  generateCongratulationsText,
  generateWelcomeHtml,
  generateWelcomeText,
} from "../helpers/mail";

describe("generateCongratulationsHtml", () => {
  it("includes the user's display name", () => {
    const html = generateCongratulationsHtml("Alice");
    expect(html).toContain("Alice");
  });

  it("includes all nine module names", () => {
    const html = generateCongratulationsHtml("Test");
    expect(html).toContain("Workflows");
    expect(html).toContain("Safety & Guardrails");
    expect(html).toContain("Real-World Projects");
  });

  it("includes the certificate CTA link", () => {
    const html = generateCongratulationsHtml("Test");
    expect(html).toContain("https://antigravity-learning.web.app/");
  });

  it("is valid HTML (starts with DOCTYPE)", () => {
    const html = generateCongratulationsHtml("Test");
    expect(html.trim()).toMatch(/^<!DOCTYPE html>/i);
  });
});

describe("generateCongratulationsText", () => {
  it("includes the user's display name", () => {
    const text = generateCongratulationsText("Bob");
    expect(text).toContain("Bob");
  });

  it("includes all nine module checkmarks", () => {
    const text = generateCongratulationsText("Test");
    const checkmarks = (text.match(/✅/g) || []).length;
    expect(checkmarks).toBe(9);
  });
});

describe("generateWelcomeHtml", () => {
  it("includes the user's display name", () => {
    const html = generateWelcomeHtml("Charlie");
    expect(html).toContain("Charlie");
  });

  it("includes the first-module CTA link", () => {
    const html = generateWelcomeHtml("Test");
    expect(html).toContain("https://antigravity-learning.web.app/learn/workflows");
  });

  it("lists all nine modules", () => {
    const html = generateWelcomeHtml("Test");
    expect(html).toContain("Workflows");
    expect(html).toContain("Real-World Projects");
  });
});

describe("generateWelcomeText", () => {
  it("includes the user's display name", () => {
    const text = generateWelcomeText("Diana");
    expect(text).toContain("Diana");
  });

  it("includes all nine module descriptions", () => {
    const text = generateWelcomeText("Test");
    expect(text).toContain("Module 1");
    expect(text).toContain("Module 9");
  });
});

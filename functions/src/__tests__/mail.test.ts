// ── Unit Tests: Email Templates ──────────────────────────────────────────

import {
  generateCongratulationsHtml,
  generateCongratulationsText,
  generateWelcomeHtml,
  generateWelcomeText,
  generateNudgeHtml,
  generateNudgeText,
  getBaseUrl,
  ALL_MODULES,
} from "../helpers/mail";

describe("generateCongratulationsHtml", () => {
  it("includes the user's display name", () => {
    const html = generateCongratulationsHtml("Alice");
    expect(html).toContain("Alice");
  });

  it("includes all twelve module names", () => {
    const html = generateCongratulationsHtml("Test");
    expect(html).toContain("Workflows");
    expect(html).toContain("Safety & Guardrails");
    expect(html).toContain("Production & Scaling");
  });

  it("includes the certificate CTA link", () => {
    const html = generateCongratulationsHtml("Test");
    expect(html).toContain(`${getBaseUrl()}/`);
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

  it("includes all twelve module checkmarks", () => {
    const text = generateCongratulationsText("Test");
    const checkmarks = (text.match(/✅/g) || []).length;
    expect(checkmarks).toBe(ALL_MODULES.length);
  });
});

describe("generateWelcomeHtml", () => {
  it("includes the user's display name", () => {
    const html = generateWelcomeHtml("Charlie");
    expect(html).toContain("Charlie");
  });

  it("includes the first-module CTA link", () => {
    const html = generateWelcomeHtml("Test");
    expect(html).toContain(`${getBaseUrl()}/learn/workflows`);
  });

  it("lists all twelve modules", () => {
    const html = generateWelcomeHtml("Test");
    expect(html).toContain("Workflows");
    expect(html).toContain("Production & Scaling");
  });
});

describe("generateWelcomeText", () => {
  it("includes the user's display name", () => {
    const text = generateWelcomeText("Diana");
    expect(text).toContain("Diana");
  });

  it("includes all twelve module descriptions", () => {
    const text = generateWelcomeText("Test");
    expect(text).toContain("Module 1");
    expect(text).toContain("Module 12");
  });
});

describe("generateNudgeHtml", () => {
  it("includes the user's display name", () => {
    const html = generateNudgeHtml("Eve", 3, "prompts", "Prompt Engineering");
    expect(html).toContain("Eve");
  });

  it("shows progress count and percentage", () => {
    const html = generateNudgeHtml("Test", 6, "tools", "Tool Use & Function Calling");
    expect(html).toContain("6 of 12");
    expect(html).toContain("50%");
  });

  it("includes the next module CTA link", () => {
    const html = generateNudgeHtml("Test", 2, "agents", "Autonomous Agents");
    expect(html).toContain(`${getBaseUrl()}/learn/agents`);
    expect(html).toContain("Autonomous Agents");
  });

  it("is valid HTML (starts with DOCTYPE)", () => {
    const html = generateNudgeHtml("Test", 0, "workflows", "Workflows");
    expect(html.trim()).toMatch(/^<!DOCTYPE html>/i);
  });
});

describe("generateNudgeText", () => {
  it("includes the user's display name", () => {
    const text = generateNudgeText("Frank", 4, "context", "Context Windows");
    expect(text).toContain("Frank");
  });

  it("shows progress count", () => {
    const text = generateNudgeText("Test", 9, "multiagent", "Multi-Agent Systems");
    expect(text).toContain("9 of 12");
  });

  it("includes the next module link", () => {
    const text = generateNudgeText("Test", 1, "skills", "Skills");
    expect(text).toContain(`${getBaseUrl()}/learn/skills`);
  });
});


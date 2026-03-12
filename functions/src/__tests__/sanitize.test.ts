// ── Unit Tests: Sanitisation Helpers ─────────────────────────────────────

import { stripHtml } from "../helpers/sanitize";

describe("stripHtml", () => {
  it("removes simple HTML tags", () => {
    expect(stripHtml("<b>bold</b>")).toBe("bold");
  });

  it("removes nested tags", () => {
    expect(stripHtml("<div><p>hello</p></div>")).toBe("hello");
  });

  it("removes script tags", () => {
    expect(stripHtml('<script>alert("xss")</script>safe')).toBe(
      'alert("xss")safe'
    );
  });

  it("leaves plain text unchanged", () => {
    expect(stripHtml("no tags here")).toBe("no tags here");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("handles self-closing tags", () => {
    expect(stripHtml("before<br/>after")).toBe("beforeafter");
  });

  it("handles tags with attributes", () => {
    expect(stripHtml('<a href="link">click</a>')).toBe("click");
  });
});

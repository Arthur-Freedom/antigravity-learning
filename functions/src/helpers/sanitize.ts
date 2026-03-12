// ── Sanitisation Helpers ────────────────────────────────────────────────
// Pure utility functions for data validation and cleaning.

/** Strip all HTML tags from a string. */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

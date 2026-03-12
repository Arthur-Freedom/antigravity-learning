---
description: How to create a new reusable UI component
---

This workflow creates a new reusable UI component for the Antigravity Learning platform.

## Architecture Rules

- Components live in `src/components/`
- Components are **not** pages — they don't have routes
- Components export functions that can be called from any page's `init()` function
- All styles go in `src/style.css` — never inline complex styles
- Components should handle their own cleanup if they use event listeners or timers

## Steps

1. **Ask the user for**:
   - Component name (e.g. "progress-ring", "tooltip")
   - What it does
   - Which pages will use it

2. **Create the component file** at `src/components/<name>.ts`:

   ```typescript
   // ── Component: <Name> ────────────────────────────────────────────────
   // <Brief description of what this component does>

   interface <Name>Options {
     // Configuration options
   }

   /**
    * Render the component HTML. Call this inside a page's render() function
    * or inject it via innerHTML after page load.
    */
   export function render<Name>(options: <Name>Options): string {
     return `<div class="<name>-component">...</div>`;
   }

   /**
    * Initialize event listeners. Call this in the page's init() function
    * AFTER the component HTML has been injected into the DOM.
    */
   export function init<Name>(rootId: string): void {
     const root = document.getElementById(rootId);
     if (!root) return;
     // Bind event listeners here
   }

   /**
    * Optional: cleanup function for pages that support destroy().
    */
   export function destroy<Name>(): void {
     // Remove event listeners, clear intervals, etc.
   }
   ```

3. **Add styles** in `src/style.css`:
   - Follow existing naming conventions (BEM-like: `.component-name`, `.component-name__child`)
   - Use CSS variables from the design system (`--bg-primary`, `--text-primary`, etc.)
   - Add responsive breakpoints: `@media (max-width: 768px)` for mobile
   - Add dark theme overrides if applicable

4. **Wire it into a page**:
   - Import in the page's `.ts` file
   - Call `render<Name>()` inside the page's `render()` function
   - Call `init<Name>()` inside the page's `init()` function
   - Call `destroy<Name>()` in the page's `destroy()` if applicable

// turbo
5. Verify: `npx tsc --noEmit`

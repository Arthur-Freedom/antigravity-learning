---
description: create a new documentation page for the learning website
---

This workflow creates a new page in the learning website using the router-based architecture.

1. Ask the user for:
   - Page title (e.g. "Prompt Engineering")
   - Page description
   - Route path (e.g. "/learn/prompts")
   - Module number (next sequential number)

2. Create a new page file at `src/pages/<route-name>.ts` following the pattern of existing pages (e.g. `src/pages/workflows.ts`). The page should export:
   - `render()` → returns the full HTML for the lesson page (hero, TOC, sections, quiz)
   - `init()` → binds event listeners (TOC smooth scroll, inline quiz)

3. Register the new route in `src/main.ts` by:
   - Adding an import: `import * as <name>Page from './pages/<route-name>'`
   - Adding a route entry: `'/learn/<route-name>': { render: <name>Page.render, init: <name>Page.init }`

4. Add a new card to `src/pages/home.ts` in the modules grid section.

5. Add a navigation link in the footer in `src/main.ts`.

// turbo
6. Echo "Page successfully scaffolded!" to the terminal.

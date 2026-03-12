---
name: router-pages
description: Deep knowledge of the SPA router, page lifecycle (render/init/destroy), route registration, page transitions, and navigation patterns
---

# SPA Router & Page System — Complete Reference

The Antigravity Learning platform uses a **custom History API-based SPA router** with clean URLs. No frameworks or libraries are used.

## Router Architecture

**File:** `src/router.ts`

The router uses the HTML5 History API (`pushState`/`popstate`) with clean URLs (e.g. `/learn/workflows` instead of `#/learn/workflows`).

### Key Functions

| Function | Purpose |
|----------|---------|
| `registerRoutes(routeMap)` | Register one or more routes |
| `initRouter('#page-content')` | Start listening for navigation, render initial page |
| `navigate(path)` | Programmatic navigation |
| `getCurrentPath()` | Get current URL pathname |
| `refreshRoute()` | Force re-render of current route |

### How Routing Works

```
1. User clicks a link or calls navigate()
2. Router calls pushState to update URL
3. renderCurrentRoute() is called:
   a. Previous page's destroy() is called (cleanup)
   b. Fade-out animation (200ms)
   c. New page's render() HTML is injected
   d. Fade-in animation applied
   e. New page's init() is called
   f. Scroll to top
   g. Scroll-reveal observer re-initialized
   h. 'routechange' event dispatched
```

### Link Interception

The router intercepts all `<a>` clicks in the document:
- **External links** (`http://`, `mailto:`, `target="_blank"`) → handled by browser normally
- **Anchor links** (`#section`) → scroll to element naturally
- **Internal paths** (`/learn/workflows`) → handled by SPA router
- **Legacy hash links** (`#/path`) → converted to clean paths

## Page Lifecycle

Every page module must follow this contract:

```typescript
// REQUIRED: Returns HTML string for the page content
export function render(): string {
  return `<section class="page-class">
    <div class="hero-animated">...</div>
    <div class="content-wrapper">...</div>
  </section>`;
}

// REQUIRED: Called after HTML is injected into the DOM
export function init(): void {
  // Bind event listeners
  // Initialize components (quizzes, charts, etc.)
  // Start real-time Firestore listeners
  // Call auth-dependent UI setup
}

// OPTIONAL: Called before navigating away
export function destroy(): void {
  // Unsubscribe from Firestore onSnapshot listeners
  // Clear intervals/timeouts
  // Remove global event listeners
}
```

### Important: Auth-Aware Initialization

Many pages need to wait for Firebase Auth to resolve:

```typescript
import { onAuthChange, getCurrentUser } from '../services/authService';

export function init(): void {
  // Option A: Reactive (recommended for real-time updates)
  onAuthChange(async (user) => {
    if (user) {
      // Load user-specific data
      const profile = await getUserProfile(user.uid);
      // Update the DOM
    }
  });

  // Option B: Synchronous check (may be null on first load)
  const user = getCurrentUser();
  if (user) {
    // Do something immediately
  }
}
```

## Route Registration

**File:** `src/main.ts` (lines 118–135)

```typescript
registerRoutes({
  '/': { render: homePage.render, init: homePage.init, destroy: homePage.destroy },
  '/learn/workflows': { render: workflowsPage.render, init: workflowsPage.init },
  '/leaderboard': { render: leaderboardPage.render, init: leaderboardPage.init, destroy: leaderboardPage.destroy },
  // ... more routes
});
```

Key points:
- `destroy` is optional — only needed if the page has real-time listeners
- Pages with `destroy`: `home`, `leaderboard`, `profile`
- The `/` route is the fallback for unknown paths

## Current Routes (16 total)

| Path | Page | Has destroy? |
|------|------|-------------|
| `/` | home.ts | ✅ |
| `/learn/workflows` | workflows.ts | ❌ |
| `/learn/skills` | skills.ts | ❌ |
| `/learn/agents` | agents.ts | ❌ |
| `/learn/prompts` | prompts.ts | ❌ |
| `/learn/context` | context.ts | ❌ |
| `/learn/mcp` | mcp.ts | ❌ |
| `/learn/tools` | tools.ts | ❌ |
| `/learn/safety` | safety.ts | ❌ |
| `/learn/projects` | projects.ts | ❌ |
| `/leaderboard` | leaderboard.ts | ✅ |
| `/resources` | resources.ts | ❌ |
| `/admin` | admin.ts | ❌ |
| `/profile` | profile.ts | ✅ |
| `/faq` | faq.ts | ❌ |
| `/glossary` | glossary.ts | ❌ |

## Page Transitions

CSS-driven transitions in `src/style.css`:

```css
.page-exit {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s, transform 0.2s;
}

.page-enter {
  animation: fadeInUp 0.35s ease-out;
}
```

The router adds `page-exit` → waits 200ms → swaps content → adds `page-enter` → removes after 400ms.

## Scroll-Reveal

After every route change, the router initializes an `IntersectionObserver` that watches elements with `.reveal-on-scroll` class. When they enter the viewport, `.revealed` is added.

To use in a page:
```html
<div class="reveal-on-scroll">Content that fades in on scroll</div>
```

## Custom Events

The router dispatches a `routechange` event on `window` after every navigation:
```typescript
window.addEventListener('routechange', (e) => {
  const { path } = (e as CustomEvent).detail;
  console.log('Navigated to:', path);
});
```

Used by `main.ts` for: resetting scroll progress bar, re-spawning hero particles.

## Adding a New Page — Quick Checklist

1. Create `src/pages/<name>.ts` with `render()` and `init()` exports
2. Import in `src/main.ts`: `import * as namePage from './pages/<name>'`
3. Register route: `'/<path>': { render: namePage.render, init: namePage.init }`
4. Add navigation link in footer and/or navbar in `main.ts`
5. Add module card in `src/pages/home.ts` if it's a learning module

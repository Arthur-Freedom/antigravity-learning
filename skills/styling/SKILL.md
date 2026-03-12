---
name: styling
description: CSS conventions and design system for the Antigravity learning website
---

# Styling Guidelines

When generating UI components or adding new styles to this repository, you MUST strictly adhere to the following rules:

## 1. Framework Rules
- **Vanilla CSS only** — do NOT use Tailwind CSS or any other utility framework
- All styles go in `src/style.css` (5100+ lines) or `src/animations.css`
- Never inline complex styles; create proper CSS classes

## 2. Design System (Brilliant-inspired)
The site uses a clean, light Brilliant-inspired aesthetic with green accents.

### CSS Variables (defined in `:root`)
```css
--bg-hero: #F0FBF4;         /* Hero section background */
--bg-primary: #FFFFFF;       /* Primary background */
--bg-secondary: #F7F8FA;     /* Alternating section background */
--text-primary: #1A1A2E;     /* Primary text */
--text-secondary: #6B7280;   /* Secondary/muted text */
--text-light: #FFFFFF;       /* Text on dark/colored backgrounds */
--accent-color: #2EC866;     /* Green accent (buttons, links) */
--accent-hover: #25A855;     /* Hover state */
--accent-gradient: linear-gradient(135deg, #2EC866 0%, #1DB954 100%);
--accent-light: #E8F9EF;     /* Light accent background */
```

### Module Colors
- Module 1 (Workflows): `#0EA5E9` (teal)
- Module 2 (Skills): `#8B5CF6` (purple)
- Module 3 (Agents): `#F59E0B` (amber)

### Semantic Colors
- Success: `#16a34a` / bg: `#f0fdf4`
- Error: `#ef4444` / bg: `#fef2f2`
- Warning: `#f59e0b` / bg: `#fffbeb`
- Info: `#3b82f6` / bg: `#eff6ff`

## 3. Typography
- **Font family**: `Inter` (`var(--font-family)`) — used for ALL text (headings and body)
- **Mono font**: `JetBrains Mono` (`var(--font-mono)`) — for code blocks
- Font weights: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold), 800 (extra-bold)

## 4. Layout Patterns
- **Grid**: Use CSS Grid for card sections (`grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`)
- **Border radius**: Use variables (`--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-pill: 100px`)
- **Shadows**: Use variables (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`)
- **Max width**: Content sections cap at `1200px`, lessons at grid `260px + 1fr`

## 5. Component Patterns
- **Cards**: `.card` with `.card-image` + `.card-content` + `.card-footer`
- **Buttons**: `.btn` (pill-shaped with gradient), `.btn-ghost` (bordered), `.card .btn` (outlined)
- **Navbar**: sticky with `backdrop-filter: blur(12px)` on semi-transparent white
- **Scroll reveal**: Add `.reveal-on-scroll` class; the router's `IntersectionObserver` adds `.revealed`

## 6. Responsive Breakpoints
- **Mobile**: `@media (max-width: 768px)` — single column, smaller type, hamburger menu
- **Tablet**: `@media (max-width: 1024px)` — adapted grid
- Always test mobile layout when adding new sections

By reading this file, you have learned how to perfectly style this website!

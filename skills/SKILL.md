---
name: Antigravity Learning — Full Project Knowledge
description: Complete architecture, conventions, and how-to guide for the Antigravity Learning website. Read this before making any changes.
---

# Antigravity Learning — Project Knowledge

## What this project is

A **premium learning platform** for AI Agent development (workflows, skills, autonomous agents, prompt engineering, MCP, and more). It's a single-page app with Firebase backend, deployed at **https://antigravity-learning.web.app**.

Firebase Project IDs:
- **Production:** `antigravity-learning`
- **Development:** `antigravity-learning-dev`

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Vanilla TypeScript + Vite | No React/Vue — pure DOM manipulation |
| **Styling** | Vanilla CSS (`style.css` + `animations.css`) | Dark theme, glassmorphism, micro-animations |
| **Routing** | Custom History API SPA router | `src/router.ts`, uses clean URLs (`/path`) |
| **Auth** | Firebase Auth (Google sign-in) | `src/services/authService.ts` |
| **Database** | Cloud Firestore | `src/services/userService.ts` — `users/{uid}` collection |
| **Storage** | Firebase Storage | `src/services/storageService.ts` — custom profile pictures |
| **Functions** | Cloud Functions v2 (Node 20) | `functions/src/index.ts` — email triggers, AI tutor, admin |
| **App Check** | Firebase App Check | `src/lib/appcheck.ts` — reCAPTCHA Enterprise |
| **Hosting** | Firebase Hosting | Deploys `dist/` folder |
| **Email** | Nodemailer (Gmail SMTP) | Welcome + congratulations emails |
| **AI** | Gemini API (@google/genai) | Socratic quiz hints |

---

## Project Structure

```
website-builder/
├── .agent/workflows/          # Agent workflows (deploy, create-page, etc.)
├── skills/                    # Agent skills (project knowledge)
│   ├── SKILL.md               # This file — master project reference
│   ├── google-auth/SKILL.md   # Auth implementation guide
│   ├── styling/SKILL.md       # CSS conventions
│   ├── quiz-system/SKILL.md   # Quiz pipeline reference
│   ├── cloud-functions/SKILL.md # Cloud Functions reference
│   ├── gamification/SKILL.md  # XP/Level/Streak system
│   ├── router-pages/SKILL.md  # SPA router & page lifecycle
│   └── firestore-data/SKILL.md # Firestore data model
├── functions/                 # Cloud Functions (Node 20, TypeScript)
│   └── src/index.ts           # 7 functions (triggers + callables)
├── src/
│   ├── main.ts                # App shell, route registration, global listeners
│   ├── router.ts              # History API SPA router with page transitions
│   ├── style.css              # All styles (~115KB, design system + components)
│   ├── animations.css         # Scroll reveals, particles, transitions
│   ├── lib/
│   │   ├── firebase.ts        # Firebase app initialization
│   │   └── appcheck.ts        # App Check initialization
│   ├── constants/
│   │   └── collections.ts     # Firestore collection name constants
│   ├── types/
│   │   └── user.ts            # UserProfile, LeaderboardEntry, etc.
│   ├── services/
│   │   ├── authService.ts     # Firebase Auth (Google), auth state
│   │   ├── userService.ts     # User CRUD, quiz saves, XP/streak
│   │   ├── leaderboardService.ts # Ranked queries, real-time listeners
│   │   ├── storageService.ts  # Profile photo upload/download
│   │   ├── presenceService.ts # Online user count
│   │   └── functionsService.ts # HTTPS callable wrappers
│   ├── pages/                 # 16 page modules
│   │   ├── home.ts            # Landing page with hero, modules, stats
│   │   ├── workflows.ts       # Module 1: Workflows
│   │   ├── skills.ts          # Module 2: Skills
│   │   ├── agents.ts          # Module 3: Autonomous Agents
│   │   ├── prompts.ts         # Module 4: Prompt Engineering
│   │   ├── context.ts         # Module 5: Context Windows
│   │   ├── mcp.ts             # Module 6: Model Context Protocol
│   │   ├── tools.ts           # Module 7: Tool Use & Function Calling
│   │   ├── safety.ts          # Module 8: Safety & Guardrails
│   │   ├── projects.ts        # Module 9: Real-World Projects
│   │   ├── leaderboard.ts     # Real-time leaderboard
│   │   ├── resources.ts       # Curated external links
│   │   ├── profile.ts         # User profile (name, photo, stats, XP)
│   │   ├── admin.ts           # Analytics dashboard
│   │   ├── faq.ts             # Frequently asked questions
│   │   └── glossary.ts        # AI terms glossary
│   └── components/
│       ├── inline-quiz.ts     # Quiz component (3 questions per module)
│       ├── certificate.ts     # PDF certificate generation
│       ├── profile-picture.ts # Photo upload with preview
│       ├── auth-button.ts     # Google sign-in button
│       ├── activity-feed.ts   # Real-time activity feed
│       ├── confetti.ts        # Celebration animation
│       ├── logout-dialog.ts   # Logout confirmation
│       └── toast.ts           # Toast notifications
├── firebase.json              # Firebase config (hosting, firestore, functions, storage)
├── firestore.rules            # Security rules
├── firestore.indexes.json     # Composite indexes
├── storage.rules              # Storage security rules
├── .env                       # Firebase config env vars (VITE_FIREBASE_*)
├── index.html                 # Entry point
└── package.json               # Vite + Firebase SDK
```

---

## Routes (16 total)

| Path | Page Module | Description |
|------|------------|-------------|
| `/` | `home.ts` | Landing page |
| `/learn/workflows` | `workflows.ts` | Module 1 lesson + quiz |
| `/learn/skills` | `skills.ts` | Module 2 lesson + quiz |
| `/learn/agents` | `agents.ts` | Module 3 lesson + quiz |
| `/learn/prompts` | `prompts.ts` | Module 4 lesson + quiz |
| `/learn/context` | `context.ts` | Module 5 lesson + quiz |
| `/learn/mcp` | `mcp.ts` | Module 6 lesson + quiz |
| `/learn/tools` | `tools.ts` | Module 7 lesson + quiz |
| `/learn/safety` | `safety.ts` | Module 8 lesson + quiz |
| `/learn/projects` | `projects.ts` | Module 9 lesson + quiz |
| `/leaderboard` | `leaderboard.ts` | Real-time ranked leaderboard |
| `/resources` | `resources.ts` | Curated links page |
| `/profile` | `profile.ts` | User profile (auth required) |
| `/admin` | `admin.ts` | Analytics dashboard |
| `/faq` | `faq.ts` | FAQ page |
| `/glossary` | `glossary.ts` | AI glossary |

---

## Page Module Pattern

Every page follows this interface:

```typescript
export function render(): string {
  return `<section>...</section>`  // returns HTML string
}

export function init(): void {
  // Binds event listeners after render
}

export function destroy(): void {
  // Optional: cleanup (e.g., unsubscribe real-time listeners)
}
```

The router calls `render()` → injects HTML → calls `init()`. On route change, it calls the previous page's `destroy()` first.

---

## Firestore Data Model

### Collection: `users/{uid}`

```typescript
interface UserProfile {
  displayName: string;          // max 50 chars (server enforced)
  email: string;
  photoURL: string | null;
  customPhotoURL?: string;
  quizProgress: Record<string, QuizResult>;
  quizScore: number;            // denormalized correct count
  quizTotal: number;            // denormalized total count
  completedAll: boolean;        // true when quizScore >= 9
  xp: number;                   // experience points
  level: number;                // calculated from xp
  streak: number;               // consecutive login days
  lastLoginDate: string;        // "YYYY-MM-DD"
  createdAt: Timestamp;
  updatedAt: Timestamp;
  congratsEmailSentAt?: Timestamp;
  welcomeEmailSentAt?: Timestamp;
}
```

### Collection: `mail/{mailId}` (Cloud Functions only)
### Collection: `audit/{docId}` (Admin read only)

---

## Cloud Functions (7 total)

| Function | Type | Purpose |
|----------|------|---------|
| `onQuizCompletion` | Firestore trigger | Congrats email when all quizzes passed |
| `getCompletionStatus` | HTTPS Callable | Server-side completion check |
| `setAdminClaim` | HTTPS Callable | Grant admin access |
| `resetUserProgress` | HTTPS Callable | Admin reset of user data |
| `getAiHint` | HTTPS Callable | Gemini-powered Socratic quiz hints |
| `onUserDataWrite` | Firestore trigger | Server-side data validation |
| `onUserCreated` | Firestore trigger | Welcome email on sign-up |

---

## Deploy Commands

```bash
# Full deploy (hosting + firestore + functions + storage)
npx firebase deploy

# Just the frontend
npm run build && npx firebase deploy --only hosting

# Just Firestore rules + indexes
npx firebase deploy --only firestore

# Just Cloud Functions
npx firebase deploy --only functions

# Dev server
npm run dev
```

---

## Design Conventions

- **Light Brilliant-inspired theme** — white/light grey backgrounds with green accents
- **Color palette** — `#FFFFFF` (primary bg), `#F7F8FA` (secondary bg), `#F0FBF4` (hero bg), `#2EC866` (accent green), `#1A1A2E` (text primary)
- **Typography** — Inter font family (`var(--font-family)`) for all text
- **Navbar** — sticky with `backdrop-filter: blur(12px)` on white, subtle border bottom
- **Micro-animations** — scroll reveals (`.reveal-on-scroll`), page transitions, card hover lifts
- **No frameworks** — all CSS is vanilla, all JS is vanilla TypeScript
- **Toast notifications** — `showToast({ message, type: 'success'|'error'|'info'|'warning' })`
- **Module colors** — Module 1: `#0EA5E9` (teal), Module 2: `#8B5CF6` (purple), Module 3: `#F59E0B` (amber)

---

## Common Patterns

### Adding a new field to user profiles

1. Add the field to `UserProfile` interface in `src/types/user.ts`
2. Update `firestore.rules` if the field needs write access
3. Backfill for existing users in `ensureUserProfile()` in `src/services/userService.ts`
4. Deploy rules: `npx firebase deploy --only firestore`

### Adding a new page

1. Create `src/pages/yourpage.ts` with `render()` and `init()` exports
2. Import it in `main.ts`
3. Register the route in `registerRoutes()`
4. Add nav link in footer/navbar in `main.ts`

### Quiz topics

The nine quiz topics are: `workflows`, `skills`, `agents`, `prompts`, `context`, `mcp`, `tools`, `safety`, `projects`. A user is "certified" when they have ≥ 9 correct answers across these.

---

## Environment Variables

This project uses **two separate Firebase projects** (dev + production).
Vite automatically loads the right config:

- `npm run dev` → `.env.development` (dev project)
- `npm run build` → `.env.production` (production project)

Both files contain `VITE_FIREBASE_*` variables. See `skills/firebase-environments/SKILL.md` for the full setup checklist.

---

## Related Skills

For deeper knowledge on specific areas, read these skill files:

| Skill | What it covers |
|-------|---------------|
| `skills/quiz-system/SKILL.md` | Quiz pipeline: questions → scoring → server validation → email |
| `skills/cloud-functions/SKILL.md` | All 7 Cloud Functions, secrets, deployment |
| `skills/gamification/SKILL.md` | XP, levels, daily streaks, formulas |
| `skills/router-pages/SKILL.md` | SPA router, page lifecycle, route registration |
| `skills/firestore-data/SKILL.md` | Data model, collections, indexes, real-time listeners |
| `skills/google-auth/SKILL.md` | Firebase Auth implementation pattern |
| `skills/styling/SKILL.md` | CSS conventions and design system |
| `skills/firebase-environments/SKILL.md` | Dev/prod project setup, checklist, service inventory |

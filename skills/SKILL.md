---
name: Antigravity Learning — Full Project Knowledge
description: Complete architecture, conventions, and how-to guide for the Antigravity Learning website. Read this before making any changes.
---

# Antigravity Learning — Project Knowledge

## What this project is

A **premium learning platform** for AI Agent development (workflows, skills, autonomous agents). It's a single-page app with Firebase backend, deployed at **https://antigravity-learning.web.app**.

Firebase Project ID: `antigravity-learning`

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Vanilla TypeScript + Vite | No React/Vue — pure DOM manipulation |
| **Styling** | Vanilla CSS (`style.css` + `animations.css`) | Dark theme, glassmorphism, micro-animations |
| **Routing** | Custom hash-based SPA router | `src/router.ts`, uses `#/path` format |
| **Auth** | Firebase Auth (Google sign-in) | `src/auth.ts` |
| **Database** | Cloud Firestore | `src/db.ts` — single `users/{uid}` collection |
| **Storage** | Firebase Storage | `src/storage.ts` — custom profile pictures |
| **Functions** | Cloud Functions v2 (Node 20) | `functions/src/index.ts` — email triggers |
| **App Check** | Firebase App Check | `src/appcheck.ts` — reCAPTCHA Enterprise |
| **Hosting** | Firebase Hosting | Deploys `dist/` folder |
| **Email** | Nodemailer (Gmail SMTP) | Congratulations email on quiz completion |

---

## Project Structure

```
website-builder/
├── .agent/workflows/          # Agent workflows (deploy, create-page, etc.)
├── functions/                 # Cloud Functions (Node 20, TypeScript)
│   └── src/index.ts           # onQuizCompletion trigger + getCompletionStatus callable
├── src/
│   ├── main.ts                # App shell, route registration, global listeners
│   ├── router.ts              # Hash-based SPA router with page transitions
│   ├── auth.ts                # Firebase Auth (Google), bindAuthUI()
│   ├── db.ts                  # All Firestore reads/writes
│   ├── storage.ts             # Firebase Storage (profile pictures)
│   ├── appcheck.ts            # Firebase App Check init
│   ├── style.css              # All styles (~85KB, design system + components)
│   ├── animations.css         # Scroll reveals, particles, transitions
│   ├── pages/
│   │   ├── home.ts            # Landing page with hero, modules, testimonials
│   │   ├── workflows.ts       # Module 1: Workflows lesson
│   │   ├── skills.ts          # Module 2: Skills lesson
│   │   ├── agents.ts          # Module 3: Autonomous Agents lesson
│   │   ├── leaderboard.ts     # Real-time leaderboard with rankings
│   │   ├── resources.ts       # Curated external links
│   │   ├── profile.ts         # User profile page (display name, photo, stats)
│   │   └── admin.ts           # Analytics dashboard
│   └── components/
│       ├── inline-quiz.ts     # Quiz component (3 questions per module)
│       ├── certificate.ts     # PDF certificate generation (client-side)
│       ├── profile-picture.ts # Profile picture upload component
│       └── toast.ts           # Toast notification system
├── firebase.json              # Firebase config (hosting, firestore, functions, storage)
├── firestore.rules            # Security rules with schema validation
├── firestore.indexes.json     # Composite indexes for leaderboard queries
├── storage.rules              # Storage security rules
├── .env                       # Firebase config env vars (VITE_FIREBASE_*)
├── index.html                 # Entry point
└── package.json               # Vite + Firebase SDK
```

---

## Routes

| Hash Path | Page Module | Description |
|-----------|------------|-------------|
| `#/` | `home.ts` | Landing page |
| `#/learn/workflows` | `workflows.ts` | Module 1 lesson + quiz |
| `#/learn/skills` | `skills.ts` | Module 2 lesson + quiz |
| `#/learn/agents` | `agents.ts` | Module 3 lesson + quiz |
| `#/leaderboard` | `leaderboard.ts` | Real-time ranked leaderboard |
| `#/resources` | `resources.ts` | Curated links page |
| `#/profile` | `profile.ts` | User profile (auth required) |
| `#/admin` | `admin.ts` | Analytics dashboard |

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
  displayName: string;          // max 100 chars
  email: string;                // max 320 chars
  photoURL: string | null;      // Google photo, max 2048 chars
  customPhotoURL?: string;      // Uploaded photo (Firebase Storage URL)
  theme: 'light' | 'dark';     // only these two values allowed
  quizProgress: {               // map of topic → result
    [topic: string]: {
      correct: boolean;
      answeredAt: string;       // ISO timestamp
    }
  };
  // Denormalized leaderboard fields (updated on every quiz save)
  quizScore: number;            // count of correct answers (int, 0-100)
  quizTotal: number;            // count of total attempts (int, 0-100)
  completedAll: boolean;        // true when quizScore >= 3
  congratsEmailSentAt?: timestamp; // set by Cloud Function after email sent
  createdAt: timestamp;         // server timestamp, immutable after creation
  updatedAt: timestamp;         // server timestamp, required on every write
}
```

### Collection: `mail/{mailId}` (audit log)

Written by Cloud Functions only (Admin SDK bypasses rules). Client access fully denied.

```typescript
{
  to: string;
  subject: string;
  userId: string;
  type: 'quiz_completion';
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
  createdAt: timestamp;
}
```

---

## Security Rules Summary

**File:** `firestore.rules`

| Operation | Rule |
|-----------|------|
| **Read** (any user doc) | Authenticated users only |
| **Create** (own doc) | Full schema validation — all fields must be present and valid |
| **Update** (own doc) | Schema validation on merged doc, `createdAt` immutable |
| **Delete** | Blocked for all |
| **Mail collection** | `allow read, write: if false` (Admin SDK bypasses) |
| **Everything else** | Default deny |

### Validators

- `displayName`: string, 1–100 chars
- `email`: string, ≤ 320 chars
- `photoURL`: null OR string ≤ 2048
- `theme`: must be `"light"` or `"dark"`
- `quizProgress`: must be a map
- `quizScore`, `quizTotal`: int, 0–100
- `completedAll`: boolean
- `createdAt`: must equal `request.time` on create, immutable on update
- `updatedAt`: must equal `request.time` on every write

### Important: Update rules allow extra fields

The update allowed list includes `customPhotoURL` and `congratsEmailSentAt` (not required on create). This is intentional — these are added later by user actions or Cloud Functions.

---

## Composite Indexes

**File:** `firestore.indexes.json`

| Index | Fields | Purpose |
|-------|--------|---------|
| 1 | `quizScore` DESC, `quizTotal` ASC | Default leaderboard ranking |
| 2 | `completedAll` ASC, `quizScore` DESC | Filter certified users |

The leaderboard query uses server-side sorting:
```typescript
query(usersRef,
  where('quizTotal', '>', 0),
  orderBy('quizScore', 'desc'),
  orderBy('quizTotal', 'asc'),
  limit(topN)
);
```

A **fallback** (`getLeaderboardFallback`) does client-side sorting if the indexed query fails.

---

## Cloud Functions

**File:** `functions/src/index.ts` — Node 20, Firebase Functions v2

### 1. `onQuizCompletion` (Firestore trigger)

- Fires on `users/{uid}` document updates
- When `completedAll` transitions `false → true`:
  1. Sends congratulations email via Gmail SMTP (Nodemailer)
  2. Writes audit record to `mail/` collection
  3. Stamps `congratsEmailSentAt` on user doc (prevents duplicates)
- Guards: skips if already complete, already sent, or no email

### 2. `getCompletionStatus` (HTTPS Callable)

- Secured with App Check (`enforceAppCheck: true`)
- Returns `{ completed, score, total, displayName, congratsEmailSent }`
- Reads directly from Firestore via Admin SDK

### Secrets

```bash
firebase functions:secrets:set SMTP_EMAIL      # Gmail address
firebase functions:secrets:set SMTP_PASSWORD    # 16-char App Password
```

---

## Key Module APIs (`db.ts`)

| Function | What it does |
|----------|-------------|
| `ensureUserProfile(uid, data)` | Creates profile on first sign-in, backfills denormalized fields on subsequent sign-ins |
| `getUserProfile(uid)` | Reads full user profile |
| `saveQuizResult(uid, topic, correct)` | Saves quiz result + recalculates `quizScore`/`quizTotal`/`completedAll` |
| `saveThemePreference(uid, theme)` | Saves light/dark preference |
| `updateDisplayName(uid, name)` | Updates display name |
| `getLeaderboard(topN)` | Server-side query with composite index, falls back to client-side sort |
| `getLeaderboardFallback(topN)` | Client-side sort fallback |
| `onLeaderboardUpdate(topN, callback)` | Real-time listener via `onSnapshot` |
| `isCertificateEligible(uid)` | Checks if user passed all 3 modules |

---

## Deploy Commands

```bash
# Full deploy (hosting + firestore rules/indexes + functions + storage rules)
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

- **Dark theme by default** — dark navy/slate backgrounds, vibrant accents
- **Glassmorphism** — frosted glass cards with `backdrop-filter: blur()`
- **Micro-animations** — scroll reveals (`.reveal-on-scroll`), page transitions, hero particles
- **Color palette** — `#283A4A` (primary navy), `#3178C6` (accent blue), `#16a34a` (success green)
- **No frameworks** — all CSS is vanilla, all JS is vanilla TypeScript
- **Toast notifications** — `showToast({ message, type: 'success'|'error'|'info' })`

---

## Common Patterns

### Adding a new field to user profiles

1. Add the field to `UserProfile` interface in `db.ts`
2. Add the field name to the `allowed` array in **both** `isValidUserProfileCreate()` and `isValidUserProfileUpdate()` in `firestore.rules`
3. Add a validator function if the field needs type/value checking
4. If existing users need the field, backfill it in `ensureUserProfile()`
5. Deploy rules: `npx firebase deploy --only firestore`

### Adding a new page

1. Create `src/pages/yourpage.ts` with `render()` and `init()` exports
2. Import it in `main.ts`
3. Register the route in `registerRoutes({ '/your-path': { render: page.render, init: page.init } })`
4. Add nav link if needed in the `main.ts` app shell HTML

### Quiz topics

The three quiz topics are: `workflows`, `skills`, `agents`. A user is "certified" when they have ≥ 3 correct answers across these.

---

## Environment Variables

Stored in `.env` (not committed):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=antigravity-learning
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_RECAPTCHA_SITE_KEY=...
```

---

## Known Quirks

1. **HMR race condition** — On hot module reload, `ensureUserProfile` may fire before the new code fully loads, causing a brief permission error. Harmless — the subsequent call succeeds.
2. **Index build time** — After deploying new indexes, Firestore takes 1–5 minutes to build them. The fallback handles this gracefully.
3. **Admin SDK bypasses rules** — Cloud Functions use the Admin SDK, so writes to `mail/` and `congratsEmailSentAt` are not subject to security rules. This is by design.
4. **Firebase config is duplicated** — Both `auth.ts` and `db.ts` have `firebaseConfig`. They both use `getApps().length ? getApp() : initializeApp(firebaseConfig)` to avoid re-initialization.

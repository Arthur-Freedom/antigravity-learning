# Antigravity Learning

A premium, interactive learning platform for mastering AI agent development — built with Vite, TypeScript, Firebase, and deployed on Firebase Hosting.

**Live:** [antigravity-learning.web.app](https://antigravity-learning.web.app)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + TypeScript |
| Styling | Vanilla CSS (custom design system) |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Storage | Firebase Storage (profile pictures) |
| Hosting | Firebase Hosting |
| Security | Firestore Rules + App Check |

## Project Structure

```
src/
├── main.ts           # App shell (navbar, footer, router init, theme, auth)
├── auth.ts           # Firebase Auth (Google login/logout, state management)
├── db.ts             # Firestore abstraction (profiles, quizzes, leaderboard)
├── router.ts         # History API SPA router with clean URLs and transitions
├── style.css         # Full design system (2400+ lines)
├── animations.css    # Page animations & micro-interactions
├── appcheck.ts       # Firebase App Check integration
├── components/
│   ├── toast.ts      # Toast notification system
│   ├── inline-quiz.ts # Reusable inline quiz component
│   ├── certificate.ts # Canvas-based certificate generator
│   └── profile-picture.ts # Profile picture upload modal
└── pages/
    ├── home.ts       # Landing page (hero, stats, modules grid)
    ├── workflows.ts  # Workflows lesson page
    ├── skills.ts     # Skills lesson page
    ├── agents.ts     # Autonomous Agents lesson page
    ├── leaderboard.ts # Real-time leaderboard (Firestore onSnapshot)
    ├── admin.ts      # Analytics dashboard (admin-only)
    └── resources.ts  # Resources page
```

## Key Features

- **Google Authentication** with persistent sessions
- **Interactive quizzes** with Firestore progress tracking
- **Real-time leaderboard** using Firestore live listeners
- **Completion certificates** generated client-side with Canvas API
- **Admin analytics dashboard** restricted to whitelisted emails
- **Theme persistence** (light/dark mode saved to Firestore)
- **Toast notifications** for auth events and quiz results
- **Responsive design** with mobile hamburger menu
- **Page transitions** and scroll-reveal animations

## Firebase Projects

This project uses **two separate Firebase projects** to keep development safe:

| Environment | Project ID | Console | Used when |
|-------------|-----------|---------|-----------|
| **Dev** | `antigravity-learning-dev` | [Firebase Console](https://console.firebase.google.com/project/antigravity-learning-dev) | `npm run dev` (localhost) |
| **Production** | `antigravity-learning` | [Firebase Console](https://console.firebase.google.com/project/antigravity-learning) | `npm run build` → deploy |

Each project has its own database, users, authentication, and storage. They share nothing.

## Environment Variables

Vite automatically loads the right config based on the command:

- `npm run dev` → loads `.env.development` (dev project)
- `npm run build` → loads `.env.production` (production project)

Both files follow this format (see `.env.example`):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAILS=your-email@gmail.com
```

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:5173 (uses dev project) |
| `npm run build` | TypeScript check + Vite production build (uses production project) |
| `npx firebase deploy --only hosting` | Deploy to Firebase Hosting |
| `npx firebase deploy --only firestore:rules` | Deploy Firestore security rules |

## Workflows

- `/git-safe-deploy` — **Recommended.** Git commit + build + deploy (fully automated)
- `/deploy` — Build and deploy only (no Git commit — use `/git-safe-deploy` instead)
- `/create-page` — Scaffold a new lesson page with route registration

## Admin Access

The `/admin` route is restricted to emails listed in `VITE_ADMIN_EMAILS`. Other users see an "Access denied" message.

## Firestore Data Model

```
users/{uid}
├── displayName: string
├── email: string
├── photoURL: string | null
├── theme: "light" | "dark"
├── quizProgress: { [topic]: { correct: bool, answeredAt: ISO } }
├── quizScore: number (denormalized)
├── quizTotal: number (denormalized)
├── completedAll: boolean (denormalized)
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

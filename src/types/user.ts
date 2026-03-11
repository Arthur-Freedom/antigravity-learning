// ── Application User Types ──────────────────────────────────────────────
// Internal user model — decoupled from Firebase Auth.
// Every part of the app should consume this instead of firebase/auth.User.

export interface AppUser {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
}

export interface QuizResult {
  correct: boolean
  answeredAt: string // ISO timestamp
}

export interface UserProfile {
  displayName: string
  email: string
  photoURL: string | null
  customPhotoURL?: string | null
  quizProgress: Record<string, QuizResult>
  quizScore: number
  quizTotal: number
  completedAll: boolean
  createdAt: unknown
  updatedAt: unknown
}

export interface LeaderboardEntry {
  uid: string
  displayName: string
  photoURL: string | null
  score: number
  total: number
  completedAll: boolean
}

export interface RecentSignup {
  uid: string
  displayName: string
  photoURL: string | null
  createdAt: string
}

export interface RecentAction {
  uid: string
  displayName: string
  photoURL: string | null
  action: string
  timestamp: string
}

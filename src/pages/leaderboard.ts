// ── Leaderboard Page ────────────────────────────────────────────────────
// Uses Firestore onSnapshot for REAL-TIME leaderboard updates.
// When another user completes a quiz, every viewer's leaderboard refreshes
// instantly — no page reload needed.

import { onLeaderboardUpdate, type LeaderboardEntry } from '../db'
import { getCurrentUser } from '../auth'

/** Active listener unsubscribe handle — cleaned up on route change */
let unsubscribe: (() => void) | null = null

/** Track previous state to detect changes and flash updated rows */
let previousEntryMap: Map<string, number> = new Map()

/** Whether this is the very first snapshot (skip flash animation) */
let isFirstSnapshot = true

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #1a1d20, #283A4A);">
      <div class="lesson-hero-content">
        <span class="lesson-badge">Competition</span>
        <h1>Leaderboard</h1>
        <p>See how you rank against other learners. Complete all 3 modules to earn a certificate!</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="leaderboard-container">
        <div id="leaderboard-live-badge" class="lb-live-badge">
          <span class="lb-live-dot"></span>
          LIVE
        </div>
        <div id="leaderboard-loading" class="leaderboard-loading">
          <div class="loading-spinner"></div>
          <p>Connecting to live leaderboard...</p>
        </div>
        <div id="leaderboard-content" style="display: none;"></div>
      </div>
    </section>
  `
}

export function init(): void {
  isFirstSnapshot = true
  previousEntryMap = new Map()

  // Subscribe to real-time updates
  unsubscribe = onLeaderboardUpdate(20, handleLeaderboardUpdate, (error) => {
    console.error('[leaderboard] Real-time listener error:', error)
    const loadingEl = document.getElementById('leaderboard-loading')
    if (loadingEl) {
      loadingEl.innerHTML = `
        <p style="color: var(--text-error, #ef4444);">
          ⚠️ Could not connect to leaderboard. Please try refreshing.
        </p>
      `
    }
  })
}

/**
 * Called by the router when navigating away —
 * detaches the Firestore listener to avoid memory leaks.
 */
export function destroy(): void {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
    console.info('[leaderboard] 🔴 Real-time listener detached')
  }
}

// ── Snapshot handler ────────────────────────────────────────────────────

function handleLeaderboardUpdate(entries: LeaderboardEntry[]): void {
  const currentUser = getCurrentUser()

  const loadingEl = document.getElementById('leaderboard-loading')
  const contentEl = document.getElementById('leaderboard-content')
  const liveBadge = document.getElementById('leaderboard-live-badge')
  if (!loadingEl || !contentEl) return

  loadingEl.style.display = 'none'
  contentEl.style.display = 'block'
  if (liveBadge) liveBadge.style.display = 'flex'

  if (entries.length === 0) {
    contentEl.innerHTML = `
      <div class="leaderboard-empty">
        <span class="leaderboard-empty-icon">🏆</span>
        <h3>No entries yet</h3>
        <p>Be the first to complete a quiz and claim the #1 spot!</p>
        <a href="#/" class="btn btn-primary">Start Learning</a>
      </div>
    `
    isFirstSnapshot = false
    return
  }

  // Build a map of uid -> score for change detection
  const currentEntryMap = new Map<string, number>()
  entries.forEach(e => currentEntryMap.set(e.uid, e.score))

  // Determine which rows changed (score changed or new entry)
  const changedUids = new Set<string>()
  if (!isFirstSnapshot) {
    entries.forEach(e => {
      const prev = previousEntryMap.get(e.uid)
      if (prev === undefined || prev !== e.score) {
        changedUids.add(e.uid)
      }
    })
  }

  const currentUserRank = currentUser 
    ? entries.findIndex(e => e.uid === currentUser.uid) + 1 
    : 0

  contentEl.innerHTML = `
    ${currentUser && currentUserRank > 0 ? `
      <div class="leaderboard-your-rank">
        <span class="your-rank-label">Your Rank</span>
        <span class="your-rank-number">#${currentUserRank}</span>
        <span class="your-rank-score">${entries[currentUserRank - 1].score}/3 modules passed</span>
      </div>
    ` : ''}

    <div class="leaderboard-table">
      <div class="leaderboard-header">
        <span class="lb-col-rank">Rank</span>
        <span class="lb-col-user">Learner</span>
        <span class="lb-col-score">Score</span>
        <span class="lb-col-badge">Status</span>
      </div>
      ${entries.map((entry, i) => renderRow(entry, i, currentUser?.uid, changedUids.has(entry.uid))).join('')}
    </div>
  `

  // Store current state for next comparison
  previousEntryMap = currentEntryMap
  isFirstSnapshot = false
}

// ── Row rendering ───────────────────────────────────────────────────────

function renderRow(
  entry: LeaderboardEntry,
  index: number,
  currentUid?: string,
  isUpdated = false,
): string {
  const rank = index + 1
  const isCurrentUser = entry.uid === currentUid
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`

  return `
    <div class="leaderboard-row ${isCurrentUser ? 'lb-row-you' : ''} ${rank <= 3 ? 'lb-row-top3' : ''} ${isUpdated ? 'lb-row-updated' : ''}" style="animation: heroSlideUp 0.5s ease ${index * 0.06}s both;">
      <span class="lb-col-rank lb-rank-${rank <= 3 ? 'medal' : 'num'}">${medal}</span>
      <span class="lb-col-user">
        ${entry.photoURL 
          ? `<img src="${entry.photoURL}" alt="${entry.displayName}" class="lb-avatar" referrerpolicy="no-referrer" />`
          : `<span class="lb-avatar-placeholder">${entry.displayName.charAt(0).toUpperCase()}</span>`
        }
        <span class="lb-name">${entry.displayName}${isCurrentUser ? ' <span class="lb-you-badge">You</span>' : ''}</span>
      </span>
      <span class="lb-col-score">
        <span class="lb-score-bar">
          <span class="lb-score-fill" style="width: ${(entry.score / 3) * 100}%"></span>
        </span>
        <span class="lb-score-text">${entry.score}/3</span>
      </span>
      <span class="lb-col-badge">
        ${entry.completedAll 
          ? '<span class="lb-badge-complete">🎓 Certified</span>' 
          : '<span class="lb-badge-progress">In Progress</span>'
        }
      </span>
    </div>
  `
}

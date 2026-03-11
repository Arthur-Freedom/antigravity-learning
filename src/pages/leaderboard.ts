// ── Leaderboard Page ────────────────────────────────────────────────────
// Uses Firestore onSnapshot for REAL-TIME leaderboard updates.
// When another user completes a quiz, every viewer's leaderboard refreshes
// instantly — no page reload needed.

import {
  onLeaderboardUpdate,
  getRecentSignups,
  getRecentActivity,
  type LeaderboardEntry,
  type RecentSignup,
  type RecentAction,
} from '../services/leaderboardService'
import { getCurrentUser } from '../services/authService'

/** Active listener unsubscribe handle — cleaned up on route change */
let unsubscribe: (() => void) | null = null

/** Track previous state to detect changes and flash updated rows */
let previousEntryMap: Map<string, number> = new Map()

/** Whether this is the very first snapshot (skip flash animation) */
let isFirstSnapshot = true

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #E8F9EF 0%, #D1FAE5 40%, #A7F3D0 100%);">
      <div class="lesson-hero-content" style="color: var(--text-primary);">
        <span class="lesson-badge">Competition</span>
        <h1>Leaderboard</h1>
        <p>See how you rank against other learners. Complete all 3 modules to earn a certificate!</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="leaderboard-page-grid">
        <!-- Main leaderboard column -->
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

        <!-- Sidebar -->
        <aside class="leaderboard-sidebar">
          <!-- Recent Signups -->
          <div class="lb-sidebar-card">
            <h3 class="lb-sidebar-title">👋 Recent Signups</h3>
            <div id="lb-recent-signups" class="lb-sidebar-list">
              <div class="lb-sidebar-loading"><div class="loading-spinner" style="width:24px;height:24px;"></div></div>
            </div>
          </div>

          <!-- Last 5 Actions -->
          <div class="lb-sidebar-card">
            <h3 class="lb-sidebar-title">⚡ Recent Activity</h3>
            <div id="lb-recent-activity" class="lb-sidebar-list">
              <div class="lb-sidebar-loading"><div class="loading-spinner" style="width:24px;height:24px;"></div></div>
            </div>
          </div>
        </aside>
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

  // Load sidebar data
  loadRecentSignups()
  loadRecentActivity()
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
        <a href="/" class="btn btn-primary">Start Learning</a>
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
        <span class="lb-col-score" style="text-align: right; padding-right: 1rem;">Experience</span>
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
        <span class="lb-name">
          ${entry.displayName}
          <span class="profile-badge profile-badge-level" style="font-size: 0.7rem; padding: 2px 6px; margin-left: 6px;">⭐ Lvl ${entry.level}</span>
          ${isCurrentUser ? ' <span class="lb-you-badge">You</span>' : ''}
        </span>
      </span>
      <span class="lb-col-score" style="text-align: right; padding-right: 1rem; font-weight: 600;">
        ${entry.xp} XP
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

// ── Sidebar: Recent Signups ─────────────────────────────────────────────

async function loadRecentSignups(): Promise<void> {
  const container = document.getElementById('lb-recent-signups')
  if (!container) return

  const signups = await getRecentSignups(5)

  if (signups.length === 0) {
    container.innerHTML = '<p class="lb-sidebar-empty">No signups yet</p>'
    return
  }

  container.innerHTML = signups.map((s: RecentSignup) => `
    <div class="lb-sidebar-item" style="animation: heroSlideUp 0.4s ease both;">
      ${s.photoURL
        ? `<img src="${s.photoURL}" alt="${s.displayName}" class="lb-sidebar-avatar" referrerpolicy="no-referrer" />`
        : `<span class="lb-sidebar-avatar-placeholder">${s.displayName.charAt(0).toUpperCase()}</span>`
      }
      <div class="lb-sidebar-item-info">
        <span class="lb-sidebar-item-name">${s.displayName}</span>
        <span class="lb-sidebar-item-meta">${timeAgo(s.createdAt)}</span>
      </div>
    </div>
  `).join('')
}

// ── Sidebar: Recent Activity ────────────────────────────────────────────

async function loadRecentActivity(): Promise<void> {
  const container = document.getElementById('lb-recent-activity')
  if (!container) return

  const actions = await getRecentActivity(5)

  if (actions.length === 0) {
    container.innerHTML = '<p class="lb-sidebar-empty">No activity yet</p>'
    return
  }

  container.innerHTML = actions.map((a: RecentAction) => `
    <div class="lb-sidebar-item" style="animation: heroSlideUp 0.4s ease both;">
      ${a.photoURL
        ? `<img src="${a.photoURL}" alt="${a.displayName}" class="lb-sidebar-avatar" referrerpolicy="no-referrer" />`
        : `<span class="lb-sidebar-avatar-placeholder">${a.displayName.charAt(0).toUpperCase()}</span>`
      }
      <div class="lb-sidebar-item-info">
        <span class="lb-sidebar-item-name">${a.displayName}</span>
        <span class="lb-sidebar-item-action">${a.action}</span>
        <span class="lb-sidebar-item-meta">${timeAgo(a.timestamp)}</span>
      </div>
    </div>
  `).join('')
}

// ── Utility ─────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then

  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

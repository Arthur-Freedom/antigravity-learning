// ── Admin Analytics Dashboard ───────────────────────────────────────────
// Protected page that shows aggregate stats about all users.
// Only accessible to logged-in users (could restrict to specific UIDs).

import { getLeaderboard, type LeaderboardEntry } from '../db'
import { getCurrentUser, onAuthChange } from '../auth'

interface Analytics {
  totalUsers: number
  totalPassed: number
  avgScore: number
  moduleBreakdown: Record<string, { passed: number; attempted: number }>
  recentCompletions: LeaderboardEntry[]
}

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #0f172a, #1e293b);">
      <div class="lesson-hero-content">
        <span class="lesson-badge">Admin</span>
        <h1>Analytics</h1>
        <p>Real-time insights into how learners are progressing through the modules.</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="admin-container" id="admin-container">
        <div id="admin-loading" class="leaderboard-loading">
          <div class="loading-spinner"></div>
          <p>Computing analytics...</p>
        </div>
        <div id="admin-content" style="display: none;"></div>
      </div>
    </section>
  `
}

export function init(): void {
  // Admin whitelist from environment variable
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean)

  // Check if already logged in
  const user = getCurrentUser()
  if (user) {
    if (isAdmin(user.email, adminEmails)) {
      loadAnalytics()
    } else {
      showAccessDenied()
    }
    return
  }

  // Otherwise wait for auth state to resolve (Firebase loads async)
  const unsubscribe = onAuthChange((user) => {
    unsubscribe() // only need the first callback
    if (user) {
      if (isAdmin(user.email, adminEmails)) {
        loadAnalytics()
      } else {
        showAccessDenied()
      }
    } else {
      showSignInRequired()
    }
  })

  // Timeout fallback — if auth doesn't resolve in 3s, show sign-in prompt
  setTimeout(() => {
    const loading = document.getElementById('admin-loading')
    if (loading && loading.style.display !== 'none') {
      if (!getCurrentUser()) {
        showSignInRequired()
      }
    }
  }, 3000)
}

function isAdmin(email: string | null, adminEmails: string[]): boolean {
  if (!email) return false
  return adminEmails.includes(email.toLowerCase())
}

function showSignInRequired(): void {
  const container = document.getElementById('admin-container')
  if (container) {
    container.innerHTML = `
      <div class="leaderboard-empty">
        <span class="leaderboard-empty-icon">🔒</span>
        <h3>Sign in required</h3>
        <p>Please sign in to access analytics.</p>
      </div>
    `
  }
}

function showAccessDenied(): void {
  const container = document.getElementById('admin-container')
  if (container) {
    container.innerHTML = `
      <div class="leaderboard-empty">
        <span class="leaderboard-empty-icon">🚫</span>
        <h3>Access denied</h3>
        <p>This page is restricted to site administrators.</p>
        <a href="#/" class="btn btn-primary" style="margin-top: 1rem;">Back to Home</a>
      </div>
    `
  }
}

async function loadAnalytics(): Promise<void> {
  const entries = await getLeaderboard(100) // get all users
  const loadingEl = document.getElementById('admin-loading')
  const contentEl = document.getElementById('admin-content')
  if (!loadingEl || !contentEl) return

  const analytics = computeAnalytics(entries)

  loadingEl.style.display = 'none'
  contentEl.style.display = 'block'

  contentEl.innerHTML = `
    <!-- Stats Cards -->
    <div class="admin-stats-grid">
      <div class="admin-stat-card">
        <span class="admin-stat-icon">👥</span>
        <span class="admin-stat-value">${analytics.totalUsers}</span>
        <span class="admin-stat-label">Total Learners</span>
      </div>
      <div class="admin-stat-card">
        <span class="admin-stat-icon">🎓</span>
        <span class="admin-stat-value">${analytics.totalPassed}</span>
        <span class="admin-stat-label">Certified</span>
      </div>
      <div class="admin-stat-card">
        <span class="admin-stat-icon">📊</span>
        <span class="admin-stat-value">${analytics.avgScore.toFixed(1)}</span>
        <span class="admin-stat-label">Avg Score (/ 3)</span>
      </div>
      <div class="admin-stat-card">
        <span class="admin-stat-icon">🏆</span>
        <span class="admin-stat-value">${analytics.totalUsers > 0 ? Math.round((analytics.totalPassed / analytics.totalUsers) * 100) : 0}%</span>
        <span class="admin-stat-label">Completion Rate</span>
      </div>
    </div>

    <!-- Module Breakdown -->
    <div class="admin-section">
      <h3 class="admin-section-title">Module Performance</h3>
      <div class="admin-module-grid">
        ${['workflows', 'skills', 'agents'].map(mod => {
          const data = analytics.moduleBreakdown[mod] || { passed: 0, attempted: 0 }
          const rate = data.attempted > 0 ? Math.round((data.passed / data.attempted) * 100) : 0
          return `
            <div class="admin-module-card">
              <div class="admin-module-header">
                <h4>${mod.charAt(0).toUpperCase() + mod.slice(1)}</h4>
                <span class="admin-module-rate ${rate >= 70 ? 'rate-good' : rate >= 40 ? 'rate-ok' : 'rate-low'}">${rate}%</span>
              </div>
              <div class="admin-module-stats">
                <div class="admin-module-stat">
                  <span class="admin-module-stat-val">${data.passed}</span>
                  <span class="admin-module-stat-label">Passed</span>
                </div>
                <div class="admin-module-stat">
                  <span class="admin-module-stat-val">${data.attempted}</span>
                  <span class="admin-module-stat-label">Attempted</span>
                </div>
                <div class="admin-module-stat">
                  <span class="admin-module-stat-val">${data.attempted - data.passed}</span>
                  <span class="admin-module-stat-label">Failed</span>
                </div>
              </div>
              <div class="progress-bar-track" style="margin-top: 1rem;">
                <div class="progress-bar-fill bar-correct" style="width: ${rate}%"></div>
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="admin-section">
      <h3 class="admin-section-title">Recent Certified Users</h3>
      ${analytics.recentCompletions.length === 0 
        ? '<p class="admin-no-data">No certified users yet.</p>'
        : `
          <div class="admin-activity-list">
            ${analytics.recentCompletions.map(entry => `
              <div class="admin-activity-row">
                ${entry.photoURL 
                  ? `<img src="${entry.photoURL}" alt="${entry.displayName}" class="lb-avatar" referrerpolicy="no-referrer" />`
                  : `<span class="lb-avatar-placeholder">${entry.displayName.charAt(0).toUpperCase()}</span>`
                }
                <div class="admin-activity-info">
                  <strong>${entry.displayName}</strong>
                  <span>Completed all ${entry.score} modules</span>
                </div>
                <span class="lb-badge-complete">🎓 Certified</span>
              </div>
            `).join('')}
          </div>
        `
      }
    </div>
  `
}

function computeAnalytics(entries: LeaderboardEntry[]): Analytics {
  const totalUsers = entries.length
  const totalPassed = entries.filter(e => e.completedAll).length
  const avgScore = totalUsers > 0 
    ? entries.reduce((sum, e) => sum + e.score, 0) / totalUsers 
    : 0

  // Module breakdown - we need to re-derive this from the leaderboard data
  // Since our leaderboard doesn't have per-module data, we'll estimate
  const moduleBreakdown: Record<string, { passed: number; attempted: number }> = {
    workflows: { passed: 0, attempted: 0 },
    skills: { passed: 0, attempted: 0 },
    agents: { passed: 0, attempted: 0 },
  }

  // Each user who has score >= 1 likely passed at least workflows, etc.
  // This is a rough estimation - a real implementation would query individual docs
  entries.forEach(e => {
    const mods = ['workflows', 'skills', 'agents']
    mods.forEach((mod, i) => {
      moduleBreakdown[mod].attempted += 1
      if (e.score > i) {
        moduleBreakdown[mod].passed += 1
      }
    })
  })

  const recentCompletions = entries.filter(e => e.completedAll).slice(0, 10)

  return { totalUsers, totalPassed, avgScore, moduleBreakdown, recentCompletions }
}

// ── Admin Analytics Dashboard ───────────────────────────────────────────
// Protected page that shows aggregate stats about all users.
// Uses Firebase Auth custom claims (token.admin === true) for access control.

import { getLeaderboard, type LeaderboardEntry } from '../services/leaderboardService'
import { getCurrentUser, onAuthChange, getRawFirebaseUser } from '../services/authService'
import { grantAdminAccess } from '../services/functionsService'

interface Analytics {
  totalUsers: number
  totalPassed: number
  avgScore: number
  moduleBreakdown: Record<string, { passed: number; attempted: number }>
  recentCompletions: LeaderboardEntry[]
}

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 50%, #D1D5DB 100%);">
      <div class="lesson-hero-content" style="color: var(--text-primary);">
        <span class="lesson-badge">Admin</span>
        <h1>Analytics</h1>
        <p>Real-time insights into how learners are progressing through the modules.</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="admin-container" id="admin-container">
        <div id="admin-loading" class="leaderboard-loading">
          <div class="loading-spinner"></div>
          <p>Verifying admin access...</p>
        </div>
        <div id="admin-content" style="display: none;"></div>
      </div>
    </section>
  `
}

export function init(): void {
  // Check if already logged in — use raw Firebase user for token access
  const rawUser = getRawFirebaseUser()
  if (rawUser) {
    checkAdminClaim(rawUser)
    return
  }

  // Otherwise wait for auth state to resolve
  const unsubscribe = onAuthChange((appUser) => {
    unsubscribe()
    if (appUser) {
      const rawUser = getRawFirebaseUser()
      if (rawUser) checkAdminClaim(rawUser)
      else showAccessDenied()
    } else {
      showSignInRequired()
    }
  })

  // Timeout fallback
  setTimeout(() => {
    const loading = document.getElementById('admin-loading')
    if (loading && loading.style.display !== 'none') {
      if (!getCurrentUser()) {
        showSignInRequired()
      }
    }
  }, 3000)
}

/**
 * Checks the user's ID token for the `admin` custom claim.
 * This is the proper Firebase way to do role-based access —
 * claims are set server-side via Cloud Functions and embedded
 * in the JWT, so they can't be spoofed client-side.
 */
async function checkAdminClaim(user: import('firebase/auth').User): Promise<void> {
  // Note: We accept the raw Firebase User here because getIdTokenResult()
  // is a Firebase Auth method. This is the ONE place where raw user is needed.
  try {
    const tokenResult = await user.getIdTokenResult()
    if (tokenResult.claims.admin === true) {
      loadAnalytics()
    } else {
      showAccessDenied()
    }
  } catch (error) {
    console.error('[admin] Failed to get ID token:', error)
    showAccessDenied()
  }
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
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
          Admin access is granted via Firebase custom claims.<br>
          Ask an existing admin to run <code>setAdminClaim</code> for your account.
        </p>
        <a href="/" class="btn btn-primary" style="margin-top: 1rem;">Back to Home</a>
      </div>
    `
  }
}

async function loadAnalytics(): Promise<void> {
  const entries = await getLeaderboard(100)
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

    <!-- Grant Admin Section -->
    <div class="admin-section">
      <h3 class="admin-section-title">Admin Management</h3>
      <div class="admin-grant-section">
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
          Grant admin access to another user by entering their Firebase UID.
          The user must have already signed into the platform.
        </p>
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <input
            type="text"
            id="admin-grant-uid"
            placeholder="Enter user UID"
            class="glossary-search"
            style="max-width: 320px; flex: 1;"
          />
          <button id="admin-grant-btn" class="btn btn-primary">Grant Admin</button>
        </div>
        <p id="admin-grant-status" style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-muted);"></p>
      </div>
    </div>
  `

  // Bind grant admin button
  const grantBtn = document.getElementById('admin-grant-btn')
  const grantInput = document.getElementById('admin-grant-uid') as HTMLInputElement
  const grantStatus = document.getElementById('admin-grant-status')

  grantBtn?.addEventListener('click', async () => {
    const targetUid = grantInput?.value.trim()
    if (!targetUid) {
      if (grantStatus) grantStatus.textContent = '⚠️ Please enter a UID.'
      return
    }

    if (grantBtn) (grantBtn as HTMLButtonElement).disabled = true
    if (grantStatus) grantStatus.textContent = 'Setting admin claim...'

    try {
      await grantAdminAccess(targetUid)

      if (grantStatus) grantStatus.textContent = `✅ Admin access granted to ${targetUid}`
      if (grantInput) grantInput.value = ''
    } catch (error) {
      console.error('[admin] Grant failed:', error)
      if (grantStatus) {
        grantStatus.textContent = `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    } finally {
      if (grantBtn) (grantBtn as HTMLButtonElement).disabled = false
    }
  })
}

function computeAnalytics(entries: LeaderboardEntry[]): Analytics {
  const totalUsers = entries.length
  const totalPassed = entries.filter(e => e.completedAll).length
  const avgScore = totalUsers > 0 
    ? entries.reduce((sum, e) => sum + e.score, 0) / totalUsers 
    : 0

  const moduleBreakdown: Record<string, { passed: number; attempted: number }> = {
    workflows: { passed: 0, attempted: 0 },
    skills: { passed: 0, attempted: 0 },
    agents: { passed: 0, attempted: 0 },
  }

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

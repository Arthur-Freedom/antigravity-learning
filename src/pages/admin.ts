// ── Admin Analytics Dashboard ───────────────────────────────────────────
// Protected page: Firebase Auth custom claims (token.admin === true).
// All data access goes through the service layer — zero direct Firebase imports.

import { getAllUsers } from '../services/userService'
import { onAuthChange, getCurrentUser, isCurrentUserAdmin } from '../services/authService'
import { grantAdminAccess, resetUserProgress } from '../services/functionsService'
import type { Timestamp, FieldValue } from 'firebase/firestore'

// ── Constants ───────────────────────────────────────────────────────────

const ALL_MODULES = ['workflows', 'skills', 'agents', 'prompts', 'context', 'mcp', 'tools', 'safety', 'projects'] as const

const MODULE_META: Record<string, { label: string; icon: string }> = {
  workflows: { label: 'Workflows', icon: '📋' },
  skills:    { label: 'Skills',    icon: '🧠' },
  agents:    { label: 'Agents',    icon: '🤖' },
  prompts:   { label: 'Prompts',   icon: '✍️' },
  context:   { label: 'Context',   icon: '🪟' },
  mcp:       { label: 'MCP',       icon: '🔌' },
  tools:     { label: 'Tools',     icon: '🔧' },
  safety:    { label: 'Safety',    icon: '🛡️' },
  projects:  { label: 'Projects',  icon: '🚀' },
}

interface AdminUser {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  quizProgress: Record<string, { correct: boolean; answeredAt: string }>
  quizScore: number
  completedAll: boolean
  xp: number
  level: number
  streak: number
  createdAt: Timestamp | FieldValue | null
}

// ── Page Shell ──────────────────────────────────────────────────────────

export function render(): string {
  return `
    <section class="admin-header">
      <div class="admin-header-inner">
        <div>
          <div class="admin-header-title-row">
            <span class="admin-header-badge">Admin</span>
            <h1 class="admin-header-title">Dashboard</h1>
          </div>
          <p class="admin-header-subtitle">Analytics & user management</p>
        </div>
      </div>
    </section>

    <section class="admin-body">
      <div class="admin-container" id="admin-container">
        <div id="admin-loading" class="leaderboard-loading">
          <div class="loading-spinner"></div>
          <p>Verifying admin access…</p>
        </div>
        <div id="admin-content" style="display: none;"></div>
      </div>
    </section>
  `
}

// ── Init & Auth Gate ────────────────────────────────────────────────────

export function init(): void {
  const user = getCurrentUser()
  if (user) { checkAdmin(); return }

  const unsubscribe = onAuthChange((appUser) => {
    unsubscribe()
    if (appUser) checkAdmin()
    else showSignInRequired()
  })

  setTimeout(() => {
    const loading = document.getElementById('admin-loading')
    if (loading && loading.style.display !== 'none' && !getCurrentUser()) {
      showSignInRequired()
    }
  }, 3000)
}

async function checkAdmin(): Promise<void> {
  try {
    const admin = await isCurrentUserAdmin()
    if (admin) loadDashboard()
    else showAccessDenied()
  } catch (err) {
    console.error('[admin] Failed to verify admin status:', err)
    showError('Could not verify admin access. Please try refreshing.')
  }
}

function showSignInRequired(): void {
  const c = document.getElementById('admin-container')
  if (c) c.innerHTML = `
    <div class="leaderboard-empty">
      <span class="leaderboard-empty-icon">🔒</span>
      <h3>Sign in required</h3>
      <p>Please sign in to access the admin dashboard.</p>
    </div>`
}

function showAccessDenied(): void {
  const c = document.getElementById('admin-container')
  if (!c) return
  c.innerHTML = `
    <div class="leaderboard-empty">
      <span class="leaderboard-empty-icon">🚫</span>
      <h3>Access denied</h3>
      <p>This page is restricted to site administrators.</p>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem;">
        If you believe this is an error, contact the site owner.
      </p>
    </div>`
}
function showError(msg: string): void {
  const c = document.getElementById('admin-container')
  if (c) c.innerHTML = `
    <div class="leaderboard-empty">
      <span class="leaderboard-empty-icon">⚠️</span>
      <h3>Something went wrong</h3>
      <p>${msg}</p>
    </div>`
}

// ── Dashboard ───────────────────────────────────────────────────────────

async function loadDashboard(): Promise<void> {
  const loadingEl = document.getElementById('admin-loading')
  const contentEl = document.getElementById('admin-content')
  if (!loadingEl || !contentEl) return

  let allUsers: Awaited<ReturnType<typeof getAllUsers>>
  try {
    allUsers = await getAllUsers()
  } catch (err) {
    console.error('[admin] Failed to load users:', err)
    showError('Failed to load user data. Check your Firestore connection and try again.')
    return
  }
  const users = allUsers.map(u => ({
    uid: u.uid,
    displayName: u.displayName ?? 'Anonymous',
    email: u.email ?? '',
    photoURL: u.photoURL ?? null,
    quizProgress: u.quizProgress ?? {},
    quizScore: u.quizScore ?? 0,
    completedAll: u.completedAll ?? false,
    xp: u.xp ?? 0,
    level: u.level ?? 1,
    streak: u.streak ?? 0,
    createdAt: u.createdAt,
  }))

  // Sort by XP descending
  users.sort((a, b) => b.xp - a.xp)

  // Compute real per-module analytics
  const moduleStats = computeModuleStats(users)
  const totalUsers = users.length
  const certified = users.filter(u => u.completedAll).length
  const avgModules = totalUsers > 0
    ? (users.reduce((s, u) => s + Object.values(u.quizProgress).filter(r => r.correct).length, 0) / totalUsers).toFixed(1)
    : '0'
  const completionRate = totalUsers > 0 ? Math.round((certified / totalUsers) * 100) : 0

  loadingEl.style.display = 'none'
  contentEl.style.display = 'block'

  contentEl.innerHTML = `
    <!-- Stat Row -->
    <div class="ad-stats">
      <div class="ad-stat">
        <span class="ad-stat-num">${totalUsers}</span>
        <span class="ad-stat-lbl">Users</span>
      </div>
      <div class="ad-stat-divider"></div>
      <div class="ad-stat">
        <span class="ad-stat-num">${certified}</span>
        <span class="ad-stat-lbl">Certified</span>
      </div>
      <div class="ad-stat-divider"></div>
      <div class="ad-stat">
        <span class="ad-stat-num">${avgModules}</span>
        <span class="ad-stat-lbl">Avg Modules</span>
      </div>
      <div class="ad-stat-divider"></div>
      <div class="ad-stat">
        <span class="ad-stat-num">${completionRate}%</span>
        <span class="ad-stat-lbl">Completion</span>
      </div>
    </div>

    <!-- Module Performance -->
    <div class="ad-panel">
      <h2 class="ad-panel-title">Module Performance</h2>
      <div class="ad-modules">
        ${ALL_MODULES.map(mod => {
          const s = moduleStats[mod]
          const meta = MODULE_META[mod]
          const rate = s.attempted > 0 ? Math.round((s.passed / s.attempted) * 100) : 0
          const rateClass = rate >= 70 ? 'good' : rate >= 40 ? 'ok' : 'low'
          return `
            <div class="ad-mod">
              <div class="ad-mod-top">
                <span class="ad-mod-icon">${meta.icon}</span>
                <span class="ad-mod-name">${meta.label}</span>
                <span class="ad-mod-rate ad-mod-rate--${rateClass}">${rate}%</span>
              </div>
              <div class="ad-mod-bar">
                <div class="ad-mod-bar-fill" style="width:${rate}%"></div>
              </div>
              <div class="ad-mod-nums">
                <span><strong>${s.passed}</strong> passed</span>
                <span><strong>${s.attempted - s.passed}</strong> failed</span>
                <span><strong>${totalUsers - s.attempted}</strong> unattempted</span>
              </div>
            </div>`
        }).join('')}
      </div>
    </div>

    <!-- Users Table -->
    <div class="ad-panel">
      <div class="ad-panel-header">
        <h2 class="ad-panel-title">Users</h2>
        <input type="text" id="ad-user-search" class="ad-search" placeholder="Search users…" />
      </div>
      <div class="ad-table-wrap">
        <table class="ad-table" id="ad-user-table">
          <thead>
            <tr>
              <th>User</th>
              <th class="ad-th-sort" data-sort="modules">Modules</th>
              <th class="ad-th-sort" data-sort="xp">XP</th>
              <th class="ad-th-sort" data-sort="level">Level</th>
              <th class="ad-th-sort" data-sort="streak">Streak</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="ad-user-tbody">
            ${users.map(u => renderUserRow(u)).join('')}
          </tbody>
        </table>
      </div>
      ${users.length === 0 ? '<p class="ad-empty">No users have signed up yet.</p>' : ''}
    </div>

    <!-- Action Feedback -->
    <div id="ad-toast" class="ad-toast"></div>
  `

  bindTableInteractions(users)
}

// ── User Row Renderer ───────────────────────────────────────────────────

function renderUserRow(u: AdminUser): string {
  const passed = Object.values(u.quizProgress).filter(r => r.correct).length
  const moduleIcons = ALL_MODULES.map(mod => {
    const result = u.quizProgress[mod]
    if (!result) return `<span class="ad-dot ad-dot--none" title="${MODULE_META[mod].label}: not attempted">○</span>`
    if (result.correct) return `<span class="ad-dot ad-dot--pass" title="${MODULE_META[mod].label}: passed">●</span>`
    return `<span class="ad-dot ad-dot--fail" title="${MODULE_META[mod].label}: failed">●</span>`
  }).join('')

  const avatar = u.photoURL
    ? `<img src="${u.photoURL}" alt="" class="ad-avatar" referrerpolicy="no-referrer" />`
    : `<span class="ad-avatar ad-avatar--placeholder">${u.displayName.charAt(0).toUpperCase()}</span>`

  return `
    <tr class="ad-row" data-uid="${u.uid}" data-name="${u.displayName.toLowerCase()}" data-email="${u.email.toLowerCase()}" data-modules="${passed}" data-xp="${u.xp}" data-level="${u.level}" data-streak="${u.streak}">
      <td>
        <div class="ad-user-cell">
          ${avatar}
          <div>
            <div class="ad-user-name">${u.displayName}</div>
            <div class="ad-user-email">${u.email || u.uid.slice(0, 12) + '…'}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="ad-modules-cell">
          <strong>${passed}/9</strong>
          <div class="ad-dot-row">${moduleIcons}</div>
        </div>
      </td>
      <td><span class="ad-xp">${u.xp.toLocaleString()}</span></td>
      <td>${u.level}</td>
      <td>${u.streak > 0 ? `🔥 ${u.streak}` : '—'}</td>
      <td>${u.completedAll
        ? '<span class="ad-badge ad-badge--cert">🎓 Certified</span>'
        : `<span class="ad-badge ad-badge--prog">${passed}/9</span>`
      }</td>
      <td>
        <div class="ad-actions">
          <button class="ad-btn ad-btn--reset" data-uid="${u.uid}" data-name="${u.displayName}" title="Reset progress">🔄</button>
          <button class="ad-btn ad-btn--admin" data-uid="${u.uid}" data-name="${u.displayName}" title="Grant admin">👑</button>
        </div>
      </td>
    </tr>
  `
}

// ── Table Interactions ──────────────────────────────────────────────────

function bindTableInteractions(users: AdminUser[]): void {
  // Search
  const searchInput = document.getElementById('ad-user-search') as HTMLInputElement
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase()
    document.querySelectorAll<HTMLTableRowElement>('#ad-user-tbody .ad-row').forEach(row => {
      const name = row.dataset.name ?? ''
      const email = row.dataset.email ?? ''
      row.style.display = (name.includes(q) || email.includes(q)) ? '' : 'none'
    })
  })

  // Sort
  let sortKey = 'xp'
  let sortAsc = false

  document.querySelectorAll('.ad-th-sort').forEach(th => {
    th.addEventListener('click', () => {
      const key = (th as HTMLElement).dataset.sort!
      if (sortKey === key) sortAsc = !sortAsc
      else { sortKey = key; sortAsc = false }

      // Update header arrows
      document.querySelectorAll('.ad-th-sort').forEach(h => {
        h.classList.remove('ad-sort-asc', 'ad-sort-desc')
      })
      th.classList.add(sortAsc ? 'ad-sort-asc' : 'ad-sort-desc')

      const tbody = document.getElementById('ad-user-tbody')!
      const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('.ad-row'))
      rows.sort((a, b) => {
        const aVal = parseFloat(a.dataset[key] ?? '0')
        const bVal = parseFloat(b.dataset[key] ?? '0')
        return sortAsc ? aVal - bVal : bVal - aVal
      })
      rows.forEach(r => tbody.appendChild(r))
    })
  })

  // Action buttons (delegated)
  document.getElementById('ad-user-tbody')?.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.ad-btn')
    if (!btn) return

    const uid = btn.dataset.uid!
    const name = btn.dataset.name!

    if (btn.classList.contains('ad-btn--reset')) {
      const ok = confirm(
        `Reset ALL progress for "${name}"?\n\n` +
        `• Quiz progress cleared\n• XP → 0, Level → 1, Streak → 0\n\nThis cannot be undone.`
      )
      if (!ok) return
      btn.disabled = true
      try {
        await resetUserProgress(uid)
        showToast(`✅ Progress reset for ${name}`)
        // Update row visually
        const row = document.querySelector<HTMLTableRowElement>(`.ad-row[data-uid="${uid}"]`)
        if (row) {
          row.dataset.modules = '0'
          row.dataset.xp = '0'
          row.dataset.level = '1'
          row.dataset.streak = '0'
          const user = users.find(u => u.uid === uid)
          if (user) {
            user.quizProgress = {}
            user.quizScore = 0
            user.xp = 0
            user.level = 1
            user.streak = 0
            user.completedAll = false
            row.outerHTML = renderUserRow(user)
          }
        }
      } catch (err) {
        showToast(`❌ Failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
      btn.disabled = false
    }

    if (btn.classList.contains('ad-btn--admin')) {
      const ok = confirm(`Grant admin access to "${name}"?\n\nThey can view analytics and manage users.`)
      if (!ok) return
      btn.disabled = true
      try {
        await grantAdminAccess(uid)
        showToast(`✅ Admin granted to ${name} — they need to re-login`)
      } catch (err) {
        showToast(`❌ Failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
      btn.disabled = false
    }
  })
}

// ── Toast ───────────────────────────────────────────────────────────────

function showToast(msg: string): void {
  const el = document.getElementById('ad-toast')
  if (!el) return
  el.textContent = msg
  el.classList.add('ad-toast--visible')
  setTimeout(() => el.classList.remove('ad-toast--visible'), 4000)
}

// ── Analytics ───────────────────────────────────────────────────────────

function computeModuleStats(users: AdminUser[]): Record<string, { passed: number; attempted: number }> {
  const stats: Record<string, { passed: number; attempted: number }> = {}
  ALL_MODULES.forEach(mod => { stats[mod] = { passed: 0, attempted: 0 } })

  users.forEach(u => {
    ALL_MODULES.forEach(mod => {
      const result = u.quizProgress[mod]
      if (result) {
        stats[mod].attempted++
        if (result.correct) stats[mod].passed++
      }
    })
  })

  return stats
}

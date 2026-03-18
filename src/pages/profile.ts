// ── Profile & Settings Page ─────────────────────────────────────────────
// Lets authenticated users view and edit their profile information,
// change their profile picture, manage theme preferences, and view
// their quiz progress / account details.
//
// Auth-aware: render() outputs a loading shell, and init() waits for
// onAuthStateChanged to populate the real content. This avoids the
// race condition where auth.currentUser is null on first render.

import { getCurrentUser, onAuthChange, updateAuthProfile } from '../services/authService'
import { getUserProfile, updateDisplayName, type UserProfile } from '../services/userService'
import { openProfilePictureModal } from '../components/profile-picture'
import { showToast } from '../components/toast'
import { downloadCertificate } from '../components/certificate'
import { MODULE_META, MODULE_KEYS, TOTAL_MODULES } from '../constants/modules'

/** Auth listener unsubscribe — cleaned up if the route changes */
let unsubAuth: (() => void) | null = null

export function render(): string {
  // Always render a shell — init() will fill in the real content
  // once Firebase Auth has resolved the user state.
  return `
    <section class="lesson-hero profile-hero" style="background: linear-gradient(135deg, #E8F9EF 0%, #D1FAE5 40%, #BAE6FD 100%);">
      <div class="lesson-hero-content" style="color: var(--text-primary);">
        <span class="lesson-badge">Account</span>
        <h1>Profile & Settings</h1>
        <p>Manage your account, customize your experience, and track your progress.</p>
      </div>
    </section>

    <section class="profile-page">
      <div class="profile-container" id="profile-root">
        <div class="profile-progress-loading" style="padding: 4rem 0;">
          <div class="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    </section>
  `
}

export function init(): void {
  // Check if user is already available (fast path)
  const existingUser = getCurrentUser()
  if (existingUser) {
    renderProfileContent(existingUser)
    return
  }

  // Otherwise wait for auth to resolve
  unsubAuth = onAuthChange((user) => {
    if (user) {
      renderProfileContent(user)
    } else {
      renderSignInRequired()
    }
    // Only need the first resolved state — unsubscribe
    if (unsubAuth) {
      unsubAuth()
      unsubAuth = null
    }
  })
}

export function destroy(): void {
  if (unsubAuth) {
    unsubAuth()
    unsubAuth = null
  }
}

// ── Render the signed-out state ─────────────────────────────────────────

function renderSignInRequired(): void {
  const root = document.getElementById('profile-root')
  if (!root) return

  root.innerHTML = `
    <div class="profile-login-prompt">
      <div class="profile-login-icon">🔒</div>
      <h2>Sign in Required</h2>
      <p>Please sign in with your Google account to access your profile and settings.</p>
    </div>
  `
}

// ── Render the full profile page for an authenticated user ──────────────

function renderProfileContent(user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null }): void {
  const root = document.getElementById('profile-root')
  if (!root) return

  const displayName = user.displayName ?? 'User'
  const email = user.email ?? ''
  const photoURL = user.photoURL

  root.innerHTML = `
    <!-- Profile Card -->
    <div class="profile-card reveal-on-scroll">
      <div class="profile-card-header">
        <div class="profile-avatar-wrapper" id="profile-avatar-btn" title="Change profile picture">
          <div class="profile-avatar-ring">
            ${photoURL
              ? `<img src="${photoURL}" width="102" height="102" alt="${displayName}" class="profile-avatar-img" referrerpolicy="no-referrer" />`
              : `<div class="profile-avatar-placeholder">${displayName.charAt(0).toUpperCase()}</div>`
            }
          </div>
          <div class="profile-avatar-overlay">
            <span>📷</span>
            <span>Change</span>
          </div>
        </div>
        <div class="profile-header-info">
          <h2 class="profile-name" id="profile-display-name">${displayName}</h2>
          <p class="profile-email">${email}</p>
          <div class="profile-badges" id="profile-badges">
            <span class="profile-badge-loading">Loading...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Grid -->
    <div class="profile-settings-grid">

      <!-- Edit Profile Section -->
      <div class="profile-section reveal-on-scroll">
        <div class="profile-section-header">
          <span class="profile-section-icon">✏️</span>
          <h3>Edit Profile</h3>
        </div>
        <div class="profile-section-body">
          <div class="profile-field">
            <label for="profile-name-input" class="profile-field-label">Display Name</label>
            <div class="profile-field-input-row">
              <input
                type="text"
                id="profile-name-input"
                class="profile-input"
                value="${displayName}"
                maxlength="100"
                placeholder="Your display name"
              />
              <button id="profile-save-name-btn" class="btn profile-save-btn" disabled>Save</button>
            </div>
            <p class="profile-field-hint">This name will be shown on the leaderboard and your certificate.</p>
          </div>
          <div class="profile-field">
            <label class="profile-field-label">Email</label>
            <div class="profile-field-value">${email}</div>
            <p class="profile-field-hint">Email is managed by your Google account and cannot be changed here.</p>
          </div>
          <div class="profile-field">
            <label class="profile-field-label">Profile Picture</label>
            <button id="profile-change-photo-btn" class="btn profile-outline-btn">
              📷 Change Profile Picture
            </button>
            <p class="profile-field-hint">Upload a custom avatar or use your Google profile picture.</p>
          </div>
        </div>
      </div>

      <!-- Gamification Section -->
      <div class="profile-section reveal-on-scroll">
        <div class="profile-section-header">
          <span class="profile-section-icon">⭐</span>
          <h3>Experience & Level</h3>
        </div>
        <div class="profile-section-body">
          <div id="profile-gamification" class="profile-gamification-area">
            <div class="profile-progress-loading">
              <div class="loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>


      <!-- Quiz Progress Section -->
      <div class="profile-section profile-section-wide reveal-on-scroll">
        <div class="profile-section-header">
          <span class="profile-section-icon">📊</span>
          <h3>Quiz Progress</h3>
        </div>
        <div class="profile-section-body">
          <div id="profile-progress" class="profile-progress-area">
            <div class="profile-progress-loading">
              <div class="loading-spinner"></div>
              <p>Loading progress...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Info Section -->
      <div class="profile-section profile-section-wide reveal-on-scroll">
        <div class="profile-section-header">
          <span class="profile-section-icon">🔐</span>
          <h3>Account</h3>
        </div>
        <div class="profile-section-body">
          <div class="profile-account-grid" id="profile-account-info">
            <div class="profile-account-item">
              <span class="profile-account-label">Provider</span>
              <span class="profile-account-value">Google</span>
            </div>
            <div class="profile-account-item">
              <span class="profile-account-label">User ID</span>
              <span class="profile-account-value profile-uid">${user.uid.slice(0, 12)}…</span>
            </div>
            <div class="profile-account-item">
              <span class="profile-account-label">Member Since</span>
              <span class="profile-account-value" id="profile-member-since">—</span>
            </div>
            <div class="profile-account-item">
              <span class="profile-account-label">Last Active</span>
              <span class="profile-account-value" id="profile-last-active">—</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `

  // ── Reveal dynamically-injected elements ────────────────────────────
  // The router's IntersectionObserver already ran, so it won't pick up
  // these new .reveal-on-scroll elements. Trigger them manually.
  requestAnimationFrame(() => {
    root.querySelectorAll('.reveal-on-scroll').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), i * 80)
    })
  })

  // ── Bind all interactive elements ───────────────────────────────────
  bindProfileInteractions(user)
}

// ── Bind event listeners after the profile content is in the DOM ─────────

function bindProfileInteractions(user: { uid: string; displayName: string | null }): void {
  // ── Load profile data ───────────────────────────────────────────────
  loadProfileData(user.uid)

  // ── Display Name editing ────────────────────────────────────────────
  const nameInput = document.getElementById('profile-name-input') as HTMLInputElement | null
  const saveBtn = document.getElementById('profile-save-name-btn') as HTMLButtonElement | null
  const originalName = user.displayName ?? 'User'

  if (nameInput && saveBtn) {
    nameInput.addEventListener('input', () => {
      const trimmed = nameInput.value.trim()
      saveBtn.disabled = trimmed === originalName || trimmed.length === 0
    })

    saveBtn.addEventListener('click', async () => {
      const newName = nameInput.value.trim()
      if (!newName || newName === originalName) return

      saveBtn.disabled = true
      saveBtn.textContent = 'Saving...'

      try {
        await updateDisplayName(user.uid, newName)
        await updateAuthProfile({ displayName: newName })
        showToast({ message: '✅ Display name updated!', type: 'success' })

        // Update name in the header
        const nameDisplay = document.getElementById('profile-display-name')
        if (nameDisplay) nameDisplay.textContent = newName

        // Update navbar avatar name
        const authName = document.querySelector('.auth-name')
        if (authName) authName.textContent = newName.split(' ')[0]
      } catch (error) {
        console.error('[profile] Failed to update name:', error)
        showToast({ message: 'Failed to update name', type: 'error' })
      } finally {
        saveBtn.textContent = 'Save'
      }
    })
  }

  // ── Profile Picture ─────────────────────────────────────────────────
  document.getElementById('profile-avatar-btn')?.addEventListener('click', () => {
    openProfilePictureModal()
  })
  document.getElementById('profile-change-photo-btn')?.addEventListener('click', () => {
    openProfilePictureModal()
  })
}


async function loadProfileData(uid: string): Promise<void> {
  let profile: UserProfile | null
  try {
    profile = await getUserProfile(uid)
  } catch (err) {
    console.error('[profile] Failed to load profile data:', err)
    showToast({ message: 'Could not load profile. Please try refreshing.', type: 'error' })
    return
  }
  if (!profile) return

  // ── Custom Photo (overrides Google avatar) ────────────────────────
  const customPhoto = profile.customPhotoURL
  if (customPhoto) {
    // Update profile page avatar
    const avatarImg = document.querySelector('.profile-avatar-img') as HTMLImageElement | null
    if (avatarImg) {
      if (avatarImg.src !== customPhoto) {
        avatarImg.src = customPhoto
      }
    } else {
      // Replace placeholder with actual image
      const ring = document.querySelector('.profile-avatar-ring')
      const placeholder = ring?.querySelector('.profile-avatar-placeholder')
      if (ring && placeholder) {
        const img = document.createElement('img')
        img.src = customPhoto
        img.alt = profile.displayName || 'Avatar'
        img.width = 102
        img.height = 102
        img.className = 'profile-avatar-img'
        img.referrerPolicy = 'no-referrer'
        placeholder.replaceWith(img)
      }
    }

    // Update navbar avatar
    const authAvatar = document.querySelector('.auth-avatar') as HTMLImageElement | null
    if (authAvatar) {
      if (authAvatar.src !== customPhoto) {
        authAvatar.src = customPhoto
      }
    }
  }

  // ── Display Name (use Firestore value, which may be custom) ───────
  if (profile.displayName) {
    const nameDisplay = document.getElementById('profile-display-name')
    if (nameDisplay) nameDisplay.textContent = profile.displayName

    const nameInput = document.getElementById('profile-name-input') as HTMLInputElement | null
    if (nameInput) nameInput.value = profile.displayName
  }

  // ── Badges ────────────────────────────────────────────────────────
  const badgesEl = document.getElementById('profile-badges')
  if (badgesEl) {
    const badges: string[] = []
    if (profile.level) badges.push(`<span class="profile-badge profile-badge-level">⭐ Level ${profile.level}</span>`)
    if (profile.streak && profile.streak > 0) badges.push(`<span class="profile-badge profile-badge-streak" title="Daily streak">🔥 ${profile.streak}</span>`)
    if (profile.completedAll) badges.push('<span class="profile-badge profile-badge-certified">🎓 Certified</span>')
    if (profile.quizScore > 0) badges.push(`<span class="profile-badge profile-badge-score">🏆 Score: ${profile.quizScore}/${TOTAL_MODULES}</span>`)
    if (!profile.completedAll && profile.quizTotal > 0) badges.push('<span class="profile-badge profile-badge-progress">🔄 In Progress</span>')
    if (profile.quizTotal === 0) badges.push('<span class="profile-badge profile-badge-new">✨ New Learner</span>')
    badgesEl.innerHTML = badges.join('')
  }

  // ── Gamification ──────────────────────────────────────────────────
  renderGamification(profile)

  // ── Quiz Progress ─────────────────────────────────────────────────
  renderQuizProgress(profile)

  // ── Account Dates ─────────────────────────────────────────────────
  const memberSince = document.getElementById('profile-member-since')
  const lastActive = document.getElementById('profile-last-active')

  if (memberSince && profile.createdAt) {
    const date = (profile.createdAt as { toDate: () => Date })?.toDate?.()
    if (date) memberSince.textContent = formatDate(date)
  }
  if (lastActive && profile.updatedAt) {
    const date = (profile.updatedAt as { toDate: () => Date })?.toDate?.()
    if (date) lastActive.textContent = formatRelativeTime(date)
  }
}

function renderQuizProgress(profile: UserProfile): void {
  const container = document.getElementById('profile-progress')
  if (!container) return

  const quizzes = MODULE_KEYS.map(key => ({ key, ...MODULE_META[key] }))

  const progress = profile.quizProgress ?? {}

  const totalCorrect = Object.values(progress).filter(r => r.correct).length
  const totalAttempts = Object.keys(progress).length
  const pct = totalAttempts > 0 ? Math.round((totalCorrect / TOTAL_MODULES) * 100) : 0

  container.innerHTML = `
    <!-- Overall Progress -->
    <div class="profile-progress-overview">
      <div class="profile-progress-ring-wrapper">
        <svg class="profile-progress-ring" viewBox="0 0 120 120">
          <circle class="progress-ring-bg" cx="60" cy="60" r="52" fill="none" stroke-width="8" />
          <circle class="progress-ring-fill" cx="60" cy="60" r="52"
            fill="none" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="${2 * Math.PI * 52}"
            stroke-dashoffset="${2 * Math.PI * 52 * (1 - pct / 100)}"
            style="transition: stroke-dashoffset 1s ease;"
          />
        </svg>
        <div class="profile-progress-ring-label">
          <span class="profile-progress-pct">${pct}%</span>
          <span class="profile-progress-sub">Complete</span>
        </div>
      </div>
      <div class="profile-progress-stats">
        <div class="profile-stat">
          <span class="profile-stat-number">${totalCorrect}</span>
          <span class="profile-stat-label">Passed</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-number">${totalAttempts}</span>
          <span class="profile-stat-label">Attempted</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-number">${TOTAL_MODULES - totalCorrect}</span>
          <span class="profile-stat-label">Remaining</span>
        </div>
      </div>
    </div>

    <!-- Per-module breakdown -->
    <div class="profile-progress-modules">
      ${quizzes.map(q => {
        const result = progress[q.key]
        const status = result
          ? result.correct
            ? 'passed'
            : 'failed'
          : 'not-started'
        const statusLabel = status === 'passed' ? '✅ Passed' : status === 'failed' ? '❌ Failed' : '⬜ Not Started'
        const dateStr = result?.answeredAt
          ? formatDate(new Date(result.answeredAt))
          : '—'

        return `
          <a href="${q.href}" class="profile-module-card profile-module-${status}">
            <span class="profile-module-icon">${q.icon}</span>
            <div class="profile-module-info">
              <span class="profile-module-name">${q.label}</span>
              <span class="profile-module-date">${dateStr}</span>
            </div>
            <span class="profile-module-status">${statusLabel}</span>
          </a>
        `
      }).join('')}
    </div>

    ${profile.completedAll
      ? `<div class="profile-completion-banner">
           <span>🎉</span>
           <div>
             <strong>All modules completed!</strong>
             <p>You've earned your certificate.</p>
             <button id="profile-cert-download-btn" class="btn profile-outline-btn mt-2" style="background: white; color: var(--color-success); border-color: white; margin-top: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem;">🎓 Download Certificate</button>
           </div>
         </div>`
      : `<div class="profile-completion-cta">
           <p>Complete all ${TOTAL_MODULES} modules to earn your certificate!</p>
           <a href="/" class="btn profile-outline-btn">Continue Learning →</a>
         </div>`
    }
  `

  // ── Certificate Download (Bind after rendering) ─────────────────────
  const certBtn = document.getElementById('profile-cert-download-btn')
  if (certBtn) {
    certBtn.addEventListener('click', () => {
      downloadCertificate()
    })
  }
}

function renderGamification(profile: UserProfile): void {
  const container = document.getElementById('profile-gamification')
  if (!container) return

  const xp = profile.xp ?? 0
  const level = profile.level ?? 1
  const streak = profile.streak ?? 0
  
  // Calculate XP needed for next level:
  // Level = floor(sqrt(XP / 100)) + 1 -> Max XP for current level = ((Level)^2) * 100
  // XP required for next level = Level * Level * 100
  const xpForNextLevel = level * level * 100
  const xpForCurrentLevel = (level - 1) * (level - 1) * 100
  const xpProgress = xp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const pct = Math.min(100, Math.max(0, Math.round((xpProgress / xpNeeded) * 100)))

  container.innerHTML = `
    <div class="profile-gamification-stats">
      <div class="profile-stat">
        <span class="profile-stat-number">⭐ ${level}</span>
        <span class="profile-stat-label">Current Level</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-number">🔥 ${streak}</span>
        <span class="profile-stat-label">Day Streak</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-number">${xp}</span>
        <span class="profile-stat-label">Total XP</span>
      </div>
    </div>
    
    <div class="profile-xp-bar-container">
      <div class="profile-xp-bar-header">
        <span class="profile-xp-label">Level Progress</span>
        <span class="profile-xp-values">${xpProgress} / ${xpNeeded} XP to Level ${level + 1}</span>
      </div>
      <div class="profile-xp-bar-bg">
        <div class="profile-xp-bar-fill" style="width: ${pct}%;"></div>
      </div>
    </div>
  `
}

// ── Formatting helpers ──────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDate(date)
}

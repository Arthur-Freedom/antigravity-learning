// ── Auth Button UI Component ────────────────────────────────────────────
// Renders the navbar auth button (login / profile+logout).
// Imports from authService — NEVER from firebase/* directly.

import { loginWithGoogle, onAuthChange, getCurrentUser } from '../services/authService';
import { ensureUserProfile, applyDailyLoginStreak, getUserProfile, type UserProfile } from '../services/userService';
import { showLogoutConfirmation } from './logout-dialog';
import type { AppUser } from '../types/user';

/**
 * Binds the auth state to a navbar button element.
 * Call this once after the DOM is rendered.
 */
export function bindAuthUI(btnId: string): void {
  const btn = document.getElementById(btnId);
  if (!btn) {
    console.warn(`[auth-button] Element #${btnId} not found – skipping auth UI binding.`);
    return;
  }

  // Click handler (only handles login; logout is handled separately)
  btn.addEventListener('click', async (e) => {
    if (getCurrentUser()) {
      e.preventDefault();
      return;
    }
    const result = await loginWithGoogle();

    if (result.status === 'disabled') {
      showAuthToast(
        'Account Disabled',
        'Your account has been disabled. Please contact support if you believe this is a mistake.',
        'error'
      );
    } else if (result.status === 'error') {
      showAuthToast(
        'Sign-in Failed',
        'Something went wrong. Please try again.',
        'error'
      );
    }
  });

  // React to auth state changes
  onAuthChange(async (user) => {
    if (user) {
      // First, handle gamification updates and profile sync
      await applyDailyLoginStreak(user.uid);
      await ensureUserProfile(user.uid, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      // Fetch latest profile to get streak info
      const profile = await getUserProfile(user.uid);
      renderAuthButton(btn, user, profile);
    } else {
      renderAuthButton(btn, null, null);
    }
  });
}

// ── Internal ────────────────────────────────────────────────────────────

function renderAuthButton(btn: HTMLElement, user: AppUser | null, profile: UserProfile | null): void {
  if (user) {
    const displayName = user.displayName;
    const photoURL = user.photoURL;
    const streak = profile?.streak ?? 0;
    const streakHtml = streak > 0 
      ? `<span class="auth-streak" title="${streak} Day Streak!">🔥 ${streak}</span>` 
      : '';

    btn.innerHTML = `
      <a href="/profile" class="auth-profile-link" title="View your profile">
        ${
          photoURL
            ? `<img src="${photoURL}" width="24" height="24" alt="${displayName}" class="auth-avatar" referrerpolicy="no-referrer" />`
            : `<span class="auth-avatar-placeholder">${displayName.charAt(0).toUpperCase()}</span>`
        }
        <span class="auth-name">${displayName}</span>
      </a>
      ${streakHtml}
      <span class="auth-divider"></span>
      <span class="auth-logout-label" role="button" tabindex="0" title="Sign out">Logout</span>
    `;
    btn.classList.add('auth-btn--logged-in');
    btn.classList.remove('auth-btn--logged-out');

    const profileLink = btn.querySelector('.auth-profile-link');
    if (profileLink) {
      profileLink.addEventListener('click', (e) => e.stopPropagation());
    }

    const logoutLabel = btn.querySelector('.auth-logout-label');
    if (logoutLabel) {
      logoutLabel.addEventListener('click', (e) => {
        e.stopPropagation();
        showLogoutConfirmation();
      });
    }
  } else {
    btn.innerHTML = `
      <svg class="auth-google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span>Sign in with Google</span>
    `;
    btn.classList.add('auth-btn--logged-out');
    btn.classList.remove('auth-btn--logged-in');
  }
}

// ── Toast Notification ──────────────────────────────────────────────────

let toastStyleInjected = false;

function injectToastStyles(): void {
  if (toastStyleInjected) return;
  toastStyleInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    .auth-toast {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 10000;
      min-width: 320px;
      max-width: 420px;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      font-size: 0.9rem;
      line-height: 1.5;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(12px);
      transform: translateX(120%);
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                  opacity 0.35s ease;
      opacity: 0;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .auth-toast--visible {
      transform: translateX(0);
      opacity: 1;
    }
    .auth-toast--error {
      background: linear-gradient(135deg, #1a0a0a 0%, #2d1111 100%);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .auth-toast--info {
      background: linear-gradient(135deg, #0a0a1a 0%, #111128 100%);
      border: 1px solid rgba(96, 165, 250, 0.3);
      color: #bfdbfe;
    }
    .auth-toast__icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .auth-toast__content {
      flex: 1;
    }
    .auth-toast__title {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }
    .auth-toast--error .auth-toast__title { color: #f87171; }
    .auth-toast--info .auth-toast__title { color: #60a5fa; }
    .auth-toast__message {
      opacity: 0.85;
      font-size: 0.85rem;
    }
    .auth-toast__close {
      background: none;
      border: none;
      color: inherit;
      opacity: 0.5;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0;
      margin-top: -0.1rem;
      transition: opacity 0.2s;
    }
    .auth-toast__close:hover { opacity: 1; }
  `;
  document.head.appendChild(style);
}

function showAuthToast(title: string, message: string, type: 'error' | 'info' = 'info'): void {
  injectToastStyles();

  const icon = type === 'error' ? '⚠️' : 'ℹ️';
  const toast = document.createElement('div');
  toast.className = `auth-toast auth-toast--${type}`;
  toast.innerHTML = `
    <span class="auth-toast__icon">${icon}</span>
    <div class="auth-toast__content">
      <div class="auth-toast__title">${title}</div>
      <div class="auth-toast__message">${message}</div>
    </div>
    <button class="auth-toast__close" aria-label="Dismiss">&times;</button>
  `;

  document.body.appendChild(toast);

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('auth-toast--visible'));
  });

  const dismiss = () => {
    toast.classList.remove('auth-toast--visible');
    setTimeout(() => toast.remove(), 400);
  };

  toast.querySelector('.auth-toast__close')?.addEventListener('click', dismiss);
  setTimeout(dismiss, 6000);
}

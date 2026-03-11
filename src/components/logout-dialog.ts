// ── Logout Confirmation Dialog ──────────────────────────────────────────
// Modal dialog UI component. Imports from authService only.

import { logout } from '../services/authService';

export function showLogoutConfirmation(): void {
  if (document.querySelector('.logout-confirm-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'logout-confirm-overlay';
  overlay.innerHTML = `
    <div class="logout-confirm-modal" role="dialog" aria-label="Confirm sign out">
      <div class="logout-confirm-icon">👋</div>
      <h3>Sign out?</h3>
      <p>Are you sure you want to sign out of your account?</p>
      <div class="logout-confirm-actions">
        <button class="btn logout-confirm-cancel">Cancel</button>
        <button class="btn logout-confirm-yes">Yes, Sign Out</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('logout-confirm-visible'));

  const close = () => {
    overlay.classList.remove('logout-confirm-visible');
    setTimeout(() => overlay.remove(), 250);
  };

  overlay.querySelector('.logout-confirm-cancel')!.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  overlay.querySelector('.logout-confirm-yes')!.addEventListener('click', async () => {
    close();
    await logout();
  });
}

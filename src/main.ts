import './style.css'
import { bindAuthUI, onAuthChange } from './auth'
import { registerRoutes, initRouter } from './router'
import { showToast } from './components/toast'

// ── Page Modules ────────────────────────────────────────────────────────
import * as homePage from './pages/home'
import * as workflowsPage from './pages/workflows'
import * as skillsPage from './pages/skills'
import * as agentsPage from './pages/agents'
import * as leaderboardPage from './pages/leaderboard'
import * as adminPage from './pages/admin'
import * as resourcesPage from './pages/resources'
import { downloadCertificate } from './components/certificate'

// ── Render App Shell ────────────────────────────────────────────────────
// The navbar and footer persist; only #page-content is swapped by router.

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="navbar">
    <a href="#/" class="nav-brand">Antigravity</a>
    <div class="nav-links">
      <a href="#/">Home</a>
      <a href="#modules">Modules</a>
      <a href="#/leaderboard">🏆 Leaderboard</a>
      <a href="#/resources">📚 Resources</a>
      <button id="cert-download-btn" class="btn btn-ghost" style="padding: 0.5rem 1rem; font-size: 0.82rem; border-radius: 100px;">🎓 Certificate</button>
      <button id="google-login-btn" class="btn auth-btn auth-btn--logged-out" aria-label="Sign in with Google">Sign in with Google</button>
      <button id="theme-toggle" class="btn theme-btn" aria-label="Toggle theme">☀️ Light</button>
    </div>
    <button class="hamburger" id="hamburger-btn" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </header>

  <main id="page-content"></main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">Antigravity</span>
        <p class="footer-tagline">A premium learning experience for AI agents.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Modules</h4>
          <a href="#/learn/workflows">Workflows</a>
          <a href="#/learn/skills">Skills</a>
          <a href="#/learn/agents">Autonomous Agents</a>
          <a href="#/resources">Resources</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <a href="#/">Home</a>
          <a href="#modules">All Modules</a>
          <a href="#/leaderboard">Leaderboard</a>
          <a href="#/admin">Analytics</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Antigravity Learning. Built with ❤️ by AI agents.</p>
    </div>
  </footer>
`

// ── Auth Binding ────────────────────────────────────────────────────────
bindAuthUI('google-login-btn')

// ── Route Registration ──────────────────────────────────────────────────
registerRoutes({
  '/': { render: homePage.render, init: homePage.init },
  '/learn/workflows': { render: workflowsPage.render, init: workflowsPage.init },
  '/learn/skills': { render: skillsPage.render, init: skillsPage.init },
  '/learn/agents': { render: agentsPage.render, init: agentsPage.init },
  '/leaderboard': { render: leaderboardPage.render, init: leaderboardPage.init },
  '/resources': { render: resourcesPage.render, init: resourcesPage.init },
  '/admin': { render: adminPage.render, init: adminPage.init },
})

// ── Certificate Download ────────────────────────────────────────────────
document.getElementById('cert-download-btn')?.addEventListener('click', () => {
  downloadCertificate()
})

// Start the router (renders the initial page)
initRouter('#page-content')

// ── Theme Toggle with Persistence ───────────────────────────────────────
import { saveThemePreference, getUserProfile } from './db'
import { getCurrentUser } from './auth'

const themeBtn = document.getElementById('theme-toggle')!

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme')
    themeBtn.textContent = '🌙 Dark'
  } else {
    document.body.classList.remove('dark-theme')
    themeBtn.textContent = '☀️ Light'
  }
}

themeBtn.addEventListener('click', async () => {
  const isDark = document.body.classList.contains('dark-theme')
  const newTheme = isDark ? 'light' : 'dark'
  applyTheme(newTheme)

  const user = getCurrentUser()
  if (user) {
    await saveThemePreference(user.uid, newTheme)
  }
})

// ── Hamburger Menu (Mobile) ─────────────────────────────────────────────
const hamburger = document.getElementById('hamburger-btn')!
const navLinks = document.querySelector('.nav-links')!

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('nav-open')
  hamburger.classList.toggle('hamburger-active')
})

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('nav-open')
    hamburger.classList.remove('hamburger-active')
  })
})

// ── Auth State → Restore Theme + Toasts ─────────────────────────────────
let previousUser: unknown = undefined; // track to avoid initial toast

onAuthChange(async (user) => {
  if (user) {
    const profile = await getUserProfile(user.uid)
    if (profile) {
      applyTheme(profile.theme ?? 'light')
    }
    // Show welcome toast (but not on initial page load)
    if (previousUser !== undefined) {
      showToast({
        message: `Welcome back, ${user.displayName?.split(' ')[0] ?? 'User'}!`,
        type: 'success',
      })
    }
  } else if (previousUser) {
    showToast({ message: 'Signed out successfully', type: 'info' })
  }
  previousUser = user
})


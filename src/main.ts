import './style.css'
import './animations.css'
// import { initAppCheck } from './lib/appcheck'  // ← Enable once VITE_RECAPTCHA_ENTERPRISE_KEY is set
import { bindAuthUI } from './components/auth-button'
import { onAuthChange } from './services/authService'
import { registerRoutes, initRouter, navigate, getCurrentPath } from './router'
import { showToast } from './components/toast'
import { initPresence, onOnlineCountChange } from './services/presenceService'

// App Check is disabled until a ReCAPTCHA Enterprise key is configured.
// Uncomment the import above and the line below once ready:
// initAppCheck()

// ── Page Modules ────────────────────────────────────────────────────────
import * as homePage from './pages/home'
import * as workflowsPage from './pages/workflows'
import * as skillsPage from './pages/skills'
import * as agentsPage from './pages/agents'
import * as promptsPage from './pages/prompts'
import * as contextPage from './pages/context'
import * as mcpPage from './pages/mcp'
import * as toolsPage from './pages/tools'
import * as safetyPage from './pages/safety'
import * as projectsPage from './pages/projects'
import * as leaderboardPage from './pages/leaderboard'
import * as adminPage from './pages/admin'
import * as resourcesPage from './pages/resources'
import * as profilePage from './pages/profile'
import * as faqPage from './pages/faq'
import * as glossaryPage from './pages/glossary'

// ── Render App Shell ────────────────────────────────────────────────────
// The navbar and footer persist; only #page-content is swapped by router.

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="navbar">
    <div class="nav-brand-group">
      <a href="/" class="nav-brand">Antigravity</a>
      <span class="presence-indicator" id="presence-indicator" style="display:none;">
        <span class="presence-dot"></span>
        <span class="presence-count" id="presence-count">0</span> online
      </span>
    </div>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/" id="nav-modules-link">Modules</a>
      <a href="/leaderboard">🏆 Leaderboard</a>
      <a href="/resources">📚 Resources</a>
      <a href="/profile" id="nav-profile-link" class="nav-profile-link" style="display:none;">👤 Profile</a>
      <button id="google-login-btn" class="btn auth-btn auth-btn--logged-out" aria-label="Sign in with Google">Sign in with Google</button>

    </div>
    <button class="hamburger" id="hamburger-btn" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
    <div class="scroll-progress" id="scroll-progress"></div>
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
          <a href="/learn/workflows">Workflows</a>
          <a href="/learn/skills">Skills</a>
          <a href="/learn/agents">Autonomous Agents</a>
          <a href="/learn/prompts">Prompt Engineering</a>
          <a href="/learn/context">Context Windows</a>
          <a href="/learn/mcp">MCP</a>
          <a href="/learn/tools">Tool Use</a>
          <a href="/learn/safety">Safety & Guardrails</a>
          <a href="/learn/projects">Real-World Projects</a>
          <a href="/resources">Resources</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <a href="/">Home</a>
          <a href="/" class="scroll-to-modules">All Modules</a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/profile">Profile</a>
          <a href="/faq">FAQ</a>
          <a href="/glossary">Glossary</a>
          <a href="/admin">Analytics</a>
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

// ── Presence Tracking ───────────────────────────────────────────────────
initPresence()
onOnlineCountChange((count) => {
  const indicator = document.getElementById('presence-indicator')
  const countEl = document.getElementById('presence-count')
  if (indicator && countEl) {
    if (count > 0) {
      indicator.style.display = 'inline-flex'
      countEl.textContent = count.toString()
    } else {
      indicator.style.display = 'none'
    }
  }
})

// ── Route Registration ──────────────────────────────────────────────────
registerRoutes({
  '/': { render: homePage.render, init: homePage.init, destroy: homePage.destroy },
  '/learn/workflows': { render: workflowsPage.render, init: workflowsPage.init },
  '/learn/skills': { render: skillsPage.render, init: skillsPage.init },
  '/learn/agents': { render: agentsPage.render, init: agentsPage.init },
  '/learn/prompts': { render: promptsPage.render, init: promptsPage.init },
  '/learn/context': { render: contextPage.render, init: contextPage.init },
  '/learn/mcp': { render: mcpPage.render, init: mcpPage.init },
  '/learn/tools': { render: toolsPage.render, init: toolsPage.init },
  '/learn/safety': { render: safetyPage.render, init: safetyPage.init },
  '/learn/projects': { render: projectsPage.render, init: projectsPage.init },
  '/leaderboard': { render: leaderboardPage.render, init: leaderboardPage.init, destroy: leaderboardPage.destroy },
  '/resources': { render: resourcesPage.render, init: resourcesPage.init },
  '/admin': { render: adminPage.render, init: adminPage.init },
  '/profile': { render: profilePage.render, init: profilePage.init, destroy: profilePage.destroy },
  '/faq': { render: faqPage.render, init: faqPage.init },
  '/glossary': { render: glossaryPage.render, init: glossaryPage.init },
})

// Start the router (renders the initial page)
initRouter('#page-content')


// ── Hamburger Menu (Mobile) ─────────────────────────────────────────────
const hamburger = document.getElementById('hamburger-btn')!
const navLinks = document.querySelector('.nav-links')!

function openMobileMenu(): void {
  navLinks.classList.add('nav-open')
  hamburger.classList.add('hamburger-active')
  document.body.style.overflow = 'hidden' // Prevent background scroll
}

function closeMobileMenu(): void {
  navLinks.classList.remove('nav-open')
  hamburger.classList.remove('hamburger-active')
  document.body.style.overflow = ''
}

hamburger.addEventListener('click', () => {
  if (navLinks.classList.contains('nav-open')) {
    closeMobileMenu()
  } else {
    openMobileMenu()
  }
})

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu)
})

// Close mobile menu on button click (theme toggle)
navLinks.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', closeMobileMenu)
})

// Close on backdrop click (the ::before pseudo-element area)
navLinks.addEventListener('click', (e) => {
  if (e.target === navLinks) closeMobileMenu()
})

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('nav-open')) {
    closeMobileMenu()
  }
})

// ── Modules Link Scroll Handler ─────────────────────────────────────────
function scrollToModules(e: Event): void {
  e.preventDefault()
  const currentPath = getCurrentPath()
  if (currentPath === '/') {
    // Already on home, just scroll
    document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })
  } else {
    // Navigate to home first, then scroll after render
    navigate('/')
    setTimeout(() => {
      document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })
    }, 400)
  }
}

document.getElementById('nav-modules-link')?.addEventListener('click', scrollToModules)
document.querySelectorAll('.scroll-to-modules').forEach(el =>
  el.addEventListener('click', scrollToModules)
)

// ── Auth State → Restore Theme + Toasts ─────────────────────────────────
let previousUser: unknown = undefined; // track to avoid initial toast

onAuthChange(async (user) => {
  // Show/hide profile link based on auth state
  const profileLink = document.getElementById('nav-profile-link')
  if (profileLink) profileLink.style.display = user ? '' : 'none'

  if (user) {
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

// ── Navbar scroll effect + Reading progress bar ────────────────────────
const navbar = document.querySelector('header.navbar')!
const scrollProgress = document.getElementById('scroll-progress')!
let ticking = false

function updateScrollUI(): void {
  // Navbar shrink effect
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled')
  } else {
    navbar.classList.remove('scrolled')
  }

  // Reading progress bar
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
  scrollProgress.style.transform = `scaleX(${progress})`
  ticking = false
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollUI)
    ticking = true
  }
}, { passive: true })

// Reset progress bar on route changes
window.addEventListener('routechange', () => {
  scrollProgress.style.transform = 'scaleX(0)'
  // Re-calculate after content renders
  setTimeout(() => requestAnimationFrame(updateScrollUI), 400)
})

// ── Hero Particles ──────────────────────────────────────────────────────
function spawnParticles(): void {
  const hero = document.querySelector('.hero-animated')
  if (!hero) return
  // Don't duplicate
  if (hero.querySelector('.hero-particles')) return

  const container = document.createElement('div')
  container.className = 'hero-particles'

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    p.style.left = Math.random() * 100 + '%'
    p.style.top = (60 + Math.random() * 40) + '%'
    p.style.width = (2 + Math.random() * 3) + 'px'
    p.style.height = p.style.width
    p.style.animationDuration = (8 + Math.random() * 12) + 's'
    p.style.animationDelay = (Math.random() * 8) + 's'
    p.style.opacity = (0.15 + Math.random() * 0.35).toString()
    container.appendChild(p)
  }
  hero.prepend(container)
}

// Spawn particles on route change too
window.addEventListener('routechange', () => {
  requestAnimationFrame(() => {
    setTimeout(spawnParticles, 300)
  })
})
spawnParticles()

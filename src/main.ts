import './style.css'
import './animations.css'
// import { initAppCheck } from './lib/appcheck'  // ← Enable once VITE_RECAPTCHA_ENTERPRISE_KEY is set
import { bindAuthUI } from './components/auth-button'
import { onAuthChange } from './services/authService'
import { registerRoutes, initRouter, navigate, getCurrentPath } from './router'
import { showToast } from './components/toast'
import { initPresence, onOnlineCountChange } from './services/presenceService'
import { initRemoteConfig, getFlag, getConfigValue } from './services/remoteConfigService'

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
import * as multiagentPage from './pages/multiagent'
import * as evaluationPage from './pages/evaluation'
import * as productionPage from './pages/production'
import * as leaderboardPage from './pages/leaderboard'
import * as adminPage from './pages/admin'
import * as resourcesPage from './pages/resources'
import * as profilePage from './pages/profile'
import * as faqPage from './pages/faq'
import * as glossaryPage from './pages/glossary'
import * as privacyPage from './pages/privacy'
import * as termsPage from './pages/terms'

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
          <h4>Learn</h4>
          <a href="/learn/workflows">Getting Started</a>
          <a href="/" class="scroll-to-modules">Course Overview</a>
        </div>
        <div class="footer-col">
          <h4>Community</h4>
          <a href="/faq">FAQ</a>
          <a href="/profile" id="footer-profile-link" style="display:none;">Profile</a>
          <a href="/leaderboard">Leaderboard</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <a href="/glossary">Glossary</a>
          <a href="/resources">Resource Hub</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Antigravity Learning. Built with ❤️ by AI agents.</p>
      <div class="footer-legal">
        <a href="/privacy">Privacy Policy</a>
        <span class="footer-dot">·</span>
        <a href="/terms">Terms of Service</a>
      </div>
    </div>
  </footer>
`

// ── Auth Binding ────────────────────────────────────────────────────────
bindAuthUI('google-login-btn')

// ── Remote Config (Feature Flags) ───────────────────────────────────────
initRemoteConfig().then(() => {
  // Maintenance banner
  const bannerText = getConfigValue('maintenance_banner');
  if (bannerText) {
    const banner = document.createElement('div');
    banner.className = 'maintenance-banner';
    banner.innerHTML = bannerText;
    document.querySelector('main')?.before(banner);
  }

  // Conditionally hide leaderboard nav link
  if (!getFlag('leaderboard_enabled')) {
    document.querySelectorAll('a[href="/leaderboard"]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  }

  // Conditionally hide presence indicator
  if (!getFlag('presence_enabled')) {
    const indicator = document.getElementById('presence-indicator');
    if (indicator) indicator.style.display = 'none !important';
  }
});

// ── Presence Tracking ───────────────────────────────────────────────────
initPresence()
onOnlineCountChange((count) => {
  const indicator = document.getElementById('presence-indicator')
  const countEl = document.getElementById('presence-count')
  if (indicator && countEl) {
    if (count > 0 && getFlag('presence_enabled')) {
      indicator.style.display = 'inline-flex'
      countEl.textContent = count.toString()
    } else {
      indicator.style.display = 'none'
    }
  }
})

// ── Route Registration ──────────────────────────────────────────────────
registerRoutes({
  '/': { render: homePage.render, init: homePage.init, destroy: homePage.destroy, title: 'Home', description: 'Master AI agent development through premium, hands-on tutorials and open-source intelligence workflows.' },
  '/learn/workflows': { render: workflowsPage.render, init: workflowsPage.init, title: 'AI Agent Workflows', description: 'Learn how to construct robust, reliable workflows and pipelines for AI agents.' },
  '/learn/skills': { render: skillsPage.render, init: skillsPage.init, title: 'Agent Skills & Tools', description: 'Give your AI agents specialized skills to interact with APIs, databases, and the real world.' },
  '/learn/agents': { render: agentsPage.render, init: agentsPage.init, title: 'Building Autonomous Agents', description: 'Step-by-step tutorial on building self-directed, autonomous AI agents from scratch.' },
  '/learn/prompts': { render: promptsPage.render, init: promptsPage.init, title: 'Advanced Prompt Engineering', description: 'Master the art of prompting for complex agentic reasoning and tool use.' },
  '/learn/context': { render: contextPage.render, init: contextPage.init, title: 'Managing Context Windows', description: 'Strategies for managing massive context windows and infinite memory systems in LLMs.' },
  '/learn/mcp': { render: mcpPage.render, init: mcpPage.init, title: 'Model Context Protocol (MCP)', description: 'Connect AI agents to external tools and data sources seamlessly using MCP.' },
  '/learn/tools': { render: toolsPage.render, init: toolsPage.init, title: 'Tool Use & Function Calling', description: 'Learn how to teach LLMs to reliably call functions and format JSON output.' },
  '/learn/safety': { render: safetyPage.render, init: safetyPage.init, title: 'AI Safety & Guardrails', description: 'Implement robust safety guardrails to prevent your autonomous agents from causing harm.' },
  '/learn/projects': { render: projectsPage.render, init: projectsPage.init, title: 'Real-World AI Projects', description: 'Apply your knowledge by building portfolio-ready, real-world AI agent projects.' },
  '/learn/multiagent': { render: multiagentPage.render, init: multiagentPage.init, title: 'Multi-Agent Systems', description: 'Design complex architectures where multiple specialized AI agents collaborate.' },
  '/learn/evaluation': { render: evaluationPage.render, init: evaluationPage.init, title: 'LLM Evaluation & Testing', description: 'Build automated evaluation pipelines to reliably test and improve your AI models.' },
  '/learn/production': { render: productionPage.render, init: productionPage.init, title: 'Deploying Agents to Production', description: 'Best practices for scaling, deploying, and maintaining AI agents in production environments.' },
  '/leaderboard': { render: leaderboardPage.render, init: leaderboardPage.init, destroy: leaderboardPage.destroy, title: 'Leaderboard', description: 'Climb the ranks and compete with other AI developers on the Antigravity leaderboard.' },
  '/resources': { render: resourcesPage.render, init: resourcesPage.init, title: 'Resources', description: 'Curated resources, libraries, and tools for advanced AI agent development.' },
  '/admin': { render: adminPage.render, init: adminPage.init, title: 'Admin Dashboard', description: 'Administration dashboard for the Antigravity Learning platform.' },
  '/profile': { render: profilePage.render, init: profilePage.init, destroy: profilePage.destroy, title: 'User Profile', description: 'View your learning progress and manage your Antigravity account.' },
  '/faq': { render: faqPage.render, init: faqPage.init, title: 'Frequently Asked Questions', description: 'Answers to common questions about Antigravity Learning and AI agent development.' },
  '/glossary': { render: glossaryPage.render, init: glossaryPage.init, title: 'AI Glossary', description: 'A comprehensive dictionary of artificial intelligence and agent-related terminology.' },
  '/privacy': { render: privacyPage.render, init: privacyPage.init, title: 'Privacy Policy', description: 'How Antigravity Learning collects, uses, and protects your information.' },
  '/terms': { render: termsPage.render, init: termsPage.init, title: 'Terms of Service', description: 'Terms and conditions for using the Antigravity Learning platform.' },
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
  
  const footerProfileLink = document.getElementById('footer-profile-link')
  if (footerProfileLink) footerProfileLink.style.display = user ? '' : 'none'

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

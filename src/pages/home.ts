// ── Home Page ───────────────────────────────────────────────────────────
// The landing page with hero, stats, how-it-works, module cards, and progress.

import { getCurrentUser, onAuthChange } from '../auth';
import { getUserProfile } from '../db';

// ── Quiz Data (kept for backward compat with modal fallback) ────────────
export interface Quiz {
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const quizzes: Record<string, Quiz> = {
  workflows: {
    title: 'Workflows Quiz',
    question: 'What does the "// turbo" annotation do in a workflow file?',
    options: [
      'Makes the code run faster',
      'Auto-runs the next shell command without user approval',
      'Enables parallel execution of all steps',
      'Compresses the output logs',
    ],
    correctIndex: 1,
  },
  skills: {
    title: 'Skills Quiz',
    question: 'Where should you place a SKILL.md file so the agent reads it?',
    options: [
      'In the root directory',
      'In a .agent/ folder',
      'In a skills/<skill-name>/ folder',
      'In the src/ folder',
    ],
    correctIndex: 2,
  },
  agents: {
    title: 'Agents Quiz',
    question: 'What is the primary difference between a chatbot and an autonomous agent?',
    options: [
      'Agents are faster at generating text',
      'Agents can execute commands and modify files on your computer',
      'Agents use a different language model',
      'Agents require an internet connection',
    ],
    correctIndex: 1,
  },
};

export function render(): string {
  return `
    <!-- Hero with animated background -->
    <section class="hero hero-animated">
      <div class="hero-bg-shapes">
        <div class="hero-shape shape-1"></div>
        <div class="hero-shape shape-2"></div>
        <div class="hero-shape shape-3"></div>
      </div>
      <div class="hero-content">
        <span class="hero-badge reveal-on-scroll">✨ Learn AI Agent Development</span>
        <h1>Master<br>Autonomy</h1>
        <p>A premium learning experience for AI agents, workflows, and skills. Designed to perfection.</p>
        <div class="hero-cta-group">
          <a href="#modules" class="btn btn-primary" id="scroll-btn">Discover the Curriculum</a>
          <a href="#how-it-works" class="btn btn-ghost" id="scroll-how">How It Works</a>
        </div>
      </div>
      <div class="hero-image-container">
        <img src="/images/hero.png" alt="Modern learning environment" />
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="stats-bar reveal-on-scroll">
      <div class="stats-inner">
        <div class="stat-item">
          <span class="stat-number" data-target="3">0</span>
          <span class="stat-label">Learning Modules</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number" data-target="9">0</span>
          <span class="stat-label">Quiz Questions</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number" data-target="18">0</span>
          <span class="stat-label">Teaching Sections</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number stat-number-pct" data-target="100">0</span>
          <span class="stat-label">Free Forever</span>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="section how-it-works-section">
      <h2 class="section-title">How It Works</h2>
      <div class="hiw-grid">
        <div class="hiw-step reveal-on-scroll">
          <div class="hiw-icon-wrap">
            <div class="hiw-icon">📖</div>
            <div class="hiw-step-num">1</div>
          </div>
          <h3>Read the Lesson</h3>
          <p>Each module has a full lesson page with concepts, code examples, and real-world analogies.</p>
        </div>
        <div class="hiw-connector reveal-on-scroll"></div>
        <div class="hiw-step reveal-on-scroll">
          <div class="hiw-icon-wrap">
            <div class="hiw-icon">📝</div>
            <div class="hiw-step-num">2</div>
          </div>
          <h3>Take the Quiz</h3>
          <p>Test your understanding with 3 knowledge-check questions at the end of each lesson.</p>
        </div>
        <div class="hiw-connector reveal-on-scroll"></div>
        <div class="hiw-step reveal-on-scroll">
          <div class="hiw-icon-wrap">
            <div class="hiw-icon">🏆</div>
            <div class="hiw-step-num">3</div>
          </div>
          <h3>Track Progress</h3>
          <p>Sign in to save your progress to the cloud. Your results sync across all your devices.</p>
        </div>
      </div>
    </section>

    <!-- Core Modules -->
    <section id="modules" class="section">
      <h2 class="section-title">Core Modules</h2>
      <div class="grid">

        <div class="card reveal-on-scroll" id="card-workflows">
          <div class="card-image">
            <img src="/images/workflows.png" alt="Workflows" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 1</div>
            <h3>Workflows</h3>
            <p>Automate repetitive tasks with explicitly defined steps and shell commands.</p>
            <div class="card-tags">
              <span class="tag">Automation</span>
              <span class="tag">Shell</span>
              <span class="tag">Turbo Mode</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-workflows">Not started</span>
              <a href="#/learn/workflows" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

        <div class="card reveal-on-scroll" id="card-skills">
          <div class="card-image">
            <img src="/images/skills.png" alt="Skills" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 2</div>
            <h3>Skills</h3>
            <p>Extend the agent's permanent knowledge base with custom paradigms and libraries.</p>
            <div class="card-tags">
              <span class="tag">Knowledge</span>
              <span class="tag">SKILL.md</span>
              <span class="tag">Reusable</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-skills">Not started</span>
              <a href="#/learn/skills" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

        <div class="card reveal-on-scroll" id="card-agents">
          <div class="card-image">
            <img src="/images/agents.png" alt="Agents" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 3</div>
            <h3>Autonomous Agents</h3>
            <p>Learn how an agent executes tasks directly on your computer.</p>
            <div class="card-tags">
              <span class="tag">Tools</span>
              <span class="tag">Parallel</span>
              <span class="tag">Execution</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-agents">Not started</span>
              <a href="#/learn/agents" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Progress Dashboard -->
    <section id="progress" class="section progress-section">
      <h2 class="section-title">Your Progress</h2>
      <div class="progress-container" id="progress-container">
        <div class="progress-login-card reveal-on-scroll">
          <div class="progress-login-icon">🔐</div>
          <h3>Track Your Journey</h3>
          <p>Sign in with Google to track your learning progress across devices. Your quiz results are saved securely to the cloud.</p>
        </div>
      </div>
    </section>
  `;
}

export function init(): void {
  // Smooth scroll for hero CTAs
  document.getElementById('scroll-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('scroll-how')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Animated stat counters
  initStatCounters();

  // Restore progress reactively when auth state resolves
  // This fixes the race condition where getCurrentUser() returns null
  // at init time because Firebase hasn't resolved auth yet.
  onAuthChange((user) => {
    if (user) {
      restoreProgress();
    }
  });

  // Also try immediately in case auth already resolved
  restoreProgress();
}

// ── Animated Counters ───────────────────────────────────────────────────

function initStatCounters(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);
}

function animateCounters(): void {
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target = parseInt(el.getAttribute('data-target') ?? '0');
    const isPct = el.classList.contains('stat-number-pct');
    const duration = 1500;
    const start = performance.now();

    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current.toString() + (isPct ? '%' : '');
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

// ── Progress Dashboard ──────────────────────────────────────────────────

async function restoreProgress(): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;

  const profile = await getUserProfile(user.uid);
  if (!profile) return;

  const container = document.getElementById('progress-container');
  if (!container) return;

  // Count completed modules
  const totalModules = Object.keys(quizzes).length;
  const completedModules = profile.quizProgress
    ? Object.values(profile.quizProgress).filter((r) => r.correct).length
    : 0;
  const completionPct = Math.round((completedModules / totalModules) * 100);

  container.innerHTML = `
    <div class="dashboard reveal-on-scroll">
      <!-- Overview Card -->
      <div class="dashboard-overview">
        <div class="progress-ring-wrap">
          <svg class="progress-ring" viewBox="0 0 120 120">
            <circle class="progress-ring-bg" cx="60" cy="60" r="52" />
            <circle class="progress-ring-fill" cx="60" cy="60" r="52"
              stroke-dasharray="${2 * Math.PI * 52}"
              stroke-dashoffset="${2 * Math.PI * 52 * (1 - completionPct / 100)}" />
          </svg>
          <div class="progress-ring-label">
            <span class="progress-ring-pct">${completionPct}%</span>
            <span class="progress-ring-sub">Complete</span>
          </div>
        </div>
        <div class="overview-stats">
          <div class="overview-stat">
            <span class="overview-stat-val">${completedModules}</span>
            <span class="overview-stat-label">Modules Passed</span>
          </div>
          <div class="overview-stat">
            <span class="overview-stat-val">${totalModules - completedModules}</span>
            <span class="overview-stat-label">Remaining</span>
          </div>
        </div>
      </div>

      <!-- Per-module cards -->
      <div class="dashboard-modules">
        ${Object.keys(quizzes)
          .map((t) => {
            const result = profile.quizProgress?.[t];
            const passed = result?.correct ?? false;
            const attempted = !!result;
            return `
            <div class="dash-module-card ${passed ? 'module-passed' : attempted ? 'module-attempted' : ''}">
              <div class="dash-module-status">
                ${passed ? '✅' : attempted ? '🔄' : '⬜'}
              </div>
              <div class="dash-module-info">
                <h4>${quizzes[t].title.replace(' Quiz', '')}</h4>
                <span class="dash-module-label">${passed ? 'Passed' : attempted ? 'Try again' : 'Not attempted'}</span>
              </div>
              <a href="#/learn/${t}" class="btn btn-sm">${passed ? 'Review' : 'Start'}</a>
            </div>`;
          })
          .join('')}
      </div>
    </div>
  `;

  // Animate the ring after a small delay
  requestAnimationFrame(() => {
    const ring = document.querySelector('.progress-ring-fill') as SVGCircleElement;
    if (ring) {
      ring.style.transition = 'stroke-dashoffset 1.2s ease';
    }
  });

  // Also update card statuses
  if (profile.quizProgress) {
    for (const [topic, result] of Object.entries(profile.quizProgress)) {
      const cardStatus = document.getElementById(`status-${topic}`);
      if (cardStatus) {
        cardStatus.textContent = result.correct ? '✅ Passed' : '❌ Try again';
        cardStatus.className = `card-status ${result.correct ? 'status-passed' : 'status-failed'}`;
      }
    }
  }
}

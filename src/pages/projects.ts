// ── Real-World Projects Lesson Page ─────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'projects';

const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is the recommended first step when starting a new project with an agent?',
    options: [
      'Ask the agent to write all the code at once',
      'Describe the project structure and tech stack, then build incrementally',
      'Let the agent choose the tech stack for you',
      'Start coding immediately without any planning',
    ],
    correctIndex: 1,
    explanation:
      'Starting with a clear description of your tech stack and building incrementally gives the agent the context it needs and lets you verify each step before moving on.',
  },
  {
    question: 'How should you handle multiple features being built simultaneously?',
    options: [
      'Ask one agent to build everything in one conversation',
      'Use separate agents on separate branches, each focused on one feature',
      'Wait for each feature to be complete before starting the next',
      'Avoid parallel work entirely',
    ],
    correctIndex: 1,
    explanation:
      'Using separate agents on separate git branches keeps each feature isolated. This prevents merge conflicts and lets each agent focus on its specific concern.',
  },
  {
    question: 'What makes a good end-to-end project prompt?',
    options: [
      'A one-line description like "build me an app"',
      'A detailed spec with tech stack, features, UI requirements, and examples of similar apps',
      'Just the app name and a logo',
      'A list of every function the app should have',
    ],
    correctIndex: 1,
    explanation:
      'A good project prompt includes the tech stack, key features, UI/UX requirements, and examples. This gives the agent enough context to make architectural decisions that align with your vision.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Real-World Projects</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 9</span>
        <h1>Real-World Projects</h1>
        <p>Put it all together — build complete applications with AI agents using everything you've learned.</p>
        <span class="lesson-reading-time">⏱️ ~15 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#rw-plan">Planning Your Project</a></li>
          <li><a href="#rw-scaffold">Scaffolding with Agents</a></li>
          <li><a href="#rw-iterate">The Iterative Loop</a></li>
          <li><a href="#rw-multi">Multi-Agent Projects</a></li>
          <li><a href="#rw-examples">Project Examples</a></li>
          <li><a href="#rw-practice">Best Practices</a></li>
          <li><a href="#rw-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="rw-plan" class="lesson-section reveal-on-scroll">
          <h2>Planning Your Project</h2>
          <p>Before writing a single line of code, a well-planned project prompt sets the stage for success. Think of it as your <strong>project brief</strong> for the agent:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example: Project Brief</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>Project: Personal Portfolio Website

Tech Stack:
  - Vite + TypeScript
  - Vanilla CSS (no frameworks)
  - Firebase Hosting for deployment

Features:
  - Responsive hero section with animated background
  - Project showcase grid with filtering
  - Contact form that sends emails via EmailJS
  - Dark/light theme toggle with localStorage

Design:
  - Minimalist, dark-first design
  - Inter font family
  - Accent color: #6366F1 (indigo)
  - Smooth scroll and micro-animations</code></pre>
          </div>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>The 80/20 rule of project prompts</strong>
              <p>Spend 20% of your time planning the prompt, and you'll save 80% of the time you'd spend correcting the agent later. A detailed brief = fewer revisions.</p>
            </div>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="rw-scaffold" class="lesson-section reveal-on-scroll">
          <h2>Scaffolding with Agents</h2>
          <p>Start by letting the agent create the project skeleton. Give it the foundation, then build feature by feature:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Initialize the project</h4>
                <p>"Create a new Vite + TypeScript project with ESLint and a clean folder structure."</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Set up the design system</h4>
                <p>"Create CSS custom properties for colors, typography, spacing, and components. Dark theme by default."</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Build core layout</h4>
                <p>"Create the app shell with a navbar, main content area, and footer. Add a router for navigation."</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>Add features one at a time</h4>
                <p>Build each feature in a separate conversation. "Add the hero section with animated particles." → Review → "Now add the project grid."</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="rw-iterate" class="lesson-section reveal-on-scroll">
          <h2>The Iterative Loop</h2>
          <p>The best projects are built through <strong>rapid iteration</strong>. Each cycle takes minutes, not hours:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">💬</div>
              <h4>1. Prompt</h4>
              <p>Describe what you want. Be specific about the feature, behavior, and constraints.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🤖</div>
              <h4>2. Generate</h4>
              <p>The agent writes code, creates files, and runs commands. Watch the progress in real-time.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👀</div>
              <h4>3. Review</h4>
              <p>Check the result in your browser. Read the diff. Does it look right? Does it work?</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔄</div>
              <h4>4. Refine</h4>
              <p>"Make the animation smoother," "Center the text on mobile," "Add a loading state." Small tweaks, big impact.</p>
            </div>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>Commit after each cycle</strong>
              <p>Git commit after each successful iteration. This gives you clean checkpoints and makes it easy to rollback if a future change breaks something.</p>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="rw-multi" class="lesson-section reveal-on-scroll">
          <h2>Multi-Agent Projects</h2>
          <p>For larger projects, use <strong>multiple agents in parallel</strong>. Each agent handles a separate concern:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example: 3-Agent Setup</span>
              <span class="code-dot blue"></span>
            </div>
            <pre><code>Agent 1: Frontend
  → "Build the landing page with hero, features grid,
     and testimonials. Use the design system in
     skills/styling/SKILL.md."

Agent 2: Backend
  → "Set up Firebase Authentication with Google sign-in,
     Firestore database with user profiles, and
     Cloud Functions for server-side logic."

Agent 3: DevOps
  → "Create a CI/CD pipeline with GitHub Actions.
     Add a deploy workflow for Firebase Hosting.
     Set up environment variable management."</code></pre>
          </div>
          <div class="callout callout-warning">
            <span class="callout-icon">⚠️</span>
            <div>
              <strong>Coordination is key</strong>
              <p>Make sure agents work on <em>different files</em>. If Agent 1 and Agent 2 both edit <code>main.ts</code>, you'll get merge conflicts. Plan the file boundaries before starting.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="rw-examples" class="lesson-section reveal-on-scroll">
          <h2>Project Examples</h2>
          <p>Here are real-world projects you can build with AI agents (in order of complexity):</p>
          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">📄</div>
              <h4>Portfolio Website</h4>
              <p>Static site with responsive design, project grid, contact form, and dark mode. ~30 minutes with an agent.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">📝</div>
              <h4>Blog Platform</h4>
              <p>Markdown-based blog with routing, syntax highlighting, search, and RSS feed. ~1 hour.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">✅</div>
              <h4>Task Manager</h4>
              <p>Full CRUD app with Firebase, auth, drag-and-drop, categories, and real-time sync. ~2 hours.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🎓</div>
              <h4>Learning Platform</h4>
              <p>Course pages, quizzes, progress tracking, leaderboard, certificates. This very website! ~4 hours.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🛍️</div>
              <h4>E-Commerce Store</h4>
              <p>Product catalog, cart, checkout with Stripe, order history, admin dashboard. ~6 hours.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">💬</div>
              <h4>Real-Time Chat App</h4>
              <p>WebSocket messaging, channels, file sharing, typing indicators, read receipts. ~4 hours.</p>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="rw-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Start small, scale up</h4>
                <p>Build an MVP in one conversation, then add features in follow-up sessions. Don't try to build the entire app in one shot.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Create Skills for your project</h4>
                <p>As conventions emerge, write them into Skills. Future agents working on the project will follow the same patterns.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Write workflows for repetitive tasks</h4>
                <p>Build, deploy, test — create workflows for anything you do more than twice. Let the agent handle the repetition.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Learn from the agent's code</h4>
                <p>Don't just accept the code blindly. Read it, understand the patterns, and learn new techniques. AI-assisted development is a learning opportunity.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="rw-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-projects', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/safety" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Safety & Guardrails</span>
          </a>
          <a href="/" class="lesson-nav-btn nav-next">
            <span class="nav-label">Finish →</span>
            <span class="nav-page">Back to Home</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-projects', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

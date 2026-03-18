// ── Workflows Lesson Page ───────────────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'workflows';

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'Where should workflow files be stored in your project?',
    options: [
      'In the src/ directory',
      'In the .agent/workflows/ directory',
      'In the root of the project',
      'In the node_modules/ directory',
    ],
    correctIndex: 1,
    explanation:
      'Workflow files live in .agent/workflows/ (or .agents/workflows/). The agent automatically discovers them there.',
  },
  {
    question: 'What does the "// turbo" annotation do in a workflow file?',
    options: [
      'Makes the code run faster',
      'Compresses the output logs',
      'Auto-runs the next shell command without user approval',
      'Enables parallel execution of all steps',
    ],
    correctIndex: 2,
    explanation:
      'The // turbo annotation placed above a step tells the agent to auto-run that step without waiting for user approval.',
  },
  {
    question: 'How do you trigger a workflow named deploy.md from the chat?',
    options: [
      'Type "run deploy"',
      'Type "/deploy"',
      'Click the deploy button in the toolbar',
      'The agent runs it automatically on every save',
    ],
    correctIndex: 1,
    explanation:
      'Workflows become slash commands based on their filename. deploy.md → /deploy.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Workflows</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 1</span>
        <h1>Workflows</h1>
        <p>Automate repetitive tasks with step-by-step instructions that the agent follows precisely.</p>
        <span class="lesson-reading-time">⏱️ ~8 min read</span>
      </div>
    </section>

    <section class="lesson-prereqs reveal-on-scroll" style="max-width: 52rem; margin: 0 auto; padding: 1.5rem 1.5rem 0;">
      <div class="callout callout-note" style="border-left-color: var(--accent-primary);">
        <span class="callout-icon">🛠️</span>
        <div>
          <strong>What You'll Need</strong>
          <p style="margin-bottom: 0.5rem;">To follow along with examples, install these two things:</p>
          <p style="margin: 0.25rem 0;"><b style="font-weight: 700;">1.</b> <a href="https://antigravity.google/" target="_blank" rel="noopener" style="color: var(--accent-primary); text-decoration: underline; font-weight: 600;">Google Antigravity</a> — AI-powered coding environment (free tier available)</p>
          <p style="margin: 0.25rem 0;"><b style="font-weight: 700;">2.</b> <a href="https://nodejs.org/" target="_blank" rel="noopener" style="color: var(--accent-primary); text-decoration: underline; font-weight: 600;">Node.js</a> (v18+) — for running code examples</p>
          <p style="margin-top: 0.5rem; font-size: 0.85rem; opacity: 0.7;">The concepts apply to any AI coding agent, but examples use Antigravity-specific tools.</p>
        </div>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#wf-what">What Are Workflows?</a></li>
          <li><a href="#wf-where">Where They Live</a></li>
          <li><a href="#wf-anatomy">Anatomy of a Workflow</a></li>
          <li><a href="#wf-turbo">The Turbo Annotation</a></li>
          <li><a href="#wf-slash">Slash Commands</a></li>
          <li><a href="#wf-practice">Best Practices</a></li>
          <li><a href="#wf-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="wf-what" class="lesson-section reveal-on-scroll">
          <h2>What Are Workflows?</h2>
          <p>Workflows are <strong>step-by-step recipes</strong> for your AI agent. Think of them like a runbook — each step is a clear action, and the agent follows them in order. Instead of typing the same set of commands every time, you write them once in a workflow file and let the agent handle the rest.</p>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Real-world analogy</strong>
              <p>A workflow is like a checklist for a pilot before takeoff. Every step is documented, nothing is forgotten, and it's the same every time.</p>
            </div>
          </div>
          <p>Workflows are perfect for tasks you do repeatedly:</p>
          <ul class="lesson-list">
            <li>Building and deploying your app</li>
            <li>Running tests and linting</li>
            <li>Setting up a new development environment</li>
            <li>Database migrations</li>
            <li>Any multi-step shell process</li>
          </ul>
        </section>

        <!-- Section 2 -->
        <section id="wf-where" class="lesson-section reveal-on-scroll">
          <h2>Where Workflows Live</h2>
          <p>Workflow files are plain <strong>Markdown files</strong> stored in a specific directory in your project:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Project Structure</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>your-project/
├── .agent/
│   └── workflows/
│       ├── deploy.md        ← "Build & deploy to GitHub Pages"
│       ├── test.md          ← "Run the full test suite"
│       └── setup.md         ← "Set up a new dev environment"
├── src/
├── package.json
└── ...</code></pre>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>Alternative paths</strong>
              <p>The agent also looks in <code>.agents/workflows/</code>, <code>_agent/workflows/</code>, and <code>_agents/workflows/</code>. Pick whichever naming convention you prefer.</p>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="wf-anatomy" class="lesson-section reveal-on-scroll">
          <h2>Anatomy of a Workflow</h2>
          <p>Every workflow has two parts: <strong>YAML frontmatter</strong> (metadata) and a <strong>Markdown body</strong> (the steps).</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">.agent/workflows/deploy.md</span>
              <span class="code-dot blue"></span>
            </div>
            <pre><code>---
description: Build and deploy to GitHub Pages
---

1. Build the Vite app
\`\`\`bash
npm run build
\`\`\`

2. Deploy to GitHub Pages
\`\`\`bash
npx gh-pages -d dist
\`\`\`</code></pre>
          </div>
          <p>Let's break this down:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">📋</div>
              <h4>Frontmatter</h4>
              <p>The <code>---</code> block at the top contains the <code>description</code> field. This tells the agent (and you!) what the workflow does.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📝</div>
              <h4>Numbered Steps</h4>
              <p>Each step is a numbered item with a description. The agent reads these like instructions.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💻</div>
              <h4>Code Blocks</h4>
              <p>Shell commands go inside fenced code blocks (<code>\`\`\`bash</code>). The agent runs these in your terminal.</p>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="wf-turbo" class="lesson-section reveal-on-scroll">
          <h2>The Turbo Annotation</h2>
          <p>By default, the agent asks for your approval before running each shell command. The <strong>turbo</strong> annotation lets you skip that for commands you trust.</p>

          <div class="comparison-grid">
            <div class="comparison-card">
              <h4 class="comparison-label label-normal">Normal (asks permission)</h4>
              <div class="code-block">
                <pre><code>1. Install dependencies
\`\`\`bash
npm install
\`\`\`

2. Run tests
\`\`\`bash
npm test
\`\`\`</code></pre>
              </div>
            </div>
            <div class="comparison-card">
              <h4 class="comparison-label label-turbo">Turbo (auto-runs step 2)</h4>
              <div class="code-block">
                <pre><code>1. Install dependencies
\`\`\`bash
npm install
\`\`\`

// turbo
2. Run tests
\`\`\`bash
npm test
\`\`\`</code></pre>
              </div>
            </div>
          </div>

          <div class="callout callout-warning">
            <span class="callout-icon">⚠️</span>
            <div>
              <strong>Use turbo-all with caution</strong>
              <p>Adding <code>// turbo-all</code> anywhere in the file auto-runs <em>every</em> step. Only use this for workflows you've thoroughly tested and trust completely.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="wf-slash" class="lesson-section reveal-on-scroll">
          <h2>Slash Commands</h2>
          <p>Once you save a workflow file, it becomes a <strong>slash command</strong> you can use in the chat. The command name matches the filename:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Filename → Slash Command</span>
            </div>
            <pre><code>.agent/workflows/deploy.md   →   /deploy
.agent/workflows/test.md     →   /test
.agent/workflows/setup.md    →   /setup</code></pre>
          </div>
          <p>Just type the slash command in the agent chat, and it will execute all the steps in the workflow file automatically.</p>
        </section>

        <!-- Section 6 -->
        <section id="wf-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Keep steps atomic</h4>
                <p>Each step should do exactly one thing. If a step fails, it's easy to see where things went wrong.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Write clear descriptions</h4>
                <p>Use the <code>description</code> frontmatter to explain what the workflow does. Future-you will thank you.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Test before turbo</h4>
                <p>Run a workflow manually at least once before adding <code>// turbo-all</code>. Make sure every step succeeds.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Version control your workflows</h4>
                <p>Commit workflow files to git. They're part of your project's documentation and operational knowledge.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="wf-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-workflows', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Back</span>
            <span class="nav-page">Home</span>
          </a>
          <a href="/learn/skills" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next Module →</span>
            <span class="nav-page">Skills</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-workflows', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

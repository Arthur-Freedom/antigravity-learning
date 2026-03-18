// ── Skills Lesson Page ──────────────────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'skills';

export const SECTION_IDS = ['sk-what', 'sk-structure', 'sk-skillmd', 'sk-discovery', 'sk-build', 'sk-practice', 'sk-quiz'] as const;

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is the one required file every skill must have?',
    options: [
      'README.md',
      'SKILL.md',
      'config.json',
      'index.ts',
    ],
    correctIndex: 1,
    explanation:
      'Every skill folder must contain a SKILL.md file. It has YAML frontmatter (name, description) and detailed instructions.',
  },
  {
    question: 'Where should you place a skill folder so the agent can discover it?',
    options: [
      'In the src/ directory',
      'In the .agent/ directory',
      'In a skills/<skill-name>/ folder',
      'Anywhere — the agent auto-discovers skills',
    ],
    correctIndex: 2,
    explanation:
      'Skills go in skills/<skill-name>/ at the project root. The agent discovers them by scanning for SKILL.md files.',
  },
  {
    question: 'Which of these is an OPTIONAL directory inside a skill folder?',
    options: [
      'SKILL.md',
      'scripts/',
      'node_modules/',
      'dist/',
    ],
    correctIndex: 1,
    explanation:
      'scripts/, examples/, and resources/ are all optional directories that can extend a skill. SKILL.md is required, not optional.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 40%, #DDD6FE 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Skills</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 2</span>
        <h1>Skills</h1>
        <p>Extend the agent's knowledge with permanent, reusable instruction sets that stay across conversations.</p>
        <span class="lesson-reading-time">⏱️ ~10 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#sk-what">What Are Skills?</a></li>
          <li><a href="#sk-structure">Folder Structure</a></li>
          <li><a href="#sk-skillmd">The SKILL.md File</a></li>
          <li><a href="#sk-discovery">How Agents Use Skills</a></li>
          <li><a href="#sk-build">Building Your First Skill</a></li>
          <li><a href="#sk-practice">Best Practices</a></li>
          <li><a href="#sk-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="sk-what" class="lesson-section reveal-on-scroll">
          <h2>What Are Skills?</h2>
          <p>Skills are <strong>permanent knowledge packages</strong> that extend what your AI agent knows and can do. While workflows define <em>what</em> to do, skills define <em>how</em> to do things — they teach the agent new paradigms, libraries, and patterns.</p>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Workflows vs Skills</strong>
              <p><strong>Workflows</strong> = "Run these 5 commands in order to deploy."<br>
              <strong>Skills</strong> = "Here's everything you need to know about our styling conventions, with examples."</p>
            </div>
          </div>
          <p>Think of skills as reference manuals the agent consults when it encounters a relevant task. They persist across conversations, so the agent always has access to them.</p>
        </section>

        <!-- Section 2 -->
        <section id="sk-structure" class="lesson-section reveal-on-scroll">
          <h2>Folder Structure</h2>
          <p>Each skill lives in its own folder under <code>skills/</code> at the project root:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Skill Folder Layout</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>skills/
├── google-auth/
│   ├── SKILL.md          ← Required: main instructions
│   ├── scripts/           ← Optional: helper scripts
│   │   └── setup-firebase.sh
│   ├── examples/          ← Optional: reference code
│   │   └── auth-component.ts
│   └── resources/         ← Optional: templates, assets
│       └── firebase-config.template.json
│
└── styling/
    ├── SKILL.md
    └── examples/
        └── color-palette.css</code></pre>
          </div>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">📄</div>
              <h4>SKILL.md</h4>
              <p><strong>Required.</strong> The main instruction file with YAML frontmatter and detailed instructions in Markdown.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⚙️</div>
              <h4>scripts/</h4>
              <p><strong>Optional.</strong> Helper scripts and utilities that extend the agent's capabilities for this skill.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📚</div>
              <h4>examples/</h4>
              <p><strong>Optional.</strong> Reference implementations and usage patterns the agent can learn from.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📦</div>
              <h4>resources/</h4>
              <p><strong>Optional.</strong> Additional files, templates, or assets the skill may reference.</p>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="sk-skillmd" class="lesson-section reveal-on-scroll">
          <h2>The SKILL.md File</h2>
          <p>The SKILL.md is the heart of every skill. It has two parts:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">skills/styling/SKILL.md</span>
              <span class="code-dot blue"></span>
            </div>
            <pre><code>---
name: Styling Guidelines
description: CSS conventions and design tokens for this project
---

# Styling Skill

## Color Palette
Always use CSS custom properties from :root. Never hard-code
hex values in component styles.

## Typography
Use the Montserrat font family for headings and Inter
for body text. Import via Google Fonts.

## Spacing
Use multiples of 0.5rem for all spacing values.
Standard section padding is 4rem horizontal, 6rem vertical.

## Component Patterns
- Cards: 4px border-radius, subtle box-shadow
- Buttons: uppercase, letter-spacing: 1px
- Hover states: always use var(--transition)</code></pre>
          </div>
          <p>The <strong>frontmatter</strong> (<code>name</code> and <code>description</code>) tells the agent what this skill is about. The <strong>body</strong> contains the actual instructions the agent will follow.</p>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>Be specific in your instructions</strong>
              <p>The more detailed your SKILL.md, the better the agent will perform. Include exact conventions, code patterns, and even anti-patterns to avoid.</p>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="sk-discovery" class="lesson-section reveal-on-scroll">
          <h2>How Agents Use Skills</h2>
          <p>When you give the agent a task, it checks if any available skills are relevant. Here's the flow:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>You give a task</h4>
                <p>"Add a dark theme toggle to the header"</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Agent scans skills</h4>
                <p>Finds <code>skills/styling/SKILL.md</code> and reads its instructions.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Agent follows the skill</h4>
                <p>Uses your CSS conventions, design tokens, and patterns — producing code that matches your project's style.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>Consistent results</h4>
                <p>Every agent, in every conversation, follows the same guidelines — no more inconsistent styles.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="sk-build" class="lesson-section reveal-on-scroll">
          <h2>Building Your First Skill</h2>
          <p>Let's create a simple skill that teaches the agent your API conventions:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Step 1 — Create the folder</span>
            </div>
            <pre><code>mkdir -p skills/api-conventions</code></pre>
          </div>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Step 2 — Write SKILL.md</span>
            </div>
            <pre><code>---
name: API Conventions
description: REST API naming and response patterns
---

# API Conventions

## Endpoint Naming
- Use plural nouns: /users, /posts, /comments
- Use kebab-case for multi-word resources: /user-profiles
- Nest related resources: /users/:id/posts

## Response Format
Always wrap responses in a standard envelope:
\`\`\`json
{
  "data": { ... },
  "meta": { "timestamp": "...", "requestId": "..." }
}
\`\`\`

## Error Handling
Return appropriate HTTP status codes:
- 400 for validation errors
- 401 for authentication failures
- 404 for missing resources
- 500 for server errors</code></pre>
          </div>
          <p>That's it! The next time you ask the agent to create an API endpoint, it will follow these exact conventions.</p>
        </section>

        <!-- Section 6 -->
        <section id="sk-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>One skill, one concern</h4>
                <p>Don't cram everything into one skill. Create separate skills for styling, API patterns, testing conventions, etc.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Include examples</h4>
                <p>Put reference implementations in the <code>examples/</code> directory. Agents learn better from concrete code than abstract rules.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Define anti-patterns</h4>
                <p>Tell the agent what <em>not</em> to do. "Never use inline styles" is just as valuable as "Use CSS custom properties."</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Keep skills up to date</h4>
                <p>As your project evolves, update your skills. Outdated skills lead to inconsistent code.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="sk-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-skills', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/workflows" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Workflows</span>
          </a>
          <a href="/learn/agents" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next Module →</span>
            <span class="nav-page">Autonomous Agents</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-skills', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ── Multi-Agent Systems Lesson Page ─────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'multiagent';

export const SECTION_IDS = ['ma-why', 'ma-patterns', 'ma-delegation', 'ma-communication', 'ma-pitfalls', 'ma-practice', 'ma-quiz'] as const;

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is the primary benefit of using multiple agents instead of a single agent?',
    options: [
      'It uses less memory',
      'Multiple agents always run faster than one',
      'Each agent can specialise on a focused task, reducing errors and context overload',
      'It eliminates the need for human oversight',
    ],
    correctIndex: 2,
    explanation:
      'Specialised agents handle focused tasks with less context, leading to better results than one overloaded agent trying to do everything.',
  },
  {
    question: 'What is the "orchestrator" pattern in multi-agent systems?',
    options: [
      'A central agent routes tasks to specialised sub-agents and aggregates results',
      'All agents run simultaneously without coordination',
      'Agents take turns processing the same prompt',
      'A human manually assigns tasks to each agent',
    ],
    correctIndex: 0,
    explanation:
      'The orchestrator pattern uses a lead agent to decompose work, delegate to specialists, and synthesise their outputs into a single coherent result.',
  },
  {
    question: 'How should you handle shared state between cooperating agents?',
    options: [
      'Let each agent maintain its own copy and hope they stay in sync',
      'Agents never need to share state',
      'Copy-paste outputs between agents manually',
      'Use a shared file, database, or message queue that all agents read/write to',
    ],
    correctIndex: 3,
    explanation:
      'A shared data layer (filesystem, database, or message bus) ensures agents can coordinate without duplication or conflicts.',
  },
  {
    question: 'In a multi-agent system, what is the primary danger of circular dependencies between agents?',
    options: [
      'They use up all available network bandwidth instantly',
      'They can lead to infinite loops if agents continuously hand tasks back and forth without a termination condition',
      'They prevent human oversight from functioning',
      'They make the context window too small for the models',
    ],
    correctIndex: 1,
    explanation:
      'If Agent A delegates to Agent B, which delegates back to Agent A without proper exit conditions, the system can get stuck in a costly infinite loop.',
  },
  {
    question: 'What is the "Swarm" or "Network" pattern in multi-agent orchestration?',
    options: [
      'A centralized pattern where one master agent controls all other sub-agents',
      'A decentralized pattern where any agent can route tasks directly to any other agent based on handoff rules',
      'A pattern where all agents process the exact same prompt simultaneously',
      'A completely random assignment of tasks to available models',
    ],
    correctIndex: 1,
    explanation:
      'The Swarm/Network pattern allows for flexible, decentralized workflows where specialized agents hand off control directly to each other as needed, rather than routing everything through a single rigid orchestrator.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 50%, #A78BFA 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Multi-Agent Systems</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 10</span>
        <h1>Multi-Agent Systems</h1>
        <p>Learn how to orchestrate multiple AI agents working together on complex tasks — delegation, coordination, and composition patterns.</p>
        <span class="lesson-reading-time">⏱️ ~15 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#ma-why">Why Multiple Agents?</a></li>
          <li><a href="#ma-patterns">Orchestration Patterns</a></li>
          <li><a href="#ma-delegation">Task Delegation</a></li>
          <li><a href="#ma-communication">Agent Communication</a></li>
          <li><a href="#ma-pitfalls">Common Pitfalls</a></li>
          <li><a href="#ma-practice">Hands-On Example</a></li>
          <li><a href="#ma-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="ma-why" class="lesson-section reveal-on-scroll">
          <h2>Why Multiple Agents?</h2>
          <p>A single agent can be powerful, but it has limits. As your project grows in complexity, one agent struggles with:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🧠</div>
              <h4>Context Overload</h4>
              <p>One agent juggling frontend, backend, database, and deployment will exceed its context window and lose track of details.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🐌</div>
              <h4>Sequential Bottleneck</h4>
              <p>A single agent processes tasks one at a time. Multiple agents can work on separate concerns in parallel.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h4>Lack of Specialisation</h4>
              <p>An agent with a narrow focus (e.g., "CSS expert") produces better results than a generalist doing everything.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔀</div>
              <h4>Merge Conflicts</h4>
              <p>When one agent edits many files, changes are interleaved. Multiple agents on separate branches keep work isolated.</p>
            </div>
          </div>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Rule of thumb</strong>
              <p>If your project has more than 3 independent concerns (frontend, backend, DevOps, docs), consider splitting across multiple agents.</p>
            </div>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="ma-patterns" class="lesson-section reveal-on-scroll">
          <h2>Orchestration Patterns</h2>
          <p>There are three main ways to organise multi-agent workflows:</p>

          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Fan-Out / Fan-In</h4>
                <p>A lead agent splits a task into independent sub-tasks, distributes them to specialist agents, then merges the results. Best for <strong>embarrassingly parallel</strong> work like "build 5 components."</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Pipeline (Assembly Line)</h4>
                <p>Each agent handles one stage and passes output to the next: <em>Plan → Code → Test → Deploy</em>. Best for <strong>sequential workflows</strong> where each stage depends on the previous.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Supervisor + Workers</h4>
                <p>A supervisor agent monitors progress, reassigns work when agents get stuck, and handles error recovery. Best for <strong>long-running, complex</strong> projects with unpredictable sub-tasks.</p>
              </div>
            </div>
          </div>

          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example: Fan-Out Architecture</span>
              <span class="code-dot blue"></span>
            </div>
            <pre><code>Orchestrator Agent:
  "Build a full-stack dashboard app."
  ├── Agent A (Frontend): "Build the React UI with charts"
  ├── Agent B (API): "Create the Express REST API"
  ├── Agent C (Database): "Design the PostgreSQL schema"
  └── Agent D (DevOps): "Set up Docker + CI/CD"

Each agent works on its own branch.
Orchestrator merges when all finish.</code></pre>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="ma-delegation" class="lesson-section reveal-on-scroll">
          <h2>Task Delegation</h2>
          <p>Effective delegation requires <strong>clear boundaries</strong>. Each agent needs to know:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Scope</h4>
                <p>Which files and directories belong to this agent? "You own <code>src/api/</code> and <code>tests/api/</code>. Do not touch <code>src/ui/</code>."</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Interface Contract</h4>
                <p>What data format should the output follow? "The API must return JSON with <code>{ data, error, meta }</code> structure."</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Completion Criteria</h4>
                <p>How does the agent know it's done? "All endpoints pass the test suite. No TypeScript errors."</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>Context Files</h4>
                <p>Which Skills or docs should this agent read? "Read <code>skills/api-patterns/SKILL.md</code> before starting."</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="ma-communication" class="lesson-section reveal-on-scroll">
          <h2>Agent Communication</h2>
          <p>Agents don't talk to each other directly — they communicate through <strong>shared artefacts</strong>:</p>
          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">📁</div>
              <h4>Filesystem</h4>
              <p>The simplest method. Agent A writes to <code>shared/api-spec.json</code>, Agent B reads it. Works well for small teams.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🌿</div>
              <h4>Git Branches</h4>
              <p>Each agent works on a separate branch. A human (or orchestrator) merges them. Gives full version history and rollback.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">📝</div>
              <h4>Knowledge Items</h4>
              <p>Agents produce KIs (knowledge items) that persist across sessions. Future agents can read and build on past discoveries.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🗃️</div>
              <h4>Database / Queue</h4>
              <p>For production systems, agents can read/write to Firestore or a message queue for robust, async coordination.</p>
            </div>
          </div>
          <div class="callout callout-warning">
            <span class="callout-icon">⚠️</span>
            <div>
              <strong>Avoid file collisions</strong>
              <p>Never let two agents edit the same file simultaneously. Define clear file ownership upfront — this is the #1 cause of broken multi-agent workflows.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="ma-pitfalls" class="lesson-section reveal-on-scroll">
          <h2>Common Pitfalls</h2>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🔄</div>
              <h4>Over-Decomposition</h4>
              <p>Splitting into too many agents creates coordination overhead. If agents constantly need each other's context, they should be merged.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🤷</div>
              <h4>Ambiguous Boundaries</h4>
              <p>"Both agents edited the router." Define ownership at the file/directory level before starting work.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔇</div>
              <h4>No Shared Context</h4>
              <p>Agent B doesn't know what Agent A decided. Use a shared SKILL.md or architecture doc that all agents read first.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💥</div>
              <h4>Merge Hell</h4>
              <p>Three agents finish their features but the code doesn't integrate. Always define interfaces and contracts upfront.</p>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="ma-practice" class="lesson-section reveal-on-scroll">
          <h2>Hands-On Example</h2>
          <p>Here's a practical multi-agent setup for building a SaaS dashboard:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">3-Agent SaaS Dashboard</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code># Agent 1: UI Agent (branch: feat/dashboard-ui)
"Build a responsive dashboard with:
- Sidebar navigation
- Data cards showing KPIs
- Line charts using Chart.js
- Dark/light theme
Files: src/components/, src/styles/, src/pages/dashboard.ts"

# Agent 2: API Agent (branch: feat/dashboard-api)
"Create the Express API with:
- GET /api/metrics (returns KPI data)
- GET /api/timeseries (returns chart data)
- Auth middleware using Firebase tokens
Files: server/routes/, server/middleware/, server/models/"

# Agent 3: Infra Agent (branch: feat/dashboard-infra)
"Set up:
- Dockerfile and docker-compose.yml
- GitHub Actions CI/CD pipeline
- Firebase hosting config
- Environment variable management
Files: .github/, Dockerfile, docker-compose.yml, firebase.json"</code></pre>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>Integration sequence matters</strong>
              <p>Merge API first, then UI (which depends on API types), then Infra last. This order minimises integration conflicts.</p>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="ma-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-multiagent', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/projects" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Real-World Projects</span>
          </a>
          <a href="/learn/evaluation" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next →</span>
            <span class="nav-page">Evaluation & Testing</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-multiagent', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

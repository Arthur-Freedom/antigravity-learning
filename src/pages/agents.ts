// ── Autonomous Agents Lesson Page ───────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'agents';

const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is the primary difference between a chatbot and an autonomous agent?',
    options: [
      'Agents are faster at generating text',
      'Agents use a different language model',
      'Agents can execute commands and modify files on your computer',
      'Agents require an internet connection',
    ],
    correctIndex: 2,
    explanation:
      'Unlike chatbots that only produce text, agents have access to tools that let them run commands, edit files, browse the web, and take real actions.',
  },
  {
    question: 'Which of these is a tool available to an Antigravity agent?',
    options: [
      'send_email',
      'run_command',
      'deploy_to_production',
      'access_admin_panel',
    ],
    correctIndex: 1,
    explanation:
      'run_command lets the agent execute shell commands in your terminal. Other core tools include write_to_file, view_file, grep_search, and browser_subagent.',
  },
  {
    question: 'How can you run multiple agents in parallel?',
    options: [
      'Use the /parallel slash command',
      'Open separate chat instances — each one is an independent agent',
      'Agents automatically parallelize themselves',
      'You need a special enterprise license',
    ],
    correctIndex: 1,
    explanation:
      'Each chat instance is a separate agent. You can open multiple chats and give each one a different task — they work independently at the same time.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #FEF9C3 0%, #FDE68A 50%, #FCD34D 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Autonomous Agents</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 3</span>
        <h1>Autonomous Agents</h1>
        <p>Understand how AI agents execute tasks directly on your machine — and how to orchestrate multiple agents at once.</p>
        <span class="lesson-reading-time">⏱️ ~12 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#ag-vs">Agents vs Chatbots</a></li>
          <li><a href="#ag-tools">Agent Tools</a></li>
          <li><a href="#ag-how">How Agents Work</a></li>
          <li><a href="#ag-parallel">Running in Parallel</a></li>
          <li><a href="#ag-context">Context & Memory</a></li>
          <li><a href="#ag-practice">Best Practices</a></li>
          <li><a href="#ag-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="ag-vs" class="lesson-section reveal-on-scroll">
          <h2>Agents vs Chatbots</h2>
          <p>Most AI systems you've used are <strong>chatbots</strong> — they take text in and produce text out. An <strong>autonomous agent</strong> is fundamentally different:</p>
          <div class="comparison-grid">
            <div class="comparison-card">
              <h4 class="comparison-label label-normal">💬 Chatbot</h4>
              <ul class="lesson-list">
                <li>Generates text responses</li>
                <li>Can't take action on your system</li>
                <li>Forgets context between sessions</li>
                <li>You copy-paste its suggestions manually</li>
              </ul>
            </div>
            <div class="comparison-card">
              <h4 class="comparison-label label-turbo">🤖 Agent</h4>
              <ul class="lesson-list">
                <li>Executes commands in your terminal</li>
                <li>Creates, edits, and deletes files</li>
                <li>Browses the web and captures screenshots</li>
                <li>Runs tests, builds, and deploys your code</li>
              </ul>
            </div>
          </div>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>The key insight</strong>
              <p>An agent doesn't just <em>tell</em> you how to fix a bug — it <em>actually fixes it</em>, runs the tests, and confirms the fix works.</p>
            </div>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="ag-tools" class="lesson-section reveal-on-scroll">
          <h2>Agent Tools</h2>
          <p>An agent's power comes from its <strong>tools</strong>. Each tool is a capability the agent can invoke to interact with your system:</p>
          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">🖥️</div>
              <h4>run_command</h4>
              <p>Execute shell commands in your terminal. Build, test, install packages, run scripts.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">📝</div>
              <h4>write_to_file</h4>
              <p>Create new files or overwrite existing ones. The agent writes code directly into your project.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">👁️</div>
              <h4>view_file</h4>
              <p>Read file contents to understand existing code. Supports line ranges for targeted reading.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🔍</div>
              <h4>grep_search</h4>
              <p>Search across your entire codebase for patterns, function names, or text matches.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🌐</div>
              <h4>browser_subagent</h4>
              <p>Open a browser, navigate pages, click buttons, fill forms — full web automation.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🎨</div>
              <h4>generate_image</h4>
              <p>Create images from text prompts. Useful for generating UI mockups and assets.</p>
            </div>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>Safety first</strong>
              <p>Potentially destructive commands (like deleting files or installing packages) require your explicit approval before running. The agent marks commands as <code>SafeToAutoRun</code> only for read-only operations.</p>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="ag-how" class="lesson-section reveal-on-scroll">
          <h2>How Agents Work</h2>
          <p>When you give the agent a task, it follows a loop of <strong>thinking → acting → observing</strong>:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Understand the task</h4>
                <p>The agent reads your request and determines what needs to be done — which files to examine, what changes to make.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Explore the codebase</h4>
                <p>Uses <code>view_file</code>, <code>grep_search</code>, and <code>list_dir</code> to understand existing code, project structure, and dependencies.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Make changes</h4>
                <p>Writes new files, edits existing code, or runs commands. Each action produces observable output.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>Verify results</h4>
                <p>Checks command output, runs tests, or inspects the browser to confirm everything works.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">5</div>
              <div class="flow-step-content">
                <h4>Report back</h4>
                <p>Explains what was done, shows diffs, and creates artifacts to document the changes.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="ag-parallel" class="lesson-section reveal-on-scroll">
          <h2>Running Agents in Parallel</h2>
          <p>One of the most powerful features is running <strong>multiple agents simultaneously</strong>. Each chat window is an independent agent with its own context.</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example: 3 Agents in Parallel</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Agent 1       │  │   Agent 2       │  │   Agent 3       │
│                 │  │                 │  │                 │
│  "Set up the    │  │  "Add Google    │  │  "Build full    │
│   GitHub Pages  │  │   auth and      │  │   content       │
│   deployment    │  │   Firestore     │  │   pages with    │
│   workflow"     │  │   database"     │  │   lessons"      │
│                 │  │                 │  │                 │
│  → Creates      │  │  → Creates      │  │  → Creates      │
│    deploy.md    │  │    auth.ts      │  │    pages/       │
│    workflow     │  │    db.ts        │  │    router.ts    │
│                 │  │    rules        │  │    styles       │
└─────────────────┘  └─────────────────┘  └─────────────────┘</code></pre>
          </div>
          <p>The key is to give each agent tasks that <strong>don't conflict</strong>. If two agents edit the same file at the same time, you'll get merge conflicts.</p>
          <div class="callout callout-warning">
            <span class="callout-icon">⚠️</span>
            <div>
              <strong>Avoid file conflicts</strong>
              <p>Plan your parallel agents so they work on <em>different</em> files. Agent 1 on deployment, Agent 2 on auth, Agent 3 on content — each touches its own set of files.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="ag-context" class="lesson-section reveal-on-scroll">
          <h2>Context & Memory</h2>
          <p>Agents have several layers of context that shape how they work:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">💬</div>
              <h4>Conversation Context</h4>
              <p>Everything said in the current chat session. This resets when you start a new conversation.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📁</div>
              <h4>Project Context</h4>
              <p>The agent reads your project files, package.json, and directory structure to understand your stack.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧠</div>
              <h4>Skills (Persistent)</h4>
              <p>Skills in <code>skills/</code> persist across all conversations. They're the agent's long-term memory for your project.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h4>Workflows (Persistent)</h4>
              <p>Workflows in <code>.agent/workflows/</code> are always available as slash commands, regardless of the conversation.</p>
            </div>
          </div>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Making agents smarter over time</strong>
              <p>Every skill and workflow you add makes <em>every future agent</em> in that project smarter. It's compound knowledge — the more you invest, the better agents perform.</p>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="ag-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Be specific with your prompts</h4>
                <p>"Add a dark theme toggle to the header that saves the preference to Firestore" is much better than "add dark mode."</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Let agents work autonomously</h4>
                <p>Resist the urge to micromanage. Give a clear goal, then let the agent figure out the implementation details.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Plan parallel work carefully</h4>
                <p>When running multiple agents, assign each one a separate concern. Files should not overlap between agents.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Review before approving</h4>
                <p>Always review file changes and commands before approving them. The agent is powerful — make sure it's doing what you intended.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="ag-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-agents', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/skills" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Skills</span>
          </a>
          <a href="/learn/prompts" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next Module →</span>
            <span class="nav-page">Prompt Engineering</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-agents', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

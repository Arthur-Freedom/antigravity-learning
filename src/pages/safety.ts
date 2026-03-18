// ── Safety & Guardrails Lesson Page ─────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'safety';

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is the SafeToAutoRun flag used for?',
    options: [
      'It makes the agent run faster',
      'It tells the agent that a command is read-only and safe to run without user approval',
      'It enables parallel execution',
      'It disables error checking',
    ],
    correctIndex: 1,
    explanation:
      'SafeToAutoRun signals that a command has no destructive side effects (e.g., reading a file or listing a directory). The agent only sets this for commands it is confident are safe.',
  },
  {
    question: 'What should you do before asking an agent to make large-scale changes?',
    options: [
      'Close all open files',
      'Restart the IDE',
      'Commit your current work to version control',
      'Delete node_modules',
    ],
    correctIndex: 2,
    explanation:
      'Committing to git before big changes creates a safety checkpoint. If anything goes wrong, you can always revert to the committed state with git checkout or git reset.',
  },
  {
    question: 'Why is "principle of least privilege" important for agent tool access?',
    options: [
      'It makes the agent run fewer tools',
      'It limits the agent to only the permissions it needs, reducing the blast radius of mistakes',
      'It speeds up tool execution',
      'It is only relevant for production deployments',
    ],
    correctIndex: 1,
    explanation:
      'Least privilege means the agent should only have access to what it needs. If it only needs to read files and run tests, it shouldn\'t have permissions to deploy to production.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 50%, #F87171 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Safety & Guardrails</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 8</span>
        <h1>Safety &amp; Guardrails</h1>
        <p>Learn how to use AI agents safely — approval flows, permission models, and protecting your codebase.</p>
        <span class="lesson-reading-time">⏱️ ~10 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#sf-why">Why Safety Matters</a></li>
          <li><a href="#sf-approval">The Approval Model</a></li>
          <li><a href="#sf-privilege">Least Privilege</a></li>
          <li><a href="#sf-sandbox">Sandboxing & Isolation</a></li>
          <li><a href="#sf-rollback">Rollback Strategies</a></li>
          <li><a href="#sf-practice">Best Practices</a></li>
          <li><a href="#sf-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="sf-why" class="lesson-section reveal-on-scroll">
          <h2>Why Safety Matters</h2>
          <p>AI agents are <strong>powerful</strong> — they can edit files, run commands, and modify your entire project. With that power comes responsibility. A single misunderstood prompt could lead to deleted files, broken builds, or unintended deployments.</p>
          <div class="callout callout-warning">
            <span class="callout-icon">⚠️</span>
            <div>
              <strong>Real risk, real consequences</strong>
              <p>Unlike a chatbot that only produces text, an agent <em>acts</em>. A wrong <code>rm -rf</code> command or a broken database migration can cause real damage to your project.</p>
            </div>
          </div>
          <p>The good news: agents are designed with multiple safety layers. Understanding these layers helps you work confidently while staying protected.</p>
        </section>

        <!-- Section 2 -->
        <section id="sf-approval" class="lesson-section reveal-on-scroll">
          <h2>The Approval Model</h2>
          <p>Every agent action goes through a <strong>safety classification</strong> before execution:</p>
          <div class="comparison-grid">
            <div class="comparison-card">
              <h4 class="comparison-label label-turbo">✅ Auto-Run (Safe)</h4>
              <ul class="lesson-list">
                <li>Reading file contents</li>
                <li>Searching the codebase</li>
                <li>Listing directories</li>
                <li>Checking command status</li>
              </ul>
              <p><em>These are read-only operations with no side effects.</em></p>
            </div>
            <div class="comparison-card">
              <h4 class="comparison-label label-normal">🔐 Requires Approval</h4>
              <ul class="lesson-list">
                <li>Creating or editing files</li>
                <li>Running shell commands</li>
                <li>Installing packages</li>
                <li>Deleting files or data</li>
              </ul>
              <p><em>These modify state and need your explicit "OK" first.</em></p>
            </div>
          </div>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Trust but verify</strong>
              <p>You can trust the agent's judgment on safe operations. For everything else, read the proposed change before approving. It takes 5 seconds to review but could save hours of debugging.</p>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="sf-privilege" class="lesson-section reveal-on-scroll">
          <h2>Principle of Least Privilege</h2>
          <p>The <strong>principle of least privilege</strong> means giving the agent only the access it needs for the current task — nothing more.</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🔒</div>
              <h4>Scoped Access</h4>
              <p>If the agent only needs to read code and run tests, it shouldn't have deploy permissions. Limit what MCP servers and tools are available.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h4>Task-Specific Permissions</h4>
              <p>Don't give blanket access. "Fix this CSS bug" doesn't need database write access or deploy permissions.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛡️</div>
              <h4>Blast Radius</h4>
              <p>If something goes wrong, limited permissions mean limited damage. A read-only agent can't accidentally delete your database.</p>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="sf-sandbox" class="lesson-section reveal-on-scroll">
          <h2>Sandboxing & Isolation</h2>
          <p>For maximum safety, run agents in <strong>isolated environments</strong> when working on critical systems:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Development branches</h4>
                <p>Always work on a feature branch. The agent's changes stay isolated until you review and merge them.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Staging environments</h4>
                <p>Deploy agent changes to staging first. Test everything before it touches production.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Environment variables</h4>
                <p>Use <code>.env</code> files for secrets. Never hardcode credentials where the agent could accidentally expose them.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>CI/CD checks</h4>
                <p>Set up automated tests and linting in your CI pipeline. Even if the agent introduces a bug, CI catches it before merge.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="sf-rollback" class="lesson-section reveal-on-scroll">
          <h2>Rollback Strategies</h2>
          <p>Things can go wrong even with careful agents. Always have a rollback plan:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Git Safety Net</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code># Before agent starts working:
git add -A && git commit -m "checkpoint: before agent changes"

# If something goes wrong:
git diff                    # See what changed
git checkout -- .           # Undo all changes
git reset --hard HEAD       # Nuclear option: reset everything

# Or keep some changes and discard others:
git checkout -- src/bad-file.ts   # Revert one file</code></pre>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>Pro tip: use stash</strong>
              <p><code>git stash</code> lets you temporarily save the agent's changes, test without them, and then <code>git stash pop</code> to restore them if they were fine after all.</p>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="sf-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Commit before, commit after</h4>
                <p>Make a git commit before asking the agent for big changes, and commit after verifying the results. Clean checkpoints make rollbacks painless.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Read diffs carefully</h4>
                <p>When the agent proposes file changes, read the diff. Code review is just as important for AI-generated code as for human-written code.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Don't share secrets in prompts</h4>
                <p>Use environment variables and .env files for API keys and passwords. Never paste credentials directly into the chat.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Test in isolation first</h4>
                <p>For risky operations (deployments, migrations, data changes), test in a safe environment before trusting the agent with production.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="sf-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-safety', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/tools" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Tool Use</span>
          </a>
          <a href="/learn/projects" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next Module →</span>
            <span class="nav-page">Real-World Projects</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-safety', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

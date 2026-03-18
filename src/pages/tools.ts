// ── Tool Use & Function Calling Lesson Page ─────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'tools';

export const SECTION_IDS = ['tl-what', 'tl-anatomy', 'tl-types', 'tl-parallel', 'tl-errors', 'tl-practice', 'tl-quiz'] as const;

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'What happens when an agent calls a tool marked as unsafe?',
    options: [
      'The tool runs immediately without any checks',
      'The agent asks the user for explicit approval before running it',
      'The tool is automatically blocked',
      'The agent skips it and moves on',
    ],
    correctIndex: 1,
    explanation:
      'Unsafe tools (those that can modify state, delete files, etc.) always require explicit user approval before execution. Only tools marked SafeToAutoRun can run without approval.',
  },
  {
    question: 'What is "function calling" in the context of AI?',
    options: [
      'Writing JavaScript functions in your code',
      'The model generating structured JSON to invoke an external tool',
      'Importing modules from npm',
      'Calling an API from the browser',
    ],
    correctIndex: 1,
    explanation:
      'Function calling is when the AI model outputs structured data (typically JSON) that specifies which tool to invoke and what arguments to pass, rather than generating plain text.',
  },
  {
    question: 'Why can an agent call multiple tools in parallel?',
    options: [
      'It has multiple CPU cores',
      'When tool calls are independent (no dependencies between them), parallel execution is faster',
      'Parallel execution is the default for all tools',
      'It can only call tools sequentially',
    ],
    correctIndex: 1,
    explanation:
      'When tool calls have no dependencies on each other (e.g., reading two unrelated files), the agent can invoke them simultaneously to save time.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #F59E0B 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Tool Use & Function Calling</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 7</span>
        <h1>Tool Use &amp; Function Calling</h1>
        <p>Understand how AI agents interact with the real world through structured tool invocations and function calling.</p>
        <span class="lesson-reading-time">⏱️ ~12 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#tl-what">What Is Function Calling?</a></li>
          <li><a href="#tl-anatomy">Anatomy of a Tool Call</a></li>
          <li><a href="#tl-types">Types of Tools</a></li>
          <li><a href="#tl-parallel">Parallel Tool Calls</a></li>
          <li><a href="#tl-errors">Handling Errors</a></li>
          <li><a href="#tl-practice">Best Practices</a></li>
          <li><a href="#tl-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="tl-what" class="lesson-section reveal-on-scroll">
          <h2>What Is Function Calling?</h2>
          <p>Function calling is the mechanism that transforms an AI from a text generator into an <strong>actionable agent</strong>. Instead of outputting plain text, the model generates structured JSON that specifies which tool to invoke and what arguments to pass.</p>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Real-world analogy</strong>
              <p>Think of function calling like a customer at a restaurant. Instead of going into the kitchen themselves, they tell the waiter (the tool) exactly what they want. The waiter handles the execution and brings back the result.</p>
            </div>
          </div>
          <p>This is what makes agents fundamentally different from chatbots — they can <strong>take action</strong> on your behalf by calling tools that interact with files, terminals, browsers, and APIs.</p>
        </section>

        <!-- Section 2 -->
        <section id="tl-anatomy" class="lesson-section reveal-on-scroll">
          <h2>Anatomy of a Tool Call</h2>
          <p>Every tool call has three parts: the <strong>tool name</strong>, the <strong>arguments</strong>, and the <strong>result</strong>:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Tool Call Flow</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>Agent decides → "I need to read a file"

Tool Call:
  name: "view_file"
  args: {
    "AbsolutePath": "/src/main.ts",
    "StartLine": 1,
    "EndLine": 50
  }

Tool Result:
  → Returns the first 50 lines of main.ts

Agent processes → "Now I understand the code structure"</code></pre>
          </div>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">📛</div>
              <h4>Tool Name</h4>
              <p>Identifies which tool to call — <code>view_file</code>, <code>run_command</code>, <code>grep_search</code>, etc.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📋</div>
              <h4>Arguments</h4>
              <p>Structured JSON parameters including file paths, search queries, command strings, or any required input.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📬</div>
              <h4>Result</h4>
              <p>The tool's output is returned to the agent as context. The agent then decides what to do next based on this result.</p>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="tl-types" class="lesson-section reveal-on-scroll">
          <h2>Types of Tools</h2>
          <p>Agent tools fall into several categories based on what they do:</p>
          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">📖</div>
              <h4>Read Tools</h4>
              <p><code>view_file</code>, <code>grep_search</code>, <code>list_dir</code> — observe the codebase without changing it. Always safe to auto-run.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">✏️</div>
              <h4>Write Tools</h4>
              <p><code>write_to_file</code>, <code>replace_file_content</code> — create or modify files. Require review before applying.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🖥️</div>
              <h4>Execute Tools</h4>
              <p><code>run_command</code>, <code>send_command_input</code> — run shell commands. May be auto-run if safe or require approval.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🌐</div>
              <h4>Browser Tools</h4>
              <p><code>browser_subagent</code>, <code>read_url_content</code> — navigate web pages, scrape content, or automate browser interactions.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🔌</div>
              <h4>MCP Tools</h4>
              <p>Tools from MCP servers — access external services like Firebase, GitHub, or custom APIs.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🎨</div>
              <h4>Generation Tools</h4>
              <p><code>generate_image</code>, <code>search_web</code> — create assets or fetch external information.</p>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="tl-parallel" class="lesson-section reveal-on-scroll">
          <h2>Parallel Tool Calls</h2>
          <p>One of the most powerful optimizations is <strong>parallel tool execution</strong>. When multiple tool calls are independent, the agent fires them simultaneously:</p>
          <div class="comparison-grid">
            <div class="comparison-card">
              <h4 class="comparison-label label-normal">🐢 Sequential (slow)</h4>
              <div class="code-block">
                <pre><code>1. view_file("auth.ts")     → wait
2. view_file("router.ts")   → wait
3. view_file("main.ts")     → wait
Total: ~3 seconds</code></pre>
              </div>
            </div>
            <div class="comparison-card">
              <h4 class="comparison-label label-turbo">⚡ Parallel (fast)</h4>
              <div class="code-block">
                <pre><code>1. view_file("auth.ts")     ╮
2. view_file("router.ts")   ├→ all at once
3. view_file("main.ts")     ╯
Total: ~1 second</code></pre>
              </div>
            </div>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>When to use sequential</strong>
              <p>If tool B depends on the result of tool A (e.g., you need to read a file to know which command to run), the agent must wait. Use <code>waitForPreviousTools: true</code> to enforce this.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="tl-errors" class="lesson-section reveal-on-scroll">
          <h2>Handling Errors</h2>
          <p>Tools can fail — and a good agent handles failures gracefully:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Tool returns an error</h4>
                <p>The file doesn't exist, the command fails, or the API returns an error.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Agent reads the error</h4>
                <p>The error message becomes part of the agent's context. It analyzes what went wrong.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Agent adapts</h4>
                <p>It might try a different file path, fix the command, or ask you for clarification.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>Retry or report</h4>
                <p>The agent either retries with a corrected approach or explains the issue and asks for guidance.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="tl-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Review before approving destructive actions</h4>
                <p>Always check what a command does before approving it. <code>rm -rf</code> and <code>drop table</code> can't be undone.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Let the agent explore first</h4>
                <p>Don't force the agent to edit files blindly. Let it read and search first — informed changes are better changes.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Use version control as a safety net</h4>
                <p>Commit your work before asking the agent to make big changes. If something goes wrong, you can always <code>git checkout</code>.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Trust the tool selection</h4>
                <p>The agent picks the right tool for the job. You don't need to tell it to use <code>grep_search</code> — just say "find where X is used" and it'll figure it out.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="tl-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-tools', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/context" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Context Management</span>
          </a>
          <a href="/learn/safety" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next Module →</span>
            <span class="nav-page">Safety & Guardrails</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-tools', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

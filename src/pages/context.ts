// ── Context Management Lesson Page ──────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'context';

const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is a "context window" in the context of AI agents?',
    options: [
      'A GUI window that shows the agent\'s activity',
      'The maximum amount of text (tokens) the model can process at once',
      'A pop-up that asks for user confirmation',
      'A browser window opened by the agent',
    ],
    correctIndex: 1,
    explanation:
      'The context window is the maximum number of tokens (words/characters) the AI model can hold in memory during a single conversation. Everything — your prompt, conversation history, and the response — must fit within this limit.',
  },
  {
    question: 'What is the most effective way to share a large codebase with an agent?',
    options: [
      'Paste all your files into the chat at once',
      'Let the agent use tools (view_file, grep_search) to explore only what it needs',
      'Compress all code into a zip file and upload it',
      'Summarize the entire codebase in one paragraph',
    ],
    correctIndex: 1,
    explanation:
      'Letting the agent use file tools is far more efficient. It reads only the relevant files on demand, keeping the context window focused and avoiding wasted tokens on irrelevant code.',
  },
  {
    question: 'Why should you start a new conversation for unrelated tasks?',
    options: [
      'To save money on API costs',
      'Because agents can\'t handle multiple tasks',
      'To keep the context focused and avoid confusion from irrelevant history',
      'New conversations run faster',
    ],
    correctIndex: 2,
    explanation:
      'Starting fresh prevents old, unrelated context from confusing the agent. A focused conversation with relevant context produces much better results than a long thread mixing multiple topics.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 50%, #A5B4FC 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Context Management</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 6</span>
        <h1>Context Management</h1>
        <p>Learn how to manage context windows, tokens, and memory to get the most out of your AI agent conversations.</p>
        <span class="lesson-reading-time">⏱️ ~10 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#ctx-what">What Is Context?</a></li>
          <li><a href="#ctx-tokens">Tokens & Limits</a></li>
          <li><a href="#ctx-strategies">Context Strategies</a></li>
          <li><a href="#ctx-files">File References vs Inline</a></li>
          <li><a href="#ctx-conversation">Conversation Design</a></li>
          <li><a href="#ctx-practice">Best Practices</a></li>
          <li><a href="#ctx-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="ctx-what" class="lesson-section reveal-on-scroll">
          <h2>What Is Context?</h2>
          <p>In AI, <strong>context</strong> is everything the model can "see" when generating a response. This includes your current message, the entire conversation history, system instructions, and any files or data the agent has accessed.</p>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Real-world analogy</strong>
              <p>Context is like a whiteboard in a meeting room. You can write instructions, diagrams, and notes — but it has a fixed size. When it's full, you need to erase old content to make room for new information.</p>
            </div>
          </div>
          <p>Understanding context is crucial because it directly affects the quality of the agent's responses. Too little context and the agent guesses. Too much irrelevant context and it gets confused.</p>
        </section>

        <!-- Section 2 -->
        <section id="ctx-tokens" class="lesson-section reveal-on-scroll">
          <h2>Tokens & Limits</h2>
          <p>AI models process text as <strong>tokens</strong> — small chunks of text (roughly ¾ of a word). Every model has a maximum context window measured in tokens:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h4>Token Basics</h4>
              <p>"Hello world" ≈ 2 tokens. A line of code ≈ 10–20 tokens. A full file ≈ hundreds to thousands of tokens.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📏</div>
              <h4>Window Sizes</h4>
              <p>Modern models support 128K–1M+ tokens. That's roughly 100,000–750,000 words in a single conversation.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⚖️</div>
              <h4>Input vs Output</h4>
              <p>The context window includes <em>both</em> your input and the model's output. A 128K window doesn't mean 128K of input — the response eats into it too.</p>
            </div>
          </div>
          <div class="callout callout-warning">
            <span class="callout-icon">⚠️</span>
            <div>
              <strong>Bigger isn't always better</strong>
              <p>Even with large context windows, models perform best when the context is <strong>focused and relevant</strong>. Dumping 50 files into a conversation makes it harder for the agent to find what matters.</p>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="ctx-strategies" class="lesson-section reveal-on-scroll">
          <h2>Context Strategies</h2>
          <p>Smart context management means giving the agent the <strong>right information at the right time</strong>. Here are proven strategies:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Start with the goal</h4>
                <p>Begin every conversation with a clear description of what you want to achieve. This frames everything that follows.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Provide relevant context only</h4>
                <p>Share only the files, error messages, and requirements that are directly relevant to the current task.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Let the agent explore</h4>
                <p>Instead of pasting code, let the agent use <code>view_file</code> and <code>grep_search</code> to find what it needs.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>Use skills for persistent context</h4>
                <p>Put conventions, patterns, and rules in Skills files. They automatically load without using conversation context.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="ctx-files" class="lesson-section reveal-on-scroll">
          <h2>File References vs Inline Content</h2>
          <p>There are two ways to share code with an agent: <strong>pasting it inline</strong> or <strong>letting the agent read files</strong>. The right choice depends on the situation:</p>
          <div class="comparison-grid">
            <div class="comparison-card">
              <h4 class="comparison-label label-normal">📋 Inline Pasting</h4>
              <ul class="lesson-list">
                <li>Good for short snippets (< 50 lines)</li>
                <li>Useful when highlighting specific code</li>
                <li>Uses tokens from the conversation context</li>
                <li>Agent sees it immediately</li>
              </ul>
            </div>
            <div class="comparison-card">
              <h4 class="comparison-label label-turbo">📁 File Tools</h4>
              <ul class="lesson-list">
                <li>Best for entire files or large codebases</li>
                <li>Agent reads only what's needed</li>
                <li>More efficient use of context window</li>
                <li>Agent can re-read files if needed</li>
              </ul>
            </div>
          </div>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Pro tip</strong>
              <p>For most tasks, just point the agent to the file path: "Look at src/services/userService.ts and fix the null check on line 42." The agent will read only what it needs.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="ctx-conversation" class="lesson-section reveal-on-scroll">
          <h2>Conversation Design</h2>
          <p>How you structure your conversations has a huge impact on agent performance:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h4>One Topic per Chat</h4>
              <p>Start a new conversation for each distinct task. Mixing topics dilutes the context and confuses the agent.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📈</div>
              <h4>Build Incrementally</h4>
              <p>Start simple and add complexity. "Create a login page" → "Now add form validation" → "Add error handling."</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔄</div>
              <h4>Summarize Long Threads</h4>
              <p>If a conversation gets very long, ask the agent to summarize what's been done, then continue from the summary.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧹</div>
              <h4>Fresh Start When Stuck</h4>
              <p>If the agent seems confused, start a new conversation with a clearer prompt. Sometimes a fresh context solves everything.</p>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="ctx-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Front-load important context</h4>
                <p>Put the most important information at the beginning of your message. Models pay more attention to the start and end of the context.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Use Skills as external memory</h4>
                <p>Move project conventions, API patterns, and coding rules into Skills. This frees up your conversation context for the actual task.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Don't repeat yourself</h4>
                <p>The agent remembers everything in the current conversation. If you already explained something, you don't need to repeat it.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Use parallel agents for parallel work</h4>
                <p>Instead of loading one agent with 10 tasks, run 3 agents in parallel with focused context. Each agent performs better with less to manage.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="ctx-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-context', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/mcp" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">MCP</span>
          </a>
          <a href="/learn/tools" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next Module →</span>
            <span class="nav-page">Tool Use</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-context', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

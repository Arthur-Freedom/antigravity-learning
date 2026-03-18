// ── Prompt Engineering Lesson Page ──────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'prompts';

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is "few-shot prompting"?',
    options: [
      'Asking the AI to respond in fewer words',
      'Providing examples of the desired input/output before your actual request',
      'Running the prompt multiple times and picking the best answer',
      'Limiting the AI to a small number of tool calls',
    ],
    correctIndex: 1,
    explanation:
      'Few-shot prompting means including a few input/output examples in your prompt so the AI learns the pattern and applies it to your request.',
  },
  {
    question: 'Which prompting technique asks the AI to "think step by step"?',
    options: [
      'Zero-shot prompting',
      'Few-shot prompting',
      'Chain-of-thought prompting',
      'System prompting',
    ],
    correctIndex: 2,
    explanation:
      'Chain-of-thought (CoT) prompting explicitly asks the model to reason through intermediate steps before producing a final answer.',
  },
  {
    question: 'Why is providing context about your project important when prompting an agent?',
    options: [
      'It makes the response longer',
      'It helps the agent make decisions that fit your specific codebase and conventions',
      'It is required by the API',
      'It reduces the number of tokens used',
    ],
    correctIndex: 1,
    explanation:
      'Context lets the agent tailor its output to your tech stack, coding style, and project requirements — producing more accurate and useful results.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 50%, #86EFAC 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Prompt Engineering</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 4</span>
        <h1>Prompt Engineering</h1>
        <p>Master the art of writing clear, effective prompts that get the best results from AI agents.</p>
        <span class="lesson-reading-time">⏱️ ~10 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#pe-what">What Is Prompt Engineering?</a></li>
          <li><a href="#pe-structure">Anatomy of a Good Prompt</a></li>
          <li><a href="#pe-fewshot">Few-Shot Prompting</a></li>
          <li><a href="#pe-cot">Chain-of-Thought</a></li>
          <li><a href="#pe-pitfalls">Common Pitfalls</a></li>
          <li><a href="#pe-practice">Best Practices</a></li>
          <li><a href="#pe-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="pe-what" class="lesson-section reveal-on-scroll">
          <h2>What Is Prompt Engineering?</h2>
          <p>Prompt engineering is the practice of <strong>crafting instructions</strong> for an AI model to get the most useful, accurate, and relevant response. It's the difference between getting a generic answer and a perfectly tailored solution.</p>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Real-world analogy</strong>
              <p>Think of prompting like giving directions to a taxi driver. "Take me somewhere nice" gets unpredictable results. "Take me to the Italian restaurant on 5th Street" gets you exactly where you want to go.</p>
            </div>
          </div>
          <p>When working with AI agents, your prompts become even more important because the agent will <strong>take real actions</strong> based on what you say — editing files, running commands, and modifying your project.</p>
        </section>

        <!-- Section 2 -->
        <section id="pe-structure" class="lesson-section reveal-on-scroll">
          <h2>Anatomy of a Good Prompt</h2>
          <p>Great prompts share a common structure. They include <strong>context</strong>, a <strong>clear task</strong>, and <strong>constraints</strong>:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example: Well-Structured Prompt</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>Context:  "I have a Vite + TypeScript project with Firebase auth."
Task:     "Add a dark mode toggle to the navbar."
Details:  "Save the preference to localStorage. Use CSS custom
           properties for theming. Match the existing design system."</code></pre>
          </div>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h4>Be Specific</h4>
              <p>Instead of "make it better," say exactly what you want changed and how it should work.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📐</div>
              <h4>Set Constraints</h4>
              <p>Tell the agent what libraries to use (or avoid), what patterns to follow, and what files to modify.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🗂️</div>
              <h4>Provide Context</h4>
              <p>Mention your tech stack, project structure, and any relevant conventions. The more the agent knows, the better it performs.</p>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="pe-fewshot" class="lesson-section reveal-on-scroll">
          <h2>Few-Shot Prompting</h2>
          <p>Few-shot prompting means giving the AI <strong>examples of what you want</strong> before asking your actual question. This helps the model learn the pattern and apply it correctly.</p>
          <div class="comparison-grid">
            <div class="comparison-card">
              <h4 class="comparison-label label-normal">❌ Zero-shot (no examples)</h4>
              <div class="code-block">
                <pre><code>"Write a utility function for formatting dates."</code></pre>
              </div>
            </div>
            <div class="comparison-card">
              <h4 class="comparison-label label-turbo">✅ Few-shot (with examples)</h4>
              <div class="code-block">
                <pre><code>"Write a utility function for formatting dates.
Here's how my existing utils look:

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

Follow the same pattern — named export,
TypeScript, Intl API, single responsibility."</code></pre>
              </div>
            </div>
          </div>
          <p>The few-shot version gives the agent a concrete example of your coding style, conventions, and patterns. The result will be much more consistent with your codebase.</p>
        </section>

        <!-- Section 4 -->
        <section id="pe-cot" class="lesson-section reveal-on-scroll">
          <h2>Chain-of-Thought Prompting</h2>
          <p>Chain-of-thought (CoT) prompting asks the AI to <strong>reason step by step</strong> before reaching a conclusion. This dramatically improves accuracy for complex tasks.</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">CoT Example</span>
              <span class="code-dot blue"></span>
            </div>
            <pre><code>"I'm getting a 'Cannot read property of undefined' error 
on line 42 of userService.ts. 

Think step by step:
1. What could cause this error?
2. What are the possible undefined values?
3. How should we fix it with proper null checks?"</code></pre>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>When to use CoT</strong>
              <p>Chain-of-thought works best for <strong>debugging</strong>, <strong>architectural decisions</strong>, and <strong>complex refactors</strong>. For simple tasks like "rename this variable," it's overkill.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="pe-pitfalls" class="lesson-section reveal-on-scroll">
          <h2>Common Pitfalls</h2>
          <p>Even experienced developers make these prompting mistakes. Here's what to avoid:</p>
          <div class="comparison-grid">
            <div class="comparison-card">
              <h4 class="comparison-label label-normal">❌ Don't</h4>
              <ul class="lesson-list">
                <li><strong>Be vague:</strong> "Fix the bug" — which bug? Where?</li>
                <li><strong>Overload:</strong> "Add auth, dark mode, payments, and tests" in one prompt</li>
                <li><strong>Skip context:</strong> Assuming the agent remembers previous conversations</li>
                <li><strong>Micromanage:</strong> Dictating every line of code instead of the goal</li>
              </ul>
            </div>
            <div class="comparison-card">
              <h4 class="comparison-label label-turbo">✅ Do</h4>
              <ul class="lesson-list">
                <li><strong>Be precise:</strong> "Fix the null check on line 42 of userService.ts"</li>
                <li><strong>One task at a time:</strong> Break big work into focused requests</li>
                <li><strong>Give context:</strong> Mention your stack, constraints, and goals</li>
                <li><strong>State the goal:</strong> Describe <em>what</em> you want, let the agent decide <em>how</em></li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="pe-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Start broad, then refine</h4>
                <p>Begin with your high-level goal, then add details in follow-up messages. "Add a login page" → "Use Google OAuth, store sessions in Firestore."</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Use skills and workflows as context</h4>
                <p>Create Skills files for your coding conventions. The agent reads them automatically — you don't need to repeat yourself every time.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Iterate, don't restart</h4>
                <p>If the first result isn't perfect, refine your prompt in the same conversation. The agent uses the full conversation as context.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Specify the output format</h4>
                <p>If you need JSON, a table, or a specific file structure, say so explicitly. "Return the results as a markdown table" removes ambiguity.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="pe-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-prompts', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/agents" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Autonomous Agents</span>
          </a>
          <a href="/learn/mcp" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next Module →</span>
            <span class="nav-page">MCP</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-prompts', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

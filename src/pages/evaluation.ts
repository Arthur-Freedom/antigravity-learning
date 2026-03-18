// ── Evaluation & Testing Lesson Page ────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'evaluation';

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is "LLM-as-a-Judge" evaluation?',
    options: [
      'Using a language model to generate test data',
      'Using a second language model to score or rank the output of the first model',
      'Having a judge decide if an LLM is legal',
      'A benchmark leaderboard for LLMs',
    ],
    correctIndex: 1,
    explanation:
      'LLM-as-a-Judge uses a separate (often stronger) model to evaluate the quality, accuracy, or safety of another model\'s responses, enabling automated evaluation at scale.',
  },
  {
    question: 'Why should you test agent outputs with diverse inputs rather than a single "golden" test?',
    options: [
      'To fill up the test suite to meet a line count target',
      'A single test can pass while hiding edge-case failures; diverse inputs reveal robustness',
      'Diverse tests are just for documentation',
      'It makes no difference — one good test is enough',
    ],
    correctIndex: 1,
    explanation:
      'Agent behaviour is non-deterministic. Testing with varied prompts, edge cases, and adversarial inputs surfaces failure modes that a single happy-path test would miss.',
  },
  {
    question: 'What is the purpose of a regression test suite for AI agent outputs?',
    options: [
      'To ensure the agent runs faster over time',
      'To detect when a code or model change breaks previously-working behaviour',
      'To measure how many lines of code the agent writes',
      'To train the model on test data',
    ],
    correctIndex: 1,
    explanation:
      'Regression tests capture known-good outputs. When you update a prompt, model, or tool, re-running the suite quickly reveals if something that used to work is now broken.',
  },
  {
    question: 'Why is absolute scoring (e.g., "Score this answer 1 out of 10") generally less reliable than pairwise comparison when using an LLM-as-a-Judge?',
    options: [
      'LLM judges suffer from calibration issues and variance, making relative comparison much more consistent',
      'Language models cannot output numbers',
      'Absolute scoring takes too many tokens to compute',
      'Human reviewers prefer reading text rather than numbers',
    ],
    correctIndex: 0,
    explanation:
      'LLM judges often struggle to consistently apply an absolute 1-10 scale (calibration), but they are highly reliable when asked to determine "which of these two answers is better" (pairwise comparison).',
  },
  {
    question: 'What is a "Golden Dataset" in the context of agent evaluation?',
    options: [
      'A dataset that costs a lot of money to acquire',
      'A curated set of input prompts mapped to human-verified, perfect responses used as the baseline standard',
      'A dataset used exclusively to train the agent to write code in Go',
      'A user interface theme for the evaluation dashboard',
    ],
    correctIndex: 1,
    explanation:
      'A Golden Dataset is the ground-truth standard: a set of curated inputs paired with known-correct outputs to rigorously measure regression and improvement.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 50%, #34D399 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Evaluation & Testing</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 11</span>
        <h1>Evaluation & Testing</h1>
        <p>Learn how to measure, benchmark, and continuously test AI agent outputs — from simple assertions to automated evaluation pipelines.</p>
        <span class="lesson-reading-time">⏱️ ~14 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#ev-why">Why Evaluate?</a></li>
          <li><a href="#ev-metrics">Key Metrics</a></li>
          <li><a href="#ev-methods">Evaluation Methods</a></li>
          <li><a href="#ev-testing">Testing Agent Workflows</a></li>
          <li><a href="#ev-regression">Regression Testing</a></li>
          <li><a href="#ev-continuous">Continuous Evaluation</a></li>
          <li><a href="#ev-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="ev-why" class="lesson-section reveal-on-scroll">
          <h2>Why Evaluate?</h2>
          <p>AI agents are <strong>non-deterministic</strong> — the same prompt can produce different outputs each time. Without evaluation, you're flying blind:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🎲</div>
              <h4>Non-Determinism</h4>
              <p>Temperature, model updates, and context shifts mean outputs vary. Evaluation catches quality drift before users do.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📉</div>
              <h4>Silent Regressions</h4>
              <p>A model update or prompt change can subtly break previously-working flows. Without tests, you won't notice until it's in production.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h4>Data-Driven Decisions</h4>
              <p>Concrete metrics let you compare prompts, models, and architectures objectively — not by gut feeling.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛡️</div>
              <h4>Safety Validation</h4>
              <p>Evaluation catches harmful, biased, or off-topic outputs before they reach end users.</p>
            </div>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="ev-metrics" class="lesson-section reveal-on-scroll">
          <h2>Key Metrics</h2>
          <p>What you measure depends on your use case. Here are the most important metrics for agent evaluation:</p>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Task Completion Rate</h4>
                <p>Did the agent actually accomplish the task? This is the most fundamental binary metric — success or failure.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Accuracy / Correctness</h4>
                <p>For code generation: does it compile, pass tests, and produce the right output? For Q&A: is the answer factually correct?</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Latency & Cost</h4>
                <p>How long does it take? How many tokens were consumed? A brilliant answer that takes 5 minutes and costs $2 may not be viable at scale.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Safety & Guardrail Adherence</h4>
                <p>Did the agent refuse unsafe requests? Did it stay within its defined boundaries? Measure violation rate across adversarial test sets.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="ev-methods" class="lesson-section reveal-on-scroll">
          <h2>Evaluation Methods</h2>
          <p>There are three tiers of evaluation, each with different cost/quality trade-offs:</p>
          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">⚡</div>
              <h4>Automated Assertions</h4>
              <p>Unit-test-style checks: "output contains X", "JSON schema matches", "code compiles". Fast, cheap, and deterministic — but shallow.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🤖</div>
              <h4>LLM-as-a-Judge</h4>
              <p>Use a stronger model (e.g., Gemini 2.5 Pro) to score the output of a smaller model on criteria like helpfulness, accuracy, and tone. Scalable and nuanced.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">👤</div>
              <h4>Human Review</h4>
              <p>Domain experts manually rate outputs. The gold standard for quality — but slow, expensive, and doesn't scale. Best used to calibrate automated methods.</p>
            </div>
          </div>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example: LLM-as-a-Judge Prompt</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>You are evaluating an AI coding assistant.
Given the USER REQUEST and the AGENT RESPONSE below,
score the response on a scale of 1-5 for each criterion:

1. Correctness: Does the code work as requested?
2. Completeness: Are all requirements addressed?
3. Code Quality: Is it clean, idiomatic, well-structured?
4. Safety: Are there any security concerns?

USER REQUEST: {request}
AGENT RESPONSE: {response}

Return a JSON object with scores and brief justifications.</code></pre>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="ev-testing" class="lesson-section reveal-on-scroll">
          <h2>Testing Agent Workflows</h2>
          <p>Agent testing requires thinking differently from traditional software testing:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Define expected outcomes, not exact outputs</h4>
                <p>"The function should return an array of strings" — not "the function should return ['foo', 'bar']". Agents are creative; test outcomes, not exact wording.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Use diverse test prompts</h4>
                <p>Test with edge cases, adversarial inputs, multilingual prompts, and ambiguous requests. A suite of 20+ diverse prompts beats 3 golden-path tests.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Snapshot and compare</h4>
                <p>Save "known-good" outputs as snapshots. When the agent produces new output, diff it against the snapshot to catch regressions.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>Test the toolchain, not just the LLM</h4>
                <p>Integration tests should verify that tools are called correctly, files are created where expected, and databases are updated properly.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="ev-regression" class="lesson-section reveal-on-scroll">
          <h2>Regression Testing</h2>
          <p>Every time you change a prompt, switch models, or update tools, run your regression suite:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Regression Test Workflow</span>
              <span class="code-dot blue"></span>
            </div>
            <pre><code>1. Collect 20–50 representative prompts with expected outcomes
2. Run all prompts through the agent
3. Score each output (automated assertions + LLM judge)
4. Compare scores against the previous baseline
5. Flag any output where the score dropped by > 1 point
6. Review flagged items manually before deploying

Example pass criteria:
  - Overall average score ≥ 4.0 / 5.0
  - Zero critical safety violations
  - Task completion rate ≥ 90%
  - No individual score drops > 2 points from baseline</code></pre>
          </div>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Automate it</strong>
              <p>Run regression tests in CI/CD. A GitHub Action that runs on every prompt or model change catches regressions before they reach production.</p>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="ev-continuous" class="lesson-section reveal-on-scroll">
          <h2>Continuous Evaluation</h2>
          <p>Evaluation isn't a one-time event — it's an ongoing process:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">📈</div>
              <h4>Production Monitoring</h4>
              <p>Log all agent inputs, outputs, and tool calls. Sample and evaluate a percentage of production interactions daily.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔔</div>
              <h4>Alerts on Drift</h4>
              <p>Set up alerts when accuracy drops below a threshold or when error rates spike — just like traditional service monitoring.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧪</div>
              <h4>A/B Testing Prompts</h4>
              <p>Run two prompt variants simultaneously. Route 50% of traffic to each. Compare metrics after 1,000 samples. Ship the winner.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📋</div>
              <h4>User Feedback Loop</h4>
              <p>Add thumbs-up/down buttons to agent responses. Aggregate feedback data to identify which prompts need improvement.</p>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="ev-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-evaluation', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/multiagent" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Multi-Agent Systems</span>
          </a>
          <a href="/learn/production" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next →</span>
            <span class="nav-page">Production & Scaling</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-evaluation', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

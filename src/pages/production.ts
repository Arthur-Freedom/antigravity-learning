// ── Production & Scaling Lesson Page ────────────────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'production';

const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is the most critical step before deploying an agent-built application to production?',
    options: [
      'Adding more features',
      'Running a comprehensive test suite and verifying all endpoints and edge cases',
      'Choosing a cooler domain name',
      'Removing all comments from the code',
    ],
    correctIndex: 1,
    explanation:
      'Before production deployment, you must verify correctness through tests, smoke tests, and edge-case validation. Features and cosmetic changes come after stability.',
  },
  {
    question: 'Why is a dev/staging/prod environment split important when using AI agents?',
    options: [
      'It makes the project look more professional',
      'Agents can make mistakes; isolated environments prevent buggy code from affecting real users',
      'It is only needed for large companies',
      'AI agents cannot work in production environments',
    ],
    correctIndex: 1,
    explanation:
      'AI agents are powerful but imperfect. A dev → staging → prod pipeline gives you multiple checkpoints to catch issues before they reach real users and real data.',
  },
  {
    question: 'What should you monitor after deploying an AI agent application?',
    options: [
      'Only the CPU usage',
      'Error logs, response times, cost per request, and user feedback',
      'Nothing — once deployed it should just work',
      'Only the number of users',
    ],
    correctIndex: 1,
    explanation:
      'Production monitoring should cover error rates, latency, costs (token usage), and user satisfaction. AI applications can degrade in ways that traditional monitoring misses.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #FEF3C7 0%, #FCD34D 50%, #F59E0B 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">Production & Scaling</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 12</span>
        <h1>Production & Scaling</h1>
        <p>Ship AI agent applications with confidence — deployment pipelines, monitoring, cost management, and scaling strategies for real-world traffic.</p>
        <span class="lesson-reading-time">⏱️ ~15 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#pd-environments">Environment Strategy</a></li>
          <li><a href="#pd-cicd">CI/CD Pipelines</a></li>
          <li><a href="#pd-monitoring">Monitoring & Observability</a></li>
          <li><a href="#pd-cost">Cost Management</a></li>
          <li><a href="#pd-scaling">Scaling Strategies</a></li>
          <li><a href="#pd-checklist">Launch Checklist</a></li>
          <li><a href="#pd-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="pd-environments" class="lesson-section reveal-on-scroll">
          <h2>Environment Strategy</h2>
          <p>Every production application needs <strong>environment isolation</strong>. This is especially critical when agents build your code:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Development (dev)</h4>
                <p>Where agents write and test code. Uses its own Firebase project, database, and API keys. Safe to break — nothing real is at stake.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>Staging (optional)</h4>
                <p>A production-like environment for final QA. Uses anonymised production data. Run your regression suite here before deploying.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>Production (prod)</h4>
                <p>The real deal. Deploy only code that's been verified in dev and (optionally) staging. Never let agents deploy directly to prod without human review.</p>
              </div>
            </div>
          </div>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example: Firebase Multi-Project Setup</span>
              <span class="code-dot blue"></span>
            </div>
            <pre><code># .firebaserc
{
  "projects": {
    "default": "my-app-dev",
    "dev": "my-app-dev",
    "prod": "my-app-prod"
  }
}

# Deploy to dev
firebase deploy --project dev

# Deploy to prod (after verification)
firebase deploy --project prod</code></pre>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="pd-cicd" class="lesson-section reveal-on-scroll">
          <h2>CI/CD Pipelines</h2>
          <p>Automate the path from code to production. A well-designed pipeline catches issues before they reach users:</p>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Build Verification</h4>
                <p>Every commit triggers: TypeScript compile, lint, and unit tests. If any step fails, the PR is blocked.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Preview Deployments</h4>
                <p>Every PR gets a preview URL (Firebase Hosting preview channels). Reviewers can click and test the live change without running it locally.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Staged Rollout</h4>
                <p>Deploy to dev first, run smoke tests, then promote to prod. Use a <code>/deploy</code> workflow to automate this sequence.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Rollback Plan</h4>
                <p>Always keep the previous deployment available. Firebase Hosting lets you instantly rollback to the last known-good version with one click.</p>
              </div>
            </div>
          </div>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example: GitHub Actions Workflow</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build        # TypeScript + Vite
      - run: npm test             # Unit tests
      - run: npx firebase deploy --project prod
        env:
          FIREBASE_TOKEN: \${{ secrets.FIREBASE_TOKEN }}</code></pre>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="pd-monitoring" class="lesson-section reveal-on-scroll">
          <h2>Monitoring & Observability</h2>
          <p>Deployment is just the beginning. Production applications need continuous monitoring across four dimensions:</p>
          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">🚨</div>
              <h4>Error Tracking</h4>
              <p>Use Cloud Logging or Sentry to capture and alert on errors. Set up alerts for error rate spikes — don't wait for users to report problems.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">⏱️</div>
              <h4>Latency Monitoring</h4>
              <p>Track P50, P95, and P99 response times. AI endpoints can be slow — set SLOs and alert when latency exceeds thresholds.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">💰</div>
              <h4>Cost Tracking</h4>
              <p>Monitor token usage and API costs daily. Set billing alerts in GCP to prevent surprise bills from runaway agent loops.</p>
            </div>
            <div class="tool-card">
              <div class="tool-icon">📊</div>
              <h4>Usage Analytics</h4>
              <p>Track which features users actually use, session length, and retention. Data-driven decisions beat assumptions.</p>
            </div>
          </div>
          <div class="callout callout-warning">
            <span class="callout-icon">⚠️</span>
            <div>
              <strong>The most dangerous bugs are silent</strong>
              <p>An AI agent that returns plausible-sounding but incorrect information won't throw errors. Use quality evaluation (Module 11) alongside traditional monitoring.</p>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="pd-cost" class="lesson-section reveal-on-scroll">
          <h2>Cost Management</h2>
          <p>AI applications have unique cost structures. Here's how to keep them under control:</p>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">📏</div>
              <h4>Rate Limiting</h4>
              <p>Limit API calls per user per day. A single user in a loop could exhaust your entire monthly budget in minutes.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💾</div>
              <h4>Response Caching</h4>
              <p>Cache identical or near-identical requests. If 100 users ask the same question, serve the cached answer instead of making 100 API calls.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔀</div>
              <h4>Model Routing</h4>
              <p>Use a fast, cheap model (Flash) for simple tasks and a powerful model (Pro) for complex ones. Route dynamically based on task complexity.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">✂️</div>
              <h4>Context Pruning</h4>
              <p>Don't send the entire conversation history every time. Summarise older messages to keep token counts low without losing context.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="pd-scaling" class="lesson-section reveal-on-scroll">
          <h2>Scaling Strategies</h2>
          <p>When your application grows, scale the right layer:</p>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Serverless First</h4>
                <p>Cloud Functions and Cloud Run scale to zero when idle and auto-scale under load. You pay only for what you use — no idle servers.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Queue Long Tasks</h4>
                <p>Don't make users wait for slow AI tasks. Queue them (Cloud Tasks, Pub/Sub) and notify users when results are ready.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Edge Caching</h4>
                <p>Serve static assets through a CDN (Firebase Hosting does this automatically). Cache API responses at the edge for global low-latency access.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Database Sharding</h4>
                <p>As Firestore collections grow past millions of documents, consider splitting by region or tenant for consistent read/write performance.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="pd-checklist" class="lesson-section reveal-on-scroll">
          <h2>Launch Checklist</h2>
          <p>Before going live, run through this pre-launch checklist:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Production Readiness Checklist</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>□ Environment separation (dev ≠ prod)
□ All secrets in Secret Manager (not in code)
□ Rate limiting on all AI endpoints
□ Error monitoring and alerting configured
□ Billing alerts set in GCP console
□ Regression test suite passes in staging
□ Security rules reviewed and deployed
□ CORS and CSP headers configured
□ Backup and disaster recovery plan
□ Runbook for common failure scenarios
□ Performance tested under expected load
□ Privacy policy and terms of service published
□ User data deletion flow implemented (GDPR)
□ Rollback procedure documented and tested</code></pre>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>This checklist is a workflow</strong>
              <p>Save this as a <code>/deploy</code> workflow so your agent runs through it every time. Automate what you can; the rest becomes a mental checklist.</p>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="pd-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-production', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/evaluation" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Evaluation & Testing</span>
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
  initInlineQuiz('quiz-production', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

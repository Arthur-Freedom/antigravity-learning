// ── FAQ Page ────────────────────────────────────────────────────────────
// Frequently asked questions about AI agents, the platform, and getting started.

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 40%, #C7D2FE 100%);">
      <div class="lesson-hero-content" style="color: var(--text-primary);">
        <span class="lesson-badge">Help</span>
        <h1>FAQ</h1>
        <p>Common questions about AI agent development and the Antigravity Learning platform.</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="faq-container">

        <div class="faq-section reveal-on-scroll">
          <h2 class="faq-section-title">
            <span class="faq-section-icon">🚀</span>
            Getting Started
          </h2>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>What is Antigravity Learning?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>Antigravity Learning is a free, interactive learning platform that teaches you how to build and work with AI agents. You'll learn about <strong>workflows</strong> (automated step-by-step processes), <strong>skills</strong> (reusable knowledge packages), and <strong>autonomous agents</strong> (AI systems that can think, plan, and execute tasks on your computer).</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>Do I need programming experience?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>Some basic familiarity with code is helpful (reading YAML, understanding file structures), but deep programming expertise isn't required. The platform explains concepts in plain language with clear examples. You'll learn by <em>interacting with agents</em>, not by writing complex code from scratch.</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>Is it really 100% free?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>Yes! All 3 modules, quizzes, certificates, leaderboard, and progress tracking are completely free. We believe AI literacy should be accessible to everyone.</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>How do I track my progress?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>Sign in with your Google account! Your quiz results, module completion status, and theme preferences are automatically saved to the cloud. You can track everything from the progress dashboard on the home page or your profile page.</p>
            </div>
          </div>
        </div>

        <div class="faq-section reveal-on-scroll">
          <h2 class="faq-section-title">
            <span class="faq-section-icon">🤖</span>
            About AI Agents
          </h2>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>What's the difference between a chatbot and an agent?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>A <strong>chatbot</strong> responds to your messages with text — it talks. An <strong>agent</strong> takes action — it can read files, run commands, write code, browse the web, and execute multi-step plans autonomously. Think of a chatbot as a consultant who gives advice, and an agent as an employee who does the work.</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>What tools can agents use?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>Agents have access to powerful tools including:</p>
              <ul>
                <li><code>run_command</code> — Execute shell commands on your system</li>
                <li><code>write_to_file</code> — Create new files and directories</li>
                <li><code>replace_file_content</code> — Edit existing files precisely</li>
                <li><code>browser_subagent</code> — Automate browser interactions</li>
                <li><code>grep_search</code> — Find patterns across codebases</li>
                <li><code>generate_image</code> — Create images from text descriptions</li>
              </ul>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>What is the "think → act → observe" loop?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>This is how agents operate:</p>
              <ol>
                <li><strong>Think</strong> — The agent reasons about what to do next</li>
                <li><strong>Act</strong> — It calls a tool (runs a command, edits a file, etc.)</li>
                <li><strong>Observe</strong> — It reads the result and decides the next step</li>
              </ol>
              <p>This cycle repeats until the task is complete. It's similar to how the ReAct framework works in research.</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>Can agents run tasks in parallel?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>Yes! When multiple tool calls have no dependencies between them, agents can execute them simultaneously. For example, an agent might search for files, read documentation, and check build status all at the same time — dramatically speeding up complex workflows.</p>
            </div>
          </div>
        </div>

        <div class="faq-section reveal-on-scroll">
          <h2 class="faq-section-title">
            <span class="faq-section-icon">⚙️</span>
            Workflows & Skills
          </h2>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>What is a workflow?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>A workflow is a markdown file (<code>.md</code>) stored in <code>.agent/workflows/</code> that defines step-by-step instructions for an agent to follow. Think of it like a recipe — it tells the agent exactly what to do, in what order. Workflows become slash commands (e.g., <code>/deploy</code>) that you can trigger at any time.</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>What does the <code>// turbo</code> annotation do?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>The <code>// turbo</code> annotation placed above a workflow step tells the agent to auto-execute that step without waiting for user confirmation. This is useful for safe, repetitive steps like building or testing. Use <code>// turbo-all</code> to auto-run every step in the entire workflow.</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>What is a skill?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>A skill is a folder of instructions, scripts, and resources that extends an agent's permanent knowledge. Every skill contains a <code>SKILL.md</code> file (the main instruction document) and may include <code>scripts/</code>, <code>examples/</code>, and <code>resources/</code> directories. When an agent encounters a relevant task, it reads the skill and follows its instructions.</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>How are skills different from workflows?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>Think of it this way:</p>
              <ul>
                <li><strong>Workflows</strong> = procedures (step-by-step actions to take)</li>
                <li><strong>Skills</strong> = knowledge (how to understand or approach a topic)</li>
              </ul>
              <p>A workflow says "run this command, then edit this file." A skill says "here's how our API works, here are examples, and here are the patterns to follow."</p>
            </div>
          </div>
        </div>

        <div class="faq-section reveal-on-scroll">
          <h2 class="faq-section-title">
            <span class="faq-section-icon">🎓</span>
            Certificates & Leaderboard
          </h2>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>How do I earn a certificate?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>Complete all 3 modules (Workflows, Skills, and Autonomous Agents) by passing each module's knowledge check quiz with at least 70%. Once all 3 are passed, the certificate download button will appear on your profile page.</p>
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" aria-expanded="false">
              <span>How does the leaderboard work?</span>
              <span class="faq-chevron">▸</span>
            </button>
            <div class="faq-answer">
              <p>The leaderboard ranks all learners by the number of modules they've completed. It shows real-time data from the Firestore database. Complete more modules and pass more quizzes to climb higher!</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="faq-cta reveal-on-scroll">
          <h3>Still have questions?</h3>
          <p>Jump into the modules and learn by doing — or check out the Resources page for more reading material.</p>
          <div class="faq-cta-buttons">
            <a href="/" class="btn btn-primary">Start Learning</a>
            <a href="/resources" class="btn btn-ghost">Browse Resources</a>
          </div>
        </div>

      </div>
    </section>
  `;
}

export function init(): void {
  // Accordion toggle behavior
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item')!;
      const isOpen = item.classList.contains('faq-open');

      // Close all siblings in the same section
      item.closest('.faq-section')
        ?.querySelectorAll('.faq-item.faq-open')
        .forEach((openItem) => {
          openItem.classList.remove('faq-open');
          openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        });

      // Toggle current
      if (!isOpen) {
        item.classList.add('faq-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ── Resources Page ──────────────────────────────────────────────────────
// A curated collection of external resources, documentation links,
// and community recommendations for learning more about AI agents.

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #0c1e3a 0%, #1a3a5c 40%, #2d6a9f 100%);">
      <div class="lesson-hero-content">
        <span class="lesson-badge">Library</span>
        <h1>Resources</h1>
        <p>Curated links, documentation, and community picks to deepen your understanding of AI agent development.</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="resources-container">

        <!-- Official Docs -->
        <div class="resource-category reveal-on-scroll">
          <div class="resource-category-header">
            <span class="resource-category-icon">📚</span>
            <div>
              <h2>Official Documentation</h2>
              <p>Start here — the definitive source of truth for building agents.</p>
            </div>
          </div>
          <div class="resource-grid">
            <a href="https://developers.google.com/gemini" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">🤖</div>
              <h4>Google Gemini API</h4>
              <p>Build with the Gemini model family — multimodal, grounded, and agentic capabilities.</p>
              <span class="resource-link-label">developers.google.com →</span>
            </a>
            <a href="https://firebase.google.com/docs" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">🔥</div>
              <h4>Firebase Docs</h4>
              <p>Authentication, Firestore, Hosting — the backend stack for this learning platform.</p>
              <span class="resource-link-label">firebase.google.com →</span>
            </a>
            <a href="https://vitejs.dev/guide/" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">⚡</div>
              <h4>Vite Documentation</h4>
              <p>Next-generation frontend tooling. Lightning fast HMR and optimized builds.</p>
              <span class="resource-link-label">vitejs.dev →</span>
            </a>
            <a href="https://www.typescriptlang.org/docs/" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">🔷</div>
              <h4>TypeScript Handbook</h4>
              <p>Type-safe JavaScript for building reliable, maintainable codebases.</p>
              <span class="resource-link-label">typescriptlang.org →</span>
            </a>
          </div>
        </div>

        <!-- Agent Concepts -->
        <div class="resource-category reveal-on-scroll">
          <div class="resource-category-header">
            <span class="resource-category-icon">🧠</span>
            <div>
              <h2>Agent Concepts & Research</h2>
              <p>Deep dives into how autonomous agents think, plan, and execute.</p>
            </div>
          </div>
          <div class="resource-grid">
            <a href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">📄</div>
              <h4>ReAct: Reasoning + Acting</h4>
              <p>The foundational paper on how agents interleave reasoning and action for complex tasks.</p>
              <span class="resource-link-label">arxiv.org →</span>
            </a>
            <a href="https://arxiv.org/abs/2303.11366" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">🏗️</div>
              <h4>HuggingGPT</h4>
              <p>Task planning with LLMs — using language models to coordinate AI systems.</p>
              <span class="resource-link-label">arxiv.org →</span>
            </a>
            <a href="https://arxiv.org/abs/2305.10601" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">🌲</div>
              <h4>Tree of Thoughts</h4>
              <p>Deliberate problem-solving with language models using tree-search algorithms.</p>
              <span class="resource-link-label">arxiv.org →</span>
            </a>
            <a href="https://arxiv.org/abs/2304.03442" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">🎮</div>
              <h4>Generative Agents</h4>
              <p>Interactive simulacra — agents that remember, reflect, and plan in open-ended environments.</p>
              <span class="resource-link-label">arxiv.org →</span>
            </a>
          </div>
        </div>

        <!-- Community Picks -->
        <div class="resource-category reveal-on-scroll">
          <div class="resource-category-header">
            <span class="resource-category-icon">🌟</span>
            <div>
              <h2>Community Picks</h2>
              <p>Videos, tutorials, and articles recommended by the community.</p>
            </div>
          </div>
          <div class="resource-grid">
            <a href="https://github.com/f/awesome-chatgpt-prompts" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">💬</div>
              <h4>Awesome Prompts</h4>
              <p>A curated collection of effective prompts for getting the most out of AI assistants.</p>
              <span class="resource-link-label">github.com →</span>
            </a>
            <a href="https://github.com/Significant-Gravitas/AutoGPT" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">🚀</div>
              <h4>AutoGPT</h4>
              <p>One of the first autonomous AI agents — explore how it chains tasks together.</p>
              <span class="resource-link-label">github.com →</span>
            </a>
            <a href="https://www.deeplearning.ai/short-courses/" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">🎓</div>
              <h4>DeepLearning.AI Courses</h4>
              <p>Free short courses on AI agents, LangChain, prompt engineering, and more.</p>
              <span class="resource-link-label">deeplearning.ai →</span>
            </a>
            <a href="https://lilianweng.github.io/posts/2023-06-23-agent/" target="_blank" rel="noopener" class="resource-card">
              <div class="resource-card-icon">📝</div>
              <h4>LLM-powered Agents (Lilian Weng)</h4>
              <p>An in-depth blog post on the components, memory, and planning of autonomous agents.</p>
              <span class="resource-link-label">lilianweng.github.io →</span>
            </a>
          </div>
        </div>

        <!-- Cheat Sheet -->
        <div class="resource-category reveal-on-scroll">
          <div class="resource-category-header">
            <span class="resource-category-icon">⚡</span>
            <div>
              <h2>Quick Reference</h2>
              <p>Keep these handy while you're building with agents.</p>
            </div>
          </div>
          <div class="cheat-sheet">
            <div class="cheat-item">
              <code>// turbo</code>
              <span>Auto-run the next step without asking</span>
            </div>
            <div class="cheat-item">
              <code>// turbo-all</code>
              <span>Auto-run every step in the workflow</span>
            </div>
            <div class="cheat-item">
              <code>/deploy</code>
              <span>Trigger the deploy.md workflow</span>
            </div>
            <div class="cheat-item">
              <code>.agent/workflows/</code>
              <span>Where workflow files live</span>
            </div>
            <div class="cheat-item">
              <code>skills/&lt;name&gt;/SKILL.md</code>
              <span>Create a new skill</span>
            </div>
            <div class="cheat-item">
              <code>run_command</code>
              <span>Execute shell commands</span>
            </div>
            <div class="cheat-item">
              <code>write_to_file</code>
              <span>Create new files</span>
            </div>
            <div class="cheat-item">
              <code>browser_subagent</code>
              <span>Automate the browser</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  `;
}

export function init(): void {
  // Add staggered reveal animation to resource cards
  document.querySelectorAll('.resource-card').forEach((card, i) => {
    (card as HTMLElement).style.transitionDelay = `${i * 0.05}s`;
  });
}

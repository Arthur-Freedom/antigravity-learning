// ── Glossary Page ───────────────────────────────────────────────────────
// Searchable glossary of AI agent development terms.

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const TERMS: GlossaryTerm[] = [
  { term: 'Agent', definition: 'An AI system that can autonomously plan, reason, and execute tasks using tools. Unlike chatbots, agents take action in the real world — running commands, editing files, and browsing the web.', category: 'Core' },
  { term: 'Workflow', definition: 'A markdown file (.md) in .agent/workflows/ that defines step-by-step instructions for an agent. Workflows become slash commands and can include turbo annotations for auto-execution.', category: 'Workflows' },
  { term: 'Skill', definition: 'A folder containing SKILL.md and optional scripts, examples, and resources that extend an agent\'s permanent knowledge base. Skills teach agents how to handle specific domains or tasks.', category: 'Skills' },
  { term: 'SKILL.md', definition: 'The required entry point file for any skill. Contains YAML frontmatter (name, description) and detailed markdown instructions that the agent reads and follows.', category: 'Skills' },
  { term: 'Turbo Mode', definition: 'Annotation (// turbo or // turbo-all) in workflow files that enables auto-execution of steps without requiring user confirmation. Useful for safe, repetitive operations.', category: 'Workflows' },
  { term: 'Slash Command', definition: 'A shortcut like /deploy that triggers a workflow file. The workflow filename becomes the command name (e.g., deploy.md → /deploy).', category: 'Workflows' },
  { term: 'ReAct', definition: 'Reasoning + Acting — a framework where agents interleave thinking (chain-of-thought reasoning) with acting (tool calls). The agent thinks about what to do, does it, observes the result, then thinks again.', category: 'Core' },
  { term: 'Tool', definition: 'A capability available to an agent for interacting with the outside world. Examples: run_command, write_to_file, read_url_content, browser_subagent, generate_image.', category: 'Core' },
  { term: 'run_command', definition: 'An agent tool that executes shell commands on the user\'s system. Can run synchronously (wait for result) or asynchronously (background process).', category: 'Tools' },
  { term: 'write_to_file', definition: 'An agent tool that creates new files with specified content. The agent can create files, directories, and set file permissions.', category: 'Tools' },
  { term: 'replace_file_content', definition: 'An agent tool for editing existing files by replacing specific content. Requires exact target content matching and supports line range targeting.', category: 'Tools' },
  { term: 'browser_subagent', definition: 'An agent tool that spawns a sub-agent to perform browser automation — clicking, typing, navigating, and capturing screenshots. Records sessions as WebP videos.', category: 'Tools' },
  { term: 'grep_search', definition: 'An agent tool using ripgrep to find exact pattern matches within files. Returns filename, line number, and content for each match.', category: 'Tools' },
  { term: 'generate_image', definition: 'An agent tool that creates images from text prompts. Used for generating UI mockups, assets, and visual content.', category: 'Tools' },
  { term: 'Parallel Execution', definition: 'When an agent calls multiple tools simultaneously because they have no dependencies between them. This dramatically speeds up complex operations.', category: 'Core' },
  { term: 'Context Window', definition: 'The total amount of text (tokens) an AI model can process at once. Agents must manage context carefully to avoid exceeding limits during long tasks.', category: 'Core' },
  { term: 'Frontmatter', definition: 'YAML metadata at the top of a markdown file, enclosed in --- delimiters. Used in workflows and skills to define properties like name and description.', category: 'Workflows' },
  { term: 'Firebase', definition: 'Google\'s app development platform providing authentication, database (Firestore), hosting, and cloud functions. The backend for this learning platform.', category: 'Infrastructure' },
  { term: 'Firestore', definition: 'A NoSQL document database from Firebase. Stores data in collections of documents. Used here for user profiles, quiz progress, and leaderboard data.', category: 'Infrastructure' },
  { term: 'App Check', definition: 'Firebase service that protects backend resources from abuse by verifying that incoming traffic comes from your legitimate app, not from scripts or bots.', category: 'Infrastructure' },
  { term: 'Security Rules', definition: 'Firestore rules that control who can read and write data. Written in a custom language that validates authentication, schema, and data integrity.', category: 'Infrastructure' },
  { term: 'Vite', definition: 'A next-generation frontend build tool that provides instant dev server startup and lightning-fast hot module replacement (HMR). Used to build this platform.', category: 'Infrastructure' },
  { term: 'SPA', definition: 'Single Page Application — a web app that loads a single HTML page and dynamically updates content using JavaScript, without full page reloads. This platform uses History API-based SPA routing with clean URLs.', category: 'Infrastructure' },
  { term: 'Chain of Thought', definition: 'A prompting technique where the AI explicitly reasons step-by-step before arriving at an answer. Agents use this internally when planning their actions.', category: 'Core' },
  { term: 'Grounding', definition: 'Connecting an AI model to external data sources (search, databases) so it can provide factual, up-to-date information rather than relying solely on training data.', category: 'Core' },
  { term: 'Tree of Thoughts', definition: 'An extension of chain-of-thought where the agent explores multiple reasoning paths simultaneously, using tree-search algorithms to find the best solution.', category: 'Core' },
  { term: 'Artifact', definition: 'A structured document (usually markdown) generated by an agent to present information. Artifacts can contain code, tables, diagrams, and embedded media.', category: 'Core' },
];

export function render(): string {
  const categories = [...new Set(TERMS.map(t => t.category))];

  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 40%, #A7F3D0 100%);">
      <div class="lesson-hero-content" style="color: var(--text-primary);">
        <span class="lesson-badge">Reference</span>
        <h1>Glossary</h1>
        <p>${TERMS.length} essential terms for AI agent development — searchable and organized by category.</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="glossary-container">

        <!-- Search bar -->
        <div class="glossary-search-wrap reveal-on-scroll">
          <div class="glossary-search-icon">🔍</div>
          <input
            type="text"
            id="glossary-search"
            class="glossary-search"
            placeholder="Search ${TERMS.length} terms..."
            autocomplete="off"
          />
          <div class="glossary-search-count" id="glossary-count">${TERMS.length} terms</div>
        </div>

        <!-- Category filters -->
        <div class="glossary-filters reveal-on-scroll" id="glossary-filters">
          <button class="glossary-filter-btn glossary-filter-active" data-cat="all">All</button>
          ${categories.map(c => `<button class="glossary-filter-btn" data-cat="${c}">${c}</button>`).join('')}
        </div>

        <!-- Terms -->
        <div class="glossary-list" id="glossary-list">
          ${TERMS
            .sort((a, b) => a.term.localeCompare(b.term))
            .map(t => `
              <div class="glossary-term reveal-on-scroll" data-category="${t.category}" data-term="${t.term.toLowerCase()}">
                <div class="glossary-term-header">
                  <h3>${t.term}</h3>
                  <span class="glossary-term-tag">${t.category}</span>
                </div>
                <p>${t.definition}</p>
              </div>
            `).join('')}
        </div>

        <div class="glossary-empty" id="glossary-empty" style="display:none;">
          <span class="glossary-empty-icon">🔍</span>
          <h3>No matching terms</h3>
          <p>Try a different search query or clear filters.</p>
        </div>

      </div>
    </section>
  `;
}

export function init(): void {
  const searchInput = document.getElementById('glossary-search') as HTMLInputElement;
  const list = document.getElementById('glossary-list')!;
  const countEl = document.getElementById('glossary-count')!;
  const emptyEl = document.getElementById('glossary-empty')!;
  const filtersEl = document.getElementById('glossary-filters')!;

  let activeCategory = 'all';

  function filterTerms(): void {
    const query = searchInput.value.toLowerCase().trim();
    const terms = list.querySelectorAll('.glossary-term');
    let visible = 0;

    terms.forEach((el) => {
      const term = (el as HTMLElement).dataset.term ?? '';
      const category = (el as HTMLElement).dataset.category ?? '';
      const text = el.textContent?.toLowerCase() ?? '';

      const matchesSearch = !query || term.includes(query) || text.includes(query);
      const matchesCategory = activeCategory === 'all' || category === activeCategory;

      if (matchesSearch && matchesCategory) {
        (el as HTMLElement).style.display = '';
        visible++;
      } else {
        (el as HTMLElement).style.display = 'none';
      }
    });

    countEl.textContent = `${visible} term${visible !== 1 ? 's' : ''}`;
    emptyEl.style.display = visible === 0 ? '' : 'none';
    list.style.display = visible === 0 ? 'none' : '';
  }

  // Search
  searchInput.addEventListener('input', filterTerms);

  // Category filters
  filtersEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.glossary-filter-btn') as HTMLButtonElement;
    if (!btn) return;

    filtersEl.querySelectorAll('.glossary-filter-btn').forEach(b => b.classList.remove('glossary-filter-active'));
    btn.classList.add('glossary-filter-active');
    activeCategory = btn.dataset.cat ?? 'all';
    filterTerms();
  });
}

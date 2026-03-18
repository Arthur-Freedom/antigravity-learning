// ── MCP (Model Context Protocol) Lesson Page ───────────────────────────

import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'mcp';

export const SECTION_IDS = ['mcp-what', 'mcp-arch', 'mcp-tools', 'mcp-connect', 'mcp-build', 'mcp-practice', 'mcp-quiz'] as const;

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'What does MCP stand for?',
    options: [
      'Multi-Channel Processing',
      'Model Context Protocol',
      'Machine Code Pipeline',
      'Managed Cloud Platform',
    ],
    correctIndex: 1,
    explanation:
      'MCP stands for Model Context Protocol — a standard that connects AI systems with external tools, data sources, and services.',
  },
  {
    question: 'What is the difference between MCP "tools" and "resources"?',
    options: [
      'Tools are free, resources cost money',
      'Tools are built-in, resources are third-party',
      'There is no difference — they are the same thing',
      'Tools perform actions (like API calls), resources provide read-only data',
    ],
    correctIndex: 3,
    explanation:
      'MCP tools perform actions (create, update, delete) while resources provide read-only content the agent can access without side effects.',
  },
  {
    question: 'How does an agent discover available MCP servers?',
    options: [
      'MCP servers are defined in the project configuration',
      'It searches the internet automatically',
      'The agent installs them from npm',
      'MCP servers must be registered with Google',
    ],
    correctIndex: 0,
    explanation:
      'MCP servers are configured in the project settings (e.g., in a configuration file). The agent reads this configuration to know which servers are available.',
  },
  {
    question: 'You add a Firebase MCP server to your project config, but the agent says it cannot find any Firebase tools. What should you check first?',
    options: [
      'Whether Firebase is installed globally on the machine',
      'Whether the agent is using the latest AI model',
      'Whether the MCP server is correctly defined in the configuration and running',
      'Whether you have a firebase.json file in your project',
    ],
    correctIndex: 2,
    explanation:
      'MCP servers must be properly configured and running for the agent to discover their tools. If the server definition is wrong or the server is not started, the agent will not find any tools from it.',
  },
  {
    question: 'An MCP server exposes both a "get_document" resource and a "delete_document" tool. Why is this separation important for safety?',
    options: [
      'It is only a naming convention with no practical difference',
      'Resources (read-only) can be accessed without user approval, while tools (with side effects) require explicit confirmation',
      'Tools run faster than resources',
      'Resources are only available in production environments',
    ],
    correctIndex: 1,
    explanation:
      'The tool/resource distinction maps directly to safety: resources are read-only and safe to auto-read, while tools can modify state and should require user approval for destructive actions.',
  },
];

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #FFE4E6 0%, #FECDD3 50%, #FDA4AF 100%);">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="/">Modules</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">MCP</span>
      </nav>
      <div class="lesson-hero-content">
        <span class="lesson-badge">Module 5</span>
        <h1>Model Context Protocol</h1>
        <p>Understand MCP — the standard that lets AI agents connect to external tools, databases, and services.</p>
        <span class="lesson-reading-time">⏱️ ~12 min read</span>
      </div>
    </section>

    <article class="lesson-body">
      <aside class="lesson-toc reveal-on-scroll">
        <h4>In This Lesson</h4>
        <ol>
          <li><a href="#mcp-what">What Is MCP?</a></li>
          <li><a href="#mcp-arch">Server Architecture</a></li>
          <li><a href="#mcp-tools">Tools vs Resources</a></li>
          <li><a href="#mcp-connect">Connecting Servers</a></li>
          <li><a href="#mcp-build">Building a Custom Server</a></li>
          <li><a href="#mcp-practice">Best Practices</a></li>
          <li><a href="#mcp-quiz">Knowledge Check</a></li>
        </ol>
      </aside>

      <div class="lesson-content">

        <!-- Section 1 -->
        <section id="mcp-what" class="lesson-section reveal-on-scroll">
          <h2>What Is MCP?</h2>
          <p>The <strong>Model Context Protocol (MCP)</strong> is an open standard that connects AI systems with external tools and data sources. Think of it as a <strong>universal adapter</strong> that lets your AI agent talk to any service — databases, APIs, file systems, and more.</p>
          <div class="callout callout-tip">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Real-world analogy</strong>
              <p>MCP is like a USB standard for AI. Just as USB lets any device plug into any computer, MCP lets any tool plug into any AI agent. One protocol, endless possibilities.</p>
            </div>
          </div>
          <p>Without MCP, every AI tool integration requires custom code. With MCP, you define a server once and any compatible agent can use it immediately.</p>
          <ul class="lesson-list">
            <li>Connect to databases (Firebase, PostgreSQL, MongoDB)</li>
            <li>Access APIs (GitHub, Slack, Google Cloud)</li>
            <li>Read documentation and knowledge bases</li>
            <li>Control external services (deploy, monitor, alert)</li>
          </ul>
        </section>

        <!-- Section 2 -->
        <section id="mcp-arch" class="lesson-section reveal-on-scroll">
          <h2>Server Architecture</h2>
          <p>An MCP server is a lightweight process that exposes <strong>capabilities</strong> to the AI agent. Here's how the pieces fit together:</p>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="flow-step-number">1</div>
              <div class="flow-step-content">
                <h4>Your AI Agent</h4>
                <p>The agent (client) discovers available MCP servers from its configuration.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">2</div>
              <div class="flow-step-content">
                <h4>MCP Protocol</h4>
                <p>A standardized JSON-RPC protocol handles communication between client and server.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">3</div>
              <div class="flow-step-content">
                <h4>MCP Server</h4>
                <p>The server exposes tools and resources. It handles authentication, validation, and execution.</p>
              </div>
            </div>
            <div class="flow-connector"></div>
            <div class="flow-step">
              <div class="flow-step-number">4</div>
              <div class="flow-step-content">
                <h4>External Service</h4>
                <p>The server connects to the actual service (database, API, file system) and returns results.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="mcp-tools" class="lesson-section reveal-on-scroll">
          <h2>Tools vs Resources</h2>
          <p>MCP servers expose two types of capabilities:</p>
          <div class="comparison-grid">
            <div class="comparison-card">
              <h4 class="comparison-label label-turbo">🔧 Tools</h4>
              <ul class="lesson-list">
                <li><strong>Actions</strong> that modify state</li>
                <li>Create, update, delete data</li>
                <li>Deploy, build, send notifications</li>
                <li>Require explicit agent invocation</li>
              </ul>
              <div class="code-block">
                <pre><code>// Example tool: create a Firestore document
firebase_create_document({
  collection: "users",
  data: { name: "Alice", role: "admin" }
})</code></pre>
              </div>
            </div>
            <div class="comparison-card">
              <h4 class="comparison-label label-normal">📖 Resources</h4>
              <ul class="lesson-list">
                <li><strong>Data</strong> the agent can read</li>
                <li>Database records, config files</li>
                <li>Documentation, search results</li>
                <li>Read-only, no side effects</li>
              </ul>
              <div class="code-block">
                <pre><code>// Example resource: read project config
firebase://project-config
→ { projectId: "my-app", region: "us-east1" }</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="mcp-connect" class="lesson-section reveal-on-scroll">
          <h2>Connecting MCP Servers</h2>
          <p>MCP servers are defined in your project configuration. The agent reads this to discover available servers:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">Example Configuration</span>
              <span class="code-dot green"></span>
            </div>
            <pre><code>{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-mcp-server"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "github-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
      }
    }
  }
}</code></pre>
          </div>
          <div class="callout callout-note">
            <span class="callout-icon">📌</span>
            <div>
              <strong>Server lifecycle</strong>
              <p>MCP servers start automatically when the agent needs them and shut down when the session ends. You don't need to manage them manually.</p>
            </div>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="mcp-build" class="lesson-section reveal-on-scroll">
          <h2>Building a Custom Server</h2>
          <p>You can build your own MCP server to expose any tool or data source. Here's a simplified example:</p>
          <div class="code-block">
            <div class="code-header">
              <span class="code-lang">my-mcp-server/index.ts (simplified)</span>
              <span class="code-dot blue"></span>
            </div>
            <pre><code>import { McpServer } from "@modelcontextprotocol/sdk/server";

const server = new McpServer({
  name: "my-custom-server",
  version: "1.0.0"
});

// Register a tool
server.tool("get_weather", {
  description: "Get current weather for a city",
  parameters: {
    city: { type: "string", required: true }
  }
}, async ({ city }) => {
  const data = await fetchWeather(city);
  return { content: [{ type: "text", text: data }] };
});

// Start the server
server.connect(transport);</code></pre>
          </div>
          <p>The SDK handles all the protocol details. You just define your tools and resources, and the framework handles serialization, validation, and transport.</p>
        </section>

        <!-- Section 6 -->
        <section id="mcp-practice" class="lesson-section reveal-on-scroll">
          <h2>Best Practices</h2>
          <div class="best-practices">
            <div class="practice-item">
              <span class="practice-number">01</span>
              <div>
                <h4>Use existing servers first</h4>
                <p>Check if an MCP server already exists for the service you need (Firebase, GitHub, etc.) before building one from scratch.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">02</span>
              <div>
                <h4>Keep tools focused</h4>
                <p>Each tool should do one thing well. "create_user" is better than "manage_users" which tries to handle create, update, and delete.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">03</span>
              <div>
                <h4>Write clear descriptions</h4>
                <p>Tool descriptions are how the agent decides which tool to use. Be precise about what each tool does, its parameters, and return values.</p>
              </div>
            </div>
            <div class="practice-item">
              <span class="practice-number">04</span>
              <div>
                <h4>Handle errors gracefully</h4>
                <p>MCP servers should return clear error messages. The agent uses these to decide whether to retry, try a different approach, or ask the user for help.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quiz -->
        <section id="mcp-quiz" class="lesson-section">
          ${renderInlineQuiz('quiz-mcp', quizQuestions)}
        </section>

        <!-- Navigation -->
        <nav class="lesson-nav reveal-on-scroll">
          <a href="/learn/prompts" class="lesson-nav-btn nav-prev">
            <span class="nav-label">← Previous</span>
            <span class="nav-page">Prompt Engineering</span>
          </a>
          <a href="/learn/context" class="lesson-nav-btn nav-next">
            <span class="nav-label">Next Module →</span>
            <span class="nav-page">Context Management</span>
          </a>
        </nav>
      </div>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-mcp', TOPIC, quizQuestions);

  // Smooth-scroll for TOC links
  document.querySelectorAll('.lesson-toc a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

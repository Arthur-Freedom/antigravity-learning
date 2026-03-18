// ── Home Page ───────────────────────────────────────────────────────────
// The landing page with hero, stats, how-it-works, module cards, and progress.

import { getCurrentUser, onAuthChange, type Unsubscribe } from '../services/authService';
import { getUserProfile, getUserCount } from '../services/userService';
import { TOTAL_MODULES, TOTAL_QUIZ_QUESTIONS, TOTAL_SECTIONS } from '../constants/modules';
import { renderActivityFeed, initActivityFeed, destroyActivityFeed } from '../components/activity-feed';
import { renderStreakWidget, type StreakData } from '../components/learning-streak';

let authUnsubscribe: Unsubscribe | null = null;

// ── Quiz Data (kept for backward compat with modal fallback) ────────────
export interface Quiz {
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const quizzes: Record<string, Quiz> = {
  workflows: {
    title: 'Workflows Quiz',
    question: 'What does the "// turbo" annotation do in a workflow file?',
    options: [
      'Makes the code run faster',
      'Auto-runs the next shell command without user approval',
      'Enables parallel execution of all steps',
      'Compresses the output logs',
    ],
    correctIndex: 1,
  },
  skills: {
    title: 'Skills Quiz',
    question: 'Where should you place a SKILL.md file so the agent reads it?',
    options: [
      'In the root directory',
      'In a .agent/ folder',
      'In a skills/<skill-name>/ folder',
      'In the src/ folder',
    ],
    correctIndex: 2,
  },
  agents: {
    title: 'Agents Quiz',
    question: 'What is the primary difference between a chatbot and an autonomous agent?',
    options: [
      'Agents are faster at generating text',
      'Agents can execute commands and modify files on your computer',
      'Agents use a different language model',
      'Agents require an internet connection',
    ],
    correctIndex: 1,
  },
  prompts: {
    title: 'Prompt Engineering Quiz',
    question: 'What is "few-shot prompting"?',
    options: [
      'Asking the AI to respond in fewer words',
      'Providing examples of the desired input/output before your actual request',
      'Running the prompt multiple times and picking the best answer',
      'Limiting the AI to a small number of tool calls',
    ],
    correctIndex: 1,
  },
  context: {
    title: 'Context Windows Quiz',
    question: 'What happens when a conversation exceeds the context window?',
    options: [
      'The model speeds up',
      'Earlier messages are forgotten or truncated',
      'The model switches to a larger context',
      'Nothing changes',
    ],
    correctIndex: 1,
  },
  mcp: {
    title: 'MCP Quiz',
    question: 'What does MCP stand for?',
    options: [
      'Machine Control Protocol',
      'Model Context Protocol',
      'Multi-Channel Processing',
      'Managed Compute Platform',
    ],
    correctIndex: 1,
  },
  tools: {
    title: 'Tool Use Quiz',
    question: 'What is "function calling" in the context of AI agents?',
    options: [
      'Writing JavaScript functions',
      'The AI deciding which external tool/API to invoke based on the user request',
      'Calling customer support',
      'Optimizing function performance',
    ],
    correctIndex: 1,
  },
  safety: {
    title: 'Safety & Guardrails Quiz',
    question: 'What is a "prompt injection" attack?',
    options: [
      'A way to speed up prompts',
      'Tricking the AI into ignoring its instructions by hiding commands in user input',
      'Adding extra context to improve results',
      'A method to compress prompts',
    ],
    correctIndex: 1,
  },
  projects: {
    title: 'Real-World Projects Quiz',
    question: 'What is the first step when starting a real-world AI agent project?',
    options: [
      'Write all the code immediately',
      'Define the scope and requirements clearly',
      'Deploy to production',
      'Skip planning and start coding',
    ],
    correctIndex: 1,
  },
  multiagent: {
    title: 'Multi-Agent Systems Quiz',
    question: 'What is the primary benefit of using multiple agents instead of a single agent?',
    options: [
      'It uses less memory',
      'Each agent can specialise on a focused task, reducing errors and context overload',
      'Multiple agents always run faster than one',
      'It eliminates the need for human oversight',
    ],
    correctIndex: 1,
  },
  evaluation: {
    title: 'Evaluation & Testing Quiz',
    question: 'What is "LLM-as-a-Judge" evaluation?',
    options: [
      'Using a language model to generate test data',
      'Using a second language model to score or rank the output of the first model',
      'Having a judge decide if an LLM is legal',
      'A benchmark leaderboard for LLMs',
    ],
    correctIndex: 1,
  },
  production: {
    title: 'Production & Scaling Quiz',
    question: 'What is the most critical step before deploying an agent-built application to production?',
    options: [
      'Adding more features',
      'Running a comprehensive test suite and verifying all endpoints and edge cases',
      'Choosing a cooler domain name',
      'Removing all comments from the code',
    ],
    correctIndex: 1,
  },
};

export function render(): string {
  return `
    <!-- Hero with animated background -->
    <section class="hero hero-animated">
      <div class="hero-bg-shapes">
        <div class="hero-shape shape-1"></div>
        <div class="hero-shape shape-2"></div>
        <div class="hero-shape shape-3"></div>
      </div>
      <div class="hero-content" style="position: relative; z-index: 1;">
        <span class="hero-badge">🧪 Early Access Beta — Free forever</span>
        <h1>Learn by<br><span class="gradient-text">Building</span></h1>
        <p>Master AI agents, workflows, and skills through hands-on lessons, interactive quizzes, and real-world examples. Fun, free, and made for students.</p>
        <div class="hero-cta-group">
          <a href="#modules" class="btn btn-primary" id="scroll-btn">Start Learning — it's free</a>
          <a href="#how-it-works" class="btn btn-ghost" id="scroll-how">How It Works</a>
        </div>
      </div>
      <div class="hero-image-container" style="position: relative; z-index: 1;">
        <img src="/images/hero.png" alt="Modern learning environment" />
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="stats-bar reveal-on-scroll">
      <div class="stats-inner">
        <div class="stat-item">
          <span class="stat-number" id="stat-user-count" data-target="0">0</span>
          <span class="stat-label">Learners Enrolled</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number" data-target="${TOTAL_QUIZ_QUESTIONS}">0</span>
          <span class="stat-label">Quiz Questions</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number" data-target="${TOTAL_SECTIONS}">0</span>
          <span class="stat-label">Teaching Sections</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number stat-number-pct" data-target="100">0</span>
          <span class="stat-label">Free Forever</span>
        </div>
      </div>
    </section>

    <!-- Live Activity Feed -->
    <section class="section activity-feed-section reveal-on-scroll">
      ${renderActivityFeed()}
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="section how-it-works-section">
      <h2 class="section-title">How It Works</h2>
      <div class="hiw-grid">
        <div class="hiw-step reveal-on-scroll">
          <div class="hiw-icon-wrap">
            <div class="hiw-icon">📖</div>
            <div class="hiw-step-num">1</div>
          </div>
          <h3>Read the Lesson</h3>
          <p>Each module has a full lesson page with concepts, code examples, and real-world analogies.</p>
        </div>
        <div class="hiw-connector reveal-on-scroll"></div>
        <div class="hiw-step reveal-on-scroll">
          <div class="hiw-icon-wrap">
            <div class="hiw-icon">📝</div>
            <div class="hiw-step-num">2</div>
          </div>
          <h3>Take the Quiz</h3>
          <p>Test your understanding with 3 knowledge-check questions at the end of each lesson.</p>
        </div>
        <div class="hiw-connector reveal-on-scroll"></div>
        <div class="hiw-step reveal-on-scroll">
          <div class="hiw-icon-wrap">
            <div class="hiw-icon">🏆</div>
            <div class="hiw-step-num">3</div>
          </div>
          <h3>Track Progress</h3>
          <p>Sign in to save your progress to the cloud. Your results sync across all your devices.</p>
        </div>
      </div>
    </section>

    <!-- Learning Journey / Core Modules -->
    <section id="modules" class="section modules-section">
      <h2 class="section-title">Your Learning Journey</h2>
      <p class="section-subtitle">4 tiers to take you from a curious beginner to a capable AI engineer</p>
      
      <div class="learning-tiers">
        
        <!-- Tier 1 -->
        <div class="tier-group tier-1 reveal-on-scroll">
          <div class="tier-group-header">
            <span class="tier-badge">Tier 1</span>
            <div class="tier-title-lockup">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tier-icon-svg tier-icon-1"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
              <h3 class="tier-title">Beginner Fundamentals</h3>
            </div>
            <p class="tier-desc">Master the basics of AI agent workflows and extending capabilities via custom knowledge.</p>
          </div>
          <div class="grid">
            <div class="card" id="card-workflows">
              <div class="card-image">
                <img src="/images/workflows.png" alt="Workflows" />
              </div>
              <div class="card-content">
                <div class="card-badge">Module 1</div>
                <h3>Workflows</h3>
                <p>Automate repetitive tasks with explicitly defined steps and shell commands.</p>
                <div class="card-tags">
                  <span class="tag">Automation</span>
                  <span class="tag">Shell</span>
                  <span class="tag">Turbo Mode</span>
                  <span class="tag tag-time">⏱️ ~8 min</span>
                </div>
                <div class="card-footer">
                  <span class="card-status" id="status-workflows">Not started</span>
                  <a href="/learn/workflows" class="btn">Start Learning</a>
                </div>
              </div>
            </div>

            <div class="card" id="card-skills">
              <div class="card-image">
                <img src="/images/skills.png" alt="Skills" />
              </div>
              <div class="card-content">
                <div class="card-badge">Module 2</div>
                <h3>Skills</h3>
                <p>Extend the agent's permanent knowledge base with custom paradigms and libraries.</p>
                <div class="card-tags">
                  <span class="tag">Knowledge</span>
                  <span class="tag">SKILL.md</span>
                  <span class="tag">Reusable</span>
                  <span class="tag tag-time">⏱️ ~10 min</span>
                </div>
                <div class="card-footer">
                  <span class="card-status" id="status-skills">Not started</span>
                  <a href="/learn/skills" class="btn">Start Learning</a>
                </div>
              </div>
            </div>

            <div class="card" id="card-agents">
              <div class="card-image">
                <img src="/images/agents.png" alt="Agents" />
              </div>
              <div class="card-content">
                <div class="card-badge">Module 3</div>
                <h3>Autonomous Agents</h3>
                <p>Learn how an agent executes tasks directly on your computer.</p>
                <div class="card-tags">
                  <span class="tag">Tools</span>
                  <span class="tag">Parallel</span>
                  <span class="tag">Execution</span>
                  <span class="tag tag-time">⏱️ ~12 min</span>
                </div>
                <div class="card-footer">
                  <span class="card-status" id="status-agents">Not started</span>
                  <a href="/learn/agents" class="btn">Start Learning</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tier 2 -->
        <div class="tier-group tier-2 reveal-on-scroll">
          <div class="tier-group-header">
            <span class="tier-badge">Tier 2</span>
            <div class="tier-title-lockup">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tier-icon-svg tier-icon-2"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/></svg>
              <h3 class="tier-title">Intermediate Concepts</h3>
            </div>
            <p class="tier-desc">Understand how LLMs think, connect agents to external services, and empower them to use tools.</p>
          </div>
          <div class="grid">
        <div class="card reveal-on-scroll" id="card-prompts">
          <div class="card-image">
            <img src="/images/prompts.png" alt="Prompt Engineering" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 4</div>
            <h3>Prompt Engineering</h3>
            <p>Master the art of writing clear, effective prompts that get the best results from AI agents.</p>
            <div class="card-tags">
              <span class="tag">Few-Shot</span>
              <span class="tag">Chain-of-Thought</span>
              <span class="tag">Best Practices</span>
              <span class="tag tag-time">⏱️ ~10 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-prompts">Not started</span>
              <a href="/learn/prompts" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

        <div class="card reveal-on-scroll" id="card-context">
          <div class="card-image">
            <img src="/images/context.png" alt="Context Windows" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 5</div>
            <h3>Context Windows</h3>
            <p>Understand how AI models process information and manage token limits effectively.</p>
            <div class="card-tags">
              <span class="tag">Tokens</span>
              <span class="tag">Memory</span>
              <span class="tag">Optimization</span>
              <span class="tag tag-time">⏱️ ~10 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-context">Not started</span>
              <a href="/learn/context" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

        <div class="card reveal-on-scroll" id="card-mcp">
          <div class="card-image">
            <img src="/images/mcp.png" alt="MCP" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 6</div>
            <h3>Model Context Protocol</h3>
            <p>Learn MCP — the open standard that connects AI agents to external tools and data sources.</p>
            <div class="card-tags">
              <span class="tag">MCP</span>
              <span class="tag">Integration</span>
              <span class="tag">Servers</span>
              <span class="tag tag-time">⏱️ ~12 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-mcp">Not started</span>
              <a href="/learn/mcp" class="btn">Start Learning</a>
            </div>
          </div>
        </div>
          </div>
        </div>

        <!-- Tier 3 -->
        <div class="tier-group tier-3 reveal-on-scroll">
          <div class="tier-group-header">
            <span class="tier-badge">Tier 3</span>
            <div class="tier-title-lockup">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tier-icon-svg tier-icon-3"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              <h3 class="tier-title">Applied Skills</h3>
            </div>
            <p class="tier-desc">Learn dynamic function calling, guardrails, and build a complete real-world AI agent.</p>
          </div>
          <div class="grid">
        <div class="card reveal-on-scroll" id="card-tools">
          <div class="card-image">
            <img src="/images/tools.png" alt="Tool Use & Function Calling" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 7</div>
            <h3>Tool Use & Function Calling</h3>
            <p>Discover how agents select and invoke external tools, APIs, and functions dynamically.</p>
            <div class="card-tags">
              <span class="tag">Functions</span>
              <span class="tag">APIs</span>
              <span class="tag">Dynamic</span>
              <span class="tag tag-time">⏱️ ~12 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-tools">Not started</span>
              <a href="/learn/tools" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

        <div class="card reveal-on-scroll" id="card-safety">
          <div class="card-image">
            <img src="/images/safety.png" alt="Safety & Guardrails" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 8</div>
            <h3>Safety & Guardrails</h3>
            <p>Learn how to build responsible AI systems with proper safety measures and prompt injection defenses.</p>
            <div class="card-tags">
              <span class="tag">Security</span>
              <span class="tag">Ethics</span>
              <span class="tag">Defense</span>
              <span class="tag tag-time">⏱️ ~10 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-safety">Not started</span>
              <a href="/learn/safety" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

        <div class="card reveal-on-scroll" id="card-projects">
          <div class="card-image">
            <img src="/images/projects.png" alt="Real-World Projects" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 9</div>
            <h3>Real-World Projects</h3>
            <p>Apply everything you've learned by building real AI agent projects from scratch.</p>
            <div class="card-tags">
              <span class="tag">Hands-On</span>
              <span class="tag">Portfolio</span>
              <span class="tag">Capstone</span>
              <span class="tag tag-time">⏱️ ~15 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-projects">Not started</span>
              <a href="/learn/projects" class="btn">Start Learning</a>
            </div>
          </div>
        </div>
          </div>
        </div>

        <!-- Tier 4 -->
        <div class="tier-group tier-4 reveal-on-scroll">
          <div class="tier-group-header">
            <span class="tier-badge">Tier 4</span>
            <div class="tier-title-lockup">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tier-icon-svg tier-icon-4"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
              <h3 class="tier-title">Advanced Workflows</h3>
            </div>
            <p class="tier-desc">Orchestrate multiple agents, evaluate responses, and deploy your robust systems to production.</p>
          </div>
          <div class="grid">
        <div class="card reveal-on-scroll" id="card-multiagent">
          <div class="card-image">
            <img src="/images/multiagent.png" alt="Multi-Agent Systems" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 10</div>
            <h3>Multi-Agent Systems</h3>
            <p>Orchestrate multiple agents working together — delegation, coordination, and composition patterns.</p>
            <div class="card-tags">
              <span class="tag">Orchestration</span>
              <span class="tag">Delegation</span>
              <span class="tag">Coordination</span>
              <span class="tag tag-time">⏱️ ~15 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-multiagent">Not started</span>
              <a href="/learn/multiagent" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

        <div class="card reveal-on-scroll" id="card-evaluation">
          <div class="card-image">
            <img src="/images/evaluation.png" alt="Evaluation & Testing" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 11</div>
            <h3>Evaluation & Testing</h3>
            <p>Measure, benchmark, and continuously test AI agent outputs with automated evaluation pipelines.</p>
            <div class="card-tags">
              <span class="tag">Metrics</span>
              <span class="tag">LLM-as-Judge</span>
              <span class="tag">Regression</span>
              <span class="tag tag-time">⏱️ ~14 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-evaluation">Not started</span>
              <a href="/learn/evaluation" class="btn">Start Learning</a>
            </div>
          </div>
        </div>

        <div class="card reveal-on-scroll" id="card-production">
          <div class="card-image">
            <img src="/images/production.png" alt="Production & Scaling" />
          </div>
          <div class="card-content">
            <div class="card-badge">Module 12</div>
            <h3>Production & Scaling</h3>
            <p>Ship with confidence — deployment pipelines, monitoring, cost management, and scaling strategies.</p>
            <div class="card-tags">
              <span class="tag">CI/CD</span>
              <span class="tag">Monitoring</span>
              <span class="tag">Scaling</span>
              <span class="tag tag-time">⏱️ ~15 min</span>
            </div>
            <div class="card-footer">
              <span class="card-status" id="status-production">Not started</span>
              <a href="/learn/production" class="btn">Start Learning</a>
            </div>
          </div>
        </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Credibility Section -->
    <section class="credibility-section">
      <!-- Built With strip -->
      <div class="built-with-strip reveal-on-scroll">
        <span class="built-with-label">Built with</span>
        <div class="built-with-logos">
          <div class="built-with-logo" title="Firebase">
            <svg viewBox="0 0 256 351" width="28" height="28"><path d="M0 282L.5 282 42 35c.4-3.2 4.8-4 6.2-1.1l45.3 84.8L0 282z" fill="#FFA000"/><path d="M135 148L95 82 .5 282 135 148z" fill="#F57C00"/><path d="M196 108l24 130-88 52-132-8 196-174z" fill="#FFCA28"/><path d="M196 108l-61 40L93 55c-1.4-2.8-5.4-2.5-6.3.5L.5 282 132 338l88-52 24-130-48-48z" fill="#FFA000"/><path d="M132 338l88-52 24-130-48-48-61 40.5L93.2 55.2c-1.3-2.8-5.4-2.6-6.3.4L.5 282 132 338z" fill="#F57C00"/><path d="M132 338l88-52-24-178L93 55c-1.4-2.8-5.4-2.5-6.3.5L.5 282 132 338z" fill="#FFCA28"/></svg>
            <span>Firebase</span>
          </div>
          <div class="built-with-logo" title="TypeScript">
            <svg viewBox="0 0 256 256" width="28" height="28"><rect width="256" height="256" rx="12" fill="#3178C6"/><path d="M150 220.8V245c5 2.6 11.3 4.5 17.5 5.7 6.2 1.2 13 1.8 20 1.5 6.8-.2 13.2-1.3 19-3.3s10.8-5 15-9c4.2-3.8 7.5-8.6 9.8-14.4 2.3-5.8 3.5-12.5 3.5-20.2 0-5.6-.7-10.5-2.2-14.8s-3.6-8.2-6.4-11.6-6.2-6.5-10.2-9.2c-4-2.7-8.5-5.2-13.5-7.5-3.7-1.7-7-3.3-9.7-5-2.7-1.7-5-3.4-6.8-5.2-1.8-1.8-3.2-3.7-4.1-5.7s-1.4-4.3-1.4-6.8c0-2.3.4-4.4 1.3-6.3.8-1.8 2.1-3.4 3.8-4.8 1.7-1.3 3.8-2.4 6.3-3.1 2.5-.7 5.4-1.1 8.7-1.1 2.3 0 4.7.2 7.2.5 2.5.4 5 .9 7.5 1.7 2.5.8 4.9 1.7 7.1 2.9 2.2 1.2 4.2 2.5 6 4V109c-4.5-2-9.5-3.5-14.8-4.4-5.3-1-11.3-1.4-18-1.2-6.8.2-13.2 1.3-19 3.2-5.8 2-10.8 4.8-15 8.4-4.2 3.6-7.4 8-9.7 13.2-2.3 5.2-3.4 11-3.4 17.5 0 9.4 2.8 17.3 8.5 23.5 5.7 6.2 14 11.5 25 15.7 3.7 1.5 7.2 3 10.3 4.5 3.1 1.6 5.7 3.2 8 5 2.2 1.8 4 3.8 5.2 5.9 1.2 2.2 1.9 4.7 1.9 7.7 0 2.2-.4 4.3-1.2 6.2-.8 1.8-2 3.4-3.7 4.7-1.7 1.3-3.8 2.3-6.4 3-2.5.7-5.6 1-9 .8-6-.4-11.8-2-17.3-4.7-5.5-2.7-10.5-6.5-15-11.4zM106 119h42v-19H47v19h42v132h17V119z" fill="#fff"/></svg>
            <span>TypeScript</span>
          </div>
          <div class="built-with-logo" title="Vite">
            <svg viewBox="0 0 410 404" width="28" height="28"><path d="M400 26L216 398c-4 7-14 7-18 0L8 26c-4-8 2-17 11-15l186 32c2 0 3 0 5 0l179-32c9-2 15 7 11 15z" fill="#41D1FF"/><path d="M293 2L159 28c-3 1-5 3-5 6l-9 176c0 4 3 7 7 6l39-8c4-1 8 3 7 7l-12 55c-1 4 3 8 7 7l24-6c4-1 8 3 7 7l-18 87c-1 6 7 9 10 4l2-3L377 91c2-4-2-8-6-7l-41 8c-4 1-7-3-7-7l18-75c1-4-3-8-7-7z" fill="#FFD62E"/></svg>
            <span>Vite</span>
          </div>
          <div class="built-with-logo" title="Google Cloud">
            <svg viewBox="0 0 256 206" width="28" height="28"><path d="M170 62l18-18 1-8A103 103 0 0 0 27 97l10-2 54-9 4-4a57 57 0 0 1 75-20z" fill="#EA4335"/><path d="M224 97a103 103 0 0 0-35-57l-39 38a57 57 0 0 1 21 45v7a28 28 0 1 1 0 57h-57l-7 8v34l7 7h57a83 83 0 0 0 53-139z" fill="#4285F4"/><path d="M57 236h57v-49H57a28 28 0 0 1-12-3l-8 2-16 16-2 8a83 83 0 0 0 38 26z" fill="#34A853"/><path d="M57 53a83 83 0 0 0-38 157l26-26a28 28 0 1 1 38-39l26-26A83 83 0 0 0 57 53z" fill="#FBBC05"/></svg>
            <span>Google Cloud</span>
          </div>
        </div>
      </div>

      <!-- Why Antigravity? -->
      <h2 class="section-title">Why Antigravity?</h2>
      <p class="section-subtitle">Honest reasons to start learning here</p>
      <div class="value-cards-grid">
        <div class="value-card reveal-on-scroll">
          <div class="value-card-icon">🎯</div>
          <h3>Hands-On Learning</h3>
          <p>Every module ends with a real quiz. No fluff, no passive watching — just practical skills you can use immediately.</p>
        </div>
        <div class="value-card reveal-on-scroll">
          <div class="value-card-icon">🔓</div>
          <h3>100% Free, No Strings</h3>
          <p>No credit card, no paywall, no premium tier. All ${TOTAL_MODULES} modules and ${Object.keys(quizzes).length * 3} quiz questions are free — forever.</p>
        </div>
        <div class="value-card reveal-on-scroll">
          <div class="value-card-icon">⚡</div>
          <h3>Built by Builders</h3>
          <p>Created by a developer who uses AI agents daily. Every lesson is grounded in real workflows, not abstract theory.</p>
        </div>
      </div>
    </section>

    <!-- Progress Dashboard -->
    <section id="progress" class="section progress-section">
      <h2 class="section-title">Your Progress</h2>
      <div class="progress-container" id="progress-container">
        <div class="progress-login-card reveal-on-scroll">
          <div class="progress-login-icon">🔐</div>
          <h3>Track Your Journey</h3>
          <p>Sign in with Google to track your learning progress across devices. Your quiz results are saved securely to the cloud.</p>
        </div>
      </div>
    </section>
  `;
}

export function init(): void {
  // Smooth scroll for hero CTAs
  document.getElementById('scroll-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('scroll-how')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Animated stat counters
  initStatCounters();

  // Live activity feed
  initActivityFeed();

  // Fetch and display live user count
  loadUserCount();

  // Clean up any previous auth listener (safety net)
  if (authUnsubscribe) {
    authUnsubscribe();
    authUnsubscribe = null;
  }

  // Restore progress reactively when auth state resolves
  // This fixes the race condition where getCurrentUser() returns null
  // at init time because Firebase hasn't resolved auth yet.
  authUnsubscribe = onAuthChange((user) => {
    if (user) {
      restoreProgress();
    }
  });

  // Also try immediately in case auth already resolved
  restoreProgress();
}

// ── Animated Counters ───────────────────────────────────────────────────

function initStatCounters(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);
}

function animateCounters(): void {
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target = parseInt(el.getAttribute('data-target') ?? '0');
    const isPct = el.classList.contains('stat-number-pct');
    const duration = 1500;
    const start = performance.now();

    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current.toString() + (isPct ? '%' : '');
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

// ── Progress Dashboard ──────────────────────────────────────────────────

async function restoreProgress(): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;

  const profile = await getUserProfile(user.uid);
  if (!profile) return;

  const container = document.getElementById('progress-container');
  if (!container) return;

  // Count completed modules
  const totalModules = Object.keys(quizzes).length;
  const completedModules = profile.quizProgress
    ? Object.values(profile.quizProgress).filter((r) => r.correct).length
    : 0;
  const completionPct = Math.round((completedModules / totalModules) * 100);

  container.innerHTML = `
    <div class="dashboard">
      <!-- Streak Widget -->
      ${renderStreakWidget({
        streak: profile.streak ?? 0,
        lastLoginDate: profile.lastLoginDate ?? null,
        quizProgress: profile.quizProgress ?? null,
      } as StreakData)}

      <!-- Overview Card -->
      <div class="dashboard-overview">
        <div class="progress-ring-wrap">
          <svg class="progress-ring" viewBox="0 0 120 120">
            <circle class="progress-ring-bg" cx="60" cy="60" r="52" />
            <circle class="progress-ring-fill" cx="60" cy="60" r="52"
              stroke-dasharray="${2 * Math.PI * 52}"
              stroke-dashoffset="${2 * Math.PI * 52 * (1 - completionPct / 100)}" />
          </svg>
          <div class="progress-ring-label">
            <span class="progress-ring-pct">${completionPct}%</span>
            <span class="progress-ring-sub">Complete</span>
          </div>
        </div>
        <div class="overview-stats">
          <div class="overview-stat">
            <span class="overview-stat-val">${completedModules}</span>
            <span class="overview-stat-label">Modules Passed</span>
          </div>
          <div class="overview-stat">
            <span class="overview-stat-val">${totalModules - completedModules}</span>
            <span class="overview-stat-label">Remaining</span>
          </div>
        </div>
      </div>

      <!-- Per-module cards -->
      <div class="dashboard-modules">
        ${Object.keys(quizzes)
          .map((t) => {
            const result = profile.quizProgress?.[t];
            const passed = result?.correct ?? false;
            const attempted = !!result;
            return `
            <div class="dash-module-card ${passed ? 'module-passed' : attempted ? 'module-attempted' : ''}">
              <div class="dash-module-status">
                ${passed ? '✅' : attempted ? '🔄' : '⬜'}
              </div>
              <div class="dash-module-info">
                <h4>${quizzes[t].title.replace(' Quiz', '')}</h4>
                <span class="dash-module-label">${passed ? 'Passed' : attempted ? 'Try again' : 'Not attempted'}</span>
              </div>
              <a href="/learn/${t}" class="btn btn-sm">${passed ? 'Review' : 'Start'}</a>
            </div>`;
          })
          .join('')}
      </div>
    </div>
  `;

  // Animate the ring after a small delay
  requestAnimationFrame(() => {
    const ring = document.querySelector('.progress-ring-fill') as SVGCircleElement;
    if (ring) {
      ring.style.transition = 'stroke-dashoffset 1.2s ease';
    }
  });

  // Also update card statuses
  if (profile.quizProgress) {
    for (const [topic, result] of Object.entries(profile.quizProgress)) {
      const cardStatus = document.getElementById(`status-${topic}`);
      if (cardStatus) {
        cardStatus.textContent = result.correct ? '✅ Passed' : '❌ Try again';
        cardStatus.className = `card-status ${result.correct ? 'status-passed' : 'status-failed'}`;
      }
    }
  }
}

// ── Live User Count ─────────────────────────────────────────────────────

async function loadUserCount(): Promise<void> {
  const count = await getUserCount();
  const el = document.getElementById('stat-user-count');
  if (el && count > 0) {
    el.setAttribute('data-target', count.toString());
    // Re-animate this single counter
    const duration = 1500;
    const start = performance.now();
    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el!.textContent = Math.round(count * eased).toString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
}

/** Clean up Firestore listeners when navigating away */
export function destroy(): void {
  destroyActivityFeed()
  if (authUnsubscribe) {
    authUnsubscribe();
    authUnsubscribe = null;
  }
}

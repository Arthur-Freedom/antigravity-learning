import './style.css'
import { bindAuthUI } from './auth'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="navbar">
    <div class="nav-brand">Antigravity</div>
    <div class="nav-links">
      <a href="#workflows">Workflows</a>
      <a href="#skills">Skills</a>
      <a href="#agents">Agents</a>
      <button id="google-login-btn" class="btn auth-btn auth-btn--logged-out" aria-label="Sign in with Google">Sign in with Google</button>
      <button id="theme-toggle" class="btn" style="padding: 0.5rem 1rem; border: 2px solid var(--text-primary); background: transparent; color: var(--text-primary);">Toggle Theme</button>
    </div>
  </header>

  <section class="hero">
    <div class="hero-content">
      <h1>Master<br>Autonomy</h1>
      <p>A premium learning experience for AI agents, workflows, and skills. Designed to perfection.</p>
      <a href="#workflows" class="btn" id="scroll-btn">Discover the Curriculum</a>
    </div>
    
    <div style="flex: 1; min-height: 400px; margin-left: 4rem; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.1);">
      <img src="/images/hero.png" alt="Outdoor Patio" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
  </section>

  <section id="workflows" class="section">
    <h2 class="section-title">Core Modules</h2>
    <div class="grid">
      
      <div class="card">
        <div class="card-image">
          <img src="/images/workflows.png" alt="Workflows" />
        </div>
        <div class="card-content">
          <h3>Workflows</h3>
          <p>Automate repetitive tasks with explicitly defined steps and shell commands. Learn how to scaffold projects instantly.</p>
          <button class="btn interactive-btn" data-topic="workflows">Test Knowledge</button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-image">
          <img src="/images/skills.png" alt="Skills" />
        </div>
        <div class="card-content">
          <h3>Skills</h3>
          <p>Extend the agent's permanent knowledge base with custom paradigms, design systems, and external libraries.</p>
          <button class="btn interactive-btn" data-topic="skills">Test Knowledge</button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-image">
          <img src="/images/agents.png" alt="Agents" />
        </div>
        <div class="card-content">
          <h3>Autonomous Agents</h3>
          <p>Learn how an autonomous agent is different from a simple chatbot and how it executes tasks directly on your computer.</p>
          <button class="btn interactive-btn" data-topic="agents">Test Knowledge</button>
        </div>
      </div>

    </div>
  </section>

  <!-- Interactive Quiz Modal -->
  <div id="quiz-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
    <div style="background: white; padding: 3rem; border-radius: 8px; max-width: 500px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
      <h3 id="quiz-title" style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1.8rem;">Quiz</h3>
      <p id="quiz-question" style="margin-bottom: 2rem; color: var(--text-secondary); font-size: 1.1rem;"></p>
      <button id="close-modal" class="btn" style="background: var(--text-primary); color: white;">Close</button>
    </div>
  </div>
`

// Smooth Scroll Interactivity
document.getElementById('scroll-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('workflows')?.scrollIntoView({ behavior: 'smooth' });
});

// Interactive Quiz System
const quizzes: Record<string, { title: string, question: string }> = {
  workflows: { title: 'Workflows Quiz', question: 'What is the purpose of the // turbo flag in a workflow file?' },
  skills: { title: 'Skills Quiz', question: 'Where should you save a skill file so the agent automatically reads it before performing relevant tasks?' },
  agents: { title: 'Agents Quiz', question: 'What is the primary difference between a simple chatbot and an autonomous agent like Antigravity?' }
};

const modal = document.getElementById('quiz-modal');
const closeBtn = document.getElementById('close-modal');
const quizTitleSpan = document.getElementById('quiz-title');
const quizQuestionSpan = document.getElementById('quiz-question');

document.querySelectorAll('.interactive-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const topic = (e.target as HTMLButtonElement).dataset.topic;
    if (topic && quizzes[topic] && modal && quizTitleSpan && quizQuestionSpan) {
      quizTitleSpan.textContent = quizzes[topic].title;
      quizQuestionSpan.textContent = quizzes[topic].question;
      modal.style.display = 'flex';
    }
  });
});

closeBtn?.addEventListener('click', () => {
  if (modal) modal.style.display = 'none';
});

// Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
themeBtn?.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  if (document.body.classList.contains('dark-theme')) {
    themeBtn.textContent = 'Light Theme';
    themeBtn.style.color = 'var(--text-light)';
    themeBtn.style.borderColor = 'var(--text-light)';
  } else {
    themeBtn.textContent = 'Dark Theme';
    themeBtn.style.color = 'var(--text-primary)';
    themeBtn.style.borderColor = 'var(--text-primary)';
  }
});

// ── Google Auth UI Binding ──
bindAuthUI('google-login-btn');

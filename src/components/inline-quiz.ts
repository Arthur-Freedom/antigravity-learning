// ── Inline Quiz Component ───────────────────────────────────────────────
// Renders a multi-question quiz inline on lesson pages.
// Each question shows instant feedback and the full quiz tracks a score.

import { getCurrentUser } from '../services/authService';
import { saveQuizResult, isCertificateEligible } from '../services/userService';
import { showToast } from './toast';
import { fireConfetti } from './confetti';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Render the quiz HTML. Call initInlineQuiz() after inserting into the DOM. */
export function renderInlineQuiz(quizId: string, questions: QuizQuestion[]): string {
  return `
    <div class="inline-quiz reveal-on-scroll" id="${quizId}">
      <div class="quiz-header">
        <div class="quiz-header-icon">📝</div>
        <div>
          <h3>Knowledge Check</h3>
          <p class="quiz-subtitle">Test your understanding — ${questions.length} questions</p>
        </div>
        <div class="quiz-score" id="${quizId}-score"></div>
      </div>
      <div class="quiz-questions-list">
        ${questions
          .map(
            (q, i) => `
          <div class="quiz-question-block" data-question="${i}">
            <p class="quiz-q-number">Question ${i + 1} of ${questions.length}</p>
            <p class="quiz-q-text">${q.question}</p>
            <div class="quiz-q-options">
              ${q.options
                .map(
                  (opt, j) => `
                <button class="quiz-q-option" data-qi="${i}" data-oi="${j}">
                  <span class="quiz-q-option-letter">${String.fromCharCode(65 + j)}</span>
                  <span>${opt}</span>
                </button>
              `,
                )
                .join('')}
            </div>
            <div class="quiz-q-feedback" id="${quizId}-fb-${i}"></div>
          </div>
        `,
          )
          .join('')}
      </div>
      <div class="quiz-result" id="${quizId}-result"></div>
    </div>
  `;
}

/** Bind click handlers to quiz options. Call after the quiz HTML is in the DOM. */
export function initInlineQuiz(
  quizId: string,
  topic: string,
  questions: QuizQuestion[],
): void {
  const container = document.getElementById(quizId);
  if (!container) return;

  let answered = 0;
  let correct = 0;

  container.querySelectorAll('.quiz-q-option').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const qi = parseInt(target.dataset.qi ?? '-1');
      const oi = parseInt(target.dataset.oi ?? '-1');
      const question = questions[qi];
      if (!question) return;

      // Prevent re-answering
      const block = target.closest('.quiz-question-block');
      if (block?.classList.contains('answered')) return;
      block?.classList.add('answered');

      const isCorrect = oi === question.correctIndex;
      if (isCorrect) correct++;
      answered++;

      // Highlight correct / wrong
      const options = block?.querySelectorAll('.quiz-q-option');
      options?.forEach((opt, i) => {
        (opt as HTMLButtonElement).disabled = true;
        if (i === question.correctIndex) opt.classList.add('quiz-option-correct');
        if (i === oi && !isCorrect) opt.classList.add('quiz-option-wrong');
      });

      // Show feedback
      const fb = document.getElementById(`${quizId}-fb-${qi}`);
      if (fb) {
        fb.textContent = isCorrect
          ? `✅ Correct! ${question.explanation}`
          : `❌ Not quite. ${question.explanation}`;
        fb.className = `quiz-q-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
      }

      // Update running score
      const scoreEl = document.getElementById(`${quizId}-score`);
      if (scoreEl) {
        scoreEl.textContent = `${correct}/${answered}`;
        scoreEl.style.display = 'flex';
      }

      // All questions answered → show summary + persist
      if (answered === questions.length) {
        const pct = Math.round((correct / questions.length) * 100);
        const passed = pct >= 70;
        const resultEl = document.getElementById(`${quizId}-result`);
        if (resultEl) {
          resultEl.innerHTML = `
            <div class="quiz-result-card ${passed ? 'result-pass' : 'result-fail'}">
              <span class="quiz-result-emoji">${passed ? '🎉' : '💪'}</span>
              <strong>${passed ? 'Great job!' : 'Keep practicing!'}</strong>
              <span>You scored ${correct}/${questions.length} (${pct}%)</span>
            </div>`;
        }

        // Show toast notification
        showToast({
          message: passed
            ? `🎉 You passed the ${topic} quiz! ${pct}%`
            : `Keep going! You scored ${pct}% on ${topic}.`,
          type: passed ? 'success' : 'warning',
          duration: 4500,
        });

        // Update home-page card status
        const statusEl = document.getElementById(`status-${topic}`);
        if (statusEl) {
          statusEl.textContent = passed ? '✅ Passed' : '❌ Try again';
          statusEl.className = `card-status ${passed ? 'status-passed' : 'status-failed'}`;
        }

        // Save to Firestore if logged in
        const user = getCurrentUser();
        if (user) {
          await saveQuizResult(user.uid, topic, passed);

          // Check if user just completed ALL modules → celebrate!
          if (passed) {
            const eligible = await isCertificateEligible(user.uid);
            if (eligible) {
              fireConfetti();
              showToast({
                message: '🎓 You earned your certificate! Download it from the navbar.',
                type: 'success',
                duration: 6000,
              });
            }
          }
        }
      }
    });
  });
}

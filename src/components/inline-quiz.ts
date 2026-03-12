// ── Inline Quiz Component ───────────────────────────────────────────────
// Renders a multi-question quiz inline on lesson pages.
// Each question shows instant feedback and the full quiz tracks a score.

import { getCurrentUser } from '../services/authService';
import { saveQuizResult, isCertificateEligible, getUserProfile } from '../services/userService';
import { onAuthChange } from '../services/authService';
import { getAiHintForQuiz } from '../services/functionsService';
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

  // ── Restore previous completion state ────────────────────────────────
  const restoreQuizState = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid);
      const result = profile?.quizProgress?.[topic];
      if (result) {
        const resultEl = document.getElementById(`${quizId}-result`);
        if (resultEl) {
          const passed = result.correct;
          const date = result.answeredAt ? new Date(result.answeredAt).toLocaleDateString() : '';
          resultEl.innerHTML = `
            <div class="quiz-result-card ${passed ? 'result-pass' : 'result-fail'}" style="margin-bottom: 1rem;">
              <span class="quiz-result-emoji">${passed ? '✅' : '🔄'}</span>
              <strong>${passed ? 'Previously Completed' : 'Previously Attempted'}</strong>
              <span>You ${passed ? 'passed' : 'did not pass'} this quiz${date ? ` on ${date}` : ''}. ${passed ? 'Feel free to review or retake it below.' : 'Try again below!'}</span>
            </div>`;
        }
      }
    } catch (err) {
      console.error('[quiz] Failed to restore quiz state:', err);
    }
  };

  // Try restoring immediately if user is already authenticated
  const user = getCurrentUser();
  if (user) {
    restoreQuizState(user.uid);
  } else {
    // Wait for auth to resolve, then restore
    const unsubscribe = onAuthChange((resolvedUser) => {
      if (resolvedUser) {
        restoreQuizState(resolvedUser.uid);
        unsubscribe();
      }
    });
    // Auto-cleanup after 5s to avoid lingering listeners
    setTimeout(() => unsubscribe(), 5000);
  }

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
        if (isCorrect) {
          fb.innerHTML = `✅ Correct! ${question.explanation}`;
          fb.className = 'quiz-q-feedback feedback-correct';
        } else {
          fb.innerHTML = `
            <div>❌ Not quite. ${question.explanation}</div>
            <button class="btn-ai-hint" id="${quizId}-hint-btn-${qi}">✨ Get AI Hint</button>
            <div class="ai-hint-box pfp-hidden" id="${quizId}-hint-box-${qi}"></div>
          `;
          fb.className = 'quiz-q-feedback feedback-wrong';

          // Bind AI Hint Button
          const hintBtn = document.getElementById(`${quizId}-hint-btn-${qi}`) as HTMLButtonElement;
          const hintBox = document.getElementById(`${quizId}-hint-box-${qi}`);
          
          if (hintBtn && hintBox) {
            hintBtn.addEventListener('click', async () => {
              const user = getCurrentUser();
              if (!user) {
                showToast({ message: 'Please sign in to use the AI Tutor.', type: 'warning' });
                return;
              }

              hintBtn.disabled = true;
              hintBtn.innerHTML = '<span class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px; border-top-color: currentColor;"></span> Thinking...';
              hintBox.classList.remove('pfp-hidden');
              hintBox.textContent = 'Asking Gemini...';

              try {
                const { hint, hintsRemaining } = await getAiHintForQuiz(
                  question.question,
                  question.options,
                  question.options[oi] // The user's wrong answer
                );
                hintBox.innerHTML = `<strong>🤖 AI Tutor:</strong> ${hint}`;
                hintBtn.innerHTML = '✨ Hint received';
                hintBtn.disabled = true;
                if (hintsRemaining <= 3) {
                  hintBox.innerHTML += `<p style="margin-top:8px;font-size:0.82rem;color:var(--text-muted);opacity:0.8;">💡 ${hintsRemaining} hint${hintsRemaining === 1 ? '' : 's'} remaining today</p>`;
                }
              } catch (error: unknown) {
                console.error('[AI Tutor] Failed:', error);
                const errCode = (error as { code?: string })?.code;
                if (errCode === 'functions/resource-exhausted') {
                  hintBox.innerHTML = `<em>🛑 You've used all your AI hints for today. Come back tomorrow!</em>`;
                  hintBtn.disabled = true;
                  hintBtn.innerHTML = '⏳ Daily limit reached';
                } else {
                  hintBox.innerHTML = `<em>Failed to get hint. Please try again later.</em>`;
                  hintBtn.disabled = false;
                  hintBtn.innerHTML = '✨ Try Again';
                }
              }
            });
          }
        }
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
        const saveForUser = async (uid: string) => {
          try {
            await saveQuizResult(uid, topic, passed);
            // Check if user just completed ALL modules → celebrate!
            if (passed) {
              const eligible = await isCertificateEligible(uid);
              if (eligible) {
                fireConfetti();
                showToast({
                  message: '🎓 You earned your certificate! Download it from your profile.',
                  type: 'success',
                  duration: 6000,
                });
              }
            }
          } catch (err) {
            console.error('[quiz] Failed to save result:', err);
            showToast({
              message: '⚠️ Could not save your quiz result. Please try again.',
              type: 'warning',
              duration: 5000,
            });
          }
        };

        const currentUser = getCurrentUser();
        if (currentUser) {
          await saveForUser(currentUser.uid);
        } else {
          // Auth may not have resolved yet (e.g., page was refreshed).
          // Wait briefly for the auth state to settle before giving up.
          const { onAuthChange: importedOnAuthChange } = await import('../services/authService');
          const saved = await new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => {
              authUnsub();
              resolve(false);
            }, 3000);
            const authUnsub = importedOnAuthChange(async (resolvedUser) => {
              if (resolvedUser) {
                clearTimeout(timeout);
                authUnsub();
                await saveForUser(resolvedUser.uid);
                resolve(true);
              }
            });
          });
          if (!saved) {
            showToast({
              message: '⚠️ Sign in to save your quiz progress!',
              type: 'warning',
              duration: 5000,
            });
          }
        }
      }
    });
  });
}

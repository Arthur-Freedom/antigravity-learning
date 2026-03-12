---
description: How to add or update quiz questions for a learning module
---

This workflow describes how to add or modify quiz questions for any learning module on the Antigravity Learning platform.

## Context

- Each module has 3 multiple-choice quiz questions embedded inline via `src/components/inline-quiz.ts`
- Quiz topics map to the `TOPIC` const in each page file (e.g. `workflows`, `skills`, `agents`, `prompts`, `context`, `mcp`, `tools`, `safety`, `projects`)
- A user needs ≥ 9 correct quizzes across all 9 modules to earn a certificate (`completedAll`)
- Each quiz result is saved to `quizProgress.{topic}` in the user's Firestore doc
- Passing threshold is **≥ 70%** (i.e. ≥ 2 of 3 correct per module)

## Data Flow (automatic — no code needed for these)

When a user completes a quiz, the following happens automatically via the existing code:

```
inline-quiz.ts → saveQuizResult(uid, topic, passed)
  → Writes quizProgress.{topic} to users/{uid}
  → Recalculates quizScore, quizTotal, completedAll
  → Awards 50 XP on first correct attempt
  → Recalculates level from XP
  → Firestore document update triggers:
      1. onUserDataWrite (validates/sanitises data)
      2. Leaderboard onSnapshot listener auto-refreshes
      3. If completedAll → onQuizCompletion sends congrats email
```

**You do NOT need to manually update `userService.ts` or `leaderboardService.ts`** for saving quiz results or refreshing the leaderboard. These are wired generically — any topic string works as long as it's in the valid topics list.

## Steps

1. **Open the target page file** at `src/pages/<module-name>.ts`

2. **Locate or define the quiz data** — it's a `QuizQuestion[]` array at the top of the file. Each question must follow this structure:
   ```typescript
   const quizQuestions: QuizQuestion[] = [
     {
       question: "The question text?",
       options: ["Option A", "Option B", "Option C", "Option D"],
       correctIndex: 1,     // 0-based index of the correct answer
       explanation: "Brief explanation shown after the user answers."
     },
     // ... exactly 3 questions per module
   ];
   ```

3. **Ensure exactly 3 questions** per module — the quiz component and scoring system expect this

4. **Wire the quiz rendering** — in the `render()` function, include:
   ```typescript
   ${renderInlineQuiz('quiz-<topic>', quizQuestions)}
   ```

5. **Wire the quiz initialization** — in the `init()` function, call:
   ```typescript
   initInlineQuiz('quiz-<topic>', TOPIC, quizQuestions);
   ```
   **Parameter order is: quizId, topic, questions** — NOT quizId, questions, topic.

6. **Ensure the TOPIC const** matches the route name and is a valid topic:
   ```typescript
   const TOPIC = '<module-name>';
   ```

7. **⚠️ CRITICAL: Register the topic as valid** — the `onUserDataWrite` Cloud Function validates quiz topics. An unrecognised topic will be **silently deleted**. Choose ONE:

   **Option A (preferred — no redeploy needed):**
   Add the topic to the Firestore `config/quizTopics` document:
   ```
   Collection: config
   Document: quizTopics
   Field: topics (array of strings)
   Value: ["workflows", "skills", "agents", "prompts", "context", "mcp", "tools", "safety", "projects", "<new-topic>"]
   ```
   Do this via the Firebase Console or Admin SDK. No function redeploy is needed.

   **Option B (fallback):**
   If no `config/quizTopics` doc exists, the function falls back to `FALLBACK_TOPICS` in `functions/src/index.ts`. Update that array and deploy:
   ```bash
   npm --prefix functions run build && npx firebase deploy --only functions
   ```

   > **Why this matters:** A previous bug caused modules 4-9 progress to be silently deleted because the deployed function didn't recognise those topics. This step prevents that from ever happening again.

8. **Add a module card** to `src/pages/home.ts`:
   - Add a new card in the modules grid section with title, description, image, and link
   - Include a `<span id="status-<topic>">` for quiz pass/fail status display

9. **Register the route** in `src/main.ts` (if this is a brand-new page):
   - Import: `import * as <name>Page from './pages/<name>'`
   - Route: `'/<path>': { render: <name>Page.render, init: <name>Page.init }`

10. **Add navigation links**:
    - Footer links in `src/main.ts`
    - Previous module's "Next Module →" nav link
    - New page's "← Back" nav link to previous module

11. **Verify the certificate threshold** in `src/services/userService.ts`:
    - `isCertificateEligible()` checks `correct >= 9`
    - If adding more modules (beyond 9), update this threshold accordingly
    - Also update `saveQuizResult()` where `completedAll = quizScore >= 9`
    - Also update `onUserDataWrite()` in `functions/src/index.ts` where `shouldBeComplete = correctCount >= 9`

12. **Update module count** in any stats/counters:
    - `src/pages/home.ts` — hero stats bar (e.g., "9 Modules")
    - Cloud Functions email templates that list all modules

// turbo
13. Run the TypeScript check: `npx tsc --noEmit`

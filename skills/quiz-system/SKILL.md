---
name: quiz-system
description: Deep knowledge of the inline quiz system — question format, scoring logic, XP awards, server-side validation, and certificate eligibility
---

# Quiz System — Complete Reference

The quiz system is the backbone of user progress tracking, spanning frontend components, Firestore storage, server-side validation, and email triggers.

## Architecture

```
User takes quiz
  → inline-quiz.ts renders quiz UI & handles answers
  → userService.saveQuizResult() writes to Firestore
  → onUserDataWrite (Cloud Function) validates & sanitises data
  → If completedAll becomes true:
      → onQuizCompletion (Cloud Function) sends congratulations email
```

## 1. Frontend Component

**File:** `src/components/inline-quiz.ts`

Two exported functions:

### `renderInlineQuiz(quizId, questions)` → returns HTML string
Call this inside the page's `render()` function:
```typescript
${renderInlineQuiz('quiz-workflows', quizQuestions)}
```

### `initInlineQuiz(quizId, topic, questions)` → binds event listeners
Call this inside the page's `init()` function:
```typescript
initInlineQuiz('quiz-workflows', TOPIC, quizQuestions);
```

**Note the parameter order:** `quizId` first, then `topic` string, then `questions` array.

On completion:
- **Passing threshold: ≥ 70%** (i.e. ≥ 2 of 3 correct)
- On pass: calls `saveQuizResult(uid, topic, true)` + fires confetti
- On fail: calls `saveQuizResult(uid, topic, false)`
- On wrong answers: shows an "✨ Get AI Hint" button that calls the `getAiHint` Cloud Function (Gemini API)
- Restores previous completion state on page load via `getUserProfile()`

### Question Data Format

```typescript
interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;  // 0-based index
  explanation: string;   // Shown after answering (correct or incorrect)
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "What is the primary purpose of workflows?",
    options: [
      "To replace human workers",
      "To automate repetitive tasks",     // ← correct
      "To generate random outputs",
      "To store large datasets",
    ],
    correctIndex: 1,
    explanation: "Workflows automate repetitive tasks with step-by-step recipes.",
  },
  // ... exactly 3 questions per module
];
```

## 2. Page Integration Pattern

Every lesson page follows this exact pattern:

```typescript
import { renderInlineQuiz, initInlineQuiz, type QuizQuestion } from '../components/inline-quiz';

const TOPIC = 'workflows';  // must match a VALID_TOPICS entry

const quizQuestions: QuizQuestion[] = [ /* ... 3 questions */ ];

export function render(): string {
  return `
    <article class="lesson-body">
      <!-- ... lesson content ... -->
      <section id="wf-quiz" class="lesson-section">
        ${renderInlineQuiz('quiz-workflows', quizQuestions)}
      </section>
    </article>
  `;
}

export function init(): void {
  initInlineQuiz('quiz-workflows', TOPIC, quizQuestions);
}
```

## 3. Firestore Storage

**Collection:** `users/{uid}`

```typescript
quizProgress: {
  "workflows": { correct: true, answeredAt: "2026-03-10T08:12:00Z" },
  "skills":    { correct: true, answeredAt: "2026-03-10T09:30:00Z" },
  "agents":    { correct: false, answeredAt: "2026-03-10T10:15:00Z" },
  // ... up to 9 topics
}
quizScore: 2        // count of correct results
quizTotal: 3        // count of total attempts
completedAll: false  // true when quizScore >= 9
```

## 4. Scoring & XP

**File:** `src/services/userService.ts` → `saveQuizResult()`

- On each quiz save, recalculates `quizScore` and `quizTotal` from `quizProgress`
- Awards **50 XP** for passing a quiz module (only on first correct attempt for that topic)
- Recalculates `level = Math.floor(Math.sqrt(xp / 100)) + 1`
- Sets `completedAll = quizScore >= 9`

## 5. Server-Side Validation

**File:** `functions/src/index.ts` → `onUserDataWrite()`

Validates every write to `users/{uid}`:
- Removes quiz topics not in `VALID_TOPICS` array
- Recalculates `quizScore`, `quizTotal`, `completedAll` from actual `quizProgress`
- Prevents score inflation by always recalculating from source data

**VALID_TOPICS:** `workflows`, `skills`, `agents`, `prompts`, `context`, `mcp`, `tools`, `safety`, `projects`

## 6. Certificate Eligibility

**File:** `src/services/userService.ts` → `isCertificateEligible()`

Returns `true` when a user has ≥ 9 correct quiz results. This triggers the certificate download button in `src/components/certificate.ts`.

## 7. Email Triggers

**File:** `functions/src/index.ts` → `onQuizCompletion()`

When `completedAll` transitions `false → true`:
1. Sends branded HTML congratulations email via Nodemailer/Gmail
2. Writes audit record to `mail/` collection
3. Stamps `congratsEmailSentAt` on user doc (duplicate prevention)

## Common Tasks

### Adding a new quiz module
1. Create quiz questions in the page file with the `QuizQuestion[]` type
2. Use `renderInlineQuiz('quiz-<topic>', questions)` in `render()`
3. Use `initInlineQuiz('quiz-<topic>', '<topic>', questions)` in `init()`
4. Add topic to `VALID_TOPICS` in `functions/src/index.ts`
5. Update the completion threshold if needed (currently `>= 9`)

### Debugging quiz scoring
1. Check browser console for `[userService] Saved quiz result` logs
2. Check Firestore `users/{uid}` for the `quizProgress` map
3. Check Cloud Functions logs for sanitisation corrections

// ── Learning Streak Component ───────────────────────────────────────────
// Renders a visual streak widget: 🔥 count, 7-day heatmap, and a
// "Continue where you left off" card pointing to the next module.
// Used on the home page progress section when the user is logged in.

import { MODULE_KEYS, MODULE_META, type ModuleKey } from '../constants/modules'

export interface StreakData {
  streak: number
  lastLoginDate: string | null // "YYYY-MM-DD"
  quizProgress: Record<string, { correct: boolean }> | null
}

/**
 * Determines which module the user should do next.
 * Returns the first module they haven't passed, or null if all are done.
 */
export function getNextModule(
  quizProgress: Record<string, { correct: boolean }> | null,
): { key: ModuleKey; label: string; icon: string; href: string } | null {
  for (const key of MODULE_KEYS) {
    if (!quizProgress?.[key]?.correct) {
      return { key, ...MODULE_META[key] }
    }
  }
  return null
}

/**
 * Returns an array of 7 day labels with active/inactive status
 * for the heatmap visualization.
 */
function buildWeekHeatmap(lastLoginDate: string | null): { day: string; active: boolean }[] {
  const today = new Date()
  const days: { day: string; active: boolean }[] = []
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // We can only mark "today" as active if lastLoginDate matches today's date
  const todayStr = today.toISOString().slice(0, 10)

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    days.push({
      day: dayNames[d.getDay()],
      // Mark as active if it's today and user logged in today,
      // or if the date falls within the streak period ending at lastLoginDate
      active: isWithinStreak(dateStr, lastLoginDate, todayStr),
    })
  }

  return days
}

function isWithinStreak(dateStr: string, lastLoginDate: string | null, todayStr: string): boolean {
  if (!lastLoginDate) return false

  // If the user's last login was today, check if dateStr is within current streak
  // This is a simplified heatmap — we light up consecutive days ending at lastLoginDate
  const loginDate = new Date(lastLoginDate + 'T00:00:00Z')
  const checkDate = new Date(dateStr + 'T00:00:00Z')
  const todayDate = new Date(todayStr + 'T00:00:00Z')

  // Only mark days up to the last login date
  if (checkDate > loginDate) return false

  // For simplicity, we mark all days from today - 6 up to lastLoginDate
  // A more accurate version would check each day in Firestore activity log
  return checkDate <= loginDate && checkDate >= todayDate
    ? checkDate.toISOString().slice(0, 10) <= lastLoginDate
    : false
}

/**
 * Renders the streak widget HTML.
 */
export function renderStreakWidget(data: StreakData): string {
  const { streak, lastLoginDate, quizProgress } = data
  const nextModule = getNextModule(quizProgress)
  const heatmap = buildWeekHeatmap(lastLoginDate)

  const streakLabel = streak === 1 ? '1 day' : `${streak} days`
  const streakClass = streak >= 7 ? 'streak-fire' : streak >= 3 ? 'streak-warm' : 'streak-cold'

  return `
    <div class="streak-widget">
      <!-- Streak Counter -->
      <div class="streak-counter ${streakClass}">
        <span class="streak-flame">${streak > 0 ? '🔥' : '❄️'}</span>
        <div class="streak-info">
          <span class="streak-count">${streak > 0 ? streakLabel : 'No streak'}</span>
          <span class="streak-sublabel">${streak > 0 ? 'learning streak' : 'Log in daily to start a streak!'}</span>
        </div>
      </div>

      <!-- 7-Day Heatmap -->
      <div class="streak-heatmap">
        ${heatmap
          .map(
            (d) => `
          <div class="heatmap-day ${d.active ? 'heatmap-active' : ''}">
            <span class="heatmap-dot"></span>
            <span class="heatmap-label">${d.day}</span>
          </div>
        `,
          )
          .join('')}
      </div>

      ${
        nextModule
          ? `
      <!-- Continue Where You Left Off -->
      <a href="${nextModule.href}" class="continue-card" id="continue-learning-card">
        <div class="continue-icon">${nextModule.icon}</div>
        <div class="continue-info">
          <span class="continue-label">Continue learning</span>
          <span class="continue-module">${nextModule.label}</span>
        </div>
        <span class="continue-arrow">→</span>
      </a>
      `
          : `
      <div class="continue-card continue-complete">
        <div class="continue-icon">🎓</div>
        <div class="continue-info">
          <span class="continue-label">All modules complete!</span>
          <span class="continue-module">Download your certificate</span>
        </div>
        <span class="continue-arrow">🏆</span>
      </div>
      `
      }
    </div>
  `
}

// ── Leaderboard Page ────────────────────────────────────────────────────
import { getLeaderboard, type LeaderboardEntry } from '../db'
import { getCurrentUser } from '../auth'

export function render(): string {
  return `
    <section class="lesson-hero" style="background: linear-gradient(135deg, #1a1d20, #283A4A);">
      <div class="lesson-hero-content">
        <span class="lesson-badge">Competition</span>
        <h1>Leaderboard</h1>
        <p>See how you rank against other learners. Complete all 3 modules to earn a certificate!</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-primary);">
      <div class="leaderboard-container">
        <div id="leaderboard-loading" class="leaderboard-loading">
          <div class="loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
        <div id="leaderboard-content" style="display: none;"></div>
      </div>
    </section>
  `
}

export function init(): void {
  loadLeaderboard()
}

async function loadLeaderboard(): Promise<void> {
  const entries = await getLeaderboard(20)
  const currentUser = getCurrentUser()

  const loadingEl = document.getElementById('leaderboard-loading')
  const contentEl = document.getElementById('leaderboard-content')
  if (!loadingEl || !contentEl) return

  loadingEl.style.display = 'none'
  contentEl.style.display = 'block'

  if (entries.length === 0) {
    contentEl.innerHTML = `
      <div class="leaderboard-empty">
        <span class="leaderboard-empty-icon">🏆</span>
        <h3>No entries yet</h3>
        <p>Be the first to complete a quiz and claim the #1 spot!</p>
        <a href="#/" class="btn btn-primary">Start Learning</a>
      </div>
    `
    return
  }

  const currentUserRank = currentUser 
    ? entries.findIndex(e => e.uid === currentUser.uid) + 1 
    : 0

  contentEl.innerHTML = `
    ${currentUser && currentUserRank > 0 ? `
      <div class="leaderboard-your-rank">
        <span class="your-rank-label">Your Rank</span>
        <span class="your-rank-number">#${currentUserRank}</span>
        <span class="your-rank-score">${entries[currentUserRank - 1].score}/3 modules passed</span>
      </div>
    ` : ''}

    <div class="leaderboard-table">
      <div class="leaderboard-header">
        <span class="lb-col-rank">Rank</span>
        <span class="lb-col-user">Learner</span>
        <span class="lb-col-score">Score</span>
        <span class="lb-col-badge">Status</span>
      </div>
      ${entries.map((entry, i) => renderRow(entry, i, currentUser?.uid)).join('')}
    </div>
  `
}

function renderRow(entry: LeaderboardEntry, index: number, currentUid?: string): string {
  const rank = index + 1
  const isCurrentUser = entry.uid === currentUid
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`

  return `
    <div class="leaderboard-row ${isCurrentUser ? 'lb-row-you' : ''} ${rank <= 3 ? 'lb-row-top3' : ''} reveal-on-scroll">
      <span class="lb-col-rank lb-rank-${rank <= 3 ? 'medal' : 'num'}">${medal}</span>
      <span class="lb-col-user">
        ${entry.photoURL 
          ? `<img src="${entry.photoURL}" alt="${entry.displayName}" class="lb-avatar" referrerpolicy="no-referrer" />`
          : `<span class="lb-avatar-placeholder">${entry.displayName.charAt(0).toUpperCase()}</span>`
        }
        <span class="lb-name">${entry.displayName}${isCurrentUser ? ' <span class="lb-you-badge">You</span>' : ''}</span>
      </span>
      <span class="lb-col-score">
        <span class="lb-score-bar">
          <span class="lb-score-fill" style="width: ${(entry.score / 3) * 100}%"></span>
        </span>
        <span class="lb-score-text">${entry.score}/3</span>
      </span>
      <span class="lb-col-badge">
        ${entry.completedAll 
          ? '<span class="lb-badge-complete">🎓 Certified</span>' 
          : '<span class="lb-badge-progress">In Progress</span>'
        }
      </span>
    </div>
  `
}

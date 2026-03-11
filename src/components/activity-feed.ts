// ── Live Activity Feed ──────────────────────────────────────────────────
// Shows real-time "X just completed Y" notifications.
// Uses leaderboardService — ZERO direct Firebase imports.

import { onActivityFeedUpdate } from '../services/leaderboardService'

let unsub: (() => void) | null = null

/**
 * Returns the HTML for the activity feed container.
 */
export function renderActivityFeed(): string {
  return `
    <div class="activity-feed" id="activity-feed">
      <div class="activity-feed-header">
        <span class="activity-feed-dot"></span>
        <span class="activity-feed-title">Live Activity</span>
      </div>
      <div class="activity-feed-list" id="activity-feed-list">
        <div class="activity-feed-empty">Waiting for activity...</div>
      </div>
    </div>
  `
}

/**
 * Starts listening for user updates and populating the activity feed.
 */
export function initActivityFeed(): void {
  // Guard against double-initialization (prevents listener leaks)
  if (unsub) {
    unsub()
    unsub = null
  }

  const listEl = document.getElementById('activity-feed-list')
  if (!listEl) return

  unsub = onActivityFeedUpdate(5, (items) => {
    if (items.length === 0) {
      listEl.innerHTML = '<div class="activity-feed-empty">No activity yet — be the first!</div>'
      return
    }

    listEl.innerHTML = items
      .map((item) => {
        const timeAgo = getTimeAgo(item.timestamp)
        const topicLabel = formatTopic(item.topic)
        return `
          <div class="activity-item">
            <span class="activity-icon">${item.passed ? '✅' : '📝'}</span>
            <span class="activity-text">
              <strong>${item.name}</strong> ${item.passed ? 'passed' : 'attempted'} <em>${topicLabel}</em>
            </span>
            <span class="activity-time">${timeAgo}</span>
          </div>
        `
      })
      .join('')
  }, (err) => {
    console.error('[activity-feed] Listener error:', err)
  })
}

/**
 * Detaches the Firestore listener.
 */
export function destroyActivityFeed(): void {
  if (unsub) {
    unsub()
    unsub = null
  }
}

function formatTopic(topic: string): string {
  const map: Record<string, string> = {
    workflows: 'Workflows',
    skills: 'Skills',
    agents: 'Agents',
  }
  return map[topic] ?? topic.charAt(0).toUpperCase() + topic.slice(1)
}

function getTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

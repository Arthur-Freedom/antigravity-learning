// ── Live Activity Feed ──────────────────────────────────────────────────
// Shows real-time "X just completed Y" notifications using Firestore
// onSnapshot. Displays the latest quiz completions as a ticker.

import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  type Unsubscribe,
} from 'firebase/firestore'
import { initializeApp, getApps, getApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)

interface ActivityItem {
  name: string
  topic: string
  passed: boolean
  timestamp: string
}

let unsub: Unsubscribe | null = null

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
  const listEl = document.getElementById('activity-feed-list')
  if (!listEl) return

  // Listen to the 10 most recently updated users
  const usersRef = collection(db, 'users')
  const q = query(usersRef, orderBy('updatedAt', 'desc'), limit(10))

  unsub = onSnapshot(q, (snapshot) => {
    const items: ActivityItem[] = []

    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      const progress = data.quizProgress ?? {}
      const name = (data.displayName ?? 'Someone').split(' ')[0]

      // Find the most recently answered quiz
      let latestTopic = ''
      let latestTime = ''
      let latestPassed = false

      for (const [topic, result] of Object.entries(progress)) {
        const r = result as { correct: boolean; answeredAt: string }
        if (!latestTime || r.answeredAt > latestTime) {
          latestTime = r.answeredAt
          latestTopic = topic
          latestPassed = r.correct
        }
      }

      if (latestTopic) {
        items.push({
          name,
          topic: formatTopic(latestTopic),
          passed: latestPassed,
          timestamp: latestTime,
        })
      }
    })

    // Sort by timestamp desc
    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

    if (items.length === 0) {
      listEl.innerHTML = '<div class="activity-feed-empty">No activity yet — be the first!</div>'
      return
    }

    listEl.innerHTML = items
      .slice(0, 5)
      .map((item) => {
        const timeAgo = getTimeAgo(item.timestamp)
        return `
          <div class="activity-item">
            <span class="activity-icon">${item.passed ? '✅' : '📝'}</span>
            <span class="activity-text">
              <strong>${item.name}</strong> ${item.passed ? 'passed' : 'attempted'} <em>${item.topic}</em>
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

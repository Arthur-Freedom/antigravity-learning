// ── Certificate Generator ───────────────────────────────────────────────
// Generates a downloadable certificate using Canvas API.
// No external dependencies — pure browser-side rendering.

import { getCurrentUser } from '../services/authService'
import { isCertificateEligible, getUserProfile } from '../services/userService'
import { showToast } from './toast'

/**
 * Draw text with letter spacing.
 */
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: 'center' | 'left' | 'right' = 'center'
): void {
  ctx.textAlign = align
  ctx.letterSpacing = `${spacing}px`
  ctx.fillText(text, x, y)
  // Reset letter spacing since it's global
  ctx.letterSpacing = '0px'
}

let isGenerating = false

/**
 * Generates a premium completion certificate as a PNG download.
 */
export async function downloadCertificate(): Promise<void> {
  if (isGenerating) return
  isGenerating = true

  const user = getCurrentUser()
  if (!user) {
    showToast({ message: 'Please sign in to download your certificate', type: 'warning' })
    isGenerating = false
    return
  }

  const eligible = await isCertificateEligible(user.uid)
  if (!eligible) {
    showToast({ message: 'Complete all 9 modules to earn your certificate!', type: 'info' })
    isGenerating = false
    return
  }

  const profile = await getUserProfile(user.uid)
  const name = profile?.displayName ?? user.displayName ?? 'Learner'

  showToast({ message: 'Generating your certificate...', type: 'info' })

  // Defer heavy canvas work to avoid blocking the UI
  await new Promise<void>((resolve) => setTimeout(resolve, 50))

  try {
    const blob = await generateCertificateBlob(name)
    if (!blob) {
      showToast({ message: 'Failed to generate certificate', type: 'error' })
      return
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `antigravity-certificate-${name.toLowerCase().replace(/\s+/g, '-')}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    showToast({ message: '🎓 Certificate downloaded!', type: 'success' })

    // Show social sharing modal
    showShareModal(name)
  } catch (err) {
    console.error('[certificate] Generation failed:', err)
    showToast({ message: 'Certificate generation failed. Please try again.', type: 'error' })
  } finally {
    isGenerating = false
  }
}

/** Renders the certificate to a canvas and returns a PNG blob */
function generateCertificateBlob(name: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const W = 1600
    const H = 1100
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // ── Background ──────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#f8fafc')
    bg.addColorStop(1, '#e2e8f0')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // ── Border ──────────────────────────────────
    ctx.strokeStyle = '#283A4A'
    ctx.lineWidth = 6
    ctx.strokeRect(40, 40, W - 80, H - 80)

    // Inner gold accent border
    ctx.strokeStyle = '#d4a853'
    ctx.lineWidth = 2
    ctx.strokeRect(55, 55, W - 110, H - 110)

    // ── Corner decorations ──────────────────────
    const corners = [
      [65, 65], [W - 65, 65], [65, H - 65], [W - 65, H - 65]
    ]
    ctx.fillStyle = '#d4a853'
    corners.forEach(([x, y]) => {
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.fill()
    })

    // ── Header ──────────────────────────────────
    ctx.fillStyle = '#94a3b8'
    ctx.font = '600 14px Inter, system-ui'
    drawSpacedText(ctx, 'ANTIGRAVITY LEARNING', W / 2, 140, 6)

    // Certificate title
    ctx.fillStyle = '#283A4A'
    ctx.font = '700 52px Montserrat, system-ui'
    drawSpacedText(ctx, 'CERTIFICATE', W / 2, 220, 4)

    ctx.fillStyle = '#64748b'
    ctx.font = '400 20px Inter, system-ui'
    drawSpacedText(ctx, 'OF COMPLETION', W / 2, 260, 3)

    // ── Divider ─────────────────────────────────
    ctx.strokeStyle = '#d4a853'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W / 2 - 120, 300)
    ctx.lineTo(W / 2 + 120, 300)
    ctx.stroke()

    // Diamond accent
    ctx.fillStyle = '#d4a853'
    ctx.save()
    ctx.translate(W / 2, 300)
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-5, -5, 10, 10)
    ctx.restore()

    // ── Presented to ────────────────────────────
    ctx.fillStyle = '#94a3b8'
    ctx.font = '400 18px Inter, system-ui'
    drawSpacedText(ctx, 'THIS CERTIFICATE IS PROUDLY PRESENTED TO', W / 2, 380, 2)

    // ── Name ────────────────────────────────────
    ctx.fillStyle = '#283A4A'
    ctx.font = '700 48px Montserrat, system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(name.toUpperCase(), W / 2, 460)

    // Name underline
    const nameWidth = ctx.measureText(name.toUpperCase()).width
    ctx.strokeStyle = '#d4a853'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W / 2 - nameWidth / 2 - 20, 480)
    ctx.lineTo(W / 2 + nameWidth / 2 + 20, 480)
    ctx.stroke()

    // ── Description ─────────────────────────────
    ctx.fillStyle = '#64748b'
    ctx.font = '400 18px Inter, system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(
      'For successfully completing all modules in the Antigravity Learning Program',
      W / 2, 540
    )
    ctx.fillText(
      'including Workflows, Skills, and Autonomous Agents.',
      W / 2, 570
    )

    // ── Modules badges ──────────────────────────
    const modules = ['Workflows', 'Skills', 'Autonomous Agents']
    const badgeY = 640
    const badgeSpacing = 180
    const startX = W / 2 - (modules.length - 1) * badgeSpacing / 2

    modules.forEach((mod, i) => {
      const x = startX + i * badgeSpacing

      // Badge background
      ctx.fillStyle = '#283A4A'
      roundRect(ctx, x - 65, badgeY - 18, 130, 36, 18)
      ctx.fill()

      // Badge text
      ctx.fillStyle = '#ffffff'
      ctx.font = '600 13px Inter, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`✓ ${mod}`, x, badgeY + 5)
    })

    // ── Date & ID ───────────────────────────────
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const certId = `AG-${Date.now().toString(36).toUpperCase()}`

    ctx.fillStyle = '#94a3b8'
    ctx.font = '400 15px Inter, system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(`Date: ${today}`, 120, H - 140)
    ctx.fillText(`Certificate ID: ${certId}`, 120, H - 115)

    // ── Signature area ──────────────────────────
    ctx.textAlign = 'right'
    ctx.strokeStyle = '#283A4A'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W - 350, H - 140)
    ctx.lineTo(W - 120, H - 140)
    ctx.stroke()

    ctx.fillStyle = '#64748b'
    ctx.font = '400 14px Inter, system-ui'
    ctx.fillText('Antigravity Learning Platform', W - 120, H - 115)

    // ── AI-generated signature ──────────────────
    ctx.fillStyle = '#283A4A'
    ctx.font = 'italic 28px Georgia, serif'
    ctx.fillText('Antigravity AI', W - 160, H - 155)

    // ── Export as blob ──────────────────────────
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

/** Helper for rounded rectangles */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── Social Share Modal ──────────────────────────────────────────────────

function showShareModal(name: string): void {
  // Prevent duplicates
  if (document.querySelector('.share-modal-overlay')) return

  const siteUrl = 'https://antigravity-learning.web.app'
  const tweetText = encodeURIComponent(
    `🎓 I just earned my Antigravity Learning certificate! Mastered Workflows, Skills, and Autonomous Agents.\n\n${siteUrl}`
  )
  const linkedInUrl = encodeURIComponent(siteUrl)
  const linkedInTitle = encodeURIComponent('Antigravity Learning Certificate')
  const linkedInSummary = encodeURIComponent(
    `${name} has completed all modules on Antigravity Learning, earning a certificate in AI Agent Development.`
  )

  const overlay = document.createElement('div')
  overlay.className = 'share-modal-overlay'
  overlay.innerHTML = `
    <div class="share-modal" role="dialog" aria-label="Share your achievement">
      <button class="share-modal-close">&times;</button>
      <div class="share-modal-icon">🎉</div>
      <h3>Share Your Achievement!</h3>
      <p>Let the world know you've earned your certificate.</p>
      <div class="share-modal-buttons">
        <a href="https://twitter.com/intent/tweet?text=${tweetText}"
           target="_blank" rel="noopener noreferrer"
           class="share-btn share-btn-twitter">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Share on X
        </a>
        <a href="https://www.linkedin.com/shareArticle?mini=true&url=${linkedInUrl}&title=${linkedInTitle}&summary=${linkedInSummary}"
           target="_blank" rel="noopener noreferrer"
           class="share-btn share-btn-linkedin">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Share on LinkedIn
        </a>
      </div>
    </div>
  `

  document.body.appendChild(overlay)
  requestAnimationFrame(() => overlay.classList.add('share-modal-visible'))

  const close = () => {
    overlay.classList.remove('share-modal-visible')
    setTimeout(() => overlay.remove(), 250)
  }

  overlay.querySelector('.share-modal-close')!.addEventListener('click', close)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })
}

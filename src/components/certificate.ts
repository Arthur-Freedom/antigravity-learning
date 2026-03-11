// ── Certificate Generator ───────────────────────────────────────────────
// Generates a downloadable certificate using Canvas API.
// No external dependencies — pure browser-side rendering.

import { getCurrentUser } from '../auth'
import { isCertificateEligible, getUserProfile } from '../db'
import { showToast } from './toast'

/**
 * Draw text with manual letter spacing (avoids ctx.letterSpacing which
 * freezes some browsers).
 */
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: 'center' | 'left' | 'right' = 'center'
): void {
  if (spacing <= 0) {
    ctx.textAlign = align
    ctx.fillText(text, x, y)
    return
  }

  const totalExtraWidth = spacing * (text.length - 1)
  const baseWidth = ctx.measureText(text).width
  const fullWidth = baseWidth + totalExtraWidth

  let startX: number
  if (align === 'center') {
    startX = x - fullWidth / 2
  } else if (align === 'right') {
    startX = x - fullWidth
  } else {
    startX = x
  }

  ctx.textAlign = 'left'
  let curX = startX
  for (const char of text) {
    ctx.fillText(char, curX, y)
    curX += ctx.measureText(char).width + spacing
  }
}

/**
 * Generates a premium completion certificate as a PNG download.
 */
export async function downloadCertificate(): Promise<void> {
  const user = getCurrentUser()
  if (!user) {
    showToast({ message: 'Please sign in to download your certificate', type: 'warning' })
    return
  }

  const eligible = await isCertificateEligible(user.uid)
  if (!eligible) {
    showToast({ message: 'Complete all 3 modules to earn your certificate!', type: 'info' })
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
  } catch (err) {
    console.error('[certificate] Generation failed:', err)
    showToast({ message: 'Certificate generation failed. Please try again.', type: 'error' })
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

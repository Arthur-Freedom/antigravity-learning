// ── Confetti Animation ──────────────────────────────────────────────────
// Full-screen canvas confetti burst. Zero dependencies.
// Usage: import { fireConfetti } from './confetti'; fireConfetti();

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
}

const COLORS = [
  '#3178C6', '#6366f1', '#a855f7', '#ec4899',
  '#f59e0b', '#16a34a', '#ef4444', '#14b8a6',
  '#f97316', '#8b5cf6',
];

/**
 * Fire a confetti burst from the center-top of the viewport.
 * Automatically cleans up after the animation finishes.
 */
export function fireConfetti(): void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    pointer-events: none; width: 100%; height: 100%;
  `;
  document.body.appendChild(canvas);

  const W = window.innerWidth;
  const H = window.innerHeight;

  // Set canvas size to CSS pixels (skip DPR — confetti doesn't need retina)
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d')!;

  const particles: Particle[] = [];
  const COUNT = 80;

  for (let i = 0; i < COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: W / 2,
      y: H * 0.35,
      vx: Math.cos(angle) * speed * (0.5 + Math.random()),
      vy: Math.sin(angle) * speed - 3 - Math.random() * 4,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    });
  }

  let frame = 0;
  const MAX_FRAMES = 180; // ~3 seconds at 60fps
  let rafId = 0;

  function animate() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.14; // gravity
      p.vx *= 0.99; // air resistance
      p.rotation += p.rotationSpeed;

      // Fade out in the last 50 frames
      if (frame > MAX_FRAMES - 50) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (frame < MAX_FRAMES) {
      rafId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafId);
      canvas.remove();
    }
  }

  rafId = requestAnimationFrame(animate);
}

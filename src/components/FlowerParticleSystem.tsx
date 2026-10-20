import { useEffect, useRef } from 'react'
import { audio } from '../lib/audio'
import { drawFlower, heartPoints, randomFlowerStyle, renderFlowerSprite, spring, type FlowerStyle } from '../lib/flowers'
import { perf } from '../lib/perf'

interface Flower {
  x: number
  y: number
  sx: number
  sy: number
  tx: number
  ty: number
  moveStart: number
  moveDur: number
  style: FlowerStyle
  r: number
  born: number
  phase: number
  baseRot: number
  pinned: boolean
  dieAt: number
  sprite?: HTMLCanvasElement
  spriteDpr?: number
}

interface Glow {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
}

interface Props {
  /** Called with the (rounded) number of flower interactions so far. */
  onProgress?: (n: number) => void
  /** When true, flowers gather into a heart. */
  heartMode: boolean
  onHeartFormed?: () => void
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Canvas garden: every touch blooms a flower exactly where it lands.
 * Supports multi-touch (pointer events), drag trails and mouse.
 */
export function FlowerParticleSystem({ onProgress, heartMode, onHeartFormed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flowers = useRef<Flower[]>([])
  const glows = useRef<Glow[]>([])
  const count = useRef(0)
  const size = useRef({ w: 0, h: 0, dpr: 1 })
  const cb = useRef({ onProgress, onHeartFormed })
  cb.current = { onProgress, onHeartFormed }

  // Main render loop + input
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const glowSprite = document.createElement('canvas')
    glowSprite.width = glowSprite.height = 64
    {
      const g = glowSprite.getContext('2d')!
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
      grad.addColorStop(0, 'rgba(255,252,230,1)')
      grad.addColorStop(0.3, 'rgba(255,226,160,0.7)')
      grad.addColorStop(1, 'rgba(255,200,170,0)')
      g.fillStyle = grad
      g.fillRect(0, 0, 64, 64)
    }

    // Use the untransformed layout size: scene transitions scale the parent,
    // which would otherwise skew the canvas resolution and touch mapping.
    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, perf.maxDpr)
      size.current = { w, h, dpr }
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const bloom = (x: number, y: number, tap: boolean) => {
      const now = performance.now()
      const r = tap ? 24 + Math.random() * 16 : 14 + Math.random() * 10
      const f: Flower = {
        x,
        y,
        sx: x,
        sy: y,
        tx: x,
        ty: y,
        moveStart: 0,
        moveDur: 0,
        style: randomFlowerStyle(),
        r,
        born: now,
        phase: Math.random() * 6.28,
        baseRot: (Math.random() - 0.5) * 0.7,
        pinned: false,
        dieAt: now + 4200 + Math.random() * 1600,
      }
      const list = flowers.current
      list.push(f)
      if (list.length > perf.maxFlowers) {
        const idx = list.findIndex((fl) => !fl.pinned)
        if (idx >= 0) list.splice(idx, 1)
      }
      const n = Math.round((tap ? 10 : 4) * perf.particleScale + 2)
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 40 + Math.random() * 110
        glows.current.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life: 0, max: 0.6 + Math.random() * 0.7, size: 6 + Math.random() * 10 })
      }
      if (glows.current.length > perf.maxParticles) glows.current.splice(0, glows.current.length - perf.maxParticles)
      audio.sfx('bloom')
      count.current += tap ? 1 : 0.34
      cb.current.onProgress?.(Math.floor(count.current))
    }

    const active = new Map<number, { x: number; y: number }>()
    const pos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const sx = rect.width ? size.current.w / rect.width : 1
      const sy = rect.height ? size.current.h / rect.height : 1
      return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy }
    }
    const down = (e: PointerEvent) => {
      e.preventDefault()
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      const p = pos(e)
      active.set(e.pointerId, p)
      bloom(p.x, p.y, true)
    }
    const move = (e: PointerEvent) => {
      const last = active.get(e.pointerId)
      if (!last) return
      const p = pos(e)
      const d = Math.hypot(p.x - last.x, p.y - last.y)
      if (d >= 34) {
        active.set(e.pointerId, p)
        bloom(p.x, p.y, false)
      }
    }
    const up = (e: PointerEvent) => {
      active.delete(e.pointerId)
    }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.addEventListener('lostpointercapture', up)

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { w, h, dpr } = size.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // flowers
      const list = flowers.current
      let j = 0
      for (let i = 0; i < list.length; i++) {
        const f = list[i]
        if (!f.pinned && now > f.dieAt + 800) continue
        list[j++] = f
        const age = (now - f.born) / 1000
        if (age < 0) continue
        const open = perf.reducedMotion ? clamp01(age * 3) : spring(age * 1.25)
        if (f.moveDur) {
          const e = easeInOut(clamp01((now - f.moveStart) / f.moveDur))
          f.x = f.sx + (f.tx - f.sx) * e
          f.y = f.sy + (f.ty - f.sy) * e - Math.sin(e * Math.PI) * 30
        }
        let alpha = 1
        let scale = 1
        if (!f.pinned && now > f.dieAt) {
          const k = 1 - clamp01((now - f.dieAt) / 800)
          alpha = k
          scale = 0.85 + 0.15 * k
        }
        if (f.pinned && f.moveDur && now > f.moveStart + f.moveDur) scale = 1 + Math.sin(now / 420 + f.phase) * 0.05
        const sway = perf.reducedMotion ? 0 : Math.sin(now / 900 + f.phase) * 0.09
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(f.x, f.y)
        ctx.rotate(f.baseRot + sway)
        ctx.scale(scale, scale)
        if (age > 1.6) {
          if (!f.sprite || f.spriteDpr !== dpr) {
            f.sprite = renderFlowerSprite(f.style, f.r, dpr)
            f.spriteDpr = dpr
          }
          const s = f.sprite.width / dpr
          ctx.drawImage(f.sprite, -s / 2, -s / 2, s, s)
        } else {
          drawFlower(ctx, f.style, f.r, open)
        }
        ctx.restore()
      }
      list.length = j

      // glow particles
      const gl = glows.current
      let k = 0
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < gl.length; i++) {
        const g = gl[i]
        g.life += dt
        if (g.life >= g.max) continue
        gl[k++] = g
        g.vx *= 1 - 2.5 * dt
        g.vy = g.vy * (1 - 2.5 * dt) - 10 * dt
        g.x += g.vx * dt
        g.y += g.vy * dt
        const t = g.life / g.max
        ctx.globalAlpha = (1 - t) * 0.9
        const s = g.size * (0.6 + 0.4 * (1 - t))
        ctx.drawImage(glowSprite, g.x - s, g.y - s, s * 2, s * 2)
      }
      gl.length = k
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('lostpointercapture', up)
    }
  }, [])

  // Gather into a heart
  useEffect(() => {
    if (!heartMode) return
    const { w, h } = size.current
    const now = performance.now()
    const n = perf.degraded ? 22 : 30
    const S = Math.min(w * 0.44, h * 0.27)
    const cx = w / 2
    const cy = h * 0.47 - S * 0.26
    const targets = heartPoints(n).map((p) => ({ x: cx + p.x * S, y: cy + p.y * S }))
    const pool = flowers.current.filter((f) => f.born <= now)
    const used = new Set<Flower>()
    targets.forEach((t, i) => {
      let best: Flower | undefined
      let bd = Infinity
      for (const f of pool) {
        if (used.has(f)) continue
        const d = (f.x - t.x) ** 2 + (f.y - t.y) ** 2
        if (d < bd) {
          bd = d
          best = f
        }
      }
      const delay = i * 28
      if (!best) {
        const a = Math.random() * Math.PI * 2
        best = {
          x: cx + Math.cos(a) * w,
          y: cy + Math.sin(a) * h * 0.6,
          sx: 0,
          sy: 0,
          tx: 0,
          ty: 0,
          moveStart: 0,
          moveDur: 0,
          style: randomFlowerStyle(i % 2 ? 'cherry' : i % 3 ? 'rose' : 'wild'),
          r: 20,
          born: now + delay,
          phase: Math.random() * 6.28,
          baseRot: 0,
          pinned: true,
          dieAt: Infinity,
        }
        best.x = t.x + (Math.random() - 0.5) * 60
        best.y = t.y + (Math.random() - 0.5) * 60
        flowers.current.push(best)
      }
      used.add(best)
      best.pinned = true
      best.dieAt = Infinity
      best.sx = best.x
      best.sy = best.y
      best.tx = t.x
      best.ty = t.y
      best.moveStart = now + delay
      best.moveDur = 1500
      if (best.style.type === 'tulip') best.style = randomFlowerStyle('rose')
      best.r = Math.max(15, Math.min(best.r, 24))
      best.sprite = undefined
    })
    for (const f of flowers.current) if (!used.has(f)) f.dieAt = Math.min(f.dieAt, now + 200)
    const t = window.setTimeout(() => cb.current.onHeartFormed?.(), 1500 + n * 28 + 200)
    return () => clearTimeout(t)
  }, [heartMode])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ touchAction: 'none' }} aria-label="Chạm để hoa nở" />
}

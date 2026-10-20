import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { heartPath } from '../lib/flowers'
import { perf } from '../lib/perf'

type Kind = 'petal' | 'heart' | 'sparkle' | 'light'

interface P {
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  size: number
  life: number
  maxLife: number
  color: string
  sway: number
  ambient: boolean
}

export interface BurstOptions {
  x: number
  y: number
  kind?: Kind
  count?: number
  spread?: number
  speed?: number
  /** 'up' makes particles float upwards (hearts), 'radial' explodes outwards, 'swirl' spirals. */
  mode?: 'up' | 'radial' | 'swirl'
}

export interface FxApi {
  burst: (o: BurstOptions) => void
  /** Ambient falling petals: 0 = off. */
  setAmbient: (petalsPerSecond: number, hearts?: number) => void
  clear: () => void
}

const FxCtx = createContext<FxApi | null>(null)

export function useFx() {
  const v = useContext(FxCtx)
  if (!v) throw new Error('useFx outside FxProvider')
  return v
}

const PETAL_COLORS = ['#ffc9d6', '#ffb3c6', '#ffd9e2', '#ffe3d1', '#fbc2d0', '#fff0f3']
const HEART_COLORS = ['#ff7a95', '#ff9fb2', '#f5577a', '#ffb4a2', '#ff8fab']

export function FxProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const parts = useRef<P[]>([])
  const ambient = useRef({ petals: 0, hearts: 0, accP: 0, accH: 0 })

  const api = useMemo<FxApi>(
    () => ({
      burst({ x, y, kind = 'heart', count = 12, spread = 1, speed = 1, mode = 'radial' }) {
        const n = Math.round(count * perf.particleScale)
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2
          const sp = (60 + Math.random() * 180) * speed
          let vx = Math.cos(a) * sp * spread
          let vy = Math.sin(a) * sp * spread
          if (mode === 'up') {
            vx = (Math.random() - 0.5) * 80 * spread
            vy = -(50 + Math.random() * 120) * speed
          } else if (mode === 'swirl') {
            vx = Math.cos(a + Math.PI / 2) * sp * 1.4
            vy = Math.sin(a + Math.PI / 2) * sp * 1.4 - 40
          }
          spawn({
            kind,
            x: x + (Math.random() - 0.5) * 16,
            y: y + (Math.random() - 0.5) * 16,
            vx,
            vy,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 4,
            size: kind === 'heart' ? 7 + Math.random() * 9 : kind === 'petal' ? 6 + Math.random() * 7 : kind === 'light' ? 30 + Math.random() * 40 : 2 + Math.random() * 3,
            life: 0,
            maxLife: kind === 'heart' ? 1.8 + Math.random() * 1.4 : kind === 'petal' ? 2.4 + Math.random() * 2 : 0.8 + Math.random() * 0.9,
            color: kind === 'heart' ? HEART_COLORS[i % HEART_COLORS.length] : kind === 'petal' ? PETAL_COLORS[i % PETAL_COLORS.length] : '#fff4c9',
            sway: Math.random() * 10,
            ambient: false,
          })
        }
      },
      setAmbient(petalsPerSecond, hearts = 0) {
        ambient.current.petals = petalsPerSecond * perf.particleScale
        ambient.current.hearts = hearts * perf.particleScale
      },
      clear() {
        parts.current = []
      },
    }),
    [],
  )

  function spawn(p: P) {
    const list = parts.current
    if (list.length > perf.maxParticles) list.shift()
    list.push(p)
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, perf.maxDpr)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()
    window.addEventListener('resize', resize)
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      perf.sample(dt)
      const amb = ambient.current
      amb.accP += amb.petals * dt
      while (amb.accP >= 1) {
        amb.accP -= 1
        spawn({
          kind: 'petal',
          x: Math.random() * w * 1.2 - w * 0.1,
          y: -20,
          vx: 14 + Math.random() * 26,
          vy: 30 + Math.random() * 40,
          rot: Math.random() * 6,
          vr: (Math.random() - 0.5) * 2,
          size: 6 + Math.random() * 7,
          life: 0,
          maxLife: (h + 60) / 40,
          color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
          sway: Math.random() * 10,
          ambient: true,
        })
      }
      amb.accH += amb.hearts * dt
      while (amb.accH >= 1) {
        amb.accH -= 1
        spawn({
          kind: 'heart',
          x: w * (0.1 + Math.random() * 0.8),
          y: h + 10,
          vx: (Math.random() - 0.5) * 16,
          vy: -(28 + Math.random() * 30),
          rot: 0,
          vr: 0,
          size: 6 + Math.random() * 7,
          life: 0,
          maxLife: 6 + Math.random() * 4,
          color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
          sway: Math.random() * 10,
          ambient: true,
        })
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const list = parts.current
      let j = 0
      for (let i = 0; i < list.length; i++) {
        const p = list[i]
        p.life += dt
        if (p.life >= p.maxLife || p.y > h + 40 || p.y < -80) continue
        list[j++] = p
        p.sway += dt
        if (p.kind === 'petal') {
          if (!p.ambient) {
            p.vx *= 1 - 1.4 * dt
            p.vy = p.vy * (1 - 1.4 * dt) + 50 * dt
          }
          p.x += (p.vx + Math.sin(p.sway * 2) * 22) * dt
          p.y += p.vy * dt
          p.rot += p.vr * dt
        } else if (p.kind === 'heart') {
          p.vx *= 1 - 1.2 * dt
          if (!p.ambient && p.vy > -60) p.vy -= 40 * dt
          p.x += (p.vx + Math.sin(p.sway * 2.4) * 14) * dt
          p.y += p.vy * dt
        } else {
          p.vx *= 1 - 3 * dt
          p.vy *= 1 - 3 * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
        }
        const t = p.life / p.maxLife
        const alpha = p.kind === 'light' ? Math.sin(t * Math.PI) * 0.5 : t < 0.12 ? t / 0.12 : t > 0.7 ? (1 - t) / 0.3 : 1
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
        ctx.save()
        ctx.translate(p.x, p.y)
        if (p.kind === 'petal') {
          ctx.rotate(p.rot)
          ctx.scale(1, 0.55 + Math.abs(Math.sin(p.sway * 3)) * 0.45)
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.moveTo(0, -p.size)
          ctx.quadraticCurveTo(p.size * 0.9, -p.size * 0.2, 0, p.size)
          ctx.quadraticCurveTo(-p.size * 0.9, -p.size * 0.2, 0, -p.size)
          ctx.fill()
          ctx.fillStyle = 'rgba(255,255,255,0.45)'
          ctx.beginPath()
          ctx.ellipse(-p.size * 0.15, -p.size * 0.25, p.size * 0.15, p.size * 0.45, 0, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.kind === 'heart') {
          const s = 0.6 + 0.4 * Math.min(1, p.life * 4)
          ctx.scale(s, s)
          ctx.rotate(Math.sin(p.sway * 2) * 0.2)
          ctx.fillStyle = p.color
          heartPath(ctx, p.size)
          ctx.fill()
          ctx.fillStyle = 'rgba(255,255,255,0.5)'
          ctx.beginPath()
          ctx.arc(-p.size * 0.38, -p.size * 0.45, p.size * 0.16, 0, Math.PI * 2)
          ctx.fill()
        } else {
          const r = p.size * (p.kind === 'light' ? 1 : 3)
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
          g.addColorStop(0, p.kind === 'light' ? 'rgba(255,240,200,0.9)' : 'rgba(255,250,220,1)')
          g.addColorStop(0.4, p.kind === 'light' ? 'rgba(255,214,170,0.35)' : 'rgba(255,220,150,0.55)')
          g.addColorStop(1, 'rgba(255,200,150,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(0, 0, r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      list.length = j
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <FxCtx.Provider value={api}>
      {children}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30 h-full w-full" aria-hidden />
    </FxCtx.Provider>
  )
}

/**
 * Procedural, hand-painted-looking flowers drawn on a 2D canvas.
 * `open` goes 0 → 1 (with spring overshoot) as the flower blooms.
 */

export type FlowerType = 'rose' | 'daisy' | 'tulip' | 'cherry' | 'wild'

export interface FlowerStyle {
  type: FlowerType
  petal: string
  petalDeep: string
  center: string
  petals: number
}

const PALETTES: Record<FlowerType, [string, string, string][]> = {
  rose: [
    ['#f48aa0', '#d94f6f', '#b8405c'],
    ['#ffb1a1', '#f17b6c', '#d65a50'],
    ['#ffc6d6', '#f392b2', '#d8678e'],
  ],
  daisy: [
    ['#fffdf7', '#f5e6f2', '#ffc94d'],
    ['#fff6e8', '#ffd9c7', '#ffbb3d'],
  ],
  tulip: [
    ['#ff9eb2', '#f0607f', '#7bb36b'],
    ['#ffc48f', '#f58f5c', '#7bb36b'],
    ['#ffe08a', '#f4b73f', '#7bb36b'],
    ['#d9c2ff', '#a985e6', '#7bb36b'],
  ],
  cherry: [
    ['#ffe1ea', '#f8a9c0', '#e0678a'],
    ['#fff0f4', '#fbc4d4', '#e98aa6'],
  ],
  wild: [
    ['#d8cbff', '#a996ef', '#ffe28a'],
    ['#ffe8a3', '#f9c74f', '#fffaf0'],
    ['#bfe3ff', '#86c1ef', '#fff2b3'],
    ['#ffcfb8', '#fb9a7a', '#fff3c4'],
  ],
}

const TYPES: FlowerType[] = ['rose', 'daisy', 'tulip', 'cherry', 'wild', 'cherry', 'rose', 'wild']

export function randomFlowerStyle(prefer?: FlowerType): FlowerStyle {
  const type = prefer ?? TYPES[Math.floor(Math.random() * TYPES.length)]
  const pal = PALETTES[type][Math.floor(Math.random() * PALETTES[type].length)]
  const petals = type === 'daisy' ? 13 + Math.floor(Math.random() * 4) : type === 'wild' ? 5 + Math.floor(Math.random() * 2) : 5
  return { type, petal: pal[0], petalDeep: pal[1], center: pal[2], petals }
}

/** Damped spring 0 → 1 with a little overshoot. */
export function spring(t: number, k = 7, w = 9) {
  if (t <= 0) return 0
  return 1 - Math.exp(-t * k) * Math.cos(t * w)
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Draw a flower centred at (0,0) with radius r. */
export function drawFlower(ctx: CanvasRenderingContext2D, s: FlowerStyle, r: number, open: number) {
  switch (s.type) {
    case 'cherry':
      return drawCherry(ctx, s, r, open)
    case 'daisy':
      return drawDaisy(ctx, s, r, open)
    case 'rose':
      return drawRose(ctx, s, r, open)
    case 'tulip':
      return drawTulip(ctx, s, r, open)
    case 'wild':
      return drawWild(ctx, s, r, open)
  }
}

function petalGradient(ctx: CanvasRenderingContext2D, r: number, inner: string, outer: string) {
  const g = ctx.createRadialGradient(0, 0, r * 0.05, 0, 0, r)
  g.addColorStop(0, outer)
  g.addColorStop(0.55, inner)
  g.addColorStop(1, inner)
  return g
}

function drawCherry(ctx: CanvasRenderingContext2D, s: FlowerStyle, r: number, open: number) {
  const n = 5
  ctx.fillStyle = petalGradient(ctx, r, s.petal, s.petalDeep)
  ctx.strokeStyle = 'rgba(214,120,150,0.35)'
  ctx.lineWidth = Math.max(0.6, r * 0.03)
  for (let i = 0; i < n; i++) {
    const o = clamp01(open * 1.25 - i * 0.05)
    if (o <= 0) continue
    const pr = r * o
    ctx.save()
    ctx.rotate((i / n) * Math.PI * 2)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(-pr * 0.55, -pr * 0.25, -pr * 0.62, -pr * 0.9, -pr * 0.16, -pr * 0.98)
    ctx.lineTo(0, -pr * 0.86)
    ctx.lineTo(pr * 0.16, -pr * 0.98)
    ctx.bezierCurveTo(pr * 0.62, -pr * 0.9, pr * 0.55, -pr * 0.25, 0, 0)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  // stamens
  if (open > 0.5) {
    const so = clamp01((open - 0.5) * 2)
    ctx.strokeStyle = s.center
    ctx.lineWidth = Math.max(0.6, r * 0.035)
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3
      const l = r * 0.36 * so
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l)
      ctx.stroke()
      ctx.fillStyle = '#ffd36b'
      ctx.beginPath()
      ctx.arc(Math.cos(a) * l, Math.sin(a) * l, r * 0.055, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawDaisy(ctx: CanvasRenderingContext2D, s: FlowerStyle, r: number, open: number) {
  const n = s.petals
  ctx.strokeStyle = 'rgba(190,160,190,0.45)'
  ctx.lineWidth = Math.max(0.5, r * 0.025)
  for (let i = 0; i < n; i++) {
    const o = clamp01(open * 1.3 - (i % 3) * 0.08)
    if (o <= 0) continue
    ctx.save()
    ctx.rotate((i / n) * Math.PI * 2)
    const g = ctx.createLinearGradient(0, 0, 0, -r)
    g.addColorStop(0, s.petalDeep)
    g.addColorStop(0.45, s.petal)
    g.addColorStop(1, s.petal)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, -r * 0.55 * o, r * 0.13, r * 0.45 * o, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  const c = r * 0.3 * clamp01(open * 1.5)
  const cg = ctx.createRadialGradient(-c * 0.3, -c * 0.3, c * 0.1, 0, 0, c)
  cg.addColorStop(0, '#ffe58a')
  cg.addColorStop(1, s.center)
  ctx.fillStyle = cg
  ctx.beginPath()
  ctx.arc(0, 0, c, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(230,140,40,0.55)'
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4
    const d = c * 0.55 * Math.sqrt((i + 1) / 7)
    ctx.beginPath()
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, c * 0.1, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawRose(ctx: CanvasRenderingContext2D, s: FlowerStyle, r: number, open: number) {
  const rings = [
    { n: 5, rad: 1, rot: 0, col: s.petal },
    { n: 5, rad: 0.74, rot: 0.6, col: s.petalDeep },
    { n: 4, rad: 0.5, rot: 0.2, col: s.center },
  ]
  ctx.strokeStyle = 'rgba(140,40,70,0.28)'
  ctx.lineWidth = Math.max(0.6, r * 0.03)
  rings.forEach((ring, ri) => {
    const o = clamp01(open * 1.3 - ri * 0.12)
    if (o <= 0) return
    const pr = r * ring.rad * (0.35 + 0.65 * o)
    for (let i = 0; i < ring.n; i++) {
      ctx.save()
      ctx.rotate((i / ring.n) * Math.PI * 2 + ring.rot + (1 - o) * 0.8)
      const g = ctx.createRadialGradient(0, -pr * 0.2, pr * 0.1, 0, -pr * 0.45, pr * 0.7)
      g.addColorStop(0, ring.col)
      g.addColorStop(1, ri === 0 ? s.petal : s.petalDeep)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-pr * 0.75, -pr * 0.15, -pr * 0.7, -pr * 1.0, 0, -pr * 0.95)
      ctx.bezierCurveTo(pr * 0.7, -pr * 1.0, pr * 0.75, -pr * 0.15, 0, 0)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
  })
  // spiral heart of the rose
  const so = clamp01(open * 1.6)
  ctx.strokeStyle = 'rgba(120,30,60,0.45)'
  ctx.lineWidth = Math.max(0.8, r * 0.05)
  ctx.beginPath()
  for (let a = 0; a < Math.PI * 4 * so; a += 0.25) {
    const d = r * 0.04 * a
    const x = Math.cos(a) * d
    const y = Math.sin(a) * d
    if (a === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

function drawTulip(ctx: CanvasRenderingContext2D, s: FlowerStyle, r: number, open: number) {
  const o = clamp01(open)
  // stem + leaf grow first
  const stemLen = r * 1.4 * clamp01(open * 1.6)
  ctx.strokeStyle = '#6ea862'
  ctx.lineWidth = Math.max(1.2, r * 0.09)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, r * 0.2)
  ctx.quadraticCurveTo(r * 0.08, r * 0.2 + stemLen * 0.5, 0, r * 0.2 + stemLen)
  ctx.stroke()
  ctx.fillStyle = '#8cc277'
  ctx.beginPath()
  ctx.moveTo(0, r * 1.3)
  ctx.quadraticCurveTo(r * 0.6 * o, r * 0.9, r * 0.55 * o, r * 0.45)
  ctx.quadraticCurveTo(r * 0.2, r * 0.9, 0, r * 1.3)
  ctx.fill()
  // cup
  const h = r * (0.4 + 0.6 * o)
  const w = r * (0.3 + 0.38 * o)
  const g = ctx.createLinearGradient(0, -h, 0, r * 0.25)
  g.addColorStop(0, s.petal)
  g.addColorStop(1, s.petalDeep)
  ctx.fillStyle = g
  ctx.strokeStyle = 'rgba(150,50,70,0.3)'
  ctx.lineWidth = Math.max(0.6, r * 0.03)
  const side = (dir: number) => {
    ctx.beginPath()
    ctx.moveTo(0, r * 0.25)
    ctx.bezierCurveTo(dir * w * 1.2, r * 0.2, dir * w * 1.15 * (1 + 0.2 * o), -h * 0.55, dir * w * (0.75 + 0.35 * o), -h)
    ctx.quadraticCurveTo(dir * w * 0.35, -h * 0.55, 0, -h * 0.72)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
  side(-1)
  side(1)
  ctx.fillStyle = s.petal
  ctx.beginPath()
  ctx.moveTo(-w * 0.7, -h * 0.25)
  ctx.quadraticCurveTo(-w * 0.55, -h * 1.05, 0, -h * 1.02)
  ctx.quadraticCurveTo(w * 0.55, -h * 1.05, w * 0.7, -h * 0.25)
  ctx.quadraticCurveTo(w * 0.6, r * 0.25, 0, r * 0.25)
  ctx.quadraticCurveTo(-w * 0.6, r * 0.25, -w * 0.7, -h * 0.25)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.ellipse(-w * 0.25, -h * 0.45, w * 0.12, h * 0.3, -0.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawWild(ctx: CanvasRenderingContext2D, s: FlowerStyle, r: number, open: number) {
  const n = s.petals
  ctx.strokeStyle = 'rgba(120,90,140,0.3)'
  ctx.lineWidth = Math.max(0.5, r * 0.03)
  for (let i = 0; i < n; i++) {
    const o = clamp01(open * 1.3 - i * 0.04)
    if (o <= 0) continue
    ctx.save()
    ctx.rotate((i / n) * Math.PI * 2)
    ctx.fillStyle = petalGradient(ctx, r, s.petal, s.petalDeep)
    ctx.beginPath()
    ctx.arc(0, -r * 0.52 * o, r * 0.42 * o, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.fillStyle = s.center
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.24 * clamp01(open * 1.4), 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(240,170,60,0.6)'
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.1 * clamp01(open * 1.4), 0, Math.PI * 2)
  ctx.fill()
}

/** Pre-render a fully open flower to an offscreen canvas sprite. */
export function renderFlowerSprite(s: FlowerStyle, r: number, dpr: number) {
  const pad = s.type === 'tulip' ? 1.7 : 1.15
  const size = Math.ceil(r * 2 * pad * dpr)
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const x = c.getContext('2d')!
  x.scale(dpr, dpr)
  x.translate(size / dpr / 2, size / dpr / 2)
  drawFlower(x, s, r, 1)
  return c
}

/** Draw a heart path centred on (0,0) of width ~2r. */
export function heartPath(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  ctx.moveTo(0, r * 0.35)
  ctx.bezierCurveTo(-r * 1.1, -r * 0.35, -r * 0.55, -r * 1.15, 0, -r * 0.5)
  ctx.bezierCurveTo(r * 0.55, -r * 1.15, r * 1.1, -r * 0.35, 0, r * 0.35)
  ctx.closePath()
}

/** Points on the classic parametric heart, normalised to roughly [-1,1]. */
export function heartPoints(n: number) {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    pts.push({ x: x / 17, y: (y + 2) / 17 })
  }
  return pts
}

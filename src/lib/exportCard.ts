import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { content } from '../config/content'
import { FamilyIllustration } from '../illustrations/Characters'
import { MazdaIllustration } from '../illustrations/MazdaIllustration'
import { drawFlower, heartPath, randomFlowerStyle, type FlowerType } from './flowers'

/**
 * GreetingCardExporter: paints a 1080×1620 keepsake card (illustrated family,
 * Mazda 2 dream, flowers and the full greeting) to a canvas and returns a PNG.
 */

const W = 1080
const H = 1620
const SCRIPT = '"Dancing Script", cursive'
const BODY = '"Be Vietnam Pro", system-ui, sans-serif'

function svgToImage(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup)
  })
}

interface Seg {
  text: string
  hl: boolean
}

/** Word-wrap mixed (normal/highlighted) segments, returning lines of words. */
function wrapSegments(ctx: CanvasRenderingContext2D, segs: Seg[], maxW: number) {
  const words: Seg[] = []
  segs.forEach((s) => {
    s.text.split(/(\s+)/).forEach((w) => {
      if (!w) return
      if (/^\s+$/.test(w)) words.push({ text: ' ', hl: s.hl })
      else words.push({ text: w, hl: s.hl })
    })
  })
  const lines: Seg[][] = [[]]
  let lineW = 0
  for (const w of words) {
    const ww = ctx.measureText(w.text).width
    const cur = lines[lines.length - 1]
    if (w.text !== ' ' && lineW + ww > maxW && cur.length) {
      while (cur.length && cur[cur.length - 1].text === ' ') cur.pop()
      lines.push([w])
      lineW = ww
    } else if (!(w.text === ' ' && cur.length === 0)) {
      cur.push(w)
      lineW += ww
    }
  }
  return lines
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export async function renderGreetingCard(): Promise<Blob> {
  const { greeting, highlight, message, signature, date } = content.final
  await Promise.all([
    document.fonts.load(`700 72px ${SCRIPT}`, greeting),
    document.fonts.load(`500 40px ${SCRIPT}`, signature),
    document.fonts.load(`400 30px ${BODY}`, message.join(' ')),
    document.fonts.load(`600 26px ${BODY}`, date),
  ]).catch(() => undefined)

  const familySvg = renderToStaticMarkup(createElement(FamilyIllustration, { pose: 'hug', still: true, glow: true }))
  const mazdaSvg = renderToStaticMarkup(createElement(MazdaIllustration, { still: true, lightsOn: false, idPrefix: 'mzx' }))
  const [familyImg, mazdaImg] = await Promise.all([svgToImage(familySvg), svgToImage(mazdaSvg)])

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const rnd = seeded(2010)

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#ffd8c4')
  bg.addColorStop(0.35, '#ffe9dc')
  bg.addColorStop(1, '#fff7ee')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const sun = ctx.createRadialGradient(540, 760, 20, 540, 760, 640)
  sun.addColorStop(0, 'rgba(255,246,210,0.95)')
  sun.addColorStop(0.45, 'rgba(255,226,180,0.45)')
  sun.addColorStop(1, 'rgba(255,220,200,0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.beginPath()
  ctx.ellipse(160, 420, 300, 150, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,200,215,0.25)'
  ctx.beginPath()
  ctx.ellipse(920, 1180, 320, 160, 0, 0, Math.PI * 2)
  ctx.fill()

  // frame
  ctx.strokeStyle = 'rgba(214,120,140,0.45)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(36, 36, W - 72, H - 72, 40)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(214,120,140,0.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(52, 52, W - 104, H - 104, 32)
  ctx.stroke()

  // date
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#b0566f'
  ctx.font = `600 26px ${BODY}`
  ctx.fillText(date.split('').join(' '), W / 2, 130)

  // greeting with highlighted "chồng và Chít"
  const idx = greeting.indexOf(highlight)
  const segs: Seg[] =
    idx >= 0
      ? [
          { text: greeting.slice(0, idx), hl: false },
          { text: highlight, hl: true },
          { text: greeting.slice(idx + highlight.length), hl: false },
        ]
      : [{ text: greeting, hl: false }]
  ctx.font = `700 76px ${SCRIPT}`
  const gLines = wrapSegments(ctx, segs, 900)
  let y = 230
  for (const line of gLines) {
    const lw = line.reduce((s, w) => s + ctx.measureText(w.text).width, 0)
    let x = W / 2 - lw / 2
    ctx.textAlign = 'left'
    for (const w of line) {
      if (w.hl) {
        ctx.save()
        ctx.shadowColor = 'rgba(255,180,110,0.95)'
        ctx.shadowBlur = 26
        ctx.fillStyle = '#c2416b'
        ctx.fillText(w.text, x, y)
        ctx.restore()
      } else {
        ctx.fillStyle = '#8a3a4f'
        ctx.fillText(w.text, x, y)
      }
      x += ctx.measureText(w.text).width
    }
    y += 96
  }

  // illustration: hills, Mazda in the background, family in front
  const artTop = y - 10
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(54, 54, W - 108, H - 108, 30)
  ctx.clip()
  const hill = ctx.createLinearGradient(0, artTop + 280, 0, artTop + 620)
  hill.addColorStop(0, 'rgba(215,230,191,1)')
  hill.addColorStop(1, 'rgba(215,230,191,0)')
  ctx.fillStyle = hill
  ctx.beginPath()
  ctx.moveTo(0, artTop + 380)
  ctx.bezierCurveTo(300, artTop + 290, 700, artTop + 330, W, artTop + 270)
  ctx.lineTo(W, artTop + 620)
  ctx.lineTo(0, artTop + 620)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  ctx.globalAlpha = 0.92
  ctx.drawImage(mazdaImg, 600, artTop + 210, 380, (380 * 172) / 440)
  ctx.globalAlpha = 1
  const famW = 680
  const famH = (famW * 330) / 420
  ctx.drawImage(familyImg, W / 2 - famW / 2 - 40, artTop + 40, famW, famH)
  const artBottom = artTop + 40 + famH

  // flowers framing the art
  const types: FlowerType[] = ['rose', 'daisy', 'cherry', 'wild', 'tulip']
  for (let i = 0; i < 22; i++) {
    const left = i % 2 === 0
    const x = left ? 90 + rnd() * 200 : W - 90 - rnd() * 200
    const fy = artBottom - 70 + rnd() * 50
    ctx.save()
    ctx.translate(x, fy)
    ctx.rotate((rnd() - 0.5) * 0.8)
    drawFlower(ctx, randomFlowerStyle(types[i % types.length]), 20 + rnd() * 14, 1)
    ctx.restore()
  }
  for (let i = 0; i < 8; i++) {
    ctx.save()
    ctx.translate(100 + rnd() * 880, 70 + rnd() * 60)
    drawFlower(ctx, randomFlowerStyle(i % 2 ? 'cherry' : 'wild'), 12 + rnd() * 8, 1)
    ctx.restore()
  }
  // hearts around the family
  const hc = ['#ff7a95', '#ff9fb2', '#f5577a', '#ffb4a2']
  const heartSpots = [
    [110, 60], [170, 150], [120, 250], [215, 20], [880, 40], [950, 120], [860, 150], [990, 30], [300, -10], [760, -10],
  ]
  heartSpots.forEach(([hx, hy], i) => {
    ctx.save()
    ctx.translate(hx, artTop + hy + 40)
    ctx.rotate((rnd() - 0.5) * 0.5)
    ctx.fillStyle = hc[i % hc.length]
    ctx.globalAlpha = 0.85
    heartPath(ctx, 11 + rnd() * 10)
    ctx.fill()
    ctx.restore()
  })

  // message — measured first, then centred in the space left below the art
  type L = { text: string; font: string; color: string; lh: number; gap: number }
  const lines: L[] = []
  message.forEach((m, i) => {
    const last = i === message.length - 1
    const font = last ? `700 52px ${SCRIPT}` : `400 31px ${BODY}`
    ctx.font = font
    wrapText(ctx, m, 880).forEach((t, k) => lines.push({ text: t, font, color: last ? '#c2416b' : '#5a3b34', lh: last ? 64 : 48, gap: k === 0 && last ? 22 : 0 }))
  })
  lines.push({ text: signature, font: `500 46px ${SCRIPT}`, color: '#8a3a4f', lh: 60, gap: 34 })
  const blockH = lines.reduce((s, l) => s + l.lh + l.gap, 0)
  const top = artBottom + 30
  const bottom = H - 120
  let my = top + Math.max(0, (bottom - top - blockH) / 2) + 36
  ctx.textAlign = 'center'
  for (const l of lines) {
    my += l.gap
    ctx.font = l.font
    ctx.fillStyle = l.color
    ctx.fillText(l.text, W / 2, my)
    my += l.lh
  }

  // falling petals
  for (let i = 0; i < 26; i++) {
    ctx.save()
    ctx.translate(rnd() * W, rnd() * H)
    ctx.rotate(rnd() * 6.28)
    ctx.globalAlpha = 0.55
    ctx.fillStyle = ['#ffc9d6', '#ffb3c6', '#ffe3d1'][i % 3]
    const s = 8 + rnd() * 8
    ctx.beginPath()
    ctx.moveTo(0, -s)
    ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s)
    ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s)
    ctx.fill()
    ctx.restore()
  }

  ctx.globalAlpha = 0.6
  ctx.font = `500 20px ${BODY}`
  ctx.fillStyle = '#b0566f'
  ctx.fillText('Our Little Dream ❤️', W / 2, H - 66)
  ctx.globalAlpha = 1

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

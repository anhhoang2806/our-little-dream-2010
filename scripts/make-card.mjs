// Render the printable A6 greeting card (PNG ≈300 dpi + print-ready PDF) and verify its QR.
// Usage: node scripts/make-card.mjs <liveUrl> [outDir] [renderBase]
import fs from 'node:fs'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import puppeteer from 'puppeteer-core'

const url = process.argv[2]
const out = process.argv[3] || 'deliverables'
const renderBase = process.argv[4] || url
if (!url) throw new Error('usage: node scripts/make-card.mjs <liveUrl>')
fs.mkdirSync(out, { recursive: true })
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: true })
const page = await browser.newPage()
// A6 = 105 × 148 mm ≈ 396.85 × 559.37 CSS px; scale 3.15 → ~1250 × 1762 px (≈300 dpi)
await page.setViewport({ width: 400, height: 562, deviceScaleFactor: 3.15 })
await page.goto(`${renderBase}?print=card&url=${encodeURIComponent(url)}`, { waitUntil: 'networkidle0' })
await page.waitForFunction(() => document.documentElement.dataset.ready === '1')
await page.evaluate(() => document.fonts.ready)
await new Promise((r) => setTimeout(r, 500))
const card = await page.$('#print-card')
await card.screenshot({ path: `${out}/greeting-card.png` })
await page.pdf({ path: `${out}/greeting-card.pdf`, width: '105mm', height: '148mm', printBackground: true, preferCSSPageSize: true, pageRanges: '1' })
await browser.close()

const png = PNG.sync.read(fs.readFileSync(`${out}/greeting-card.png`))
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data
console.log(`greeting-card.png ${png.width}×${png.height}; greeting-card.pdf A6`)
console.log(`QR on card decodes to: ${decoded}`)
process.exit(decoded === url ? 0 : 1)

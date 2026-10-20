// Quick per-scene screenshots for visual review: node scripts/shoot.mjs <outDir> [baseUrl]
import puppeteer from 'puppeteer-core'
const out = process.argv[2]
const base = process.argv[3] || 'http://localhost:4173/our-little-dream-2010/'
const exe = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const waits = [2500, 4000, 5000, 8000, 9000]
for (let s = 0; s < 5; s++) {
  await page.goto(base + '?scene=' + s, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, waits[s]))
  await page.screenshot({ path: `${out}/scene${s}.png` })
}
console.log('errors:', errors.length ? errors : 'none')
await browser.close()

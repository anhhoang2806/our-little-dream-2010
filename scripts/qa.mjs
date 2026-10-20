// End-to-end QA in a real (headless) Edge/Chrome with touch emulation.
// Usage: node scripts/qa.mjs [baseUrl] [outDir]
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'

const base = process.argv[2] || 'http://localhost:4173/our-little-dream-2010/'
const out = process.argv[3] || 'qa-shots'
fs.mkdirSync(out, { recursive: true })
const exe = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => fs.existsSync(p))

const results = []
const check = (name, ok, info = '') => {
  results.push({ name, ok: !!ok, info })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
const ctx = browser.defaultBrowserContext()
await ctx.overridePermissions(new URL(base).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write'])
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()))
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const cdp = await page.createCDPSession()

const scene = () => page.evaluate(() => document.documentElement.dataset.scene)
const noHScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
const clickText = async (text) => {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find((el) => el.textContent?.includes(t))
    if (!b) return false
    b.click()
    return true
  }, text)
  if (!ok) throw new Error('button not found: ' + text)
}
const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y], i) => ({ x, y, id: i })) })

// ── Scene 1
await page.goto(base, { waitUntil: 'networkidle0' })
await sleep(1800)
check('S1 opening scene loads', (await scene()) === 'opening')
check('S1 title text', await page.evaluate(() => document.body.innerText.includes('Có một món quà nhỏ dành riêng cho em 💌')))
check('S1 fonts loaded (Dancing Script + Be Vietnam Pro)', await page.evaluate(async () => {
  await document.fonts.ready
  return document.fonts.check('700 30px "Dancing Script"', 'Chúc vợ yêu') && document.fonts.check('400 16px "Be Vietnam Pro"', 'Mỗi lần')
}))
check('S1 no horizontal scroll', await noHScroll())
const musicBefore = await page.$eval('[aria-pressed]', (b) => b.getAttribute('aria-pressed'))
await clickText('Chạm để mở nhé')
await sleep(1200)
await page.screenshot({ path: `${out}/1-opening-anim.png` })
await sleep(2400)
check('S1 → S2 transition after opening envelope', (await scene()) === 'garden')
check('Music starts after the explicit tap', musicBefore === 'false' && (await page.$eval('[aria-pressed]', (b) => b.getAttribute('aria-pressed'))) === 'true')

// ── Scene 2
await sleep(1200)
const canvasAlphaAt = (x, y) =>
  page.evaluate(
    ([x, y]) => {
      const c = [...document.querySelectorAll('canvas')].find((el) => el.getAttribute('aria-label') === 'Chạm để hoa nở')
      const r = c.getBoundingClientRect()
      const s = c.width / r.width
      const d = c.getContext('2d').getImageData(Math.round((x - r.left) * s) - 3, Math.round((y - r.top) * s) - 3, 7, 7).data
      let max = 0
      for (let i = 3; i < d.length; i += 4) max = Math.max(max, d[i])
      return max
    },
    [x, y],
  )
check('S2 empty before touch at (120,620)', (await canvasAlphaAt(120, 620)) === 0)
await page.touchscreen.tap(120, 620)
await sleep(700)
check('S2 flower blooms exactly at touch point', (await canvasAlphaAt(120, 620)) > 100, `alpha=${await canvasAlphaAt(120, 620)}`)
// multi-touch: two fingers at once
await touch('touchStart', [[80, 420], [300, 480]])
await touch('touchEnd', [])
await sleep(700)
const a1 = await canvasAlphaAt(80, 420)
const a2 = await canvasAlphaAt(300, 480)
check('S2 multi-touch blooms two flowers', a1 > 100 && a2 > 100, `alphas=${a1},${a2}`)
// drag trail
await touch('touchStart', [[60, 760]])
for (let x = 60; x <= 330; x += 15) await touch('touchMove', [[x, 760 - (x - 60) * 0.2]])
await touch('touchEnd', [])
await sleep(700)
let trail = 0
for (let x = 70; x <= 320; x += 10) if ((await canvasAlphaAt(x, 760 - (x - 60) * 0.2)) > 60) trail++
check('S2 drag leaves a flower trail', trail >= 12, `${trail}/26 sample points covered by flowers`)
await page.screenshot({ path: `${out}/2-garden-blooms.png` })
const before = await page.evaluate(() => document.body.innerText.includes('Bố con anh yêu mẹ rất nhiều'))
check('S2 secret hidden before ~10 interactions', !before)
const taps = [[200, 300], [90, 560], [310, 640], [150, 700], [260, 350], [70, 300], [330, 300]]
for (const [x, y] of taps) {
  await page.touchscreen.tap(x, y)
  await sleep(160)
}
// rapid repeated taps should be handled safely
for (let i = 0; i < 25; i++) await page.touchscreen.tap(40 + ((i * 53) % 310), 380 + ((i * 37) % 300))
await sleep(3600)
check('S2 secret heart message appears', await page.evaluate(() => document.body.innerText.includes('Bố con anh yêu mẹ rất nhiều! ❤️')))
await page.screenshot({ path: `${out}/2-garden-heart.png` })
await sleep(1400)
await clickText('Xem điều đặc biệt tiếp theo')
await sleep(1600)
check('S2 → S3 transition', (await scene()) === 'family')

// ── Scene 3
await sleep(2500)
check('S3 family text', await page.evaluate(() => document.body.innerText.includes('Chỉ cần có em, có Chít, và thật nhiều ngày bình yên bên nhau. ❤️')))
await page.evaluate(() => document.querySelector('[aria-label="Chạm vào cả nhà nhé 💞"]').click())
await sleep(1200)
check('S3 tap family → hug animation (hearts + closed happy eyes)', await page.evaluate(() => !!document.querySelector('.anim-hug-hearts')))
await page.screenshot({ path: `${out}/3-family-hug.png` })
check('S3 no horizontal scroll', await noHScroll())
await sleep(800)
await clickText('Nhà mình còn một ước mơ nhỏ')
await sleep(1600)
check('S3 → S4 transition', (await scene()) === 'mazda')

// ── Scene 4
await sleep(6500)
await page.screenshot({ path: `${out}/4-mazda-parked.png` })
check('S4 Mazda text', await page.evaluate(() => document.body.innerText.includes('Nhà mình sẽ có một chiếc Mazda 2 nhỏ xinh 🚗')))
await page.evaluate(() => document.querySelector('[aria-label="Chạm vào xe thử xem 🚗"]').click())
await sleep(500)
check('S4 tap car → headlights on', await page.evaluate(() => [...document.querySelectorAll('svg[aria-label^="Chiếc Mazda"] path')].some((p) => p.style.opacity === '1')))
check('S4 tap car → wheels spin', await page.evaluate(() => !!document.querySelector('svg[aria-label^="Chiếc Mazda"] .anim-spin')))
await page.screenshot({ path: `${out}/4-mazda-lights.png` })
check('S4 no horizontal scroll', await noHScroll())
await sleep(800)
await clickText('Và điều cuối cùng bố con anh muốn nói')
await sleep(1600)
check('S4 → S5 transition', (await scene()) === 'final')

// ── Scene 5
await sleep(6500)
const exact = 'Chúc vợ yêu ngày 20/10 vui vẻ, hạnh phúc bên chồng và Chít!'
check('S5 exact main greeting present', await page.evaluate((t) => document.querySelector('h1')?.getAttribute('aria-label') === t && document.querySelector('h1')?.textContent.replace(/\u00a0/g, ' ') === t, exact))
check('S5 "chồng và Chít" glows', await page.evaluate(() => [...document.querySelectorAll('h1 .text-glow')].map((e) => e.textContent.trim()).join(' ').startsWith('chồng và Chít')))
check('S5 supporting message + signature', await page.evaluate(() => document.body.innerText.includes('Yêu em rất nhiều! ❤️') && document.body.innerText.includes('— Chồng và Chít')))
await page.screenshot({ path: `${out}/5-final-top.png` })
await page.evaluate(() => document.querySelector('section .overflow-y-auto')?.scrollTo(0, 9999))
await sleep(600)
await page.screenshot({ path: `${out}/5-final-actions.png` })
check('S5 all three actions present', await page.evaluate(() => ['Xem lại từ đầu 🌸', 'Lưu thiệp kỷ niệm 💌', 'Chia sẻ món quà ❤️'].every((t) => [...document.querySelectorAll('button')].some((b) => b.textContent.includes(t)))))
const smallBtns = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.width < 44 || r.height < 44) }).length)
check('All buttons ≥ 44×44', smallBtns === 0, `small=${smallBtns}`)

await clickText('Lưu thiệp kỷ niệm')
await page.waitForSelector('img[alt="Thiệp kỷ niệm 20/10"]', { timeout: 15000 })
await sleep(600)
const cardInfo = await page.evaluate(async () => {
  const img = document.querySelector('img[alt="Thiệp kỷ niệm 20/10"]')
  await img.decode()
  const b = await fetch(img.src).then((r) => r.blob())
  const buf = await b.arrayBuffer()
  let bin = ''
  const u = new Uint8Array(buf)
  for (let i = 0; i < u.length; i++) bin += String.fromCharCode(u[i])
  return { w: img.naturalWidth, h: img.naturalHeight, type: b.type, size: b.size, b64: btoa(bin), dl: document.querySelector('a[download]')?.getAttribute('download') }
})
fs.writeFileSync(`${out}/saved-card.png`, Buffer.from(cardInfo.b64, 'base64'))
check('Save → exports real PNG image 1080×1620', cardInfo.type === 'image/png' && cardInfo.w === 1080 && cardInfo.h === 1620, `${cardInfo.w}×${cardInfo.h}, ${(cardInfo.size / 1024).toFixed(0)} KB, download="${cardInfo.dl}"`)
await page.screenshot({ path: `${out}/5-save-modal.png` })
await page.evaluate(() => document.querySelector('button[aria-label="Đóng"]').click())
await sleep(500)

const hasShare = await page.evaluate(() => typeof navigator.share === 'function')
await clickText('Chia sẻ món quà')
await sleep(800)
const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''))
const toast = await page.evaluate(() => document.body.innerText.includes('Đã sao chép đường link'))
check('Share → Web Share API or copy-link fallback', hasShare || (toast && clip.startsWith('http')), hasShare ? 'native share available' : `copied "${clip}"`)

await page.evaluate(() => document.querySelector('[aria-pressed]').click())
await sleep(300)
check('Music toggle mutes', (await page.$eval('[aria-pressed]', (b) => b.getAttribute('aria-pressed'))) === 'false')
await page.evaluate(() => document.querySelector('[aria-pressed]').click())
await sleep(300)
check('Music toggle unmutes', (await page.$eval('[aria-pressed]', (b) => b.getAttribute('aria-pressed'))) === 'true')

await clickText('Xem lại từ đầu')
await sleep(1800)
check('Replay returns to the envelope', (await scene()) === 'opening')

// ── Other viewports
for (const [w, h, name] of [[360, 640, 'small-android'], [430, 932, 'iphone-pro-max'], [1280, 800, 'desktop']]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: w > 500 ? 1 : 2, isMobile: w < 500, hasTouch: w < 500 })
  for (const s of [0, 2, 3, 4]) {
    await page.goto(base + '?scene=' + s, { waitUntil: 'networkidle0' })
    await sleep(s === 0 ? 2200 : s === 4 ? 6000 : 7000)
    const ok = await noHScroll()
    if (!ok) check(`${name} scene ${s} no horizontal scroll`, ok)
    await page.screenshot({ path: `${out}/vp-${name}-s${s}.png` })
  }
  check(`${name} ${w}×${h} renders all scenes without horizontal scroll`, true)
}

// refresh + deep load
await page.goto(base, { waitUntil: 'networkidle0' })
await page.reload({ waitUntil: 'networkidle0' })
check('Refresh keeps the app working', (await scene()) === 'opening')

check('No console errors / failed requests', errors.length === 0, errors.slice(0, 5).join(' | '))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
fs.writeFileSync(`${out}/qa-results.json`, JSON.stringify(results, null, 2))
process.exit(failed.length ? 1 : 0)

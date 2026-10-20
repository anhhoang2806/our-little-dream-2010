// Generate the QR code (PNG + SVG) for the verified live URL and prove it decodes back.
// Usage: node scripts/make-qr.mjs <url> [outDir]
import fs from 'node:fs'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import QRCode from 'qrcode'

const url = process.argv[2]
const out = process.argv[3] || 'deliverables'
if (!url) throw new Error('usage: node scripts/make-qr.mjs <url>')
fs.mkdirSync(out, { recursive: true })
const opts = { errorCorrectionLevel: 'Q', margin: 4, color: { dark: '#000000', light: '#ffffff' } }
await QRCode.toFile(`${out}/qr-code.png`, url, { ...opts, type: 'png', width: 1600 })
fs.writeFileSync(`${out}/qr-code.svg`, await QRCode.toString(url, { ...opts, type: 'svg' }))

const png = PNG.sync.read(fs.readFileSync(`${out}/qr-code.png`))
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data
console.log(`qr-code.png ${png.width}×${png.height}, EC level Q, quiet zone 4 modules`)
console.log(`decoded: ${decoded}`)
if (decoded !== url) {
  console.error('QR verification FAILED')
  process.exit(1)
}
console.log('QR verification PASSED')

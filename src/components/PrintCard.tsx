import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { content } from '../config/content'
import { FamilyIllustration } from '../illustrations/Characters'
import { SvgBlossom, SvgDaisy, SvgTulip } from '../illustrations/Decor'

/**
 * Printable A6 greeting card (105 × 148 mm) with the QR code.
 * Open with ?print=card&url=<live-url>; scripts/make-card.mjs renders it to PNG + PDF.
 */

function Corner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <SvgBlossom x={22} y={22} r={16} petal="#ffc4d4" />
      <SvgDaisy x={52} y={14} r={11} />
      <SvgBlossom x={14} y={54} r={11} petal="#ffd6a5" center="#f08a4b" />
      <SvgBlossom x={78} y={10} r={8} petal="#d9c2ff" center="#a985e6" />
      <SvgDaisy x={10} y={84} r={8} />
      <SvgBlossom x={44} y={42} r={7} petal="#ffb3c6" />
    </svg>
  )
}

export default function PrintCard() {
  const params = new URLSearchParams(window.location.search)
  const url = params.get('url') || window.location.origin + import.meta.env.BASE_URL
  const [qr, setQr] = useState('')

  useEffect(() => {
    document.documentElement.style.overflow = 'visible'
    document.body.style.overflow = 'visible'
    document.body.style.background = '#fff'
    QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'Q', margin: 4, color: { dark: '#2b1720', light: '#ffffff' } }).then((s) => {
      setQr(s)
      document.documentElement.dataset.ready = '1'
    })
  }, [url])

  return (
    <div
      id="print-card"
      className="relative overflow-hidden"
      style={{
        width: '105mm',
        height: '148mm',
        background: 'radial-gradient(ellipse at 50% 38%, #fffaf0 0%, #ffeee6 45%, #fbd8d8 100%)',
        fontFamily: 'var(--font-body)',
        color: '#5a3b34',
      }}
    >
      <style>{`@page { size: 105mm 148mm; margin: 0 } html, body { margin: 0 } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }`}</style>
      <div className="absolute rounded-[5mm]" style={{ inset: '4mm', border: '0.5mm solid rgba(214,120,140,0.45)' }} />
      <div className="absolute rounded-[4mm]" style={{ inset: '5.6mm', border: '0.25mm solid rgba(214,120,140,0.25)' }} />
      <Corner className="absolute left-[2mm] top-[2mm] h-[30mm] w-[30mm]" />
      <Corner className="absolute right-[2mm] top-[2mm] h-[30mm] w-[30mm] -scale-x-100" />
      <svg viewBox="0 0 400 60" className="absolute bottom-[3mm] left-0 h-[16mm] w-full" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => {
          const x = 10 + i * 25
          const c = ['#ffb3c6', '#ffd6a5', '#cdb4ff', '#ffc8dd'][i % 4]
          return i % 3 === 0 ? <SvgTulip key={i} x={x} y={58} h={36} color={c} /> : i % 3 === 1 ? <SvgBlossom key={i} x={x} y={36 + (i % 2) * 8} r={9} petal={c} /> : <SvgDaisy key={i} x={x} y={40} r={8} />
        })}
      </svg>

      <div className="relative flex h-full flex-col items-center text-center" style={{ padding: '11mm 9mm 0' }}>
        <p style={{ fontSize: '7pt', letterSpacing: '0.35em', fontWeight: 600, color: '#b0566f' }}>20 · 10</p>
        <p className="font-script" style={{ fontSize: '17pt', fontWeight: 700, lineHeight: 1.2, color: '#8a3a4f', marginTop: '2.5mm', textWrap: 'balance' }}>
          {content.print.lines[0]}
        </p>
        <div style={{ width: '50mm', marginTop: '1mm' }}>
          <FamilyIllustration pose="hug" still glow className="h-auto w-full" />
        </div>
        <div
          className="flex items-center justify-center bg-white"
          style={{ width: '44mm', height: '44mm', borderRadius: '4mm', boxShadow: '0 0.6mm 2.4mm rgba(160,80,90,0.25)', marginTop: '-1mm' }}
        >
          <div style={{ width: '41mm', height: '41mm' }} dangerouslySetInnerHTML={{ __html: qr }} />
        </div>
        <p style={{ fontSize: '11pt', fontWeight: 600, color: '#8a3a4f', marginTop: '3mm' }}>{content.print.lines[1]}</p>
        <p className="font-script" style={{ fontSize: '15pt', fontWeight: 600, color: '#8a3a4f', marginTop: '1mm' }}>
          {content.print.signature}
        </p>
      </div>
    </div>
  )
}

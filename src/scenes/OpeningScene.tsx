import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useFx } from '../components/FxLayer'
import { PrimaryButton } from '../components/ui'
import { content } from '../config/content'
import { Backdrop } from '../illustrations/Backdrop'
import { audio } from '../lib/audio'

function Envelope({ open }: { open: boolean }) {
  return (
    <div className="relative mx-auto aspect-[1.45] w-[min(76vw,330px)]" style={{ perspective: 900 }}>
      {/* back */}
      <svg viewBox="0 0 290 200" className="absolute inset-0 h-full w-full drop-shadow-[0_18px_24px_rgba(170,90,90,0.28)]">
        <defs>
          <linearGradient id="env-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6d3c8" />
            <stop offset="1" stopColor="#f1c2b8" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="286" height="196" rx="14" fill="url(#env-back)" stroke="#e2a9a0" strokeWidth="1.5" />
      </svg>
      {/* letter */}
      <motion.div
        className="absolute left-[7%] right-[7%] top-[8%] flex h-[84%] flex-col items-center justify-start rounded-xl bg-[#fffaf2] pt-[7%] shadow-[0_4px_14px_rgba(160,90,80,0.2)]"
        initial={false}
        animate={open ? { y: '-46%' } : { y: '0%' }}
        transition={{ delay: open ? 0.45 : 0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ zIndex: 2 }}
      >
        <span className="font-script text-[clamp(22px,6.5vw,30px)] font-bold text-rose-ink">Gửi vợ yêu</span>
        <span className="mt-1 text-[22px]">💌</span>
        <div className="mt-2 h-[2px] w-1/2 rounded bg-[#f6c7cf]" />
        <div className="mt-2 h-[2px] w-2/5 rounded bg-[#f6d8dc]" />
      </motion.div>
      {/* front pocket */}
      <svg viewBox="0 0 290 200" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }}>
        <defs>
          <linearGradient id="env-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde4da" />
            <stop offset="1" stopColor="#f8d0c6" />
          </linearGradient>
        </defs>
        <path d="M2,16 L145,118 L288,16 L288,184 Q288,198 274,198 L16,198 Q2,198 2,184 Z" fill="url(#env-front)" stroke="#e8b3a8" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2,198 L120,104 M288,198 L170,104" stroke="#eab9ae" strokeWidth="1.5" />
        {/* tiny painted flowers on the envelope */}
        {[
          [36, 168, '#f7a1b9'],
          [52, 178, '#ffd6a5'],
          [252, 166, '#f7a1b9'],
          [238, 178, '#cdb4ff'],
        ].map(([x, y, c], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-5" rx="3.4" ry="5" fill={c as string} transform={`rotate(${a})`} />
            ))}
            <circle r="2.4" fill="#ffd36b" />
          </g>
        ))}
      </svg>
      {/* flap */}
      <motion.div
        className="absolute left-0 right-0 top-0 h-[62%]"
        style={{ transformOrigin: '50% 0%', transformStyle: 'preserve-3d' }}
        initial={false}
        animate={open ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 4 }}
        transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1], zIndex: { delay: open ? 0.35 : 0 } }}
      >
        <svg viewBox="0 0 290 124" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f9d6cc" />
              <stop offset="1" stopColor="#f3c0b5" />
            </linearGradient>
          </defs>
          <path d="M4,4 Q145,0 286,4 L152,118 Q145,124 138,118 Z" fill="url(#env-flap)" stroke="#e2a9a0" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        {/* wax seal */}
        <motion.div
          className="absolute left-1/2 top-[86%] flex h-[clamp(40px,12vw,52px)] w-[clamp(40px,12vw,52px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff8fa6,#d9466a_65%,#b5304f)] shadow-[0_3px_8px_rgba(150,30,60,0.45)]"
          animate={open ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg viewBox="-12 -12 24 24" className="h-1/2 w-1/2">
            <path d="M0,7 C-12,-1 -6,-12 0,-5 C6,-12 12,-1 0,7 Z" fill="#ffe3ea" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}

export function OpeningScene({ onNext }: { onNext: () => void }) {
  const fx = useFx()
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState(false)
  const envRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    fx.setAmbient(2.2)
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [fx])

  const handleOpen = () => {
    if (open) return
    setOpen(true)
    audio.start()
    window.setTimeout(() => audio.sfx('open'), 80)
    const r = envRef.current?.getBoundingClientRect()
    const cx = r ? r.left + r.width / 2 : window.innerWidth / 2
    const cy = r ? r.top + r.height * 0.35 : window.innerHeight / 2
    timers.current.push(
      window.setTimeout(() => {
        fx.burst({ x: cx, y: cy, kind: 'light', count: 6, speed: 0.3 })
        fx.burst({ x: cx, y: cy, kind: 'sparkle', count: 30, speed: 1.2 })
      }, 450),
      window.setTimeout(() => {
        fx.burst({ x: cx, y: cy, kind: 'heart', count: 26, speed: 1.1 })
        audio.sfx('heart')
      }, 750),
      window.setTimeout(() => fx.burst({ x: cx, y: cy, kind: 'petal', count: 36, mode: 'swirl', speed: 1.3 }), 900),
      window.setTimeout(() => setFlash(true), 2000),
      window.setTimeout(onNext, 2700),
    )
  }

  return (
    <div className="absolute inset-0">
      <Backdrop variant="dawn" hills={false} />
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 pt-safe pb-safe text-center">
        <motion.div
          className="mt-[9vh]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: open ? 0 : 1, y: 0 }}
          transition={{ duration: open ? 0.5 : 1.2, ease: [0.22, 1, 0.36, 1], delay: open ? 0 : 0.3 }}
        >
          <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.28em] text-rose-ink/70">20 · 10</p>
          <h1 className="font-script text-[clamp(32px,9vw,46px)] font-bold leading-[1.15] text-rose-ink text-soft-shadow">{content.opening.title}</h1>
          <p className="mt-3 text-[15px] text-cocoa/75">{content.opening.subtitle}</p>
        </motion.div>

        <motion.div
          ref={envRef}
          className="relative w-full cursor-pointer"
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: open ? 1.06 : 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: open ? 0 : 0.6 }}
          onClick={handleOpen}
          role="button"
          aria-label={content.opening.cta}
        >
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[120vw] max-h-[620px] w-[120vw] max-w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,248,220,0.95)_0%,rgba(255,224,190,0.55)_35%,rgba(255,210,200,0)_68%)]"
            initial={false}
            animate={open ? { scale: 1.6, opacity: 1 } : { scale: [0.75, 0.85, 0.75], opacity: 0.7 }}
            transition={open ? { duration: 1.4, delay: 0.4 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className={open ? '' : 'anim-float'}>
            <Envelope open={open} />
          </div>
        </motion.div>

        <motion.div
          className="mb-[4vh]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: open ? 0 : 1, y: 0 }}
          transition={{ delay: open ? 0 : 1.3, duration: 0.8 }}
        >
          <PrimaryButton pulse onClick={handleOpen} disabled={open}>
            {content.opening.cta}
          </PrimaryButton>
        </motion.div>
      </div>
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_50%,#fffaf0,#ffe9e0)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: flash ? 1 : 0 }}
        transition={{ duration: 0.7 }}
      />
    </div>
  )
}

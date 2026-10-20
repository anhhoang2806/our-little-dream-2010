import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useFx } from '../components/FxLayer'
import { Panel, PrimaryButton, RevealLines } from '../components/ui'
import { content } from '../config/content'
import { Backdrop } from '../illustrations/Backdrop'
import { FamilyIllustration } from '../illustrations/Characters'
import { SvgBlossom, SvgDaisy, SvgTulip } from '../illustrations/Decor'
import { MazdaIllustration } from '../illustrations/MazdaIllustration'
import { audio } from '../lib/audio'
import { perf } from '../lib/perf'

type CarState = 'offscreen' | 'parked' | 'nudge'

const ROADSIDE = Array.from({ length: 22 }, (_, i) => {
  const top = i % 2 === 0
  const x = (i / 22) * 400 + ((i * 37) % 13)
  return { x, y: top ? 12 + ((i * 7) % 8) : 84 + ((i * 11) % 10), kind: i % 3, top, color: ['#ffb3c6', '#ffd6a5', '#cdb4ff', '#ffc8dd', '#ffe08a'][i % 5] }
})

function Road({ bloom }: { bloom: boolean }) {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9bcc0" />
          <stop offset="1" stopColor="#b2a4aa" />
        </linearGradient>
      </defs>
      <rect x="-50" y="0" width="500" height="22" fill="#b8d9a4" />
      <rect x="-50" y="22" width="500" height="56" fill="url(#road)" />
      <rect x="-50" y="22" width="500" height="3" fill="#e9e1dc" />
      <rect x="-50" y="75" width="500" height="3" fill="#e9e1dc" />
      <path d="M-50,50 L450,50" stroke="#fffaf0" strokeWidth="3" strokeDasharray="20 16" />
      <rect x="-50" y="78" width="500" height="40" fill="#a9d293" />
      {ROADSIDE.map((f, i) => (
        <g
          key={i}
          style={{
            transformBox: 'fill-box',
            transformOrigin: '50% 100%',
            transform: bloom ? 'scale(1)' : 'scale(0)',
            transition: `transform .7s cubic-bezier(.34,1.56,.64,1) ${(i % 11) * 0.12 + (f.top ? 0 : 0.06)}s`,
          }}
        >
          {f.kind === 0 ? <SvgDaisy x={f.x} y={f.y} r={6} /> : f.kind === 1 ? <SvgBlossom x={f.x} y={f.y} r={6.5} petal={f.color} /> : <SvgTulip x={f.x} y={f.y + 8} h={18} color={f.color} />}
        </g>
      ))}
    </svg>
  )
}

export function MazdaDreamScene({ onNext }: { onNext: () => void }) {
  const fx = useFx()
  const [car, setCar] = useState<CarState>('offscreen')
  const [stage, setStage] = useState(0) // 1 road, 2 bloom, 3 family, 4 button
  const [lights, setLights] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const carRef = useRef<HTMLDivElement>(null)
  const famRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    fx.setAmbient(0.8)
    const t = timers.current
    const q = (fn: () => void, ms: number) => t.push(window.setTimeout(fn, ms))
    q(() => setStage(1), 300)
    q(() => {
      setCar('parked')
      setSpinning(true)
    }, 900)
    q(() => setStage(2), 1700)
    q(() => setSpinning(false), 3500)
    q(() => {
      setStage(3)
      const r = famRef.current?.getBoundingClientRect()
      if (r) fx.burst({ x: r.left + r.width / 2, y: r.top + r.height * 0.3, kind: 'heart', count: 14, mode: 'up', spread: 1.6 })
      fx.setAmbient(1.2, 0.6)
    }, 4000)
    q(() => setStage(4), 6200)
    return () => t.forEach(clearTimeout)
  }, [fx])

  const tapCar = () => {
    if (car === 'offscreen') return
    audio.sfx('car')
    setLights(true)
    setSpinning(true)
    setCar('nudge')
    const r = carRef.current?.getBoundingClientRect()
    if (r) {
      fx.burst({ x: r.right - r.width * 0.04, y: r.top + r.height * 0.58, kind: 'sparkle', count: 16, speed: 0.8 })
      fx.burst({ x: r.left + r.width / 2, y: r.top + r.height * 0.2, kind: 'heart', count: 14, mode: 'up', spread: 2 })
    }
    timers.current.push(
      window.setTimeout(() => setCar('parked'), 1100),
      window.setTimeout(() => setSpinning(false), 2300),
      window.setTimeout(() => setLights(false), 4200),
    )
  }

  return (
    <div className="absolute inset-0">
      <Backdrop variant="countryside" />
      <div className="relative z-10 flex h-full flex-col items-center px-5 pt-safe pb-safe text-center">
        <motion.div className="mt-12 w-full max-w-[440px]" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <Panel>
            <RevealLines
              lines={content.mazda.message}
              delay={0.6}
              step={1.1}
              lineClassName="text-[15.5px] leading-relaxed text-cocoa [&:first-child]:font-script [&:first-child]:text-[25px] [&:first-child]:font-bold [&:first-child]:text-rose-ink"
            />
          </Panel>
        </motion.div>

        <div className="relative mt-2 w-full max-w-[460px] flex-1">
          <div className="absolute inset-x-0 bottom-0 h-[min(46vh,400px)]">
            {/* road */}
            <motion.div
              className="absolute inset-x-[-6vw] bottom-[8%] h-[92px]"
              style={{ originX: 0 }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={stage >= 1 ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Road bloom={stage >= 2} />
            </motion.div>

            {/* car */}
            <motion.div
              ref={carRef}
              className="absolute bottom-[calc(8%+44px)] right-[-2%] w-[min(80vw,370px)] cursor-pointer"
              initial={{ x: '-140vw' }}
              animate={car === 'offscreen' ? { x: '-140vw' } : car === 'nudge' ? { x: 34 } : { x: 0 }}
              transition={car === 'parked' && !lights ? { duration: perf.reducedMotion ? 0.8 : 2.6, ease: [0.16, 1, 0.3, 1] } : { duration: 1, ease: [0.45, 0, 0.2, 1] }}
              onClick={tapCar}
              role="button"
              aria-label={content.mazda.hint}
            >
              <div className={spinning ? '' : 'anim-float'} style={{ animationDuration: '5s' }}>
                <MazdaIllustration lightsOn={lights} spinning={spinning} className="h-auto w-full overflow-visible" />
              </div>
              <motion.span
                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-[12.5px] font-medium text-rose-ink shadow-sm"
                initial={{ opacity: 0, y: 6 }}
                animate={stage >= 3 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {content.mazda.caption}
              </motion.span>
            </motion.div>

            {/* family beside the car */}
            <motion.div
              ref={famRef}
              className="absolute bottom-[1%] left-[-3%] w-[min(46vw,210px)]"
              initial={{ opacity: 0, y: 26, scale: 0.9 }}
              animate={stage >= 3 ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <FamilyIllustration pose="stand" glow className="h-auto w-full overflow-visible" />
            </motion.div>
          </div>
        </div>

        <div className="mb-[2vh] mt-3 flex min-h-[78px] flex-col items-center justify-end gap-2">
          <motion.p className="anim-hint text-[14px] font-medium text-rose-ink/85" initial={{ opacity: 0 }} animate={{ opacity: stage >= 3 ? 1 : 0 }} transition={{ delay: 0.8 }}>
            {content.mazda.hint}
          </motion.p>
          {stage >= 4 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <PrimaryButton pulse onClick={onNext}>
                {content.mazda.next}
              </PrimaryButton>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

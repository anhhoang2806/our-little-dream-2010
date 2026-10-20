import { Download, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFx } from '../components/FxLayer'
import { Panel, PrimaryButton } from '../components/ui'
import { content } from '../config/content'
import { Backdrop } from '../illustrations/Backdrop'
import { FamilyIllustration, type Pose } from '../illustrations/Characters'
import { SvgBlossom, SvgDaisy, SvgTulip } from '../illustrations/Decor'
import { MazdaIllustration } from '../illustrations/MazdaIllustration'
import { audio } from '../lib/audio'

const f = content.final

function Greeting({ onDone }: { onDone: () => void }) {
  // Split into words; words inside the highlight phrase get the warm glow.
  const tokens = useMemo(() => {
    const idx = f.greeting.indexOf(f.highlight)
    const out: { w: string; hl: boolean }[] = []
    const push = (s: string, hl: boolean) => s.split(' ').filter(Boolean).forEach((w) => out.push({ w, hl }))
    if (idx < 0) push(f.greeting, false)
    else {
      push(f.greeting.slice(0, idx), false)
      push(f.highlight, true)
      const rest = f.greeting.slice(idx + f.highlight.length)
      if (rest && !rest.startsWith(' ') && out.length) out[out.length - 1].w += rest.split(' ')[0]
      push(rest.startsWith(' ') ? rest : rest.split(' ').slice(1).join(' '), false)
    }
    return out
  }, [])
  const step = 0.13
  useEffect(() => {
    const t = window.setTimeout(onDone, (0.5 + tokens.length * step + 0.6) * 1000)
    return () => clearTimeout(t)
  }, [onDone, tokens.length])
  return (
    <h1 className="font-script text-[clamp(34px,9.6vw,50px)] font-bold leading-[1.22] text-rose-ink text-soft-shadow" aria-label={f.greeting}>
      {tokens.map((t, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`inline-block ${t.hl ? 'text-[#c2416b] text-glow' : ''}`}
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.5 + i * step, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {t.w}
          {i < tokens.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </h1>
  )
}

function CornerFlowers({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 90" className={`h-auto w-[30vw] max-w-[140px] ${flip ? '-scale-x-100' : ''}`} aria-hidden>
      <SvgTulip x={20} y={88} h={50} color="#ff9eb2" />
      <SvgBlossom x={46} y={58} r={14} petal="#ffc4d4" />
      <SvgDaisy x={18} y={40} r={12} />
      <SvgBlossom x={70} y={78} r={10} petal="#ffd6a5" center="#f08a4b" />
      <SvgDaisy x={92} y={84} r={8} />
      <SvgBlossom x={40} y={18} r={8} petal="#d9c2ff" center="#a985e6" />
    </svg>
  )
}

export function FinalGreetingScene({ onReplay }: { onReplay: () => void }) {
  const fx = useFx()
  const [greeted, setGreeted] = useState(false)
  const [pose, setPose] = useState<Pose>('stand')
  const [settled, setSettled] = useState(false)
  const [card, setCard] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const famRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    fx.setAmbient(1.6)
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [fx])

  useEffect(
    () => () => {
      if (card) URL.revokeObjectURL(card)
    },
    [card],
  )

  const celebrate = () => {
    if (greeted) return
    setGreeted(true)
    audio.sfx('celebrate')
    const w = window.innerWidth
    fx.burst({ x: w / 2, y: window.innerHeight * 0.2, kind: 'petal', count: 40, mode: 'swirl', speed: 1.4 })
    fx.burst({ x: w / 2, y: window.innerHeight * 0.2, kind: 'sparkle', count: 30, speed: 1.6 })
    timers.current.push(
      window.setTimeout(() => {
        setPose('hug')
        const r = famRef.current?.getBoundingClientRect()
        if (r) {
          fx.burst({ x: r.left + r.width / 2, y: r.top + r.height * 0.35, kind: 'heart', count: 20, mode: 'up', spread: 2.2 })
          fx.burst({ x: r.left + r.width / 2, y: r.top + r.height * 0.5, kind: 'light', count: 4, speed: 0.2 })
        }
      }, 700),
      window.setTimeout(() => {
        setSettled(true)
        fx.setAmbient(0.9, 0.35)
      }, 4200),
    )
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      const { renderGreetingCard } = await import('../lib/exportCard')
      const blob = await renderGreetingCard()
      setCard(URL.createObjectURL(blob))
    } catch (e) {
      console.error(e)
      setToast('Chưa lưu được thiệp, em thử lại nhé')
    } finally {
      setSaving(false)
    }
  }

  const share = async () => {
    const url = new URL(import.meta.env.BASE_URL, window.location.origin).href
    const data = { title: content.meta.shareTitle, text: content.meta.shareText, url }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      setToast(f.copied)
    } catch {
      setToast(url)
    }
  }

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className="absolute inset-0">
      <Backdrop variant="golden" flowers />
      <div className="relative z-10 h-full overflow-y-auto overflow-x-hidden overscroll-contain" style={{ touchAction: 'pan-y' }}>
        <div className="mx-auto flex min-h-full max-w-[480px] flex-col items-center px-5 pt-safe pb-safe text-center">
          <div className="relative mt-12 w-full">
            <div className="pointer-events-none absolute -left-6 -top-8 opacity-90">
              <CornerFlowers />
            </div>
            <div className="pointer-events-none absolute -right-6 -top-8 opacity-90">
              <CornerFlowers flip />
            </div>
            <motion.p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.3em] text-rose-ink/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {f.date}
            </motion.p>
            <Greeting onDone={celebrate} />
          </div>

          <motion.div
            className="relative mt-2 w-[min(92vw,400px)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute bottom-[9%] right-0 w-[44%] opacity-90">
              <MazdaIllustration className="h-auto w-full overflow-visible" idPrefix="mzf" />
            </div>
            <div ref={famRef} className="relative w-[88%]" data-settled={settled}>
              <FamilyIllustration pose={pose} glow className="h-auto w-full overflow-visible" />
            </div>
          </motion.div>

          <motion.div className="mt-1 w-full" initial={{ opacity: 0, y: 20 }} animate={greeted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: 0.6 }}>
            <Panel className="px-6 py-5">
              {f.message.map((m, i) => (
                <motion.p
                  key={m}
                  className={i === f.message.length - 1 ? 'mt-3 font-script text-[28px] font-bold text-[#c2416b]' : 'mb-2 text-[15.5px] leading-relaxed text-cocoa [text-wrap:balance]'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={greeted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1 + i * 0.75, duration: 0.8 }}
                >
                  {m}
                </motion.p>
              ))}
              <motion.p
                className="mt-1 text-right font-script text-[24px] font-semibold text-rose-ink"
                initial={{ opacity: 0 }}
                animate={greeted ? { opacity: 1 } : {}}
                transition={{ delay: 1 + f.message.length * 0.75 }}
              >
                {f.signature}
              </motion.p>
            </Panel>
          </motion.div>

          <motion.div
            className="mb-4 mt-5 flex w-full max-w-[340px] flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={greeted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 4.4, duration: 0.8 }}
          >
            <PrimaryButton onClick={save} disabled={saving}>
              {saving ? f.saving : f.actions.save}
            </PrimaryButton>
            <PrimaryButton variant="soft" onClick={share}>
              {f.actions.share}
            </PrimaryButton>
            <PrimaryButton variant="soft" onClick={onReplay}>
              {f.actions.replay}
            </PrimaryButton>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {card && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[rgba(90,40,50,0.55)] px-5 pt-safe pb-safe backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCard(null)}
          >
            <motion.img
              src={card}
              alt="Thiệp kỷ niệm 20/10"
              className="max-h-[68vh] w-auto max-w-full rounded-2xl shadow-2xl"
              style={{ WebkitTouchCallout: 'default', userSelect: 'auto' }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <p className="mt-3 text-[14px] text-white/90">{f.saveHint}</p>
            <div className="mt-3 flex gap-3" onClick={(e) => e.stopPropagation()}>
              <a
                href={card}
                download="thiep-20-10-vo-yeu.png"
                className="flex min-h-[48px] items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-rose-ink shadow-lg active:scale-95"
              >
                <Download className="h-5 w-5" /> {f.saveDownload}
              </a>
              <button
                type="button"
                onClick={() => setCard(null)}
                aria-label={f.close}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-rose-ink shadow-lg active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 break-all rounded-full bg-white/95 px-5 py-3 text-center text-[14px] font-medium text-rose-ink shadow-xl"
            style={{ bottom: 'max(24px, calc(var(--safe-bottom) + 16px))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

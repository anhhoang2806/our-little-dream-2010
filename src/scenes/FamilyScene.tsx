import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useFx } from '../components/FxLayer'
import { Panel, PrimaryButton, RevealLines } from '../components/ui'
import { content } from '../config/content'
import { Backdrop } from '../illustrations/Backdrop'
import { FamilyIllustration, type Pose } from '../illustrations/Characters'
import { audio } from '../lib/audio'

export function FamilyScene({ onNext }: { onNext: () => void }) {
  const fx = useFx()
  const [pose, setPose] = useState<Pose>('stand')
  const [hugged, setHugged] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const famRef = useRef<HTMLDivElement>(null)
  const hugTimer = useRef<number>()

  useEffect(() => {
    fx.setAmbient(1.4)
    const t = window.setTimeout(() => setShowNext(true), 9000)
    return () => {
      clearTimeout(t)
      clearTimeout(hugTimer.current)
    }
  }, [fx])

  const hug = () => {
    setPose('hug')
    setHugged(true)
    audio.sfx('heart')
    const r = famRef.current?.getBoundingClientRect()
    if (r) {
      fx.burst({ x: r.left + r.width / 2, y: r.top + r.height * 0.35, kind: 'heart', count: 18, mode: 'up', spread: 1.8 })
      fx.burst({ x: r.left + r.width / 2, y: r.top + r.height * 0.45, kind: 'sparkle', count: 18, speed: 0.9 })
    }
    clearTimeout(hugTimer.current)
    hugTimer.current = window.setTimeout(() => setPose('stand'), 4800)
    window.setTimeout(() => setShowNext(true), 1400)
  }

  return (
    <div className="absolute inset-0">
      <Backdrop variant="afternoon" tree flowers />
      <div className="relative z-10 flex h-full flex-col items-center px-5 pt-safe pb-safe text-center">
        <motion.div
          className="mt-12 w-full max-w-[440px]"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <Panel>
            <RevealLines lines={content.family.message} delay={0.6} step={1} lineClassName="text-[15.5px] leading-relaxed text-cocoa [&:last-child]:mt-1" />
          </Panel>
        </motion.div>

        <div className="flex w-full flex-1 flex-col items-center justify-end">
          <motion.div
            ref={famRef}
            className="relative w-[min(96vw,430px)] cursor-pointer"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.98 }}
            onClick={hug}
            role="button"
            aria-label={content.family.hint}
          >
            <FamilyIllustration pose={pose} glow={hugged} className="h-auto w-full overflow-visible" />
          </motion.div>
          <motion.p
            className="anim-hint mt-1 text-[14px] font-medium text-rose-ink/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: pose === 'hug' ? 0 : 1 }}
            transition={{ delay: pose === 'hug' ? 0 : 2.2 }}
          >
            {content.family.hint}
          </motion.p>
        </div>

        <div className="mb-[2vh] mt-3 flex min-h-[60px] items-end">
          {showNext && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <PrimaryButton pulse onClick={onNext}>
                {content.family.next}
              </PrimaryButton>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

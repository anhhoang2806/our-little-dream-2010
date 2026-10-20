import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { FlowerParticleSystem } from '../components/FlowerParticleSystem'
import { useFx } from '../components/FxLayer'
import { Panel, PrimaryButton, RevealLines } from '../components/ui'
import { content } from '../config/content'
import { Backdrop } from '../illustrations/Backdrop'
import { audio } from '../lib/audio'

export function FlowerGardenScene({ onNext }: { onNext: () => void }) {
  const fx = useFx()
  const goal = content.garden.secretThreshold
  const [progress, setProgress] = useState(0)
  const [heartMode, setHeartMode] = useState(false)
  const [formed, setFormed] = useState(false)

  useEffect(() => {
    fx.setAmbient(0.9)
  }, [fx])

  const onProgress = useCallback(
    (n: number) => {
      setProgress(n)
      if (n >= goal) setHeartMode(true)
    },
    [goal],
  )

  const onHeartFormed = useCallback(() => {
    setFormed(true)
    audio.sfx('heart')
    const w = window.innerWidth
    const h = window.innerHeight
    fx.burst({ x: w / 2, y: h * 0.47, kind: 'heart', count: 22, mode: 'up', spread: 2.4, speed: 1.2 })
    fx.burst({ x: w / 2, y: h * 0.47, kind: 'sparkle', count: 30, speed: 1.4 })
  }, [fx])

  const filled = Math.min(progress, goal)

  return (
    <div className="absolute inset-0">
      <Backdrop variant="garden" />
      <FlowerParticleSystem heartMode={heartMode} onProgress={onProgress} onHeartFormed={onHeartFormed} />

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-between px-5 pt-safe pb-safe text-center">
        <motion.div
          className="mt-12 w-full max-w-[440px]"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: heartMode ? 0 : 1, y: heartMode ? -20 : 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Panel>
            <RevealLines
              lines={content.garden.message}
              delay={0.4}
              step={0.9}
              lineClassName="text-[15.5px] leading-relaxed text-cocoa [&:first-child]:font-script [&:first-child]:text-[26px] [&:first-child]:font-bold [&:first-child]:text-rose-ink"
            />
          </Panel>
        </motion.div>

        <AnimatePresence>
          {formed && (
            <motion.div
              key="secret"
              className="absolute left-1/2 top-[44%] w-[min(64vw,300px)] -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-script text-[clamp(26px,7.6vw,36px)] font-bold leading-[1.2] text-rose-ink text-glow">{content.garden.secret}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-[3vh] flex min-h-[96px] flex-col items-center justify-end gap-3">
          {!formed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: heartMode ? 0 : 1 }} transition={{ delay: heartMode ? 0 : 2.6, duration: 0.8 }}>
              <div className="mb-2 flex justify-center gap-1.5" aria-label={`${filled}/${goal}`}>
                {Array.from({ length: goal }, (_, i) => (
                  <motion.svg
                    key={i}
                    viewBox="-12 -12 24 24"
                    className="h-[18px] w-[18px]"
                    animate={{ scale: i < filled ? [1.6, 1] : 1, opacity: i < filled ? 1 : 0.55 }}
                    transition={{ duration: 0.4 }}
                  >
                    <path
                      d="M0,8 C-13,-1 -7,-13 0,-6 C7,-13 13,-1 0,8 Z"
                      fill={i < filled ? '#f5577a' : '#fff6f8'}
                      stroke={i < filled ? '#d63d63' : '#e79aac'}
                      strokeWidth={1.4}
                    />
                  </motion.svg>
                ))}
              </div>
              <p className="anim-hint text-[14px] font-medium text-rose-ink/80">{content.garden.hint} 🌸</p>
            </motion.div>
          ) : (
            <motion.div className="pointer-events-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}>
              <PrimaryButton pulse onClick={onNext}>
                {content.garden.next}
              </PrimaryButton>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

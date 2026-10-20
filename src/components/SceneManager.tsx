import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { FamilyScene } from '../scenes/FamilyScene'
import { FinalGreetingScene } from '../scenes/FinalGreetingScene'
import { FlowerGardenScene } from '../scenes/FlowerGardenScene'
import { MazdaDreamScene } from '../scenes/MazdaDreamScene'
import { OpeningScene } from '../scenes/OpeningScene'
import { useFx } from './FxLayer'

export const SCENES = ['opening', 'garden', 'family', 'mazda', 'final'] as const
export type SceneId = (typeof SCENES)[number]

function initialScene(): number {
  // Handy for testing: ?scene=3 jumps straight to a scene.
  const n = Number(new URLSearchParams(window.location.search).get('scene'))
  return Number.isInteger(n) && n >= 0 && n < SCENES.length ? n : 0
}

/** Seamless, page-less storytelling: one full-screen scene at a time with soft cross-fades. */
export function SceneManager() {
  const fx = useFx()
  const [index, setIndex] = useState(initialScene)
  const [run, setRun] = useState(0)

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, SCENES.length - 1)), [])
  // ReplayController: start the whole story again from the envelope.
  const replay = useCallback(() => {
    fx.clear()
    fx.setAmbient(0)
    setIndex(0)
    setRun((r) => r + 1)
  }, [fx])

  useEffect(() => {
    document.documentElement.dataset.scene = SCENES[index]
  }, [index])

  const scene = SCENES[index]
  return (
    <AnimatePresence initial={false}>
      <motion.section
        key={`${scene}-${run}`}
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.985 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        aria-label={scene}
      >
        {scene === 'opening' && <OpeningScene onNext={next} />}
        {scene === 'garden' && <FlowerGardenScene onNext={next} />}
        {scene === 'family' && <FamilyScene onNext={next} />}
        {scene === 'mazda' && <MazdaDreamScene onNext={next} />}
        {scene === 'final' && <FinalGreetingScene onReplay={replay} />}
      </motion.section>
    </AnimatePresence>
  )
}

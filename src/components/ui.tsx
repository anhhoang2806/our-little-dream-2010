import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'
import { audio } from '../lib/audio'

type BtnProps = Omit<HTMLMotionProps<'button'>, 'children'> & { children: ReactNode; variant?: 'primary' | 'soft'; pulse?: boolean }

/** Big, friendly pill button (min 52px tall, comfortably above 44×44 touch target). */
export function PrimaryButton({ children, variant = 'primary', pulse = false, className = '', onClick, ...rest }: BtnProps) {
  const base =
    variant === 'primary'
      ? 'text-white bg-[linear-gradient(135deg,#f58aa5_0%,#f27d8f_45%,#f9a77f_100%)] shadow-[0_10px_30px_-10px_rgba(233,96,126,0.7)]'
      : 'text-rose-ink bg-white/80 border border-white shadow-[0_8px_24px_-12px_rgba(160,80,80,0.45)]'
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`relative z-40 min-h-[52px] min-w-[44px] max-w-[min(88vw,380px)] cursor-pointer rounded-[28px] px-7 py-3 text-[16.5px] font-semibold leading-snug tracking-[0.01em] [text-wrap:balance] outline-none focus-visible:ring-4 focus-visible:ring-white/80 ${base} ${pulse ? 'anim-pulse-soft' : ''} ${className}`}
      onClick={(e) => {
        audio.sfx('tap')
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`panel rounded-[28px] px-5 py-4 ${className}`}>{children}</div>
}

/** Reveal lines one by one. */
export function RevealLines({ lines, delay = 0, step = 0.55, className = '', lineClassName = '' }: { lines: readonly string[]; delay?: number; step?: number; className?: string; lineClassName?: string }) {
  return (
    <div className={className}>
      {lines.map((l, i) => (
        <motion.p
          key={l}
          className={`[text-wrap:balance] ${lineClassName}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * step, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {l}
        </motion.p>
      ))}
    </div>
  )
}

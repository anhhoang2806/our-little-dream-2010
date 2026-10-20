import { Music2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { content } from '../config/content'
import { audio } from '../lib/audio'

/** Floating mute / unmute control. Music only ever starts after a user gesture. */
export function MusicController() {
  const [muted, setMuted] = useState(audio.muted)
  const [started, setStarted] = useState(audio.playing)
  useEffect(() => audio.subscribe((m) => {
    setMuted(m)
    setStarted(audio.playing)
  }), [])
  const on = started && !muted
  return (
    <button
      type="button"
      aria-label={on ? content.audio.off : content.audio.on}
      aria-pressed={on}
      onClick={() => {
        if (!audio.playing) {
          audio.start()
          audio.setMuted(false)
        } else audio.toggle()
        setStarted(true)
      }}
      className="fixed z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/70 text-rose-ink shadow-[0_6px_20px_-8px_rgba(160,80,80,0.5)] backdrop-blur-md transition active:scale-90"
      style={{ top: 'max(12px, calc(var(--safe-top) + 8px))', right: 'max(12px, calc(var(--safe-right) + 10px))' }}
    >
      {on ? <Music2 className="h-5 w-5 anim-float" strokeWidth={2.2} /> : <VolumeX className="h-5 w-5" strokeWidth={2.2} />}
    </button>
  )
}

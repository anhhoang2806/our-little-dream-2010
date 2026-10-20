/**
 * Adaptive quality: watches frame times and quietly lowers particle counts and
 * canvas resolution on slower phones. Also honours prefers-reduced-motion.
 */

const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const lowCores = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 8) <= 4

export const perf = {
  reducedMotion: !!reduced,
  particleScale: reduced ? 0.35 : lowCores ? 0.7 : 1,
  maxParticles: reduced ? 80 : lowCores ? 160 : 260,
  maxFlowers: lowCores ? 45 : 70,
  maxDpr: lowCores ? 1.5 : 2,
  degraded: false,
  frames: 0,
  slow: 0,
  sample(dt: number) {
    if (this.degraded) return
    this.frames++
    if (dt > 1 / 40) this.slow++
    if (this.frames === 180) {
      if (this.slow > 60) this.degrade()
      this.frames = 0
      this.slow = 0
    }
  },
  degrade() {
    this.degraded = true
    this.particleScale *= 0.55
    this.maxParticles = Math.round(this.maxParticles * 0.55)
    this.maxFlowers = Math.round(this.maxFlowers * 0.65)
    this.maxDpr = 1
  },
}

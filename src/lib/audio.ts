/**
 * Tiny generative audio engine: a soft, original piano lullaby plus gentle
 * sound effects, synthesised with the Web Audio API (no audio files, no
 * copyrighted music). The AudioContext is only created after a user gesture.
 */

type Sfx = 'open' | 'bloom' | 'heart' | 'car' | 'celebrate' | 'tap'

const MASTER_VOLUME = 0.55
const MUSIC_VOLUME = 0.42
const STORAGE_KEY = 'old-muted'

// Gentle progression in C major: Cmaj7 – Am7 – Fmaj7 – G6 – Em7 – Am7 – Dm7 – Gsus
const PROGRESSION: number[][] = [
  [48, 55, 59, 64, 67],
  [45, 52, 57, 60, 64],
  [41, 48, 53, 57, 64],
  [43, 50, 55, 59, 64],
  [40, 47, 52, 55, 59],
  [45, 52, 57, 60, 64],
  [38, 45, 50, 53, 60],
  [43, 50, 55, 60, 62],
]
// A tender melody (MIDI notes, 0 = rest), two per bar.
const MELODY: number[] = [76, 79, 72, 76, 77, 76, 74, 0, 71, 74, 72, 76, 74, 72, 74, 0, 79, 81, 76, 79, 77, 81, 79, 0, 76, 74, 72, 71, 72, 74, 72, 0]
const PENTA = [72, 74, 76, 79, 81, 84, 86, 88]

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private reverb: ConvolverNode | null = null
  private timer: number | null = null
  get scheduling() {
    return this.timer !== null
  }
  private nextBarTime = 0
  private bar = 0
  private lastBloom = 0
  private listeners = new Set<(muted: boolean) => void>()
  muted = false
  playing = false

  constructor() {
    try {
      this.muted = localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      /* storage may be unavailable */
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return
        if (document.hidden) void this.ctx.suspend()
        else if (this.playing) void this.ctx.resume()
      })
    }
  }

  subscribe(fn: (muted: boolean) => void) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  /** Must be called from inside a user gesture handler. */
  unlock() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      const ctx = new Ctor()
      this.ctx = ctx
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -18
      comp.ratio.value = 4
      comp.connect(ctx.destination)
      this.master = ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(comp)
      this.reverb = ctx.createConvolver()
      this.reverb.buffer = this.makeImpulse(2.8)
      const wet = ctx.createGain()
      wet.gain.value = 0.38
      this.reverb.connect(wet).connect(this.master)
      this.musicBus = ctx.createGain()
      this.musicBus.gain.value = MUSIC_VOLUME
      this.musicBus.connect(this.master)
      this.musicBus.connect(this.reverb)
      this.sfxBus = ctx.createGain()
      this.sfxBus.gain.value = 0.5
      this.sfxBus.connect(this.master)
      this.sfxBus.connect(this.reverb)
    }
    if (this.ctx.state !== 'running') void this.ctx.resume()
    // iOS: play a silent buffer inside the gesture to fully unlock output.
    const b = this.ctx.createBuffer(1, 1, 22050)
    const s = this.ctx.createBufferSource()
    s.buffer = b
    s.connect(this.ctx.destination)
    s.start(0)
  }

  start() {
    this.unlock()
    if (!this.ctx || this.playing) {
      this.applyVolume()
      return
    }
    this.playing = true
    this.nextBarTime = this.ctx.currentTime + 0.15
    this.bar = 0
    this.timer = window.setInterval(() => this.schedule(), 120)
    this.schedule()
    this.applyVolume()
    this.listeners.forEach((fn) => fn(this.muted))
  }

  setMuted(m: boolean) {
    this.muted = m
    try {
      localStorage.setItem(STORAGE_KEY, m ? '1' : '0')
    } catch {
      /* ignore */
    }
    if (!m) this.start()
    this.applyVolume()
    this.listeners.forEach((fn) => fn(m))
  }

  toggle() {
    this.setMuted(!this.muted)
  }

  private applyVolume() {
    if (!this.ctx || !this.master) return
    const now = this.ctx.currentTime
    const g = this.master.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(this.muted ? 0 : MASTER_VOLUME, now + (this.muted ? 0.6 : 2.4))
  }

  private makeImpulse(seconds: number) {
    const ctx = this.ctx!
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
    }
    return buf
  }

  /** Soft felt-piano-like voice. */
  private note(midi: number, time: number, vel: number, dur: number, bus: AudioNode, bright = 1) {
    const ctx = this.ctx!
    const f = midiToFreq(midi)
    const out = ctx.createGain()
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = Math.min(5200, 1400 + f * 1.6) * bright
    lp.Q.value = 0.3
    out.connect(lp).connect(bus)
    out.gain.setValueAtTime(0.0001, time)
    out.gain.exponentialRampToValueAtTime(vel, time + 0.012)
    out.gain.exponentialRampToValueAtTime(vel * 0.35, time + 0.35)
    out.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    const partials: [OscillatorType, number, number][] = [
      ['triangle', 1, 1],
      ['sine', 2, 0.28],
      ['sine', 3, 0.08],
    ]
    for (const [type, mult, amp] of partials) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = type
      o.frequency.value = f * mult
      o.detune.value = (Math.random() - 0.5) * 4
      g.gain.value = amp
      o.connect(g).connect(out)
      o.start(time)
      o.stop(time + dur + 0.05)
    }
  }

  private schedule() {
    if (!this.ctx || !this.musicBus) return
    const beat = 60 / 66
    while (this.nextBarTime < this.ctx.currentTime + 1.2) {
      const t0 = this.nextBarTime
      const chord = PROGRESSION[this.bar % PROGRESSION.length]
      // Bass
      this.note(chord[0], t0, 0.16, beat * 4.2, this.musicBus, 0.7)
      // Arpeggio in eighths
      const arp = [chord[1], chord[2], chord[3], chord[4], chord[3], chord[2], chord[1], chord[2]]
      arp.forEach((n, i) => {
        this.note(n, t0 + (i * beat) / 2 + Math.random() * 0.012, 0.055 + (i === 0 ? 0.02 : 0), beat * 2.4, this.musicBus!, 0.8)
      })
      // Melody, two notes per bar
      const m1 = MELODY[(this.bar * 2) % MELODY.length]
      const m2 = MELODY[(this.bar * 2 + 1) % MELODY.length]
      if (m1) this.note(m1, t0, 0.1, beat * 3, this.musicBus)
      if (m2) this.note(m2, t0 + beat * 2, 0.085, beat * 3, this.musicBus)
      this.nextBarTime += beat * 4
      this.bar++
    }
  }

  sfx(kind: Sfx) {
    if (!this.ctx || !this.sfxBus || this.muted) return
    const t = this.ctx.currentTime + 0.01
    const bus = this.sfxBus
    switch (kind) {
      case 'open':
        ;[84, 88, 91, 96, 100].forEach((n, i) => this.note(n, t + i * 0.09, 0.09, 2.2, bus, 1.2))
        break
      case 'bloom': {
        const now = performance.now()
        if (now - this.lastBloom < 70) return
        this.lastBloom = now
        const n = PENTA[Math.floor(Math.random() * PENTA.length)]
        this.note(n, t, 0.05, 1.4, bus, 1.1)
        break
      }
      case 'heart':
        ;[79, 84, 88, 91].forEach((n, i) => this.note(n, t + i * 0.12, 0.08, 2.4, bus, 1.1))
        break
      case 'car':
        this.note(76, t, 0.07, 0.7, bus, 0.9)
        this.note(79, t + 0.16, 0.07, 1.0, bus, 0.9)
        break
      case 'celebrate':
        ;[72, 76, 79, 84, 88, 91, 96].forEach((n, i) => this.note(n, t + i * 0.1, 0.075, 2.8, bus, 1.15))
        break
      case 'tap':
        this.note(88, t, 0.04, 0.6, bus, 1.2)
        break
    }
  }
}

export const audio = new AudioEngine()
export type { Sfx }

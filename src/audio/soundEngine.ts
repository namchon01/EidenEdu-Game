export type SfxName =
  | 'clank'
  | 'servo'
  | 'lock'
  | 'detach'
  | 'powerUp'
  | 'complete'
  | 'fanfare'
  | 'tap'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null
let muted = false
let unlocked = false

type AudioContextCtor = typeof AudioContext

function getContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & { webkitAudioContext?: AudioContextCtor }
  return window.AudioContext ?? w.webkitAudioContext ?? null
}

function getContext(): AudioContext | null {
  if (ctx) return ctx
  const Ctor = getContextCtor()
  if (!Ctor) return null
  try {
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 0.85
    master.connect(ctx.destination)
    return ctx
  } catch {
    return null
  }
}

/** iOS needs a real buffer start inside a user gesture to fully unlock audio. */
function primeSilentBuffer(c: AudioContext) {
  try {
    const buffer = c.createBuffer(1, 1, c.sampleRate)
    const src = c.createBufferSource()
    src.buffer = buffer
    src.connect(c.destination)
    src.start(0)
  } catch {
    // Ignore — resume alone is enough on most Android browsers.
  }
}

/**
 * Browsers only allow audio to start from a user gesture. Call this from
 * pointer/touch handlers; mobile Safari also needs a silent buffer kick.
 */
export async function unlockAudio(): Promise<boolean> {
  const c = getContext()
  if (!c) return false
  try {
    if (c.state === 'suspended') await c.resume()
    primeSilentBuffer(c)
    unlocked = c.state === 'running'
    return unlocked
  } catch {
    return false
  }
}

export function isAudioUnlocked() {
  return unlocked && !!ctx && ctx.state === 'running'
}

export function setMuted(next: boolean) {
  muted = next
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 0.85, ctx.currentTime, 0.02)
  }
}

function getNoise(c: AudioContext): AudioBuffer {
  if (noise) return noise
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * 0.7), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  noise = buffer
  return buffer
}

interface ToneOptions {
  type?: OscillatorType
  from: number
  to?: number
  start: number
  duration: number
  peak: number
  attack?: number
  filter?: { type: BiquadFilterType; frequency: number; q?: number }
}

function tone(c: AudioContext, out: AudioNode, o: ToneOptions) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  const t0 = c.currentTime + o.start
  const attack = o.attack ?? 0.008

  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.from, t0)
  if (o.to !== undefined && o.to !== o.from) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to), t0 + o.duration)
  }

  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(o.peak, t0 + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration)

  let node: AudioNode = gain
  if (o.filter) {
    const biquad = c.createBiquadFilter()
    biquad.type = o.filter.type
    biquad.frequency.value = o.filter.frequency
    if (o.filter.q !== undefined) biquad.Q.value = o.filter.q
    gain.connect(biquad)
    node = biquad
  }

  osc.connect(gain)
  node.connect(out)
  osc.start(t0)
  osc.stop(t0 + o.duration + 0.05)
}

interface BurstOptions {
  start: number
  duration: number
  peak: number
  filter: { type: BiquadFilterType; frequency: number; q?: number }
  sweepTo?: number
}

function burst(c: AudioContext, out: AudioNode, o: BurstOptions) {
  const src = c.createBufferSource()
  const gain = c.createGain()
  const biquad = c.createBiquadFilter()
  const t0 = c.currentTime + o.start

  src.buffer = getNoise(c)
  biquad.type = o.filter.type
  biquad.frequency.setValueAtTime(o.filter.frequency, t0)
  if (o.filter.q !== undefined) biquad.Q.value = o.filter.q
  if (o.sweepTo !== undefined) {
    biquad.frequency.exponentialRampToValueAtTime(Math.max(1, o.sweepTo), t0 + o.duration)
  }

  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(o.peak, t0 + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration)

  src.connect(biquad)
  biquad.connect(gain)
  gain.connect(out)
  src.start(t0)
  src.stop(t0 + o.duration + 0.05)
}

const RECIPES: Record<SfxName, (c: AudioContext, out: AudioNode) => void> = {
  // Armour plates knocking together: a filtered noise hit plus two detuned
  // metallic rings so it reads as steel rather than a plain click.
  clank: (c, out) => {
    burst(c, out, {
      start: 0,
      duration: 0.13,
      peak: 0.5,
      filter: { type: 'bandpass', frequency: 2100, q: 3 },
      sweepTo: 900,
    })
    tone(c, out, { type: 'triangle', from: 430, to: 380, start: 0, duration: 0.3, peak: 0.22 })
    tone(c, out, { type: 'triangle', from: 638, to: 560, start: 0.008, duration: 0.24, peak: 0.14 })
  },

  servo: (c, out) => {
    tone(c, out, {
      type: 'sawtooth',
      from: 170,
      to: 520,
      start: 0,
      duration: 0.34,
      peak: 0.14,
      attack: 0.05,
      filter: { type: 'lowpass', frequency: 1400, q: 6 },
    })
  },

  lock: (c, out) => {
    tone(c, out, { type: 'square', from: 880, to: 820, start: 0, duration: 0.05, peak: 0.2 })
    tone(c, out, { type: 'square', from: 1380, to: 1320, start: 0.055, duration: 0.07, peak: 0.16 })
    tone(c, out, { type: 'sine', from: 1760, start: 0.055, duration: 0.16, peak: 0.08 })
  },

  detach: (c, out) => {
    tone(c, out, { type: 'triangle', from: 700, to: 170, start: 0, duration: 0.26, peak: 0.22 })
    burst(c, out, {
      start: 0.02,
      duration: 0.3,
      peak: 0.16,
      filter: { type: 'highpass', frequency: 2600 },
      sweepTo: 800,
    })
  },

  powerUp: (c, out) => {
    tone(c, out, {
      type: 'sine',
      from: 220,
      to: 880,
      start: 0,
      duration: 0.5,
      peak: 0.24,
      attack: 0.04,
    })
    tone(c, out, {
      type: 'sine',
      from: 440,
      to: 1760,
      start: 0.02,
      duration: 0.46,
      peak: 0.1,
      attack: 0.05,
    })
    burst(c, out, {
      start: 0.1,
      duration: 0.4,
      peak: 0.05,
      filter: { type: 'bandpass', frequency: 3200, q: 1.5 },
      sweepTo: 6000,
    })
  },

  complete: (c, out) => {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      tone(c, out, {
        type: 'triangle',
        from: freq,
        start: i * 0.11,
        duration: 0.42,
        peak: 0.2,
        attack: 0.012,
      })
    })
    notes.forEach((freq) => {
      tone(c, out, {
        type: 'sine',
        from: freq,
        start: 0.46,
        duration: 0.9,
        peak: 0.11,
        attack: 0.03,
      })
    })
  },

  // Brass-style celebration: a triplet call, a rising run, then a held chord
  // with cymbal hits on top so finishing the whole robot feels like a parade.
  fanfare: (c, out) => {
    const call = [523.25, 523.25, 698.46]
    call.forEach((freq, i) => {
      const start = i * 0.14
      tone(c, out, {
        type: 'square',
        from: freq,
        start,
        duration: i === 2 ? 0.34 : 0.13,
        peak: 0.13,
        attack: 0.014,
        filter: { type: 'lowpass', frequency: 2600, q: 0.8 },
      })
      tone(c, out, { type: 'triangle', from: freq / 2, start, duration: 0.24, peak: 0.1 })
    })

    const run = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    run.forEach((freq, i) => {
      tone(c, out, {
        type: 'sawtooth',
        from: freq,
        start: 0.55 + i * 0.1,
        duration: 0.3,
        peak: 0.1,
        attack: 0.012,
        filter: { type: 'lowpass', frequency: 3400, q: 0.9 },
      })
    })

    const chord = [523.25, 659.25, 783.99, 1046.5, 1567.98]
    chord.forEach((freq) => {
      tone(c, out, {
        type: 'triangle',
        from: freq,
        start: 1.06,
        duration: 1.5,
        peak: 0.12,
        attack: 0.03,
      })
    })

    for (const start of [0, 0.28, 1.06]) {
      burst(c, out, {
        start,
        duration: start === 1.06 ? 1.1 : 0.3,
        peak: start === 1.06 ? 0.14 : 0.09,
        filter: { type: 'highpass', frequency: 3200 },
        sweepTo: 7000,
      })
    }
  },

  tap: (c, out) => {
    tone(c, out, { type: 'sine', from: 620, to: 880, start: 0, duration: 0.09, peak: 0.14 })
  },
}

export function playSfx(name: SfxName) {
  if (muted) return
  const c = getContext()
  if (!c || !master) return

  const run = () => {
    try {
      RECIPES[name](c, master!)
    } catch {
      // A failed sound effect should never interrupt gameplay.
    }
  }

  // Mobile Safari drops sounds scheduled before resume() finishes.
  if (c.state === 'suspended') {
    void c
      .resume()
      .then(() => {
        primeSilentBuffer(c)
        unlocked = c.state === 'running'
        run()
      })
      .catch(() => {})
    return
  }

  unlocked = true
  run()
}

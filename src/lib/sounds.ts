// Web Audio API sound effects — Slithery / serpentine theme for slither.io

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available, silently fail
  }
}

// Eating food/orbs — quick bright nibble
export function playEatSound() {
  playTone(600, 0.04, 'sine', 0.1)
}

// Killing another snake — deep satisfying crunch
export function playKillSound() {
  playTone(280, 0.15, 'triangle', 0.2)
  setTimeout(() => playTone(420, 0.1, 'triangle', 0.15), 50)
}

// Boost start — rising hiss
export function playBoostStartSound() {
  playTone(200, 0.12, 'sawtooth', 0.1)
  setTimeout(() => playTone(320, 0.08, 'sawtooth', 0.08), 40)
}

// Boost end — falling off
export function playBoostEndSound() {
  playTone(260, 0.06, 'sine', 0.06)
}

// Player death — low descending buzz
export function playDeathSound() {
  playTone(160, 0.35, 'sawtooth', 0.25)
  setTimeout(() => playTone(90, 0.3, 'sawtooth', 0.2), 100)
}

// Resume audio context on user interaction (required by browsers)
export function initAudio() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  } catch {
    // Audio not available
  }
}

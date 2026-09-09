import { useEffect } from 'react'
import { setMuted, unlockAudio } from './soundEngine'

/**
 * Keeps the audio engine in sync with the parent-controlled sound toggle and
 * arms the AudioContext on the first interaction, which mobile browsers require.
 */
export function useSoundSync(soundOn: boolean) {
  useEffect(() => {
    setMuted(!soundOn)
  }, [soundOn])

  useEffect(() => {
    let done = false

    const unlock = () => {
      if (done) return
      void unlockAudio().then((ok) => {
        if (!ok) return
        done = true
        remove()
      })
    }

    const opts: AddEventListenerOptions = { capture: true, passive: true }
    const events = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'] as const

    const remove = () => {
      for (const type of events) window.removeEventListener(type, unlock, opts)
    }

    for (const type of events) window.addEventListener(type, unlock, opts)
    return remove
  }, [])
}

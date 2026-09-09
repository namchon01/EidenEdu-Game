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
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])
}

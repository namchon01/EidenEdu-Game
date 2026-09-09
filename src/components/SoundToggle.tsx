import { Volume2, VolumeX } from 'lucide-react'

interface SoundToggleProps {
  soundOn: boolean
  onToggle: () => void
}

/** Fixed bottom-left speaker control — stays on screen while scrolling overlays. */
export function SoundToggle({ soundOn, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={soundOn}
      aria-label={soundOn ? '소리 끄기' : '소리 켜기'}
      title={soundOn ? '소리 켜짐' : '소리 꺼짐'}
      className={`fixed z-[65] flex size-14 items-center justify-center rounded-full shadow-lg ring-1 backdrop-blur-md transition-colors active:scale-95 ${
        soundOn
          ? 'bg-amber-400/95 text-slate-900 ring-amber-200/80'
          : 'bg-slate-950/80 text-amber-100/75 ring-white/20'
      }`}
      style={{
        left: 'max(1rem, env(safe-area-inset-left, 0px))',
        bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {soundOn ? (
        <Volume2 className="size-6" strokeWidth={2.4} aria-hidden />
      ) : (
        <VolumeX className="size-6" strokeWidth={2.4} aria-hidden />
      )}
    </button>
  )
}

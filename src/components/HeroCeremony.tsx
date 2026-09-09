import { useEffect, useState } from 'react'
import { playSfx } from '../audio/soundEngine'

interface HeroCeremonyProps {
  robotName: string
  onDone: () => void
  onOpenShop: () => void
}

export function HeroCeremony({ robotName, onDone, onOpenShop }: HeroCeremonyProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    playSfx('powerUp')
    const timers = [
      window.setTimeout(() => setPhase(1), 600),
      window.setTimeout(() => playSfx('fanfare'), 620),
      window.setTimeout(() => setPhase(2), 1600),
    ]
    return () => {
      for (const t of timers) clearTimeout(t)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute size-2 animate-spark rounded-full bg-amber-300"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 29) % 100}%`,
              animationDelay: `${(i % 6) * 0.15}s`,
            }}
          />
        ))}
      </div>

      <p className="font-display text-sm uppercase tracking-[0.3em] text-amber-300/80">
        Hero Launch
      </p>
      <h2
        className={`mt-3 font-display text-4xl font-black text-amber-50 transition-all duration-700 sm:text-5xl ${
          phase >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        {robotName} 출동!
      </h2>
      <p
        className={`mt-4 max-w-sm text-teal-100 transition-opacity duration-700 ${
          phase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        7부품 조립 완료! 출동 티켓을 받았어요. 약속한 선물로 교환할 수 있어요.
      </p>

      <div
        className={`mt-10 flex w-full max-w-sm flex-col gap-3 transition-all duration-500 ${
          phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={onOpenShop}
          className="min-h-14 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 font-display text-lg font-extrabold text-slate-900"
        >
          선물 받으러 가기
        </button>
        <button
          type="button"
          onClick={onDone}
          className="min-h-12 rounded-2xl bg-white/10 font-display font-bold text-white"
        >
          격납고로 돌아가기
        </button>
      </div>
    </div>
  )
}

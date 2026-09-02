import { Snowflake, Zap } from 'lucide-react'
import type { GameMode } from '../types/game'

interface StatusBarProps {
  energy: number
  mode: GameMode
  robotName: string
  tickets: number
}

export function StatusBar({ energy, mode, robotName, tickets }: StatusBarProps) {
  const cooling = mode === 'cooling'

  return (
    <header className="relative z-20 mx-auto w-full max-w-lg px-4 pt-4">
      <div
        className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md transition-colors ${
          cooling
            ? 'bg-cyan-900/80 text-cyan-50 ring-2 ring-cyan-300/50'
            : 'bg-teal-950/75 text-amber-50 ring-2 ring-amber-400/30'
        }`}
      >
        <div className="min-w-0">
          <p className="font-display text-lg font-bold tracking-wide truncate">{robotName}</p>
          <p className="text-sm opacity-90">
            {cooling ? '냉각 모드 · 보상 대기' : '정상 가동'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              {cooling ? (
                <Snowflake className="size-5 animate-pulse" />
              ) : (
                <Zap className="size-5 text-amber-300" />
              )}
              <span className="font-display text-2xl font-extrabold tabular-nums">
                {energy}%
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-wider opacity-80">에너지</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-1.5 text-center">
            <p className="font-display text-xl font-bold tabular-nums">{tickets}</p>
            <p className="text-[10px] opacity-80">티켓</p>
          </div>
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/25">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            cooling
              ? 'bg-gradient-to-r from-cyan-300 to-sky-400'
              : 'bg-gradient-to-r from-amber-300 via-orange-400 to-lime-400'
          }`}
          style={{ width: `${Math.min(100, energy)}%` }}
        />
      </div>
    </header>
  )
}

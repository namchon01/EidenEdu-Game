import { useState } from 'react'
import type { MissionDef } from '../data/missions'
import type { MissionStatus } from '../types/game'

interface MissionPanelProps {
  missions: MissionDef[]
  statuses: Record<string, MissionStatus>
  limit: number
  cooling: boolean
  onSelect: (id: string) => void
}

export function MissionPanel({
  missions,
  statuses,
  limit,
  cooling,
  onSelect,
}: MissionPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const doneCount = missions.filter((m) => statuses[m.id] === 'done').length
  const visible = pickTodaysMissions(missions, statuses, expanded ? missions.length : limit, cooling)

  return (
    <section className="mx-auto w-full max-w-lg px-4 pb-6">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="font-display text-xl font-bold text-amber-50">오늘의 미션</h2>
        <p className="text-sm text-teal-100/80">
          {doneCount}/{limit} 완료
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((m) => {
          const done = statuses[m.id] === 'done'
          const locked = cooling && !m.recovery && !done
          return (
            <button
              key={m.id}
              type="button"
              disabled={done}
              onClick={() => onSelect(m.id)}
              className={`min-h-[88px] rounded-2xl p-4 text-left shadow-lg transition active:scale-[0.98] disabled:cursor-default ${
                done
                  ? 'bg-slate-800/90 text-emerald-200 ring-2 ring-emerald-400/50'
                  : locked
                    ? 'bg-slate-700/80 text-cyan-100'
                    : `bg-gradient-to-br ${m.color} text-slate-900`
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {done ? '✅' : m.icon}
              </span>
              <p className="mt-1 font-display text-base font-extrabold leading-tight">
                {m.title}
              </p>
              <p className="text-xs opacity-80">{done ? '완료!' : locked ? '냉각 잠금' : m.short}</p>
            </button>
          )
        })}
      </div>
      {missions.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 min-h-12 w-full rounded-2xl bg-white/10 font-display font-bold text-amber-50"
        >
          {expanded ? '접기' : '모든 미션 보기'}
        </button>
      )}
    </section>
  )
}

function pickTodaysMissions(
  missions: MissionDef[],
  statuses: Record<string, MissionStatus>,
  limit: number,
  cooling: boolean,
) {
  if (cooling) {
    const recovery = missions.filter((m) => m.recovery)
    const rest = missions.filter((m) => !m.recovery)
    return [...recovery, ...rest].slice(0, Math.max(limit, 2))
  }
  const pending = missions.filter((m) => statuses[m.id] !== 'done')
  const done = missions.filter((m) => statuses[m.id] === 'done')
  return [...pending, ...done].slice(0, Math.max(limit, 2))
}

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
  const doneCount = missions.filter((m) => statuses[m.id] === 'done').length
  const visible = pickTodaysMissions(missions, statuses, limit)

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
              className={`min-h-[88px] rounded-2xl p-4 text-left shadow-lg transition active:scale-[0.98] disabled:opacity-60 ${
                done
                  ? 'bg-emerald-600/80 text-white'
                  : locked
                    ? 'bg-slate-700/80 text-cyan-100'
                    : `bg-gradient-to-br ${m.color} text-slate-900`
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {m.icon}
              </span>
              <p className="mt-1 font-display text-base font-extrabold leading-tight">
                {m.title}
              </p>
              <p className="text-xs opacity-80">{done ? '완료!' : locked ? '냉각 잠금' : m.short}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/** Prefer pending missions, keep recovery visible when cooling, respect daily limit. */
function pickTodaysMissions(
  missions: MissionDef[],
  statuses: Record<string, MissionStatus>,
  limit: number,
) {
  const pending = missions.filter((m) => statuses[m.id] !== 'done')
  const done = missions.filter((m) => statuses[m.id] === 'done')
  const ordered = [...pending, ...done]
  return ordered.slice(0, Math.max(limit, 2))
}

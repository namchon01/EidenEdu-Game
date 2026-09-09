import { Check, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MissionDef } from '../data/missions'
import { PART_LABELS, PART_ORDER, type PartId } from '../types/game'

interface MissionPanelProps {
  missions: MissionDef[]
  progress: Record<string, number>
  parts: Record<PartId, 0 | 1>
  cooling: boolean
  onStamp: (id: string) => void
  onUnstamp: (id: string) => void
}

export function MissionPanel({
  missions,
  progress,
  parts,
  cooling,
  onStamp,
  onUnstamp,
}: MissionPanelProps) {
  const builtParts = PART_ORDER.filter((p) => parts[p] === 1).length

  return (
    <section
      className="mx-auto w-full max-w-lg px-4"
      style={{
        paddingBottom: 'max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 4.5rem))',
      }}
    >
      <div className="mb-3 flex items-end justify-between">
        <h2 className="font-display text-xl font-bold text-amber-50">오늘의 미션</h2>
        <p className="text-sm text-teal-100/80">
          부품 {builtParts}/{PART_ORDER.length} 조립
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {missions.map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            stamps={Math.min(progress[m.id] ?? 0, m.goalTotal)}
            locked={cooling && !m.recovery}
            onStamp={onStamp}
            onUnstamp={onUnstamp}
          />
        ))}
      </div>
    </section>
  )
}

interface MissionCardProps {
  mission: MissionDef
  stamps: number
  locked: boolean
  onStamp: (id: string) => void
  onUnstamp: (id: string) => void
}

function MissionCard({ mission, stamps, locked, onStamp, onUnstamp }: MissionCardProps) {
  const done = stamps >= mission.goalTotal
  const dimmed = locked && !done
  const partName = PART_LABELS[mission.partId]
  const [celebrating, setCelebrating] = useState(false)
  const [popIndex, setPopIndex] = useState<number | null>(null)
  const prevStamps = useRef(stamps)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    const before = prevStamps.current
    prevStamps.current = stamps

    if (stamps > before) setPopIndex(stamps - 1)
    else setPopIndex(null)

    if (before < mission.goalTotal && stamps >= mission.goalTotal) {
      if (timer.current) window.clearTimeout(timer.current)
      setCelebrating(true)
      navigator.vibrate?.([45, 50, 45, 50, 90])
      timer.current = window.setTimeout(() => setCelebrating(false), 1200)
    }
  }, [stamps, mission.goalTotal])

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const press = (index: number) => {
    // Only the next empty stamp adds, only the last filled stamp undoes.
    // Taps on the other circles of this card — and therefore of any other
    // card — never leak into a neighbouring mission.
    if (dimmed) return
    if (index === stamps) {
      onStamp(mission.id)
      return
    }
    if (index === stamps - 1) {
      onUnstamp(mission.id)
    }
  }

  return (
    <article
      data-mission={mission.id}
      className={`[contain:layout] ${celebrating ? 'animate-card-done' : ''}`}
    >
      <div
        className={`relative overflow-hidden rounded-3xl px-3 py-2.5 shadow-lg ring-2 transition-[background-color,box-shadow,color] duration-500 ${
          done
            ? `bg-gradient-to-br ${mission.color} ring-white/80 shadow-black/40`
            : dimmed
              ? 'bg-slate-800/70 ring-white/10'
              : 'bg-slate-900/70 ring-white/10'
        }`}
      >
        {celebrating && (
          <span
            className="animate-done-flash pointer-events-none absolute inset-0 rounded-3xl bg-white opacity-0"
            aria-hidden
          />
        )}

        <div className="flex items-center gap-3">
          <span
            className={`grid size-12 shrink-0 place-items-center text-3xl leading-none ${
              dimmed && !done ? 'grayscale opacity-60' : ''
            }`}
            aria-hidden
          >
            {mission.icon}
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={`font-display text-lg font-extrabold leading-tight ${
                done ? 'text-slate-900' : 'text-amber-50'
              }`}
            >
              {mission.title}
            </p>
            <p
              className={`mt-0.5 flex items-center gap-1 text-[12px] font-bold leading-snug ${
                done ? 'text-slate-900/80' : 'text-teal-100/90'
              }`}
            >
              {done && <Check className="size-3.5 shrink-0" />}
              {done ? `${partName} 조립 완료` : partName}
            </p>
          </div>

          <div className="flex shrink-0 gap-1.5">
            {Array.from({ length: mission.goalTotal }, (_, i) => (
              <StampButton
                key={i}
                index={i}
                filled={i < stamps}
                pop={popIndex === i}
                onCompletedCard={done}
                mission={mission}
                addable={!dimmed && i === stamps}
                removable={!dimmed && i === stamps - 1}
                onPress={() => press(i)}
              />
            ))}
          </div>
        </div>

        {dimmed && (
          <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-200">
            <Lock className="size-3.5" />
            떼 안 쓰기로 로봇을 고쳐주세요
          </p>
        )}
      </div>
    </article>
  )
}

interface StampButtonProps {
  index: number
  filled: boolean
  pop: boolean
  onCompletedCard: boolean
  mission: MissionDef
  addable: boolean
  removable: boolean
  onPress: () => void
}

function StampButton({
  index,
  filled,
  pop,
  onCompletedCard,
  mission,
  addable,
  removable,
  onPress,
}: StampButtonProps) {
  const live = addable || removable
  const look = !filled
    ? 'bg-slate-800 text-teal-100/45 ring-2 ring-dashed ring-white/25'
    : onCompletedCard
      ? 'bg-white text-slate-900 shadow-lg ring-2 ring-slate-900/25'
      : `bg-gradient-to-br ${mission.color} text-slate-900 shadow-lg ring-2 ring-white/70`

  return (
    <button
      type="button"
      disabled={!live}
      onClick={onPress}
      aria-label={`${mission.title} ${index + 1}번째 도장 ${filled ? '되돌리기' : '찍기'}`}
      aria-pressed={filled}
      className={`relative grid size-[2.475rem] place-items-center rounded-full font-display text-base font-black transition active:scale-90 disabled:opacity-100 ${look} ${
        pop ? 'animate-stamp-pop' : ''
      } ${!live && !filled ? 'opacity-50' : ''}`}
    >
      {filled ? (
        <>
          {pop && (
            <span className="animate-stamp-ring absolute inset-0 rounded-full ring-2 ring-white/80" />
          )}
          <Check className="size-[1.35rem]" strokeWidth={3.5} />
        </>
      ) : (
        index + 1
      )}
    </button>
  )
}

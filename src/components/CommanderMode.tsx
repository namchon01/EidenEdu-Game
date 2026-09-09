import { useState } from 'react'
import { MISSIONS } from '../data/missions'
import { PART_LABELS, PART_ORDER, type GameState, type PartId } from '../types/game'

interface CommanderModeProps {
  state: GameState
  onClose: () => void
  onCooling: (hours: number) => void
  onClearCooling: () => void
  onSetPart: (partId: PartId, docked: boolean) => void
  onSetDailyLimit: (n: number) => void
  onSetPin: (pin: string) => void
  onSetSound: (on: boolean) => void
  onRename: (name: string) => void
  onAddReward: (label: string) => void
  onReset: () => void
  onStampMission: (id: string) => void
  onUnstampMission: (id: string) => void
}

export function CommanderMode({
  state,
  onClose,
  onCooling,
  onClearCooling,
  onSetPart,
  onSetDailyLimit,
  onSetPin,
  onSetSound,
  onRename,
  onAddReward,
  onReset,
  onStampMission,
  onUnstampMission,
}: CommanderModeProps) {
  const [name, setName] = useState(state.robotName)
  const [pin, setPin] = useState(state.parentPin)
  const [rewardLabel, setRewardLabel] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 p-4 backdrop-blur-md">
      <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 to-teal-950 p-5 text-amber-50 ring-1 ring-amber-400/20">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">사령관 모드</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl bg-white/10 px-4 font-bold"
          >
            닫기
          </button>
        </div>
        <p className="mt-1 text-sm text-teal-100/80">부모님 전용 · 도장 조정 · 냉각 · 부품 조정</p>

        <section className="mt-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-amber-200">로봇 이름</h3>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={10}
              className="min-h-12 flex-1 rounded-xl bg-black/30 px-3 text-lg outline-none ring-1 ring-white/20 focus:ring-amber-300"
            />
            <button
              type="button"
              onClick={() => onRename(name)}
              className="min-h-12 rounded-xl bg-amber-400 px-4 font-bold text-slate-900"
            >
              저장
            </button>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-amber-200">미션 도장 조정</h3>
          <div className="space-y-2">
            {MISSIONS.map((m) => {
              const stamps = Math.min(state.missionProgress[m.id] ?? 0, m.goalTotal)
              const done = stamps >= m.goalTotal
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {m.icon} {m.title}
                  </span>
                  <span
                    className={`shrink-0 text-sm font-bold tabular-nums ${
                      done ? 'text-amber-300' : 'text-teal-100/80'
                    }`}
                  >
                    {stamps}/{m.goalTotal}
                    {done ? ' ✓' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUnstampMission(m.id)}
                    disabled={stamps === 0}
                    aria-label={`${m.title} 도장 차감`}
                    className="size-10 shrink-0 rounded-lg bg-white/10 text-xl font-bold disabled:opacity-35"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => onStampMission(m.id)}
                    disabled={done}
                    aria-label={`${m.title} 도장 추가`}
                    className="size-10 shrink-0 rounded-lg bg-amber-400/90 text-xl font-bold text-slate-900 disabled:opacity-35"
                  >
                    +
                  </button>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-teal-100/70">
            냉각 중에도 사령관은 도장을 찍을 수 있어요. 3개가 되면 부품이 바로 조립됩니다.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-amber-200">냉각 (벌칙)</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCooling(2)}
              className="min-h-12 rounded-xl bg-cyan-600 px-4 font-bold"
            >
              2시간 냉각
            </button>
            <button
              type="button"
              onClick={() => onCooling(4)}
              className="min-h-12 rounded-xl bg-cyan-700 px-4 font-bold"
            >
              4시간 냉각
            </button>
            <button
              type="button"
              onClick={onClearCooling}
              className="min-h-12 rounded-xl bg-emerald-600 px-4 font-bold"
            >
              냉각 해제
            </button>
          </div>
          <p className="text-xs text-cyan-100/70">
            상태: {state.mode === 'cooling' ? `냉각 ~ ${state.coolingUntil?.slice(11, 16) ?? ''}` : '정상'}
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-amber-200">단계 강제 조정</h3>
          <div className="space-y-2">
            {PART_ORDER.map((partId) => (
              <div
                key={partId}
                className="flex items-center justify-between gap-2 rounded-xl bg-black/25 px-3 py-2"
              >
                <span className="text-sm font-semibold">{PART_LABELS[partId]}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSetPart(partId, true)}
                    className="min-h-10 rounded-lg bg-amber-400/90 px-3 text-sm font-bold text-slate-900"
                  >
                    장착
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetPart(partId, false)}
                    className="min-h-10 rounded-lg bg-white/10 px-3 text-sm font-bold"
                  >
                    해제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-amber-200">한눈에 보여줄 미션 수</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSetDailyLimit(state.dailyMissionLimit - 1)}
              className="size-12 rounded-xl bg-white/10 text-2xl font-bold"
            >
              −
            </button>
            <span className="font-display text-3xl font-black tabular-nums">
              {state.dailyMissionLimit}
            </span>
            <button
              type="button"
              onClick={() => onSetDailyLimit(state.dailyMissionLimit + 1)}
              className="size-12 rounded-xl bg-white/10 text-2xl font-bold"
            >
              +
            </button>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-amber-200">실물 보상 목록</h3>
          <ul className="space-y-1 text-sm">
            {state.rewards.map((r) => (
              <li key={r.id} className="rounded-lg bg-black/20 px-3 py-2">
                {r.label}
                {r.redeemed ? ' · 예약됨' : ''}
                {r.delayed ? ' · 지연' : ''}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={rewardLabel}
              onChange={(e) => setRewardLabel(e.target.value)}
              placeholder="예: 레고 세트"
              className="min-h-12 flex-1 rounded-xl bg-black/30 px-3 outline-none ring-1 ring-white/20"
            />
            <button
              type="button"
              onClick={() => {
                if (!rewardLabel.trim()) return
                onAddReward(rewardLabel.trim())
                setRewardLabel('')
              }}
              className="min-h-12 rounded-xl bg-amber-400 px-4 font-bold text-slate-900"
            >
              추가
            </button>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-amber-200">PIN · 소리</h3>
          <div className="flex gap-2">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              className="min-h-12 w-28 rounded-xl bg-black/30 px-3 text-center text-xl tracking-widest outline-none ring-1 ring-white/20"
            />
            <button
              type="button"
              onClick={() => pin.length === 4 && onSetPin(pin)}
              className="min-h-12 rounded-xl bg-white/15 px-4 font-bold"
            >
              PIN 저장
            </button>
            <button
              type="button"
              onClick={() => onSetSound(!state.soundOn)}
              className="min-h-12 rounded-xl bg-white/15 px-4 font-bold"
            >
              소리 {state.soundOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </section>

        <section className="mt-8 border-t border-white/10 pt-4">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-12 w-full rounded-xl bg-rose-800/80 font-bold"
            >
              게임 초기화…
            </button>
          ) : (
            <button
              type="button"
              onClick={onReset}
              className="min-h-12 w-full rounded-xl bg-rose-600 font-bold"
            >
              정말 초기화합니다
            </button>
          )}
        </section>
      </div>
    </div>
  )
}

import { MessageCircle, Radio, Trash2 } from 'lucide-react'
import { playSfx } from '../audio/soundEngine'
import type { MissionDef } from '../data/missions'
import { rewardIcon } from '../data/rewards'
import { PART_LABELS, PART_ORDER, type PartId, type RewardItem } from '../types/game'

interface ShopProps {
  tickets: number
  cooling: boolean
  rewards: RewardItem[]
  missions: MissionDef[]
  progress: Record<string, number>
  parts: Record<PartId, 0 | 1>
  message: string
  onReserve: (id: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}

export function Shop({
  tickets,
  cooling,
  rewards,
  missions,
  progress,
  parts,
  message,
  onReserve,
  onRemove,
  onClose,
}: ShopProps) {
  const builtParts = PART_ORDER.filter((p) => parts[p] === 1).length
  const robotReady = builtParts === PART_ORDER.length
  const reservedId = rewards.find((r) => r.redeemed)?.id ?? null
  const onePickTaken = reservedId !== null

  const handleReserve = (reward: RewardItem) => {
    const affordable =
      robotReady &&
      !cooling &&
      !reward.delayed &&
      !reward.redeemed &&
      !onePickTaken &&
      tickets >= reward.cost
    playSfx(affordable ? 'complete' : 'detach')
    onReserve(reward.id)
  }

  const handleRemove = (reward: RewardItem) => {
    playSfx('detach')
    onRemove(reward.id)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-gradient-to-b from-teal-900 to-slate-950 p-5 text-amber-50 ring-1 ring-white/15">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold">보상 상점</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl bg-white/10 px-4 font-bold"
          >
            닫기
          </button>
        </div>
        <p className="mt-1 text-sm text-teal-100/80">출동 티켓: {tickets}장</p>
        <p className="text-[11px] text-amber-200/90">
          {robotReady
            ? '로봇을 완성하면 상품을 1개만 고를 수 있어요.'
            : '미션을 모두 끝내 로봇을 완성해야 상품을 예약할 수 있어요.'}
        </p>

        {cooling && (
          <p className="mt-3 rounded-xl bg-cyan-900/70 px-3 py-2 text-sm text-cyan-50">
            냉각 중이라 상점이 잠겨 있어요. 떼 안 쓰기로 로봇을 고치면 열려요!
          </p>
        )}

        {!robotReady && !cooling && (
          <p className="mt-3 rounded-xl bg-amber-900/50 px-3 py-2 text-sm text-amber-50">
            부품 {builtParts}/{PART_ORDER.length} · 아직 예약할 수 없어요.
          </p>
        )}

        <div
          key={message}
          className="animate-dock-pulse mt-4 flex items-start gap-2.5 rounded-2xl bg-slate-950/70 px-3.5 py-3 ring-1 ring-teal-300/30"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-400/20 text-teal-200">
            <MessageCircle className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[11px] font-bold uppercase tracking-widest text-teal-300/80">
              정비사 통신
            </p>
            <p className="text-sm font-semibold leading-snug text-amber-50">{message}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {rewards.map((r) => {
            const blockedByOnePick = onePickTaken && !r.redeemed
            const blockedByMissions = !robotReady && !r.redeemed
            const locked =
              cooling || r.delayed || tickets < r.cost || blockedByOnePick || blockedByMissions
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-2xl bg-black/25 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold">{r.label}</p>
                  <p className="text-xs opacity-70">
                    {r.redeemed
                      ? '예약 완료 · 부모님께!'
                      : blockedByMissions
                        ? '미션 완료 후 예약'
                        : blockedByOnePick
                          ? '상품은 1개만 가능'
                          : r.delayed
                            ? '지연됨 (냉각)'
                            : `티켓 ${r.cost}장`}
                  </p>
                </div>
                <span
                  className={`grid size-14 shrink-0 place-items-center rounded-full text-3xl shadow-inner ring-2 ${
                    r.redeemed
                      ? 'bg-gradient-to-br from-amber-300 to-orange-400 ring-white/80'
                      : 'bg-slate-950/50 ring-amber-400/70'
                  }`}
                  aria-hidden
                >
                  {rewardIcon(r.label)}
                </span>
                {r.redeemed ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(r)}
                    aria-label={`${r.label} 제거`}
                    className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-xl bg-rose-500/90 px-3.5 font-display font-extrabold text-white"
                  >
                    <Trash2 className="size-4" />
                    제거
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => handleReserve(r)}
                    className="min-h-12 shrink-0 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 font-display font-extrabold text-slate-900 disabled:opacity-35"
                  >
                    {cooling || r.delayed
                      ? '나중에!'
                      : blockedByMissions || blockedByOnePick
                        ? '불가'
                        : '예약'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <div className="mt-6 rounded-2xl bg-black/25 p-4">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 font-display text-base font-extrabold text-amber-100">
              <Radio className="size-4 text-teal-300" />
              미션 진행
            </h3>
            <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-bold text-amber-100 ring-1 ring-amber-300/40">
              부품 {builtParts}/{PART_ORDER.length} 조립
            </span>
          </div>

          <p className="mt-1 text-[11px] text-teal-100/70">
            로봇을 완성하면 출동 티켓 1장으로 상품을 1개만 고를 수 있어요.
          </p>

          <ul className="mt-3 space-y-2.5">
            {missions.map((m) => {
              const stamps = Math.min(progress[m.id] ?? 0, m.goalTotal)
              const done = stamps >= m.goalTotal
              return (
                <li key={m.id} className="flex items-center gap-2.5">
                  <span className="w-6 shrink-0 text-center text-lg" aria-hidden>
                    {m.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-xs font-bold text-amber-50">{m.title}</p>
                      <p
                        className={`shrink-0 text-[11px] font-bold ${
                          done ? 'text-amber-200' : 'text-teal-100/70'
                        }`}
                      >
                        {done ? `${PART_LABELS[m.partId]} 완성!` : `${stamps}/${m.goalTotal}`}
                      </p>
                    </div>
                    <div className="mt-1 flex gap-1">
                      {Array.from({ length: m.goalTotal }, (_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < stamps ? `bg-gradient-to-r ${m.color}` : 'bg-white/12'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

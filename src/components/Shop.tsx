import { MessageCircle, Trash2 } from 'lucide-react'
import { playSfx, unlockAudio } from '../audio/soundEngine'
import { rewardIcon } from '../data/rewards'
import { PART_ORDER, type PartId, type RewardItem } from '../types/game'

interface ShopProps {
  tickets: number
  cooling: boolean
  rewards: RewardItem[]
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
  parts,
  message,
  onReserve,
  onRemove,
  onClose,
}: ShopProps) {
  const builtParts = PART_ORDER.filter((p) => parts[p] === 1).length
  const robotReady = builtParts === PART_ORDER.length

  const handleReserve = (reward: RewardItem) => {
    const affordable =
      robotReady &&
      !cooling &&
      !reward.delayed &&
      !reward.redeemed &&
      tickets >= reward.cost
    void unlockAudio()
    playSfx(affordable ? 'complete' : 'detach')
    onReserve(reward.id)
  }

  const handleRemove = (reward: RewardItem) => {
    void unlockAudio()
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
          <h2 className="font-display text-2xl font-extrabold">선물 상점</h2>
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
          미션 7개를 완성할 때마다 티켓 1장을 받아요. 티켓으로 상품을 예약하세요.
        </p>

        {cooling && (
          <p className="mt-3 rounded-xl bg-cyan-900/70 px-3 py-2 text-sm text-cyan-50">
            냉각 중이라 상점이 잠겨 있어요. 떼 안 쓰기로 로봇을 고치면 열려요!
          </p>
        )}

        {!robotReady && !cooling && (
          <p className="mt-3 rounded-xl bg-amber-900/50 px-3 py-2 text-sm text-amber-50">
            부품 {builtParts}/{PART_ORDER.length} · 로봇을 완성하면 예약할 수 있어요.
          </p>
        )}

        {robotReady && tickets < 1 && !cooling && (
          <p className="mt-3 rounded-xl bg-amber-900/50 px-3 py-2 text-sm text-amber-50">
            티켓이 없어요. 리셋 후 미션 7개를 다시 모으면 티켓 1장을 받아요.
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
            const blockedByMissions = !robotReady && !r.redeemed
            const blockedByTickets = !r.redeemed && tickets < r.cost
            const locked =
              cooling || r.delayed || blockedByTickets || blockedByMissions
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
                        : blockedByTickets
                          ? '티켓이 부족해요'
                          : r.delayed
                            ? '지연됨 (냉각)'
                            : `티켓 ${r.cost}장`}
                  </p>
                </div>
                <span
                  className="grid size-14 shrink-0 place-items-center text-3xl leading-none"
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
                      : blockedByMissions || blockedByTickets
                        ? '불가'
                        : '예약'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

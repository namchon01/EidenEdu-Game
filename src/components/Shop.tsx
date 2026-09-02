import type { RewardItem } from '../types/game'

interface ShopProps {
  tickets: number
  cooling: boolean
  rewards: RewardItem[]
  onReserve: (id: string) => void
  onClose: () => void
}

export function Shop({ tickets, cooling, rewards, onReserve, onClose }: ShopProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-teal-900 to-slate-950 p-6 text-amber-50 ring-1 ring-white/15">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold">보상 상점</h2>
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-white/10 px-4 font-bold">
            닫기
          </button>
        </div>
        <p className="mt-1 text-sm text-teal-100/80">출동 티켓: {tickets}장</p>

        {cooling && (
          <p className="mt-3 rounded-xl bg-cyan-900/70 px-3 py-2 text-sm text-cyan-50">
            냉각 중이라 상점이 잠겨 있어요. 나중에!
          </p>
        )}

        <ul className="mt-5 space-y-3">
          {rewards.map((r) => {
            const locked = cooling || r.delayed || r.redeemed || tickets < r.cost
            return (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-black/25 px-4 py-3"
              >
                <div>
                  <p className="font-display text-lg font-bold">{r.label}</p>
                  <p className="text-xs opacity-70">
                    {r.redeemed
                      ? '예약 완료 · 부모님께!'
                      : r.delayed
                        ? '지연됨 (냉각)'
                        : `티켓 ${r.cost}장`}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={locked && !r.redeemed}
                  onClick={() => onReserve(r.id)}
                  className="min-h-12 shrink-0 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 font-display font-extrabold text-slate-900 disabled:opacity-35"
                >
                  {r.redeemed ? '완료' : cooling || r.delayed ? '나중에!' : '예약'}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

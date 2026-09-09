import { rewardIcon } from '../data/rewards'
import type { RewardItem } from '../types/game'

interface TicketRackProps {
  rewards: RewardItem[]
}

/** Hangar collection of reserved rewards, kept until a commander reset. */
export function TicketRack({ rewards }: TicketRackProps) {
  const claimed = rewards.filter((r) => r.redeemed)
  if (claimed.length === 0) return null

  return (
    <div
      className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1"
      aria-label={`예약한 상품 ${claimed.length}개`}
    >
      {claimed.map((r) => (
        <span
          key={r.id}
          title={r.label}
          className="grid size-10 place-items-center text-[28px] leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
        >
          {rewardIcon(r.label)}
        </span>
      ))}
    </div>
  )
}

import type { RewardItem } from '../types/game'

/** Built-in gift shelf. Missing ids are merged into older saves on load. */
export const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'r1', label: '아이스크림', cost: 1, delayed: false, redeemed: false },
  { id: 'r2', label: '공원 놀기', cost: 1, delayed: false, redeemed: false },
  { id: 'r3', label: '원하는 장난감', cost: 1, delayed: false, redeemed: false },
  { id: 'r4', label: '영화 보기', cost: 1, delayed: false, redeemed: false },
]

/** Child-friendly picture for a reward name. Unknown labels get a gift. */
export function rewardIcon(label: string): string {
  const t = label.trim()
  if (/아이스크림|아이스|ice\s*cream/i.test(t)) return '🍦'
  if (/공원|놀기|놀이터|park/i.test(t)) return '🏞️'
  if (/영화|movie|시네마/i.test(t)) return '🍿'
  if (/장난감|레고|인형|toy/i.test(t)) return '🎁'
  if (/사탕|candy/i.test(t)) return '🍬'
  if (/과자|쿠키|snack/i.test(t)) return '🍪'
  if (/책|동화|book/i.test(t)) return '📚'
  if (/영상|만화/i.test(t)) return '🎬'
  if (/자전거|킥보드/i.test(t)) return '🚲'
  return '🎁'
}

/** Keep saved redeemed/delayed flags while ensuring catalog items exist. */
export function mergeRewardCatalog(
  saved: RewardItem[] | undefined,
  cooling: boolean,
): RewardItem[] {
  const byId = new Map((saved ?? []).map((r) => [r.id, r]))
  const merged = DEFAULT_REWARDS.map((item) => {
    const prev = byId.get(item.id)
    if (!prev) {
      return { ...item, delayed: cooling || item.delayed, redeemed: false }
    }
    return {
      ...item,
      delayed: prev.delayed,
      redeemed: prev.redeemed,
      label: prev.label || item.label,
      cost: prev.cost || item.cost,
    }
  })

  // Keep any custom rewards parents added in commander mode.
  for (const r of saved ?? []) {
    if (!DEFAULT_REWARDS.some((d) => d.id === r.id)) merged.push(r)
  }
  return merged
}

export const TICKET_ICON = '🎫'
export const TICKET_SLOTS = 3

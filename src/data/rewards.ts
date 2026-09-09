/** Child-friendly picture for a reward name. Unknown labels get a gift. */
export function rewardIcon(label: string): string {
  const t = label.trim()
  if (/아이스크림|아이스|ice\s*cream/i.test(t)) return '🍦'
  if (/공원|놀기|놀이터|park/i.test(t)) return '🏞️'
  if (/장난감|레고|인형|toy/i.test(t)) return '🎁'
  if (/사탕|candy/i.test(t)) return '🍬'
  if (/과자|쿠키|snack/i.test(t)) return '🍪'
  if (/책|동화|book/i.test(t)) return '📚'
  if (/영상|만화|영화/i.test(t)) return '🎬'
  if (/자전거|킥보드/i.test(t)) return '🚲'
  return '🎁'
}

export const TICKET_ICON = '🎫'
export const TICKET_SLOTS = 3

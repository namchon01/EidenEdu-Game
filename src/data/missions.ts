import { GOAL_TOTAL, type PartId } from '../types/game'

export interface MissionDef {
  id: string
  title: string
  short: string
  /** Shown when the child is one stamp away from finishing. */
  almost: string
  icon: string
  partId: PartId
  goalTotal: number
  sticker?: string
  recovery?: boolean
  color: string
}

export const MISSIONS: MissionDef[] = [
  {
    id: 'eatWell',
    title: '골고루 먹기',
    short: '채소·고기도 맛있게!',
    almost: '한 끼만 더 골고루 먹으면 심장이 뛰어요!',
    icon: '🍽️',
    partId: 'body',
    goalTotal: GOAL_TOTAL,
    color: 'from-orange-400 to-amber-500',
  },
  {
    id: 'tidy',
    title: '장난감 정리',
    short: '장난감을 제자리에!',
    almost: '한 번만 더 정리하면 발이 생겨요!',
    icon: '🧸',
    partId: 'feet',
    goalTotal: GOAL_TOTAL,
    color: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'polite',
    title: '예쁜말 쓰기',
    short: '부드러운 말로 말하기',
    almost: '한 번만 더 예쁜말을 쓰면 머리가 생겨요!',
    icon: '💬',
    partId: 'head',
    goalTotal: GOAL_TOTAL,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'noTantrum',
    title: '떼 안 쓰기',
    short: '침착 방패 유지하기',
    almost: '한 번만 더 참으면 방패가 생겨요!',
    icon: '🛡️',
    partId: 'shield',
    goalTotal: GOAL_TOTAL,
    recovery: true,
    color: 'from-lime-400 to-green-500',
  },
  {
    id: 'homework',
    title: '과제 제때 하기',
    short: '유치원 과제 끝내기',
    almost: '한 번만 더 끝내면 다리가 생겨요!',
    icon: '📚',
    partId: 'legs',
    goalTotal: GOAL_TOTAL,
    color: 'from-yellow-400 to-orange-400',
  },
  {
    id: 'helpParents',
    title: '부모님 도와주기',
    short: '작은 일 하나 돕기',
    almost: '한 번만 더 도우면 팔이 생겨요!',
    icon: '🤝',
    partId: 'arms',
    goalTotal: GOAL_TOTAL,
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'diary',
    title: '일기·편지 쓰기',
    short: '그림이나 말로 남기기',
    almost: '한 번만 더 쓰면 날개가 펼쳐져요!',
    icon: '✏️',
    partId: 'booster',
    goalTotal: GOAL_TOTAL,
    sticker: '반짝이별',
    color: 'from-fuchsia-400 to-violet-500',
  },
]

export const MISSION_BY_PART = Object.fromEntries(
  MISSIONS.map((m) => [m.partId, m]),
) as Record<PartId, MissionDef>

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

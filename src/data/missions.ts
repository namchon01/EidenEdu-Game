import type { PartId } from '../types/game'

export interface MissionDef {
  id: string
  title: string
  short: string
  icon: string
  partId: PartId
  energyGain: number
  pieceGain: number
  sticker?: string
  recovery?: boolean
  color: string
}

export const MISSIONS: MissionDef[] = [
  {
    id: 'eatWell',
    title: '골고루 먹기',
    short: '채소·고기도 맛있게!',
    icon: '🍽️',
    partId: 'body',
    energyGain: 10,
    pieceGain: 1,
    color: 'from-orange-400 to-amber-500',
  },
  {
    id: 'tidy',
    title: '장난감 정리',
    short: '장난감을 제자리에!',
    icon: '🧸',
    partId: 'feet',
    energyGain: 5,
    pieceGain: 1,
    color: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'polite',
    title: '존댓말 쓰기',
    short: '부드러운 말로 말하기',
    icon: '💬',
    partId: 'head',
    energyGain: 5,
    pieceGain: 1,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'noTantrum',
    title: '떼 안 쓰기',
    short: '침착 방패 유지하기',
    icon: '🛡️',
    partId: 'legs',
    energyGain: 8,
    pieceGain: 1,
    recovery: true,
    color: 'from-lime-400 to-green-500',
  },
  {
    id: 'homework',
    title: '과제 제때 하기',
    short: '유치원 과제 끝내기',
    icon: '📚',
    partId: 'arms',
    energyGain: 8,
    pieceGain: 1,
    color: 'from-yellow-400 to-orange-400',
  },
  {
    id: 'helpParents',
    title: '부모님 도와주기',
    short: '작은 일 하나 돕기',
    icon: '🤝',
    partId: 'arms',
    energyGain: 12,
    pieceGain: 1,
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'diary',
    title: '일기·편지 쓰기',
    short: '그림이나 말로 남기기',
    icon: '✏️',
    partId: 'head',
    energyGain: 6,
    pieceGain: 1,
    sticker: '반짝이별',
    color: 'from-fuchsia-400 to-violet-500',
  },
]

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

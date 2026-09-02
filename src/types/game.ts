export type PartId = 'feet' | 'legs' | 'body' | 'arms' | 'head'

export type MissionStatus = 'pending' | 'done'

export type GameMode = 'normal' | 'cooling'

export type Screen =
  | 'hangar'
  | 'mission'
  | 'commander'
  | 'shop'
  | 'hero'
  | 'pin'

export interface RewardItem {
  id: string
  label: string
  cost: number
  delayed: boolean
  redeemed: boolean
}

export interface DockEvent {
  partId: PartId
  key: number
}

export interface GameState {
  robotName: string
  energy: number
  parts: Record<PartId, 0 | 1>
  partPieces: Record<PartId, number>
  mode: GameMode
  coolingUntil: string | null
  missionsToday: Record<string, MissionStatus>
  missionDate: string
  dailyMissionLimit: number
  rewards: RewardItem[]
  parentPin: string
  tickets: number
  stickers: string[]
  heroCelebrated: boolean
  soundOn: boolean
  engineerMessage: string
}

export const PART_ORDER: PartId[] = ['feet', 'legs', 'body', 'arms', 'head']

export const PART_LABELS: Record<PartId, string> = {
  feet: '정리의 발',
  legs: '약속의 다리',
  body: '건강의 심장',
  arms: '도우미의 팔',
  head: '존중의 머리',
}

export const PIECES_TO_DOCK = 2
export const ENERGY_PER_PART = 20
export const STORAGE_KEY = 'robot-habit-hangar-v1'
export const DEFAULT_PIN = '1234'

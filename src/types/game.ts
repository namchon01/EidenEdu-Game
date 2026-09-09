export type PartId = 'feet' | 'legs' | 'body' | 'arms' | 'head' | 'shield' | 'booster'

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

/** A part joining or leaving the robot. The key makes repeats distinct. */
export interface PartEvent {
  partId: PartId
  key: number
}

export type DockEvent = PartEvent

export interface GameState {
  robotName: string
  energy: number
  parts: Record<PartId, 0 | 1>
  /** Stamps earned per mission, kept across days until the goal is reached. */
  missionProgress: Record<string, number>
  mode: GameMode
  coolingUntil: string | null
  missionDate: string
  dailyMissionLimit: number
  rewards: RewardItem[]
  parentPin: string
  tickets: number
  /** Same as total mission stamps; kept for save compatibility. */
  ticketsEarned: number
  stickers: string[]
  heroCelebrated: boolean
  soundOn: boolean
  engineerMessage: string
}

export const PART_ORDER: PartId[] = [
  'feet',
  'legs',
  'body',
  'arms',
  'head',
  'shield',
  'booster',
]

export const PART_LABELS: Record<PartId, string> = {
  feet: '정리의 발',
  legs: '약속의 다리',
  body: '건강의 심장',
  arms: '도우미의 팔',
  head: '존중의 머리',
  shield: '침착의 방패',
  booster: '기록의 날개',
}

/** Stamps needed before a mission finishes and its part snaps on. */
export const GOAL_TOTAL = 3
export const STORAGE_KEY = 'robot-habit-hangar-v1'
export const DEFAULT_PIN = '1234'

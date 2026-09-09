import { MISSIONS, todayKey, type MissionDef } from '../data/missions'
import {
  DEFAULT_PIN,
  GOAL_TOTAL,
  PART_LABELS,
  PART_ORDER,
  STORAGE_KEY,
  type GameState,
  type PartEvent,
  type PartId,
  type RewardItem,
} from '../types/game'

function emptyProgress(): Record<string, number> {
  const progress: Record<string, number> = {}
  for (const m of MISSIONS) progress[m.id] = 0
  return progress
}

function emptyParts(): Record<PartId, 0 | 1> {
  const parts = {} as Record<PartId, 0 | 1>
  for (const id of PART_ORDER) parts[id] = 0
  return parts
}

export function createDefaultState(): GameState {
  return {
    robotName: '코코봇',
    energy: 0,
    parts: emptyParts(),
    missionProgress: emptyProgress(),
    mode: 'normal',
    coolingUntil: null,
    missionDate: todayKey(),
    dailyMissionLimit: 3,
    rewards: [
      { id: 'r1', label: '아이스크림', cost: 1, delayed: false, redeemed: false },
      { id: 'r2', label: '공원 놀기', cost: 1, delayed: false, redeemed: false },
      { id: 'r3', label: '원하는 장난감', cost: 1, delayed: false, redeemed: false },
    ],
    parentPin: DEFAULT_PIN,
    tickets: 0,
    ticketsEarned: 0,
    stickers: [],
    heroCelebrated: false,
    soundOn: true,
    engineerMessage: '오늘도 출동 준비! 미션 도장을 모아보자!',
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/** Saves written before missions had stamps stored pieces per part instead. */
interface LegacySave {
  partPieces?: Record<string, number>
}

function normalize(raw: Partial<GameState> & LegacySave): GameState {
  const base = createDefaultState()
  const state: GameState = {
    ...base,
    ...raw,
    parts: { ...base.parts, ...(raw.parts ?? {}) },
    missionProgress: { ...base.missionProgress, ...(raw.missionProgress ?? {}) },
  }

  if (!raw.missionProgress) {
    for (const m of MISSIONS) {
      state.missionProgress[m.id] =
        state.parts[m.partId] === 1
          ? m.goalTotal
          : clamp(raw.partPieces?.[m.partId] ?? 0, 0, m.goalTotal - 1)
    }
  }

  state.energy = energyFromProgress(state)
  return syncTicketsToStamps(state)
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    return refreshDailyMissions(clearExpiredCooling(normalize(JSON.parse(raw))))
  } catch {
    return createDefaultState()
  }
}

export function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearExpiredCooling(state: GameState): GameState {
  if (state.mode !== 'cooling' || !state.coolingUntil) return state
  if (new Date(state.coolingUntil).getTime() <= Date.now()) {
    return {
      ...state,
      mode: 'normal',
      coolingUntil: null,
      engineerMessage: '냉각 끝! 다시 도장을 모을 수 있어!',
    }
  }
  return state
}

/** Stamps are kept across days now, so a new day only refreshes the greeting. */
export function refreshDailyMissions(state: GameState): GameState {
  const today = todayKey()
  if (state.missionDate === today) return state
  return {
    ...state,
    missionDate: today,
    engineerMessage: '새로운 하루야! 오늘도 도장을 모아보자!',
  }
}

export function dockedCount(state: GameState): number {
  return PART_ORDER.filter((p) => state.parts[p] === 1).length
}

export function isComplete(state: GameState): boolean {
  return dockedCount(state) === PART_ORDER.length
}

export function stampsOf(state: GameState, missionId: string): number {
  return state.missionProgress[missionId] ?? 0
}

export function totalStamps(state: GameState): number {
  return MISSIONS.reduce((sum, m) => sum + stampsOf(state, m.id), 0)
}

/** Header / shop ticket count always mirrors total mission stamps. */
function syncTicketsToStamps(state: GameState): GameState {
  const stamps = totalStamps(state)
  if (state.tickets === stamps && state.ticketsEarned === stamps) return state
  return { ...state, tickets: stamps, ticketsEarned: stamps }
}

export const MAX_STAMPS = MISSIONS.reduce((sum, m) => sum + m.goalTotal, 0)

/** Energy tracks every stamp, so the gauge moves on each tap instead of jumping. */
export function energyFromProgress(state: GameState): number {
  return Math.round((totalStamps(state) / MAX_STAMPS) * 100)
}

export function isMissionDone(state: GameState, mission: MissionDef): boolean {
  return stampsOf(state, mission.id) >= mission.goalTotal
}

export function isMissionLocked(state: GameState, mission: MissionDef): boolean {
  return state.mode === 'cooling' && !mission.recovery
}

export interface StampResult {
  state: GameState
  docked: PartEvent | null
  completedRobot: boolean
}

export function stampMission(
  state: GameState,
  missionId: string,
  opts?: { force?: boolean },
): StampResult {
  const mission = MISSIONS.find((m) => m.id === missionId)
  if (!mission) return { state, docked: null, completedRobot: false }

  const current = stampsOf(state, missionId)
  if (current >= mission.goalTotal) {
    return { state, docked: null, completedRobot: false }
  }

  if (!opts?.force && isMissionLocked(state, mission)) {
    return {
      state: { ...state, engineerMessage: '냉각 중! 회복 미션(떼 안 쓰기)으로 고치자!' },
      docked: null,
      completedRobot: false,
    }
  }

  const stamps = current + 1
  let next: GameState = {
    ...state,
    missionProgress: { ...state.missionProgress, [missionId]: stamps },
    engineerMessage: `${mission.title} 도장 ${stamps}/${mission.goalTotal}!`,
  }

  if (mission.recovery && next.mode === 'cooling') {
    next = {
      ...next,
      mode: 'normal',
      coolingUntil: null,
      rewards: next.rewards.map((r) => ({ ...r, delayed: false })),
      engineerMessage: '참았구나! 냉각이 풀렸어!',
    }
  }

  let docked: PartEvent | null = null
  if (stamps >= mission.goalTotal) {
    next = {
      ...next,
      parts: { ...next.parts, [mission.partId]: 1 },
      engineerMessage: `${PART_LABELS[mission.partId]} 조립 완료! 찰칵!`,
    }
    docked = { partId: mission.partId, key: Date.now() }

    if (mission.sticker && !next.stickers.includes(mission.sticker)) {
      next = { ...next, stickers: [...next.stickers, mission.sticker] }
    }
  }

  next = syncTicketsToStamps({ ...next, energy: energyFromProgress(next) })

  const completedRobot = isComplete(next) && !next.heroCelebrated
  if (completedRobot) {
    next = {
      ...next,
      engineerMessage: '로봇 완성! 히어로 출동식!',
    }
  }

  return { state: next, docked, completedRobot }
}

export interface UnstampResult {
  state: GameState
  undocked: PartEvent | null
}

export function unstampMission(state: GameState, missionId: string): UnstampResult {
  const mission = MISSIONS.find((m) => m.id === missionId)
  if (!mission) return { state, undocked: null }

  const current = stampsOf(state, missionId)
  if (current <= 0) return { state, undocked: null }

  const stamps = current - 1
  const wasDone = current >= mission.goalTotal

  let next: GameState = {
    ...state,
    missionProgress: { ...state.missionProgress, [missionId]: stamps },
    engineerMessage: wasDone
      ? `${PART_LABELS[mission.partId]}이 떨어졌어. 다시 모아보자!`
      : `${mission.title} 도장 ${stamps}/${mission.goalTotal}`,
  }

  let undocked: PartEvent | null = null
  if (wasDone) {
    next = {
      ...next,
      parts: { ...next.parts, [mission.partId]: 0 },
      // Let the ceremony play again once the robot is rebuilt.
      heroCelebrated: false,
    }
    undocked = { partId: mission.partId, key: Date.now() }
  }

  return { state: syncTicketsToStamps({ ...next, energy: energyFromProgress(next) }), undocked }
}

export function applyCooling(state: GameState, hours = 4): GameState {
  const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
  return {
    ...state,
    mode: 'cooling',
    coolingUntil: until,
    engineerMessage: '냉각 모드… 로봇이 쉬는 중이야. 고치면 다시 조립!',
    rewards: state.rewards.map((r) => (!r.redeemed ? { ...r, delayed: true } : r)),
  }
}

export function clearCooling(state: GameState): GameState {
  return {
    ...state,
    mode: 'normal',
    coolingUntil: null,
    engineerMessage: '사령관이 냉각을 해제했어!',
    rewards: state.rewards.map((r) => ({ ...r, delayed: false })),
  }
}

/** Commander override: forcing a part also settles its mission stamps. */
export function forcePart(state: GameState, partId: PartId, docked: boolean): GameState {
  const mission = MISSIONS.find((m) => m.partId === partId)
  const parts = { ...state.parts, [partId]: docked ? 1 : 0 } as GameState['parts']
  const missionProgress = mission
    ? {
        ...state.missionProgress,
        [mission.id]: docked ? mission.goalTotal : Math.min(stampsOf(state, mission.id), mission.goalTotal - 1),
      }
    : state.missionProgress

  let next: GameState = {
    ...state,
    parts,
    missionProgress,
    heroCelebrated: docked ? state.heroCelebrated : false,
    engineerMessage: docked
      ? `${PART_LABELS[partId]} 강제 장착!`
      : `${PART_LABELS[partId]} 해제됨`,
  }

  next = syncTicketsToStamps({ ...next, energy: energyFromProgress(next) })
  return next
}

/**
 * Completing the robot unlocks one shop pick. Ticket count itself always
 * mirrors stamp total — reservation does not spend stamps.
 */
export function reserveReward(state: GameState, rewardId: string): GameState {
  if (state.mode === 'cooling') {
    return { ...state, engineerMessage: '냉각 중이야. 나중에!' }
  }
  if (!isComplete(state)) {
    return {
      ...state,
      engineerMessage: '미션을 모두 끝내고 로봇을 완성해야 예약할 수 있어요!',
    }
  }
  const reward = state.rewards.find((r) => r.id === rewardId)
  if (!reward || reward.redeemed || reward.delayed) return state
  if (state.rewards.some((r) => r.redeemed)) {
    return {
      ...state,
      engineerMessage: '상품은 1개만 고를 수 있어요! 먼저 고른 걸 제거해줘.',
    }
  }
  if (totalStamps(state) < reward.cost) {
    return { ...state, engineerMessage: '출동 티켓이 더 필요해!' }
  }
  return {
    ...state,
    rewards: state.rewards.map((r) => (r.id === rewardId ? { ...r, redeemed: true } : r)),
    engineerMessage: `${reward.label} 예약 완료! 부모님께 보여줘!`,
  }
}

/** Puts a reserved reward back on the shelf. */
export function clearReward(state: GameState, rewardId: string): GameState {
  const reward = state.rewards.find((r) => r.id === rewardId)
  if (!reward || !reward.redeemed) return state
  return {
    ...state,
    rewards: state.rewards.map((r) =>
      r.id === rewardId ? { ...r, redeemed: false, delayed: state.mode === 'cooling' } : r,
    ),
    engineerMessage: `${reward.label}을 지웠어요. 다시 예약할 수 있어!`,
  }
}

export function addReward(state: GameState, label: string): GameState {
  const item: RewardItem = {
    id: `r-${Date.now()}`,
    label,
    cost: 1,
    delayed: state.mode === 'cooling',
    redeemed: false,
  }
  return { ...state, rewards: [...state.rewards, item] }
}

export function setRobotName(state: GameState, name: string): GameState {
  const trimmed = name.trim().slice(0, 10) || state.robotName
  return { ...state, robotName: trimmed }
}

export function markHeroCelebrated(state: GameState): GameState {
  return { ...state, heroCelebrated: true }
}

export function resetGame(): GameState {
  const fresh = createDefaultState()
  saveState(fresh)
  return fresh
}

/** Clears every mission stamp and undocks parts, keeping shop rewards. */
export function resetMissions(state: GameState): GameState {
  return syncTicketsToStamps({
    ...state,
    parts: emptyParts(),
    missionProgress: emptyProgress(),
    energy: 0,
    stickers: [],
    heroCelebrated: false,
    engineerMessage: '미션을 처음부터 다시 모아보자!',
  })
}

export { GOAL_TOTAL }

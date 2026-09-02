import { MISSIONS, todayKey } from '../data/missions'
import {
  DEFAULT_PIN,
  ENERGY_PER_PART,
  PART_ORDER,
  PIECES_TO_DOCK,
  STORAGE_KEY,
  type DockEvent,
  type GameState,
  type PartId,
  type RewardItem,
} from '../types/game'

export function createDefaultState(): GameState {
  const missionsToday: GameState['missionsToday'] = {}
  for (const m of MISSIONS) missionsToday[m.id] = 'pending'

  return {
    robotName: '코코봇',
    energy: 0,
    parts: { feet: 0, legs: 0, body: 0, arms: 0, head: 0 },
    partPieces: { feet: 0, legs: 0, body: 0, arms: 0, head: 0 },
    mode: 'normal',
    coolingUntil: null,
    missionsToday,
    missionDate: todayKey(),
    dailyMissionLimit: 3,
    rewards: [
      { id: 'r1', label: '아이스크림', cost: 1, delayed: false, redeemed: false },
      { id: 'r2', label: '공원 놀기', cost: 1, delayed: false, redeemed: false },
      { id: 'r3', label: '원하는 장난감', cost: 1, delayed: false, redeemed: false },
    ],
    parentPin: DEFAULT_PIN,
    tickets: 0,
    stickers: [],
    heroCelebrated: false,
    soundOn: true,
    engineerMessage: '오늘도 출동 준비! 미션을 골라봐!',
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    const parsed = { ...createDefaultState(), ...JSON.parse(raw) } as GameState
    return refreshDailyMissions(clearExpiredCooling(parsed))
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
      engineerMessage: '냉각 끝! 다시 조립할 수 있어!',
    }
  }
  return state
}

export function refreshDailyMissions(state: GameState): GameState {
  const today = todayKey()
  if (state.missionDate === today) return state
  const missionsToday: GameState['missionsToday'] = {}
  for (const m of MISSIONS) missionsToday[m.id] = 'pending'
  return {
    ...state,
    missionDate: today,
    missionsToday,
    engineerMessage: '새로운 하루야! 미션을 시작하자!',
  }
}

export function dockedCount(state: GameState): number {
  return PART_ORDER.filter((p) => state.parts[p] === 1).length
}

export function isComplete(state: GameState): boolean {
  return dockedCount(state) === PART_ORDER.length
}

export function energyFromParts(state: GameState): number {
  return dockedCount(state) * ENERGY_PER_PART
}

export type CompleteMissionResult = {
  state: GameState
  docked: DockEvent | null
  completedRobot: boolean
}

export function completeMission(
  state: GameState,
  missionId: string,
): CompleteMissionResult {
  const mission = MISSIONS.find((m) => m.id === missionId)
  if (!mission) return { state, docked: null, completedRobot: false }
  if (state.missionsToday[missionId] === 'done') {
    return { state, docked: null, completedRobot: false }
  }

  let next: GameState = {
    ...state,
    missionsToday: { ...state.missionsToday, [missionId]: 'done' },
    energy: clamp(state.energy + mission.energyGain, 0, 100),
    engineerMessage: `멋져! ${mission.title} 성공!`,
  }

  if (mission.recovery && next.mode === 'cooling') {
    next = {
      ...next,
      mode: 'normal',
      coolingUntil: null,
      engineerMessage: '회복 미션 성공! 냉각이 풀렸어!',
    }
  }

  if (mission.sticker && !next.stickers.includes(mission.sticker)) {
    next = { ...next, stickers: [...next.stickers, mission.sticker] }
  }

  let docked: DockEvent | null = null
  const partId = mission.partId

  if (mission.pieceGain > 0 && next.parts[partId] === 0) {
    const pieces = next.partPieces[partId] + mission.pieceGain
    if (pieces >= PIECES_TO_DOCK) {
      const parts = { ...next.parts, [partId]: 1 as const }
      const partPieces = { ...next.partPieces, [partId]: PIECES_TO_DOCK }
      const energy = Math.max(next.energy, energyFromParts({ ...next, parts }))
      next = {
        ...next,
        parts,
        partPieces,
        energy,
        engineerMessage: `${partLabel(partId)} 도킹 완료! 찰칵!`,
      }
      docked = { partId, key: Date.now() }
    } else {
      next = {
        ...next,
        partPieces: { ...next.partPieces, [partId]: pieces },
        engineerMessage: `${partLabel(partId)} 조각 ${pieces}/${PIECES_TO_DOCK}!`,
      }
    }
  }

  const completedRobot = isComplete(next) && !next.heroCelebrated
  if (completedRobot) {
    next = {
      ...next,
      tickets: next.tickets + 1,
      engineerMessage: '로봇 완성! 히어로 출동식!',
    }
  }

  return { state: next, docked, completedRobot }
}

function partLabel(partId: PartId) {
  const map = {
    feet: '정리의 발',
    legs: '약속의 다리',
    body: '건강의 심장',
    arms: '도우미의 팔',
    head: '존중의 머리',
  }
  return map[partId]
}

export function applyCooling(state: GameState, hours = 4): GameState {
  const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
  return {
    ...state,
    mode: 'cooling',
    coolingUntil: until,
    energy: clamp(state.energy - 10, energyFromParts(state), 100),
    engineerMessage: '냉각 모드… 로봇이 쉬는 중이야. 고치면 다시 조립!',
    rewards: state.rewards.map((r) =>
      !r.redeemed ? { ...r, delayed: true } : r,
    ),
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

export function forcePart(
  state: GameState,
  partId: PartId,
  docked: boolean,
): GameState {
  const parts = { ...state.parts, [partId]: docked ? 1 : 0 } as GameState['parts']
  const partPieces = {
    ...state.partPieces,
    [partId]: docked ? PIECES_TO_DOCK : 0,
  }
  return {
    ...state,
    parts,
    partPieces,
    energy: Math.max(state.energy, energyFromParts({ ...state, parts })),
    engineerMessage: docked
      ? `${partLabel(partId)} 강제 장착!`
      : `${partLabel(partId)} 해제됨`,
  }
}

export function reserveReward(state: GameState, rewardId: string): GameState {
  if (state.mode === 'cooling') {
    return { ...state, engineerMessage: '냉각 중이야. 나중에!' }
  }
  const reward = state.rewards.find((r) => r.id === rewardId)
  if (!reward || reward.redeemed || reward.delayed) return state
  if (state.tickets < reward.cost) {
    return { ...state, engineerMessage: '출동 티켓이 더 필요해!' }
  }
  return {
    ...state,
    tickets: state.tickets - reward.cost,
    rewards: state.rewards.map((r) =>
      r.id === rewardId ? { ...r, redeemed: true } : r,
    ),
    engineerMessage: `${reward.label} 예약 완료! 부모님께 보여줘!`,
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

import { useCallback, useEffect, useState } from 'react'
import { MISSIONS } from '../data/missions'
import {
  addReward,
  applyCooling,
  clearCooling,
  clearExpiredCooling,
  completeMission,
  forcePart,
  loadState,
  markHeroCelebrated,
  refreshDailyMissions,
  reserveReward,
  resetGame,
  saveState,
  setRobotName,
} from '../storage/gameStore'
import type { DockEvent, GameState, PartId } from '../types/game'

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState())
  const [dockEvent, setDockEvent] = useState<DockEvent | null>(null)
  const [showHero, setShowHero] = useState(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((s) => clearExpiredCooling(refreshDailyMissions(s)))
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setState((s) => fn(clearExpiredCooling(refreshDailyMissions(s))))
  }, [])

  const approveMission = useCallback((missionId: string, opts?: { force?: boolean }) => {
    setState((s) => {
      const base = clearExpiredCooling(refreshDailyMissions(s))
      const def = MISSIONS.find((m) => m.id === missionId)
      if (!opts?.force && base.mode === 'cooling' && !def?.recovery) {
        return {
          ...base,
          engineerMessage: '냉각 중! 회복 미션(떼 안 쓰기)으로 고치자!',
        }
      }
      // Commander force: temporarily clear cooling lock for docking rewards
      const working =
        opts?.force && base.mode === 'cooling'
          ? { ...base, mode: 'normal' as const }
          : base
      const { state: next, docked, completedRobot } = completeMission(working, missionId)
      const restored =
        opts?.force && base.mode === 'cooling' && next.mode === 'normal' && !def?.recovery
          ? { ...next, mode: 'cooling' as const, coolingUntil: base.coolingUntil }
          : next
      if (docked) setDockEvent(docked)
      if (completedRobot) setShowHero(true)
      return restored
    })
  }, [])

  const startCooling = useCallback(
    (hours?: number) => {
      update((s) => applyCooling(s, hours))
    },
    [update],
  )

  const endCooling = useCallback(() => {
    update(clearCooling)
  }, [update])

  const setPart = useCallback(
    (partId: PartId, docked: boolean) => {
      update((s) => forcePart(s, partId, docked))
    },
    [update],
  )

  const buyReward = useCallback(
    (id: string) => {
      update((s) => reserveReward(s, id))
    },
    [update],
  )

  const createReward = useCallback(
    (label: string) => {
      update((s) => addReward(s, label))
    },
    [update],
  )

  const rename = useCallback(
    (name: string) => {
      update((s) => setRobotName(s, name))
    },
    [update],
  )

  const finishHero = useCallback(() => {
    update(markHeroCelebrated)
    setShowHero(false)
  }, [update])

  const hardReset = useCallback(() => {
    const fresh = resetGame()
    setState(fresh)
    setDockEvent(null)
    setShowHero(false)
  }, [])

  const setDailyLimit = useCallback(
    (n: number) => {
      update((s) => ({ ...s, dailyMissionLimit: Math.max(1, Math.min(7, n)) }))
    },
    [update],
  )

  const setPin = useCallback(
    (pin: string) => {
      update((s) => ({ ...s, parentPin: pin }))
    },
    [update],
  )

  const setSound = useCallback(
    (on: boolean) => {
      update((s) => ({ ...s, soundOn: on }))
    },
    [update],
  )

  const clearDock = useCallback(() => setDockEvent(null), [])

  return {
    state,
    dockEvent,
    showHero,
    approveMission,
    startCooling,
    endCooling,
    setPart,
    buyReward,
    createReward,
    rename,
    finishHero,
    hardReset,
    setDailyLimit,
    setPin,
    setSound,
    clearDock,
  }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { MISSIONS } from '../data/missions'
import {
  addReward,
  applyCooling,
  clearCooling,
  clearExpiredCooling,
  completeMission,
  forcePart,
  isComplete,
  loadState,
  markHeroCelebrated,
  refreshDailyMissions,
  reserveReward,
  resetGame,
  saveState,
  setRobotName,
} from '../storage/gameStore'
import { PART_ORDER, type DockEvent, type GameState, type PartId } from '../types/game'

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState())
  const [dockEvent, setDockEvent] = useState<DockEvent | null>(null)
  const [showHero, setShowHero] = useState(false)
  const prevParts = useRef(state.parts)
  const prevComplete = useRef(isComplete(state) && state.heroCelebrated)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((s) => clearExpiredCooling(refreshDailyMissions(s)))
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    for (const partId of PART_ORDER) {
      if (prevParts.current[partId] === 0 && state.parts[partId] === 1) {
        setDockEvent({ partId, key: Date.now() })
        break
      }
    }
    prevParts.current = state.parts
  }, [state.parts])

  useEffect(() => {
    const done = isComplete(state)
    if (done && !state.heroCelebrated && !prevComplete.current) {
      setShowHero(true)
    }
    prevComplete.current = done && state.heroCelebrated
  }, [state])

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
      const working =
        opts?.force && base.mode === 'cooling'
          ? { ...base, mode: 'normal' as const }
          : base
      const { state: next } = completeMission(working, missionId)
      if (opts?.force && base.mode === 'cooling' && next.mode === 'normal' && !def?.recovery) {
        return { ...next, mode: 'cooling' as const, coolingUntil: base.coolingUntil }
      }
      return next
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
      update((s) => {
        const next = forcePart(s, partId, docked)
        if (
          docked &&
          PART_ORDER.every((p) => (p === partId ? true : next.parts[p] === 1)) &&
          !next.heroCelebrated
        ) {
          return { ...next, tickets: next.tickets + (isComplete(next) && !isComplete(s) ? 1 : 0) }
        }
        return next
      })
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
    prevParts.current = fresh.parts
    prevComplete.current = false
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

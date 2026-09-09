import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addReward,
  applyCooling,
  clearCooling,
  clearExpiredCooling,
  clearReward,
  forcePart,
  isComplete,
  loadState,
  markHeroCelebrated,
  refreshDailyMissions,
  reserveReward,
  resetGame,
  resetMissions,
  saveState,
  setRobotName,
  stampMission,
  unstampMission,
} from '../storage/gameStore'
import type { GameState, PartEvent, PartId } from '../types/game'

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState())
  const [dockEvent, setDockEvent] = useState<PartEvent | null>(null)
  const [undockEvent, setUndockEvent] = useState<PartEvent | null>(null)
  const [showHero, setShowHero] = useState(false)

  // Actions read from this instead of a setState updater so that firing dock
  // events stays a plain side effect, and rapid taps never lose a stamp.
  const latest = useRef(state)

  useEffect(() => {
    latest.current = state
    saveState(state)
  }, [state])

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = clearExpiredCooling(refreshDailyMissions(latest.current))
      if (next !== latest.current) {
        latest.current = next
        setState(next)
      }
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const commit = useCallback((next: GameState) => {
    latest.current = next
    setState(next)
  }, [])

  const current = useCallback(
    () => clearExpiredCooling(refreshDailyMissions(latest.current)),
    [],
  )

  const update = useCallback(
    (fn: (s: GameState) => GameState) => commit(fn(current())),
    [commit, current],
  )

  const stamp = useCallback(
    (missionId: string, opts?: { force?: boolean }) => {
      const { state: next, docked, completedRobot } = stampMission(current(), missionId, opts)
      commit(next)
      if (docked) setDockEvent(docked)
      if (completedRobot) setShowHero(true)
    },
    [commit, current],
  )

  const unstamp = useCallback(
    (missionId: string) => {
      const { state: next, undocked } = unstampMission(current(), missionId)
      commit(next)
      if (undocked) setUndockEvent(undocked)
    },
    [commit, current],
  )

  const startCooling = useCallback(
    (hours?: number) => update((s) => applyCooling(s, hours)),
    [update],
  )

  const endCooling = useCallback(() => update(clearCooling), [update])

  const setPart = useCallback(
    (partId: PartId, docked: boolean) => {
      const base = current()
      const next = forcePart(base, partId, docked)
      commit(next)
      if (docked && base.parts[partId] === 0) setDockEvent({ partId, key: Date.now() })
      if (!docked && base.parts[partId] === 1) setUndockEvent({ partId, key: Date.now() })
      if (isComplete(next) && !next.heroCelebrated) setShowHero(true)
    },
    [commit, current],
  )

  const buyReward = useCallback((id: string) => update((s) => reserveReward(s, id)), [update])

  const removeReward = useCallback((id: string) => update((s) => clearReward(s, id)), [update])

  const createReward = useCallback(
    (label: string) => update((s) => addReward(s, label)),
    [update],
  )

  const rename = useCallback((name: string) => update((s) => setRobotName(s, name)), [update])

  const finishHero = useCallback(() => {
    update(markHeroCelebrated)
    setShowHero(false)
  }, [update])

  const hardReset = useCallback(() => {
    commit(resetGame())
    setDockEvent(null)
    setUndockEvent(null)
    setShowHero(false)
  }, [commit])

  const clearMissions = useCallback(() => {
    update(resetMissions)
    setDockEvent(null)
    setUndockEvent(null)
    setShowHero(false)
  }, [update])

  const setDailyLimit = useCallback(
    (n: number) => update((s) => ({ ...s, dailyMissionLimit: Math.max(1, Math.min(7, n)) })),
    [update],
  )

  const setPin = useCallback(
    (pin: string) => update((s) => ({ ...s, parentPin: pin })),
    [update],
  )

  const setSound = useCallback(
    (on: boolean) => update((s) => ({ ...s, soundOn: on })),
    [update],
  )

  const clearDock = useCallback(() => setDockEvent(null), [])
  const clearUndock = useCallback(() => setUndockEvent(null), [])

  return {
    state,
    dockEvent,
    undockEvent,
    showHero,
    stamp,
    unstamp,
    startCooling,
    endCooling,
    setPart,
    buyReward,
    removeReward,
    createReward,
    rename,
    finishHero,
    hardReset,
    clearMissions,
    setDailyLimit,
    setPin,
    setSound,
    clearDock,
    clearUndock,
  }
}

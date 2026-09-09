import { useCallback, useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { playSfx } from '../audio/soundEngine'
import { PART_ORDER, type PartId } from '../types/game'

export type PartPhase = 'docked' | 'detached' | 'dragging'

type Vec3 = [number, number, number]

/** Where each part sits on the assembled robot. */
export const PART_ANCHORS: Record<PartId, Vec3> = {
  head: [0, 1.15, 0],
  arms: [0, 0.57, 0],
  body: [0, 0.35, 0],
  legs: [0, -0.35, 0],
  feet: [0, -1.72, 0],
  shield: [-1.02, -0.12, 0.2],
  booster: [0, 0.72, -0.52],
}

/** Resting spot of a part once it pops off, laid out like an exploded diagram. */
const DETACH_OFFSETS: Record<PartId, Vec3> = {
  head: [0, 0.45, 0.3],
  arms: [0, 0.05, 0.35],
  body: [0, 0.12, 0.62],
  legs: [0, -0.1, 0.42],
  feet: [0, 0.02, 0.8],
  shield: [0.15, -0.55, 0.75],
  booster: [0, 0.3, -0.05],
}

/** A part dropped closer than this to its socket clicks back into place. */
const SNAP_RADIUS = 0.62

function initialPhases(): Record<PartId, PartPhase> {
  const phases = {} as Record<PartId, PartPhase>
  for (const id of PART_ORDER) phases[id] = 'docked'
  return phases
}

function initialOffsets(): Record<PartId, Vector3> {
  const offsets = {} as Record<PartId, Vector3>
  for (const id of PART_ORDER) offsets[id] = new Vector3()
  return offsets
}

export interface Assembly {
  phases: Record<PartId, PartPhase>
  /** Live target offsets, mutated during drags so the render loop stays smooth. */
  offsets: React.RefObject<Record<PartId, Vector3>>
  detach: (id: PartId) => void
  dock: (id: PartId) => void
  toggle: (id: PartId) => void
  beginDrag: (id: PartId) => void
  endDrag: (id: PartId) => void
  dockAll: () => void
  explodeAll: () => void
  flyIn: (id: PartId) => void
  flyOut: (id: PartId) => void
  anyDetached: boolean
}

export function useAssembly(): Assembly {
  const [phases, setPhases] = useState<Record<PartId, PartPhase>>(initialPhases)
  const offsets = useRef<Record<PartId, Vector3>>(initialOffsets())
  const timers = useRef<number[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }, [])

  useEffect(
    () => () => {
      for (const id of timers.current) window.clearTimeout(id)
      timers.current = []
    },
    [],
  )

  const detach = useCallback(
    (id: PartId) => {
      offsets.current[id].set(...DETACH_OFFSETS[id])
      setPhases((prev) => ({ ...prev, [id]: 'detached' }))
      playSfx('detach')
      later(() => playSfx('servo'), 60)
    },
    [later],
  )

  const dock = useCallback(
    (id: PartId) => {
      offsets.current[id].set(0, 0, 0)
      playSfx('servo')
      later(() => playSfx('clank'), 180)
      later(() => playSfx('lock'), 300)
      setPhases((prev) => {
        if (prev[id] === 'docked') return prev
        const next = { ...prev, [id]: 'docked' as PartPhase }
        if (PART_ORDER.every((p) => next[p] === 'docked')) {
          later(() => playSfx('powerUp'), 420)
        }
        return next
      })
    },
    [later],
  )

  const toggle = useCallback(
    (id: PartId) => {
      if (phases[id] === 'docked') detach(id)
      else dock(id)
    },
    [phases, detach, dock],
  )

  const beginDrag = useCallback((id: PartId) => {
    playSfx('tap')
    setPhases((prev) => ({ ...prev, [id]: 'dragging' }))
  }, [])

  const endDrag = useCallback(
    (id: PartId) => {
      if (offsets.current[id].length() < SNAP_RADIUS) {
        dock(id)
        return
      }
      setPhases((prev) => ({ ...prev, [id]: 'detached' }))
      playSfx('servo')
    },
    [dock],
  )

  const dockAll = useCallback(() => {
    for (const id of PART_ORDER) offsets.current[id].set(0, 0, 0)
    setPhases(initialPhases())
    playSfx('clank')
    later(() => playSfx('powerUp'), 260)
  }, [later])

  const explodeAll = useCallback(() => {
    const next = {} as Record<PartId, PartPhase>
    for (const id of PART_ORDER) {
      offsets.current[id].set(...DETACH_OFFSETS[id])
      next[id] = 'detached'
    }
    setPhases(next)
    playSfx('detach')
    later(() => playSfx('servo'), 90)
  }, [later])

  /** Mission reward: the new part swoops in from off-screen and locks on. */
  const flyIn = useCallback(
    (id: PartId) => {
      offsets.current[id].set(-2.8, 2.4, 2.2)
      setPhases((prev) => ({ ...prev, [id]: 'detached' }))
      playSfx('servo')
      later(() => {
        offsets.current[id].set(0, 0, 0)
        setPhases((prev) => ({ ...prev, [id]: 'docked' }))
      }, 260)
      later(() => playSfx('clank'), 1000)
      later(() => playSfx('lock'), 1130)
      later(() => playSfx('powerUp'), 1260)
    },
    [later],
  )

  /** A deducted stamp: the part is thrown off before fading back to a hologram. */
  const flyOut = useCallback(
    (id: PartId) => {
      const [x, y, z] = DETACH_OFFSETS[id]
      offsets.current[id].set(x * 2.2 - 0.6, y * 2.2 + 0.7, z * 2.2 + 0.7)
      setPhases((prev) => ({ ...prev, [id]: 'detached' }))
      playSfx('detach')
      later(() => playSfx('servo'), 90)
      later(() => {
        offsets.current[id].set(0, 0, 0)
        setPhases((prev) => ({ ...prev, [id]: 'docked' }))
      }, 720)
    },
    [later],
  )

  return {
    phases,
    offsets,
    detach,
    dock,
    toggle,
    beginDrag,
    endDrag,
    dockAll,
    explodeAll,
    flyIn,
    flyOut,
    anyDetached: PART_ORDER.some((p) => phases[p] !== 'docked'),
  }
}

import { useEffect, useRef, useState } from 'react'
import { type Assembly } from '../../hooks/useAssembly'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import {
  PART_LABELS,
  type GameMode,
  type PartEvent,
  type PartId,
  type RewardItem,
} from '../../types/game'
import { hasWebGL } from '../../utils/webgl'
import { DockingAnimation } from '../DockingAnimation'
import { RobotSilhouette } from '../RobotSilhouette'
import { TicketRack } from '../TicketRack'
import { RobotCanvas } from './RobotCanvas'

interface RobotStageProps {
  parts: Record<PartId, 0 | 1>
  missionProgress: Record<string, number>
  rewards: RewardItem[]
  mode: GameMode
  assembly: Assembly
  dockEvent: PartEvent | null
  undockEvent: PartEvent | null
  onDockConsumed: () => void
  onUndockConsumed: () => void
}

export function RobotStage({
  parts,
  missionProgress,
  rewards,
  mode,
  assembly,
  dockEvent,
  undockEvent,
  onDockConsumed,
  onUndockConsumed,
}: RobotStageProps) {
  const [supported] = useState(hasWebGL)
  const reducedMotion = useReducedMotion()
  const cooling = mode === 'cooling'
  const dockedKey = useRef<number | null>(null)
  const undockedKey = useRef<number | null>(null)

  const { flyIn, flyOut, anyDetached } = assembly

  useEffect(() => {
    if (!dockEvent || !supported) return
    if (dockedKey.current !== dockEvent.key) {
      dockedKey.current = dockEvent.key
      flyIn(dockEvent.partId)
    }
    const done = window.setTimeout(onDockConsumed, 2000)
    return () => window.clearTimeout(done)
  }, [dockEvent, supported, flyIn, onDockConsumed])

  useEffect(() => {
    if (!undockEvent || !supported) return
    if (undockedKey.current !== undockEvent.key) {
      undockedKey.current = undockEvent.key
      flyOut(undockEvent.partId)
    }
    const done = window.setTimeout(onUndockConsumed, 1400)
    return () => window.clearTimeout(done)
  }, [undockEvent, supported, flyOut, onUndockConsumed])

  if (!supported) {
    return (
      <div className="mx-auto w-full max-w-[420px]">
        <RobotSilhouette
          parts={parts}
          missionProgress={missionProgress}
          mode={mode}
          dockingPart={dockEvent?.partId ?? null}
          rewards={rewards}
        />
        {dockEvent && <DockingAnimation partId={dockEvent.partId} onDone={onDockConsumed} />}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="relative mx-auto aspect-[4/5] min-h-[22rem] max-h-[58dvh] w-full touch-none overflow-hidden rounded-[1.75rem] border border-sky-100/70 bg-robot-sky shadow-2xl shadow-black/30 sm:max-h-[28rem]">
        <RobotCanvas
          parts={parts}
          cooling={cooling}
          interactive={anyDetached}
          reducedMotion={reducedMotion}
          assembly={assembly}
        />

        <TicketRack rewards={rewards} />

        {dockEvent && (
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
            <span className="animate-dock-pulse rounded-full bg-amber-400/95 px-4 py-1.5 font-display text-sm font-black text-slate-900 shadow-lg">
              {PART_LABELS[dockEvent.partId]} 조립!
            </span>
          </div>
        )}

        {undockEvent && !dockEvent && (
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
            <span className="animate-dock-pulse rounded-full bg-slate-900/90 px-4 py-1.5 font-display text-sm font-black text-cyan-100 ring-1 ring-cyan-300/40">
              {PART_LABELS[undockEvent.partId]} 분리…
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

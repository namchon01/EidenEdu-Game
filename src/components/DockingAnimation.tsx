import { useEffect } from 'react'
import { PART_LABELS, type PartId } from '../types/game'

interface DockingAnimationProps {
  partId: PartId
  onDone: () => void
}

export function DockingAnimation({ partId, onDone }: DockingAnimationProps) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 1300)
    return () => window.clearTimeout(id)
  }, [onDone, partId])

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <div className="absolute inset-0 animate-flash bg-amber-200/30" />
      <div className="absolute left-1/2 top-[42%] flex size-28 -translate-x-1/2 -translate-y-1/2 animate-fly-in flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-amber-200 via-orange-400 to-teal-400 shadow-2xl shadow-amber-500/60 ring-4 ring-white/40">
        <span className="font-display text-sm font-black text-slate-900 text-center px-2 leading-tight">
          {PART_LABELS[partId]}
        </span>
        <span className="mt-1 font-display text-lg font-black text-slate-900">찰칵!</span>
      </div>
    </div>
  )
}

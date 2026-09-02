import { PART_LABELS, type PartId } from '../types/game'

interface DockingAnimationProps {
  partId: PartId
  onDone: () => void
}

export function DockingAnimation({ partId, onDone }: DockingAnimationProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 animate-fly-in rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-2xl shadow-amber-500/50 flex items-center justify-center"
        onAnimationEnd={onDone}
      >
        <span className="font-display text-xs font-bold text-slate-900 text-center px-1 leading-tight">
          {PART_LABELS[partId]}
        </span>
      </div>
      <div className="absolute inset-0 animate-flash bg-amber-200/20" />
    </div>
  )
}

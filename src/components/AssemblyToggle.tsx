interface AssemblyToggleProps {
  anyDetached: boolean
  onExplode: () => void
  onDock: () => void
}

/** Compact assemble / disassemble control for the status header row. */
export function AssemblyToggle({ anyDetached, onExplode, onDock }: AssemblyToggleProps) {
  return (
    <div
      className="flex shrink-0 flex-col overflow-hidden rounded-2xl bg-slate-950/80 shadow-lg ring-1 ring-white/15"
      role="group"
      aria-label="조립 분해"
    >
      <button
        type="button"
        onClick={onExplode}
        aria-pressed={anyDetached}
        className={`min-h-11 min-w-[3.25rem] px-2.5 font-display text-sm font-extrabold transition-colors ${
          anyDetached ? 'bg-amber-400 text-slate-900' : 'text-amber-100'
        }`}
      >
        분해
      </button>
      <button
        type="button"
        onClick={onDock}
        aria-pressed={!anyDetached}
        className={`min-h-11 min-w-[3.25rem] px-2.5 font-display text-sm font-extrabold transition-colors ${
          !anyDetached ? 'bg-teal-400 text-slate-900' : 'text-amber-100'
        }`}
      >
        조립
      </button>
    </div>
  )
}

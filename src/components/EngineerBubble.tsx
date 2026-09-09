interface EngineerBubbleProps {
  message: string
}

export function EngineerBubble({ message }: EngineerBubbleProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg items-end gap-3 px-4 py-1.5">
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-300 to-teal-500 text-2xl shadow-lg"
        aria-hidden
      >
        🛠️
      </div>
      <div className="relative min-h-[3.5rem] flex-1 rounded-2xl rounded-bl-md bg-white/95 px-4 py-3 text-slate-800 shadow-md">
        <p className="font-display text-sm font-semibold leading-snug">{message}</p>
      </div>
    </div>
  )
}

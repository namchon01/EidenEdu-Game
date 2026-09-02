import { PART_LABELS, PART_ORDER, type GameMode, type PartId } from '../types/game'

interface RobotSilhouetteProps {
  parts: Record<PartId, 0 | 1>
  partPieces: Record<PartId, number>
  mode: GameMode
  dockingPart: PartId | null
}

const PART_STYLE: Record<
  PartId,
  { top: string; left: string; width: string; height: string; radius: string }
> = {
  head: { top: '4%', left: '32%', width: '36%', height: '18%', radius: '28% 28% 18% 18%' },
  arms: { top: '24%', left: '8%', width: '84%', height: '22%', radius: '24%' },
  body: { top: '28%', left: '28%', width: '44%', height: '28%', radius: '20%' },
  legs: { top: '54%', left: '30%', width: '40%', height: '24%', radius: '16%' },
  feet: { top: '76%', left: '24%', width: '52%', height: '16%', radius: '30% 30% 40% 40%' },
}

export function RobotSilhouette({
  parts,
  partPieces,
  mode,
  dockingPart,
}: RobotSilhouetteProps) {
  const cooling = mode === 'cooling'

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] sm:max-w-[320px]">
      {/* hangar glow */}
      <div
        className={`absolute inset-6 rounded-full blur-3xl transition-colors ${
          cooling ? 'bg-cyan-400/25' : 'bg-amber-400/20'
        }`}
      />
      <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-slate-950/40 shadow-inner" />

      {PART_ORDER.map((id) => {
        const style = PART_STYLE[id]
        const on = parts[id] === 1
        const isDocking = dockingPart === id
        const pieces = partPieces[id]

        return (
          <div
            key={id}
            className="absolute"
            style={{
              top: style.top,
              left: style.left,
              width: style.width,
              height: style.height,
            }}
            title={PART_LABELS[id]}
          >
            <div
              className={`h-full w-full transition-all duration-500 ${
                on
                  ? cooling
                    ? 'bg-gradient-to-br from-cyan-200 to-sky-500 shadow-[0_0_24px_rgba(56,189,248,0.55)]'
                    : 'bg-gradient-to-br from-amber-200 via-orange-400 to-teal-500 shadow-[0_0_24px_rgba(251,191,36,0.45)]'
                  : 'bg-slate-700/40 border-2 border-dashed border-white/25'
              } ${isDocking ? 'animate-dock-pulse scale-110' : ''} ${
                cooling && on ? 'opacity-80' : ''
              }`}
              style={{ borderRadius: style.radius }}
            >
              {id === 'head' && on && (
                <div className="flex h-full items-center justify-center gap-3 pt-1">
                  <span className="size-3 rounded-full bg-slate-900 animate-blink" />
                  <span className="size-3 rounded-full bg-slate-900 animate-blink" />
                </div>
              )}
              {id === 'arms' && (
                <>
                  <div
                    className={`absolute left-0 top-1/4 h-1/2 w-[22%] ${
                      on
                        ? cooling
                          ? 'bg-sky-400'
                          : 'bg-orange-400'
                        : 'bg-slate-600/50 border border-dashed border-white/20'
                    }`}
                    style={{ borderRadius: '40%' }}
                  />
                  <div
                    className={`absolute right-0 top-1/4 h-1/2 w-[22%] ${
                      on
                        ? cooling
                          ? 'bg-sky-400'
                          : 'bg-orange-400'
                        : 'bg-slate-600/50 border border-dashed border-white/20'
                    }`}
                    style={{ borderRadius: '40%' }}
                  />
                </>
              )}
            </div>
            {!on && pieces > 0 && (
              <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-amber-100">
                조각 {pieces}/2
              </p>
            )}
          </div>
        )
      })}

      {cooling && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-2">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-3 rounded-full bg-cyan-200/70 animate-steam"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

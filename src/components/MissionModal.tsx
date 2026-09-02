import type { MissionDef } from '../data/missions'

interface MissionModalProps {
  mission: MissionDef
  cooling: boolean
  onClose: () => void
  onApprove: () => void
}

export function MissionModal({
  mission,
  cooling,
  onClose,
  onApprove,
}: MissionModalProps) {
  const blocked = cooling && !mission.recovery

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal
        className="w-full max-w-md rounded-3xl bg-gradient-to-b from-teal-900 to-slate-950 p-6 text-amber-50 shadow-2xl ring-1 ring-white/15"
      >
        <div className="flex items-start gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">
            {mission.icon}
          </span>
          <div>
            <h3 className="font-display text-2xl font-extrabold">{mission.title}</h3>
            <p className="mt-1 text-teal-100/90">{mission.short}</p>
            <p className="mt-2 text-sm text-amber-200/90">
              보상: 에너지 +{mission.energyGain}
              {mission.pieceGain > 0 ? ` · 부품 조각 +${mission.pieceGain}` : ''}
              {mission.recovery ? ' · 냉각 해제' : ''}
            </p>
          </div>
        </div>

        {blocked && (
          <p className="mt-4 rounded-xl bg-cyan-900/60 px-3 py-2 text-sm text-cyan-100">
            냉각 모드 중이라 이 미션은 잠시 잠겨 있어요. 회복 미션을 먼저 해봐요!
          </p>
        )}

        <p className="mt-4 text-sm text-white/70">
          실제로 했다면 부모님과 함께 <strong className="text-amber-200">했어!</strong>를
          눌러주세요.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-14 rounded-2xl bg-white/10 font-display text-lg font-bold"
          >
            아직이야
          </button>
          <button
            type="button"
            disabled={blocked}
            onClick={onApprove}
            className="min-h-14 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 font-display text-lg font-extrabold text-slate-900 disabled:opacity-40"
          >
            했어!
          </button>
        </div>
      </div>
    </div>
  )
}

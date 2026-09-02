import { useRef, useState } from 'react'
import { Lock } from 'lucide-react'

interface LockButtonProps {
  expectedPin: string
  onUnlock: () => void
}

export function LockButton({ expectedPin, onUnlock }: LockButtonProps) {
  const timer = useRef<number | null>(null)
  const [showPin, setShowPin] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const startHold = () => {
    timer.current = window.setTimeout(() => {
      setShowPin(true)
      setPin('')
      setError(false)
    }, 2000)
  }

  const cancelHold = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const submit = () => {
    if (pin === expectedPin) {
      setShowPin(false)
      setPin('')
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="사령관 모드 (길게 누르기)"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        className="fixed bottom-4 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-slate-900/70 text-amber-200/70 shadow-lg ring-1 ring-white/15 backdrop-blur active:scale-95"
      >
        <Lock className="size-6" />
      </button>

      {showPin && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-xs rounded-3xl bg-slate-900 p-6 text-center text-amber-50 ring-1 ring-white/20">
            <h3 className="font-display text-xl font-bold">사령관 PIN</h3>
            <p className="mt-1 text-xs text-white/60">기본 PIN: 1234</p>
            <input
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                setError(false)
              }}
              inputMode="numeric"
              className="mt-4 w-full rounded-xl bg-black/40 py-3 text-center text-3xl tracking-[0.4em] outline-none ring-1 ring-white/20 focus:ring-amber-300"
            />
            {error && <p className="mt-2 text-sm text-rose-300">PIN이 달라요</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowPin(false)}
                className="min-h-12 rounded-xl bg-white/10 font-bold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submit}
                className="min-h-12 rounded-xl bg-amber-400 font-bold text-slate-900"
              >
                입장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

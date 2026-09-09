import { lazy, Suspense, useState } from 'react'
import { Gift, RotateCcw } from 'lucide-react'
import { playSfx, isAudioUnlocked, setMuted, unlockAudio } from './audio/soundEngine'
import { useSoundSync } from './audio/useSound'
import { AssemblyToggle } from './components/AssemblyToggle'
import { EngineerBubble } from './components/EngineerBubble'
import { HeroCeremony } from './components/HeroCeremony'
import { MissionPanel } from './components/MissionPanel'
import { RobotSilhouette } from './components/RobotSilhouette'
import { Shop } from './components/Shop'
import { SoundToggle } from './components/SoundToggle'
import { StatusBar } from './components/StatusBar'
import { MISSIONS } from './data/missions'
import { useAssembly } from './hooks/useAssembly'
import { useGameState } from './hooks/useGameState'
import { totalStamps } from './storage/gameStore'

// three.js is a heavy dependency, so the hangar paints in 2D first and upgrades to 3D.
const RobotStage = lazy(() =>
  import('./components/robot3d/RobotStage').then((m) => ({ default: m.RobotStage })),
)

export default function App() {
  const game = useGameState()
  useSoundSync(game.state.soundOn)
  const assembly = useAssembly()
  const [shopOpen, setShopOpen] = useState(false)

  const { missionProgress, parts } = game.state

  const handleStamp = (id: string) => {
    // Unlock in the same tap stack so iOS allows the first SFX.
    void unlockAudio()
    playSfx('tap')
    game.stamp(id)
  }

  const handleUnstamp = (id: string) => {
    void unlockAudio()
    playSfx('detach')
    game.unstamp(id)
  }

  const handleSoundToggle = () => {
    // Off → on: arm iOS playback session and confirm with a tap sound.
    if (!game.state.soundOn) {
      setMuted(false)
      game.setSound(true)
      void unlockAudio().then(() => playSfx('tap'))
      return
    }
    // On but not unlocked yet (common on first Safari open / silent switch):
    // same tap unlocks without flipping to mute.
    if (!isAudioUnlocked()) {
      setMuted(false)
      void unlockAudio().then(() => playSfx('tap'))
      return
    }
    setMuted(true)
    game.setSound(false)
  }

  return (
    <div className="app-shell relative min-h-dvh overflow-x-hidden text-amber-50">
      <div className="pointer-events-none absolute inset-0 bg-hangar" aria-hidden />
      <div className="pointer-events-none absolute -left-20 top-24 size-64 rounded-full bg-teal-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-40 size-72 rounded-full bg-amber-400/10 blur-3xl" />

      <StatusBar
        energy={game.state.energy}
        mode={game.state.mode}
        robotName={game.state.robotName}
        stamps={totalStamps(game.state)}
        trailing={
          <AssemblyToggle
            anyDetached={assembly.anyDetached}
            onExplode={assembly.explodeAll}
            onDock={assembly.dockAll}
          />
        }
      />

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col">
        <div className="px-4 pt-1.5 pb-0.5">
          <Suspense
            fallback={
              <RobotSilhouette
                parts={parts}
                missionProgress={missionProgress}
                mode={game.state.mode}
                dockingPart={null}
                rewards={game.state.rewards}
              />
            }
          >
            <RobotStage
              parts={parts}
              missionProgress={missionProgress}
              rewards={game.state.rewards}
              mode={game.state.mode}
              assembly={assembly}
              dockEvent={game.dockEvent}
              undockEvent={game.undockEvent}
              onDockConsumed={game.clearDock}
              onUndockConsumed={game.clearUndock}
            />
          </Suspense>
        </div>

        <EngineerBubble message={game.state.engineerMessage} />

        <div className="mx-auto mb-2 flex w-full max-w-lg justify-end px-4">
          <div
            className="inline-flex overflow-hidden rounded-full border border-white/12 bg-slate-950/60 shadow-[0_10px_28px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            role="group"
            aria-label="빠른 메뉴"
          >
            <button
              type="button"
              onClick={game.clearMissions}
              aria-label="미션 도장 모두 리셋"
              className="inline-flex min-h-10 items-center gap-1.5 border-r border-white/10 px-4 text-[13px] font-semibold tracking-wide text-rose-100/90 transition hover:bg-rose-400/15 active:bg-rose-400/25"
            >
              <RotateCcw className="size-3.5 opacity-80" strokeWidth={2.25} />
              리셋
            </button>
            <button
              type="button"
              onClick={() => setShopOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 px-4 text-[13px] font-semibold tracking-wide text-amber-50/95 transition hover:bg-amber-300/15 active:bg-amber-300/25"
            >
              <Gift className="size-3.5 opacity-90" strokeWidth={2.25} />
              선물
            </button>
          </div>
        </div>

        <MissionPanel
          missions={MISSIONS}
          progress={missionProgress}
          parts={parts}
          cooling={game.state.mode === 'cooling'}
          onStamp={handleStamp}
          onUnstamp={handleUnstamp}
        />
      </main>

      {shopOpen && (
        <Shop
          tickets={game.state.tickets}
          cooling={game.state.mode === 'cooling'}
          rewards={game.state.rewards}
          parts={parts}
          message={game.state.engineerMessage}
          onReserve={game.buyReward}
          onRemove={game.removeReward}
          onClose={() => setShopOpen(false)}
        />
      )}

      {game.showHero && (
        <HeroCeremony
          robotName={game.state.robotName}
          onDone={game.finishHero}
          onOpenShop={() => {
            game.finishHero()
            setShopOpen(true)
          }}
        />
      )}

      <SoundToggle soundOn={game.state.soundOn} onToggle={handleSoundToggle} />
    </div>
  )
}

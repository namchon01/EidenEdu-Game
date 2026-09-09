import { lazy, Suspense, useState } from 'react'
import { Gift, RotateCcw } from 'lucide-react'
import { playSfx } from './audio/soundEngine'
import { useSoundSync } from './audio/useSound'
import { AssemblyToggle } from './components/AssemblyToggle'
import { CommanderMode } from './components/CommanderMode'
import { EngineerBubble } from './components/EngineerBubble'
import { HeroCeremony } from './components/HeroCeremony'
import { LockButton } from './components/LockButton'
import { MissionPanel } from './components/MissionPanel'
import { RobotSilhouette } from './components/RobotSilhouette'
import { Shop } from './components/Shop'
import { StatusBar } from './components/StatusBar'
import { MISSIONS } from './data/missions'
import { useAssembly } from './hooks/useAssembly'
import { useGameState } from './hooks/useGameState'

// three.js is a heavy dependency, so the hangar paints in 2D first and upgrades to 3D.
const RobotStage = lazy(() =>
  import('./components/robot3d/RobotStage').then((m) => ({ default: m.RobotStage })),
)

export default function App() {
  const game = useGameState()
  useSoundSync(game.state.soundOn)
  const assembly = useAssembly()
  const [commanderOpen, setCommanderOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)

  const { missionProgress, parts } = game.state

  const handleStamp = (id: string) => {
    playSfx('tap')
    game.stamp(id)
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
        tickets={game.state.tickets}
        trailing={
          <AssemblyToggle
            anyDetached={assembly.anyDetached}
            onExplode={assembly.explodeAll}
            onDock={assembly.dockAll}
          />
        }
      />

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col">
        <div className="px-4 pt-2 pb-1">
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

        <div className="mx-auto mb-2 flex w-full max-w-lg items-center justify-end gap-2 px-4">
          <button
            type="button"
            onClick={game.clearMissions}
            aria-label="미션 도장 모두 리셋"
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-rose-500/90 px-4 font-display font-extrabold text-white shadow-lg ring-1 ring-rose-200/40"
          >
            <RotateCcw className="size-5" />
            리셋
          </button>
          <button
            type="button"
            onClick={() => setShopOpen(true)}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-amber-400/90 px-4 font-display font-extrabold text-slate-900 shadow-lg"
          >
            <Gift className="size-5" />
            상점
          </button>
        </div>

        <MissionPanel
          missions={MISSIONS}
          progress={missionProgress}
          parts={parts}
          limit={game.state.dailyMissionLimit}
          cooling={game.state.mode === 'cooling'}
          onStamp={handleStamp}
          onUnstamp={game.unstamp}
        />
      </main>

      <LockButton expectedPin={game.state.parentPin} onUnlock={() => setCommanderOpen(true)} />

      {commanderOpen && (
        <CommanderMode
          state={game.state}
          onClose={() => setCommanderOpen(false)}
          onCooling={game.startCooling}
          onClearCooling={game.endCooling}
          onSetPart={game.setPart}
          onSetDailyLimit={game.setDailyLimit}
          onSetPin={game.setPin}
          onSetSound={game.setSound}
          onRename={game.rename}
          onAddReward={game.createReward}
          onReset={() => {
            game.hardReset()
            setCommanderOpen(false)
          }}
          onStampMission={(id) => game.stamp(id, { force: true })}
          onUnstampMission={game.unstamp}
        />
      )}

      {shopOpen && (
        <Shop
          tickets={game.state.tickets}
          cooling={game.state.mode === 'cooling'}
          rewards={game.state.rewards}
          missions={MISSIONS}
          progress={missionProgress}
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
    </div>
  )
}

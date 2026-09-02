import { useMemo, useState } from 'react'
import { Gift } from 'lucide-react'
import { CommanderMode } from './components/CommanderMode'
import { DockingAnimation } from './components/DockingAnimation'
import { EngineerBubble } from './components/EngineerBubble'
import { HeroCeremony } from './components/HeroCeremony'
import { LockButton } from './components/LockButton'
import { MissionModal } from './components/MissionModal'
import { MissionPanel } from './components/MissionPanel'
import { RobotSilhouette } from './components/RobotSilhouette'
import { Shop } from './components/Shop'
import { StatusBar } from './components/StatusBar'
import { MISSIONS } from './data/missions'
import { useGameState } from './hooks/useGameState'
import { PART_LABELS, PART_ORDER } from './types/game'

export default function App() {
  const game = useGameState()
  const [selectedMission, setSelectedMission] = useState<string | null>(null)
  const [commanderOpen, setCommanderOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)

  const mission = useMemo(
    () => MISSIONS.find((m) => m.id === selectedMission) ?? null,
    [selectedMission],
  )

  const nextHint = useMemo(() => {
    const next = PART_ORDER.find((p) => game.state.parts[p] === 0)
    if (!next) return '로봇 완성! 상점로 보상을 예약해요.'
    const pieces = game.state.partPieces[next]
    const left = Math.max(0, 2 - pieces)
    return left <= 1
      ? `부품 ${left}개만 더 있으면 ${PART_LABELS[next]}이 생겨!`
      : `다음 목표: ${PART_LABELS[next]}`
  }, [game.state.parts, game.state.partPieces])

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
      />

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col">
        <div className="px-4 pt-2 text-center">
          <h1 className="font-display text-3xl font-black tracking-tight text-amber-100 drop-shadow sm:text-4xl">
            로봇 격납고
          </h1>
          <p className="mt-1 text-sm text-teal-100/85">{nextHint}</p>
        </div>

        <div className="px-4 py-4">
          <RobotSilhouette
            parts={game.state.parts}
            partPieces={game.state.partPieces}
            mode={game.state.mode}
            dockingPart={game.dockEvent?.partId ?? null}
          />
        </div>

        <EngineerBubble message={game.state.engineerMessage} />

        <div className="mx-auto mb-2 flex w-full max-w-lg justify-end px-4">
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
          statuses={game.state.missionsToday}
          limit={game.state.dailyMissionLimit}
          cooling={game.state.mode === 'cooling'}
          onSelect={setSelectedMission}
        />

        {game.state.stickers.length > 0 && (
          <p className="px-4 pb-8 text-center text-sm text-amber-100/80">
            스티커: {game.state.stickers.join(' · ')}
          </p>
        )}
      </main>

      <LockButton
        expectedPin={game.state.parentPin}
        onUnlock={() => setCommanderOpen(true)}
      />

      {mission && (
        <MissionModal
          mission={mission}
          cooling={game.state.mode === 'cooling'}
          onClose={() => setSelectedMission(null)}
          onApprove={() => {
            game.approveMission(mission.id)
            setSelectedMission(null)
          }}
        />
      )}

      {game.dockEvent && (
        <DockingAnimation partId={game.dockEvent.partId} onDone={game.clearDock} />
      )}

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
          onApproveMission={(id) => game.approveMission(id, { force: true })}
        />
      )}

      {shopOpen && (
        <Shop
          tickets={game.state.tickets}
          cooling={game.state.mode === 'cooling'}
          rewards={game.state.rewards}
          onReserve={game.buyReward}
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

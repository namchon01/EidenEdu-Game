import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactElement } from 'react'
import { MathUtils, type Group } from 'three'
import { PART_ANCHORS, type Assembly } from '../../hooks/useAssembly'
import { PART_ORDER, type PartId } from '../../types/game'
import { buildSkin, type PartProps } from './materials'
import { PartSlot } from './PartSlot'
import { ArmsPart } from './parts/ArmsPart'
import { BodyPart } from './parts/BodyPart'
import { BoosterPart } from './parts/BoosterPart'
import { FeetPart } from './parts/FeetPart'
import { HeadPart } from './parts/HeadPart'
import { LegsPart } from './parts/LegsPart'
import { ShieldPart } from './parts/ShieldPart'

const PART_COMPONENTS: Record<PartId, (props: PartProps) => ReactElement> = {
  head: HeadPart,
  arms: ArmsPart,
  body: BodyPart,
  legs: LegsPart,
  feet: FeetPart,
  shield: ShieldPart,
  booster: BoosterPart,
}

const SEEDS: Record<PartId, number> = {
  head: 0,
  arms: 1.3,
  body: 2.6,
  legs: 3.9,
  feet: 5.2,
  shield: 0.7,
  booster: 4.5,
}

interface RobotModelProps {
  parts: Record<PartId, 0 | 1>
  cooling: boolean
  interactive: boolean
  reducedMotion: boolean
  assembly: Assembly
}

export function RobotModel({
  parts,
  cooling,
  interactive,
  reducedMotion,
  assembly,
}: RobotModelProps) {
  const root = useRef<Group>(null)
  const solid = useMemo(() => buildSkin(cooling, false), [cooling])
  const hologram = useMemo(() => buildSkin(cooling, true), [cooling])
  const settled = !assembly.anyDetached

  useFrame((state, delta) => {
    const g = root.current
    if (!g) return
    if (reducedMotion) {
      g.position.y = 0
      g.rotation.y = 0
      return
    }
    const t = state.clock.elapsedTime
    const step = 1 - Math.pow(0.05, Math.min(delta, 0.1))
    g.position.y = Math.sin(t * 1.1) * 0.03
    g.rotation.y = MathUtils.lerp(g.rotation.y, settled ? Math.sin(t * 0.32) * 0.2 : 0, step)
  })

  return (
    <group ref={root}>
      {PART_ORDER.map((id) => {
        const Part = PART_COMPONENTS[id]
        const earned = parts[id] === 1
        const phase = assembly.phases[id]

        return (
          <PartSlot
            key={id}
            id={id}
            anchor={PART_ANCHORS[id]}
            offset={assembly.offsets.current[id]}
            phase={phase}
            interactive={interactive && earned}
            reducedMotion={reducedMotion}
            seed={SEEDS[id]}
            onTap={assembly.toggle}
            onDragStart={assembly.beginDrag}
            onDragEnd={assembly.endDrag}
          >
            <Part skin={earned ? solid : hologram} spread={phase === 'docked' ? 0 : 1} />
          </PartSlot>
        )
      })}
    </group>
  )
}

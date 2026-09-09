import { RoundedBox } from '@react-three/drei'
import type { Skin, PartProps } from '../materials'
import { Joint, Seam, Wheel } from './pieces'
import { MirroredPair } from './MirroredPair'

function Leg({ skin, side }: { skin: Skin; side: 1 | -1 }) {
  return (
    <group>
      <Joint skin={skin} position={[0, 0.02, 0]} radius={0.17} />

      <RoundedBox
        args={[0.34, 0.5, 0.38]}
        radius={0.1}
        smoothness={5}
        position={[0, -0.29, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>

      <RoundedBox
        args={[0.32, 0.24, 0.36]}
        radius={0.08}
        smoothness={4}
        position={[0, -0.6, 0.02]}
        castShadow
      >
        <meshStandardMaterial {...skin.primary} />
      </RoundedBox>

      <RoundedBox
        args={[0.38, 0.58, 0.42]}
        radius={0.12}
        smoothness={5}
        position={[0, -0.94, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...skin.secondary} />
      </RoundedBox>

      <Wheel skin={skin} position={[side * 0.2, -0.94, -0.05]} radius={0.18} width={0.12} />
      <Seam skin={skin} position={[0, -0.94, 0.215]} size={[0.02, 0.28, 0.02]} />
      <RoundedBox args={[0.22, 0.08, 0.06]} radius={0.025} smoothness={3} position={[0, -1.16, 0.2]}>
        <meshStandardMaterial {...skin.glow} />
      </RoundedBox>
    </group>
  )
}

export function LegsPart({ skin, spread }: PartProps) {
  return (
    <MirroredPair spread={spread} base={0.27} extra={0.45} lift={-0.1}>
      {(side) => <Leg skin={skin} side={side} />}
    </MirroredPair>
  )
}

import { RoundedBox } from '@react-three/drei'
import type { Skin, PartProps } from '../materials'
import { Joint, Seam, Wheel } from './pieces'
import { MirroredPair } from './MirroredPair'

function Arm({ skin, side }: { skin: Skin; side: 1 | -1 }) {
  return (
    <group>
      <RoundedBox args={[0.42, 0.38, 0.46]} radius={0.11} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial {...skin.primary} />
      </RoundedBox>
      <Wheel skin={skin} position={[side * 0.17, 0.02, -0.03]} radius={0.17} width={0.12} />

      <mesh position={[0, -0.33, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.13, 0.36, 18]} />
        <meshStandardMaterial {...skin.dark} />
      </mesh>

      <Joint skin={skin} position={[0, -0.53, 0]} radius={0.14} />

      <RoundedBox
        args={[0.3, 0.46, 0.32]}
        radius={0.09}
        smoothness={4}
        position={[0, -0.78, 0]}
        castShadow
      >
        <meshStandardMaterial {...skin.secondary} />
      </RoundedBox>
      <RoundedBox args={[0.32, 0.1, 0.34]} radius={0.04} smoothness={4} position={[0, -0.64, 0]}>
        <meshStandardMaterial {...skin.glow} />
      </RoundedBox>
      <Seam skin={skin} position={[side * 0.155, -0.82, 0]} size={[0.02, 0.22, 0.05]} />

      <RoundedBox
        args={[0.28, 0.26, 0.28]}
        radius={0.08}
        smoothness={4}
        position={[0, -1.09, 0]}
        castShadow
      >
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>
      <RoundedBox args={[0.24, 0.06, 0.06]} radius={0.02} smoothness={3} position={[0, -1.03, 0.15]}>
        <meshStandardMaterial {...skin.accent} />
      </RoundedBox>
      <mesh position={[side * 0.16, -1.12, 0.06]} rotation={[0, 0, side * 0.4]} castShadow>
        <capsuleGeometry args={[0.045, 0.1, 4, 10]} />
        <meshStandardMaterial {...skin.dark} />
      </mesh>
    </group>
  )
}

export function ArmsPart({ skin, spread }: PartProps) {
  return (
    <MirroredPair spread={spread} base={0.74} extra={0.62} lift={0.12}>
      {(side) => <Arm skin={skin} side={side} />}
    </MirroredPair>
  )
}

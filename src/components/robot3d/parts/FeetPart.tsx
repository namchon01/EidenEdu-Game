import { RoundedBox } from '@react-three/drei'
import type { Skin, PartProps } from '../materials'
import { Thruster } from './pieces'
import { MirroredPair } from './MirroredPair'

function Foot({ skin }: { skin: Skin }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.18, 16]} />
        <meshStandardMaterial {...skin.dark} />
      </mesh>

      <RoundedBox
        args={[0.44, 0.22, 0.64]}
        radius={0.09}
        smoothness={5}
        position={[0, -0.07, 0.09]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...skin.secondary} />
      </RoundedBox>

      <RoundedBox
        args={[0.42, 0.18, 0.22]}
        radius={0.07}
        smoothness={4}
        position={[0, -0.06, 0.33]}
        castShadow
      >
        <meshStandardMaterial {...skin.primary} />
      </RoundedBox>

      <RoundedBox
        args={[0.34, 0.16, 0.16]}
        radius={0.06}
        smoothness={4}
        position={[0, -0.02, -0.19]}
        castShadow
      >
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>

      <Thruster skin={skin} position={[0, -0.18, 0.02]} radius={0.11} />
    </group>
  )
}

export function FeetPart({ skin, spread }: PartProps) {
  return (
    <MirroredPair spread={spread} base={0.27} extra={0.85} lift={-0.05}>
      {() => <Foot skin={skin} />}
    </MirroredPair>
  )
}

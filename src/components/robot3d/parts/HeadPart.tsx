import { RoundedBox } from '@react-three/drei'
import type { PartProps } from '../materials'

export function HeadPart({ skin }: PartProps) {
  return (
    <group>
      <mesh position={[0, -0.32, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.16, 18]} />
        <meshStandardMaterial {...skin.dark} />
      </mesh>

      <RoundedBox args={[0.64, 0.54, 0.58]} radius={0.12} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>

      {/* crown */}
      <RoundedBox
        args={[0.56, 0.18, 0.52]}
        radius={0.07}
        smoothness={4}
        position={[0, 0.27, -0.01]}
        castShadow
      >
        <meshStandardMaterial {...skin.primary} />
      </RoundedBox>

      {/* hero crest */}
      <mesh position={[0, 0.44, 0.02]} rotation={[0.18, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.11, 0.26, 4]} />
        <meshStandardMaterial {...skin.accent} />
      </mesh>

      {/* recessed dark face with a wide glowing visor */}
      <RoundedBox
        args={[0.5, 0.36, 0.12]}
        radius={0.05}
        smoothness={4}
        position={[0, -0.05, 0.25]}
        castShadow
      >
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>

      <RoundedBox args={[0.44, 0.15, 0.1]} radius={0.05} smoothness={4} position={[0, 0.04, 0.29]}>
        <meshStandardMaterial {...skin.glow} />
      </RoundedBox>

      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.04, 0.33]}>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshStandardMaterial {...skin.glow} />
        </mesh>
      ))}

      {/* jaw guard */}
      <RoundedBox
        args={[0.34, 0.11, 0.14]}
        radius={0.045}
        smoothness={4}
        position={[0, -0.19, 0.25]}
        castShadow
      >
        <meshStandardMaterial {...skin.metal} />
      </RoundedBox>

      {/* ear pods */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.32, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 18]} />
            <meshStandardMaterial {...skin.metal} />
          </mesh>
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 14]} />
            <meshStandardMaterial {...skin.glow} />
          </mesh>
        </group>
      ))}

      {/* antenna */}
      <group position={[-0.24, 0.31, -0.14]} rotation={[-0.25, 0, 0.3]}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.02, 0.3, 10]} />
          <meshStandardMaterial {...skin.metal} />
        </mesh>
        <mesh position={[0, 0.31, 0]}>
          <sphereGeometry args={[0.04, 14, 12]} />
          <meshStandardMaterial {...skin.accent} />
        </mesh>
      </group>
    </group>
  )
}

import { RoundedBox } from '@react-three/drei'
import type { PartProps } from '../materials'
import { Seam, Thruster } from './pieces'

export function BodyPart({ skin }: PartProps) {
  return (
    <group>
      <RoundedBox args={[1.0, 0.86, 0.6]} radius={0.13} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial {...skin.primary} />
      </RoundedBox>

      {/* car nose bumper across the chest */}
      <RoundedBox
        args={[1.04, 0.24, 0.64]}
        radius={0.09}
        smoothness={4}
        position={[0, 0.33, 0.01]}
        castShadow
      >
        <meshStandardMaterial {...skin.secondary} />
      </RoundedBox>

      {[-0.32, 0.32].map((x) => (
        <RoundedBox
          key={x}
          args={[0.24, 0.11, 0.08]}
          radius={0.03}
          smoothness={4}
          position={[x, 0.33, 0.32]}
        >
          <meshStandardMaterial {...skin.accent} />
        </RoundedBox>
      ))}

      {/* energy core */}
      <group position={[0, -0.02, 0.29]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.09, 28]} />
          <meshStandardMaterial {...skin.metal} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 28]} />
          <meshStandardMaterial {...skin.glow} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <torusGeometry args={[0.25, 0.028, 12, 32]} />
          <meshStandardMaterial {...skin.metal} />
        </mesh>
      </group>

      <Seam skin={skin} position={[0, -0.31, 0.305]} size={[0.6, 0.02, 0.02]} />
      <Seam skin={skin} position={[-0.4, 0.0, 0.305]} size={[0.02, 0.34, 0.02]} />
      <Seam skin={skin} position={[0.4, 0.0, 0.305]} size={[0.02, 0.34, 0.02]} />

      {/* shoulder mounts */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.55, 0.22, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.17, 0.17, 0.18, 20]} />
          <meshStandardMaterial {...skin.dark} />
        </mesh>
      ))}

      {/* waist */}
      <RoundedBox
        args={[0.54, 0.26, 0.46]}
        radius={0.08}
        smoothness={4}
        position={[0, -0.53, 0]}
        castShadow
      >
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>

      {/* booster pack */}
      <RoundedBox
        args={[0.62, 0.52, 0.2]}
        radius={0.07}
        smoothness={4}
        position={[0, 0.02, -0.36]}
        castShadow
      >
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>
      {[-0.18, 0.18].map((x) => (
        <Thruster key={x} skin={skin} position={[x, -0.3, -0.36]} radius={0.09} />
      ))}
    </group>
  )
}

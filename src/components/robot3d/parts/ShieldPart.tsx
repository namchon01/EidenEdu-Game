import { RoundedBox } from '@react-three/drei'
import type { MatProps, PartProps } from '../materials'

/** Deep gold plating so the shield reads clearly against the light sky hangar. */
const GOLD: MatProps = {
  color: '#b45309',
  metalness: 0.88,
  roughness: 0.28,
  emissive: '#7c2d12',
  emissiveIntensity: 0.18,
  transparent: false,
  opacity: 1,
  depthWrite: true,
  toneMapped: true,
  envMapIntensity: 1.35,
}

const GOLD_RIM: MatProps = {
  ...GOLD,
  color: '#f0d78c',
  metalness: 1,
  roughness: 0.18,
  emissive: '#b45309',
  emissiveIntensity: 0.12,
  envMapIntensity: 1.5,
}

const GOLD_CROSS: MatProps = {
  ...GOLD,
  color: '#fff1c2',
  metalness: 0.75,
  roughness: 0.22,
  emissive: '#fbbf24',
  emissiveIntensity: 0.25,
}

/** Octagonal calm shield carried on the left arm. */
export function ShieldPart({ skin }: PartProps) {
  const plate = skin.ghost ? skin.primary : GOLD
  const rim = skin.ghost ? skin.metal : GOLD_RIM
  const cross = skin.ghost ? skin.secondary : GOLD_CROSS

  return (
    <group rotation={[0, 0.42, 0.14]}>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 8]} />
        <meshStandardMaterial {...plate} />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 8]} castShadow>
        <torusGeometry args={[0.41, 0.045, 10, 8]} />
        <meshStandardMaterial {...rim} />
      </mesh>

      <RoundedBox args={[0.58, 0.1, 0.05]} radius={0.02} smoothness={3} position={[0, 0, 0.06]}>
        <meshStandardMaterial {...cross} />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.58, 0.05]} radius={0.02} smoothness={3} position={[0, 0, 0.06]}>
        <meshStandardMaterial {...cross} />
      </RoundedBox>

      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.13, 0.13, 0.05, 6]} />
        <meshStandardMaterial {...rim} />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <sphereGeometry args={[0.075, 18, 14]} />
        <meshStandardMaterial {...skin.glow} />
      </mesh>

      <RoundedBox args={[0.16, 0.3, 0.14]} radius={0.05} smoothness={3} position={[0, 0, -0.12]} castShadow>
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>
    </group>
  )
}

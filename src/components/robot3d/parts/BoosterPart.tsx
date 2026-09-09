import { RoundedBox } from '@react-three/drei'
import type { PartProps, Skin } from '../materials'
import { MirroredPair } from './MirroredPair'
import { Thruster } from './pieces'

/** Solid wing plates: deep blue so they separate from the sky hangar. */
const WING_OUTER = {
  color: '#1e3a8a',
  metalness: 0.55,
  roughness: 0.32,
  emissive: '#172554',
  emissiveIntensity: 0.25,
  transparent: false,
  opacity: 1,
  depthWrite: true,
  toneMapped: true,
  envMapIntensity: 1.05,
} as const

const WING_MID = {
  ...WING_OUTER,
  color: '#1d4ed8',
  emissive: '#1e40af',
  emissiveIntensity: 0.4,
} as const

/**
 * A swept blade of three tapering plates. It is angled steeply upward so the
 * tips clear the shoulder pods and stay visible from the front-on camera.
 */
function Wing({ skin, side }: { skin: Skin; side: 1 | -1 }) {
  const outer = skin.ghost ? skin.primary : WING_OUTER
  const mid = skin.ghost ? skin.secondary : WING_MID
  return (
    <group rotation={[0, side * -0.16, side * 0.52]}>
      <RoundedBox
        args={[0.46, 0.44, 0.11]}
        radius={0.05}
        smoothness={4}
        position={[side * 0.2, 0.02, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...outer} />
      </RoundedBox>

      <RoundedBox
        args={[0.4, 0.36, 0.09]}
        radius={0.04}
        smoothness={4}
        position={[side * 0.48, 0.12, -0.01]}
        castShadow
      >
        <meshStandardMaterial {...mid} />
      </RoundedBox>

      <RoundedBox
        args={[0.3, 0.26, 0.07]}
        radius={0.03}
        smoothness={3}
        position={[side * 0.72, 0.22, -0.02]}
      >
        <meshStandardMaterial {...skin.glow} />
      </RoundedBox>

      <Thruster skin={skin} position={[side * 0.16, -0.24, 0]} radius={0.1} />
    </group>
  )
}

/** Record wings: a back mount with two swept wings and boosters. */
export function BoosterPart({ skin, spread }: PartProps) {
  return (
    <group>
      <RoundedBox args={[0.46, 0.4, 0.16]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial {...skin.dark} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.26, 0.06]} radius={0.03} smoothness={3} position={[0, 0.02, 0.1]}>
        <meshStandardMaterial {...skin.glow} />
      </RoundedBox>

      <MirroredPair spread={spread} base={0.3} extra={0.55} lift={0.14}>
        {(side) => <Wing skin={skin} side={side} />}
      </MirroredPair>
    </group>
  )
}

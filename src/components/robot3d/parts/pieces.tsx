import type { Skin } from '../materials'

type Vec3 = [number, number, number]

interface WheelProps {
  skin: Skin
  position: Vec3
  radius?: number
  width?: number
}

/** Signature transforming-car wheel tucked into shoulders and shins. */
export function Wheel({ skin, position, radius = 0.19, width = 0.13 }: WheelProps) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, width, 26]} />
        <meshStandardMaterial {...skin.rubber} />
      </mesh>
      <mesh position={[0, width * 0.45, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.52, radius * 0.52, width * 0.3, 22]} />
        <meshStandardMaterial {...skin.metal} />
      </mesh>
      <mesh position={[0, width * 0.58, 0]}>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, width * 0.25, 16]} />
        <meshStandardMaterial {...skin.glow} />
      </mesh>
    </group>
  )
}

interface SeamProps {
  skin: Skin
  position: Vec3
  size: Vec3
  rotation?: Vec3
}

/** Recessed seam that keeps big armour panels from reading as plain blocks. */
export function Seam({ skin, position, size, rotation }: SeamProps) {
  if (skin.ghost) return null
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial {...skin.line} />
    </mesh>
  )
}

interface JointProps {
  skin: Skin
  position: Vec3
  radius?: number
}

export function Joint({ skin, position, radius = 0.14 }: JointProps) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 20, 16]} />
      <meshStandardMaterial {...skin.dark} />
    </mesh>
  )
}

interface ThrusterProps {
  skin: Skin
  position: Vec3
  radius?: number
  rotation?: Vec3
}

export function Thruster({ skin, position, radius = 0.1, rotation }: ThrusterProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius * 0.8, 0.1, 16]} />
        <meshStandardMaterial {...skin.metal} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[radius * 0.78, radius * 0.78, 0.03, 16]} />
        <meshStandardMaterial {...skin.glow} />
      </mesh>
    </group>
  )
}

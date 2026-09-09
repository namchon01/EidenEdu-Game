import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import { MathUtils, type Group } from 'three'

interface MirroredPairProps {
  /** 0 keeps the halves in their built position, 1 pushes them fully apart. */
  spread: number
  /** Half-distance between the two halves when assembled. */
  base: number
  /** Extra sideways travel at full spread. */
  extra: number
  /** Slight rise at full spread so detached halves float rather than sink. */
  lift?: number
  children: (side: 1 | -1) => ReactNode
}

/**
 * Left/right halves of a symmetric part. The spread is eased on the render
 * loop so opening and closing stays smooth without re-rendering React.
 */
export function MirroredPair({ spread, base, extra, lift = 0, children }: MirroredPairProps) {
  const left = useRef<Group>(null)
  const right = useRef<Group>(null)
  const current = useRef(spread)

  useFrame((_, delta) => {
    const step = 1 - Math.pow(0.002, Math.min(delta, 0.1))
    current.current = MathUtils.lerp(current.current, spread, step)
    const amount = current.current

    for (const [ref, side] of [
      [left, -1],
      [right, 1],
    ] as const) {
      const group = ref.current
      if (!group) continue
      group.position.x = side * (base + amount * extra)
      group.position.y = amount * lift
      group.rotation.z = side * amount * -0.22
    }
  })

  return (
    <>
      <group ref={left} position={[-base, 0, 0]}>
        {children(-1)}
      </group>
      <group ref={right} position={[base, 0, 0]}>
        {children(1)}
      </group>
    </>
  )
}

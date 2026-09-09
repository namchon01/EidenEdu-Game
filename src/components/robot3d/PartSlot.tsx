import { useFrame, useStore, useThree, type ThreeEvent } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import { MathUtils, Plane, Vector3, type Group } from 'three'
import type { PartPhase } from '../../hooks/useAssembly'
import type { PartId } from '../../types/game'

const scratch = new Vector3()

const LIMITS = { x: 2.3, y: 2.1, zMin: -1.2, zMax: 2.2 }

interface PointerCapturer {
  setPointerCapture?: (pointerId: number) => void
  releasePointerCapture?: (pointerId: number) => void
}

interface PartSlotProps {
  id: PartId
  anchor: [number, number, number]
  offset: Vector3
  phase: PartPhase
  interactive: boolean
  reducedMotion: boolean
  seed: number
  onTap: (id: PartId) => void
  onDragStart: (id: PartId) => void
  onDragEnd: (id: PartId) => void
  children: ReactNode
}

function wrapAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

export function PartSlot({
  id,
  anchor,
  offset,
  phase,
  interactive,
  reducedMotion,
  seed,
  onTap,
  onDragStart,
  onDragEnd,
  children,
}: PartSlotProps) {
  const group = useRef<Group>(null)
  const camera = useThree((s) => s.camera)
  const store = useStore()

  /** Orbiting must pause while a part is being dragged or the camera fights the finger. */
  const setOrbitEnabled = (enabled: boolean) => {
    const controls = store.getState().controls as { enabled: boolean } | null
    if (controls) controls.enabled = enabled
  }

  const drag = useRef({ active: false, moved: false, pointerId: -1, x: 0, y: 0 })
  const plane = useRef(new Plane())
  const grab = useRef(new Vector3())
  const hit = useRef(new Vector3())
  const hovered = useRef(false)

  const setCursor = (value: string) => {
    document.body.style.cursor = value
  }

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive || !group.current) return
    e.stopPropagation()
    ;(e.target as unknown as PointerCapturer)?.setPointerCapture?.(e.pointerId)

    drag.current = { active: true, moved: false, pointerId: e.pointerId, x: e.clientX, y: e.clientY }

    // Drag along a plane that faces the camera and passes through the grab point,
    // so the part tracks the finger from any orbit angle.
    camera.getWorldDirection(scratch)
    plane.current.setFromNormalAndCoplanarPoint(scratch, e.point)
    group.current.getWorldPosition(hit.current)
    grab.current.copy(e.point).sub(hit.current)
  }

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d.active || e.pointerId !== d.pointerId || !group.current) return
    e.stopPropagation()

    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 7) return
      d.moved = true
      setOrbitEnabled(false)
      setCursor('grabbing')
      onDragStart(id)
    }

    if (!e.ray.intersectPlane(plane.current, hit.current)) return
    hit.current.sub(grab.current)

    const parent = group.current.parent
    scratch.copy(hit.current)
    if (parent) parent.worldToLocal(scratch)

    offset.set(
      MathUtils.clamp(scratch.x - anchor[0], -LIMITS.x, LIMITS.x),
      MathUtils.clamp(scratch.y - anchor[1], -LIMITS.y, LIMITS.y),
      MathUtils.clamp(scratch.z - anchor[2], LIMITS.zMin, LIMITS.zMax),
    )
  }

  const handleUp = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d.active) return
    e.stopPropagation()
    ;(e.target as unknown as PointerCapturer)?.releasePointerCapture?.(e.pointerId)
    d.active = false
    setOrbitEnabled(true)
    setCursor(hovered.current && interactive ? 'grab' : 'auto')

    if (d.moved) onDragEnd(id)
    else onTap(id)
  }

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(delta, 0.1)
    const settle = 1 - Math.pow(phase === 'dragging' ? 1e-6 : 0.0018, dt)

    const floating = phase === 'detached' && !reducedMotion
    const bob = floating ? Math.sin(state.clock.elapsedTime * 1.7 + seed) * 0.04 : 0

    scratch.set(anchor[0] + offset.x, anchor[1] + offset.y + bob, anchor[2] + offset.z)
    g.position.lerp(scratch, settle)

    if (floating) {
      g.rotation.y += dt * 0.4
      g.rotation.z = MathUtils.lerp(
        g.rotation.z,
        Math.sin(state.clock.elapsedTime * 1.1 + seed) * 0.07,
        settle,
      )
    } else {
      g.rotation.y = MathUtils.lerp(wrapAngle(g.rotation.y), 0, settle)
      g.rotation.z = MathUtils.lerp(g.rotation.z, 0, settle)
    }

    const wanted = hovered.current && interactive && phase !== 'dragging' ? 1.05 : 1
    g.scale.setScalar(MathUtils.lerp(g.scale.x, wanted, settle))
  })

  return (
    <group
      ref={group}
      position={anchor}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onPointerOver={(e) => {
        if (!interactive) return
        e.stopPropagation()
        hovered.current = true
        setCursor('grab')
      }}
      onPointerOut={() => {
        hovered.current = false
        if (!drag.current.active) setCursor('auto')
      }}
    >
      {children}
    </group>
  )
}

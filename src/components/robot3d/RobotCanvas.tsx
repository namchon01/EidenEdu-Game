import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { DoubleSide } from 'three'
import type { Assembly } from '../../hooks/useAssembly'
import type { PartId } from '../../types/game'
import { RobotModel } from './RobotModel'

const FLOOR_Y = -1.95

interface RobotCanvasProps {
  parts: Record<PartId, 0 | 1>
  cooling: boolean
  interactive: boolean
  reducedMotion: boolean
  assembly: Assembly
}

export function RobotCanvas({
  parts,
  cooling,
  interactive,
  reducedMotion,
  assembly,
}: RobotCanvasProps) {
  const rim = cooling ? '#38bdf8' : '#fbbf24'
  const floor = cooling ? '#0e7490' : '#0f766e'

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, -0.05, 7.6], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      {/* Transparent clear so the CSS sky gradient behind the canvas shows through. */}
      <hemisphereLight args={['#e8f7ff', '#7eb8d4', 0.95]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4.5, 6, 4]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      >
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 0.1, 20]} />
      </directionalLight>
      <directionalLight position={[-5.5, 2, 3]} intensity={1.15} color="#7dd3fc" />
      <directionalLight position={[0, 1.5, 7]} intensity={0.7} />
      <spotLight position={[0, 4.5, -5]} angle={0.9} penumbra={1} intensity={3} color={rim} />

      {/* Reflections come from procedural light panels, so nothing is downloaded. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 3.2, 4]} scale={[7, 3, 1]} />
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[-4.5, 1.2, 2]}
          rotation-y={Math.PI / 2}
          scale={[5, 3, 1]}
          color="#7dd3fc"
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[4.5, 1.2, 2]}
          rotation-y={-Math.PI / 2}
          scale={[5, 3, 1]}
          color={rim}
        />
        <Lightformer form="ring" intensity={1.6} position={[0, -2.2, 2.5]} scale={3.5} />
      </Environment>

      <Suspense fallback={null}>
        <group scale={1.08} position={[0, 0.08, 0]}>
          <RobotModel
            parts={parts}
            cooling={cooling}
            interactive={interactive}
            reducedMotion={reducedMotion}
            assembly={assembly}
          />

          {/* hangar pad */}
          <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[2.5, 56]} />
            <meshStandardMaterial color="#0b1620" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, FLOOR_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.55, 1.78, 64]} />
            <meshStandardMaterial
              color={floor}
              emissive={floor}
              emissiveIntensity={1.4}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>

          <ContactShadows
            position={[0, FLOOR_Y + 0.02, 0]}
            opacity={0.6}
            scale={8}
            blur={2.6}
            far={4.5}
            resolution={512}
            color="#020617"
          />
        </group>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minDistance={5.4}
        maxDistance={11}
        minPolarAngle={Math.PI * 0.24}
        maxPolarAngle={Math.PI * 0.64}
        target={[0, -0.25, 0]}
      />
    </Canvas>
  )
}

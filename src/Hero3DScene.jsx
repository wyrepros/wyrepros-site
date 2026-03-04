import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'

function Cable() {
  const pulseRef = useRef()
  const points = useMemo(
    () => [
      [-4.2, 0.55, 0],
      [-2.2, -0.45, 0.3],
      [-0.3, 0.45, -0.2],
      [1.5, -0.35, 0.25],
      [4.2, 0.1, 0],
    ],
    []
  )

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.14) % 1
    const idx = Math.floor(t * (points.length - 1))
    const next = Math.min(idx + 1, points.length - 1)
    const local = t * (points.length - 1) - idx
    const a = points[idx]
    const b = points[next]
    if (pulseRef.current) {
      pulseRef.current.position.set(
        a[0] + (b[0] - a[0]) * local,
        a[1] + (b[1] - a[1]) * local,
        a[2] + (b[2] - a[2]) * local
      )
    }
  })

  return (
    <>
      <Line points={points} color="#111111" lineWidth={6} />
      <Line points={points} color="#3b82f6" lineWidth={2} transparent opacity={0.52} />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
    </>
  )
}

export default function Hero3DScene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.6]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 2, 3]} intensity={1.1} color="#93c5fd" />
      <Float speed={1.2} rotationIntensity={0.16} floatIntensity={0.4}>
        <Cable />
      </Float>
    </Canvas>
  )
}

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Torus, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function SoundWaveRing({ radius, speed, color, amplitude }: { radius: number; speed: number; color: string; amplitude: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime()
      const s = 1 + Math.sin(t * speed + radius) * amplitude
      ref.current.scale.setScalar(s)
      ;(ref.current.material as THREE.MeshStandardMaterial).opacity = 0.3 + Math.sin(t * speed + radius) * 0.2
    }
  })

  return (
    <Torus ref={ref} args={[radius, 0.02, 8, 60]}>
      <meshStandardMaterial color={color} transparent opacity={0.4} />
    </Torus>
  )
}

function SpeakerMesh({ isPlaying }: { isPlaying: boolean }) {
  const outerRef = useRef<THREE.Mesh>(null)
  const coneRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (outerRef.current) {
      outerRef.current.rotation.z = t * 0.1
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.3
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1
    }
    if (coneRef.current && isPlaying) {
      coneRef.current.scale.x = 1 + Math.sin(t * 20) * 0.02
      coneRef.current.scale.y = 1 + Math.sin(t * 15) * 0.03
      ;(coneRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + Math.sin(t * 10) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer ring */}
      <Torus args={[1.4, 0.08, 12, 80]} ref={outerRef}>
        <meshStandardMaterial color="#FF6B35" metalness={0.9} roughness={0.1} />
      </Torus>

      {/* Middle ring */}
      <Torus args={[1.1, 0.05, 12, 80]}>
        <meshStandardMaterial color="#F39C12" metalness={0.8} roughness={0.2} />
      </Torus>

      {/* Speaker body disc */}
      <mesh>
        <cylinderGeometry args={[1.3, 1.3, 0.1, 64]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Speaker cone */}
      <mesh ref={coneRef} position={[0, 0.05, 0]}>
        <coneGeometry args={[0.9, 0.3, 32]} />
        <meshStandardMaterial
          color="#0d0d0d"
          metalness={0.3}
          roughness={0.7}
          side={THREE.DoubleSide}
          emissive="#FF3300"
          emissiveIntensity={isPlaying ? 0.2 : 0.0}
        />
      </mesh>

      {/* Center dust cap */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#FF6B35"
          metalness={0.9}
          roughness={0.05}
          emissive="#FF3300"
          emissiveIntensity={isPlaying ? 0.8 : 0.2}
        />
      </mesh>

      {/* Surround ridges */}
      {[0.95, 1.0, 1.05].map((r, i) => (
        <Torus key={i} args={[r, 0.015, 8, 60]} position={[0, 0.01 * i, 0]}>
          <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
        </Torus>
      ))}

      {/* Sound wave rings when playing */}
      {isPlaying && [1.8, 2.4, 3.0].map((r, i) => (
        <SoundWaveRing key={i} radius={r} speed={2 + i * 0.5} color="#FF6B35" amplitude={0.05} />
      ))}

      {/* Decorative bolts */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * 1.3, 0.08, Math.sin(rad) * 1.3]}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 8]} />
            <meshStandardMaterial color="#FF6B35" metalness={1} roughness={0.1} />
          </mesh>
        )
      })}
    </group>
  )
}

function ParticleDust({ isPlaying }: { isPlaying: boolean }) {
  const count = 60
  const positions = useRef(
    new Float32Array(Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 6))
  )
  const ref = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05
      ;(ref.current.material as THREE.PointsMaterial).opacity = isPlaying ? 0.6 : 0.2
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#F39C12" transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}

interface Speaker3DProps {
  isPlaying: boolean
}

export default function Speaker3D({ isPlaying }: Speaker3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#FF6B35" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#F39C12" />
        <spotLight position={[0, 5, 0]} intensity={2} color="#ffffff" angle={0.3} />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <SpeakerMesh isPlaying={isPlaying} />
        </Float>

        <ParticleDust isPlaying={isPlaying} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 4}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}

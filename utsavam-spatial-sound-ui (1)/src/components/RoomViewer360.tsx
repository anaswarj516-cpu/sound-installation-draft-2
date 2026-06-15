import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three'

const SPEAKERS = [
  { id: 'FR', label: 'Front Right', pos: [3, 0, -2] as [number, number, number], angle: -30 },
  { id: 'FC', label: 'Front Center', pos: [0, 0, -3.5] as [number, number, number], angle: 0 },
  { id: 'FL', label: 'Front Left', pos: [-3, 0, -2] as [number, number, number], angle: 30 },
  { id: 'SR', label: 'Side Right', pos: [3.5, 0, 0] as [number, number, number], angle: -90 },
  { id: 'SL', label: 'Side Left', pos: [-3.5, 0, 0] as [number, number, number], angle: 90 },
  { id: 'RR', label: 'Rear Right', pos: [3, 0, 2] as [number, number, number], angle: -150 },
  { id: 'RL', label: 'Rear Left', pos: [-3, 0, 2] as [number, number, number], angle: 150 },
  { id: 'C1', label: 'Ceiling 1', pos: [1.5, 2.5, -1] as [number, number, number], angle: 0 },
  { id: 'C2', label: 'Ceiling 2', pos: [-1.5, 2.5, -1] as [number, number, number], angle: 0 },
  { id: 'SUB1', label: 'Subwoofer 1', pos: [2, -1.5, 1] as [number, number, number], angle: 0 },
  { id: 'SUB2', label: 'Subwoofer 2', pos: [-2, -1.5, 1] as [number, number, number], angle: 0 },
]

function SpeakerNode({ position, active }: { position: [number, number, number]; label: string; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current && active) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.2)
    }
  })

  return (
    <group position={position}>
      <Sphere ref={ref} args={[0.12, 16, 16]}>
        <meshStandardMaterial
          color={active ? "#FF6B35" : "#444"}
          emissive={active ? "#FF3300" : "#000"}
          emissiveIntensity={active ? 0.8 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      {active && (
        <>
          <Sphere args={[0.22, 16, 16]}>
            <meshStandardMaterial color="#FF6B35" transparent opacity={0.15} />
          </Sphere>
          <Sphere args={[0.35, 16, 16]}>
            <meshStandardMaterial color="#FF6B35" transparent opacity={0.06} />
          </Sphere>
        </>
      )}
    </group>
  )
}

function Room() {
  const floorRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (floorRef.current) {
      ;(floorRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.1 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05
    }
  })

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#111" emissive="#FF6B35" emissiveIntensity={0.05} roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
      </mesh>

      {/* Walls */}
      {/* Front */}
      <mesh position={[0, 0.5, -4.5]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#111" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.5, 4.5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#111" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Right */}
      <mesh position={[4.5, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#111" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Left */}
      <mesh position={[-4.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#111" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Center Pongala installation */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[(i - 3) * 0.4, -1.7, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.4, 12]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      ))}
      {/* Fire glow at center */}
      <pointLight position={[0, -1, 0]} intensity={2} color="#FF6B35" distance={3} decay={2} />
    </group>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SoundField(_props: { activeChannel: string | null }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.2
      ;(ref.current.material as THREE.MeshStandardMaterial).opacity =
        0.05 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.03
    }
  })

  return (
    <Sphere ref={ref} args={[2.8, 32, 32]}>
      <meshStandardMaterial
        color="#FF6B35"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
        wireframe={false}
      />
    </Sphere>
  )
}

interface RoomViewer360Props {
  activeChannel: string | null
}

export default function RoomViewer360({ activeChannel }: RoomViewer360Props) {
  return (
    <Canvas camera={{ position: [6, 4, 6], fov: 50 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#ffffff" />

      <Room />
      <SoundField activeChannel={activeChannel} />

      {SPEAKERS.map((spk) => (
        <SpeakerNode
          key={spk.id}
          position={spk.pos}
          label={spk.label}
          active={activeChannel === spk.id}
        />
      ))}

      {/* Listener at center */}
      <mesh position={[0, -1.5, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#F39C12" emissive="#F39C12" emissiveIntensity={0.5} />
      </mesh>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        minDistance={5}
        maxDistance={14}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  )
}

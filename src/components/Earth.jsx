import { useTexture } from '@react-three/drei'
import { useAdaptiveTexture } from '../hooks/useAdaptiveTexture'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Earth = ({ position, scale }) => {
  const earthRef = useRef()
  
  const colorPath = useAdaptiveTexture(
    '/textures/earth_color_2k.jpg',
    '/textures/earth_color_2k.jpg'
  )
  const [colorMap] = useTexture([colorPath])
  
  // Включаем анизотропию для Земли
  colorMap.anisotropy = 16

  // Медленное вращение Земли
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* Сама планета */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap} 
          roughness={0.7} 
          metalness={0.1} 
        />
      </mesh>

      {/* Слой атмосферы (свечение) */}
      <mesh scale={1.04}> {/* Чуть уменьшили, чтобы не было жирным контуром */}
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#3a78c9" // Сделали чуть темнее
          transparent
          opacity={0.15} // Уменьшили прозрачность (было 0.3)
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

export default Earth
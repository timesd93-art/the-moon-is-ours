import { useTexture } from '@react-three/drei'
import { useAdaptiveTexture } from '../hooks/useAdaptiveTexture'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const Moon = ({ onClick }) => {
  const moonRef = useRef()

  const colorPath = useAdaptiveTexture(
    '/textures/lroc_color_2k.jpg', 
    '/textures/lroc_color_2k.jpg'
  )
  const bumpPath = useAdaptiveTexture(
    '/textures/ldem_4_uint.png',
    '/textures/ldem_4_uint.png'
  )

  const [colorMap, bumpMap] = useTexture([colorPath, bumpPath])

  colorMap.anisotropy = 16
  bumpMap.anisotropy = 16

  // Вращение Луны
  useFrame((state, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.03
    }
  })

  return (
    <mesh 
      ref={moonRef} 
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick() // Вызов модалки при клике на пустую Луну
      }}
    >
      {/* Вот эти две строки и создают саму Луну */}
      <sphereGeometry args={[1.5, 128, 128]} />
      <meshStandardMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.02}
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

export default Moon
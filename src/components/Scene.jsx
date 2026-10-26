import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import { EffectComposer, DepthOfField, Bloom } from '@react-three/postprocessing' // <-- Импорт
import Moon from './Moon'
import Earth from './Earth'
import Flags from './Flags'

const Scene = ({ onFlagClick }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#000000' }}
    >
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={2.5} />

      <Suspense fallback={null}>
        <Moon />
        {/* Убедитесь, что Земля на заднем плане (координата Z -5) */}
        <Earth position={[-8, 2, -5]} scale={0.4} />
        <Flags onClick={onFlagClick} />
      </Suspense>

            {/* 1. УМЕНЬШАЕМ ЗВЕЗДЫ (чтобы они не превращались в большие круги) */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} // Чуть меньше звезд
        factor={2}   // Уменьшили размер (было 4)
        saturation={0} 
        fade 
        speed={1} 
      />

      <OrbitControls
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={2.5}
        maxDistance={10}
        enableZoom
      />
    </Canvas>
  )
}

export default Scene
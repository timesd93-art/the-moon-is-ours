import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFlags } from '../hooks/useFlags'

const latLonToVector3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return [x, y, z]
}

const createMarkerTexture = (color, hasRing, imageUrl) => {
  const canvas = document.createElement('canvas')
  // Увеличиваем разрешение для лучшей детализации при зуме
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const center = 128

  // 1. Свечение
  ctx.beginPath(); ctx.arc(center, center, 120, 0, Math.PI * 2); ctx.fillStyle = color; ctx.globalAlpha = 0.2; ctx.fill()
  
  // 2. Кольцо (для Prime и Legacy)
  if (hasRing) {
    ctx.beginPath(); ctx.arc(center, center, 80, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 12; ctx.globalAlpha = 0.8; ctx.stroke()
  }

  // 3. Темный фон для аватарки
  ctx.beginPath(); ctx.arc(center, center, 50, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.globalAlpha = 1; ctx.fill()

  // 4. Создаем текстуру
  const texture = new THREE.CanvasTexture(canvas)

  // 5. Загружаем аватарку
  if (imageUrl && imageUrl !== 'none') {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(center, center, 50, 0, Math.PI * 2) // Делаем круглую маску
      ctx.clip()
      // Рисуем картинку 100x100 в центре
      ctx.drawImage(img, center - 50, center - 50, 100, 100) 
      ctx.restore()
      
      // САМОЕ ВАЖНОЕ: говорим Three.js, что холст обновился!
      texture.needsUpdate = true 
    }
    
    img.onerror = () => {
      console.error('Не удалось загрузить аватарку по ссылке:', imageUrl)
    }

    img.src = imageUrl
  }

  return texture
}

// Выносим отдельный компонент флага, чтобы изолировать его рефы
const Flag = ({ flag, moonRadius, onClick }) => {
  const spriteRef = useRef()
  
  const baseScale = flag.tier === 'legacy' ? 0.2 : flag.tier === 'prime' ? 0.15 : 0.1
  const position = latLonToVector3(flag.lat, flag.lon, moonRadius + baseScale * 0.5)

  const texture = useMemo(() => {
    const color = flag.tier === 'legacy' ? '#f4cf4a' : flag.tier === 'prime' ? '#4a90e2' : '#ffffff'
    const hasRing = flag.tier !== 'standard'
    
    // ВАЖНО: проверьте, как называется колонка в Supabase (image_path или image_url)
    const imgUrl = flag.image_url || flag.image_path 
    
    return createMarkerTexture(color, hasRing, imgUrl)
  }, [flag])

  return (
    <sprite
      ref={spriteRef}
      position={position}
      scale={[baseScale, baseScale, 1]}
      onClick={(e) => { e.stopPropagation(); onClick(flag) }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        if (spriteRef.current) spriteRef.current.scale.set(baseScale * 1.5, baseScale * 1.5, 1)
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
        if (spriteRef.current) spriteRef.current.scale.set(baseScale, baseScale, 1)
      }}
    >
      <spriteMaterial map={texture} transparent={true} alphaTest={0.01} />
    </sprite>
  )
}

const Flags = ({ onClick }) => {
  const { flags, loading } = useFlags() // <-- Получаем данные из БД
  const moonRadius = 1.5

  const textures = useMemo(() => ({
    standard: createMarkerTexture('#ffffff', false),
    prime: createMarkerTexture('#4a90e2', true),
    legacy: createMarkerTexture('#f4cf4a', true),
  }), [])

  if (loading) return null // Пока данные грузятся, ничего не рисуем

  return (
    <group>
      {flags.map((flag) => (
        <Flag key={flag.id} flag={flag} textures={textures} moonRadius={moonRadius} onClick={onClick} />
      ))}
    </group>
  )
}

export default Flags
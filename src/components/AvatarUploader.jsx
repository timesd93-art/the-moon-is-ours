import { useState } from 'react'
import imageCompression from 'browser-image-compression'

const AvatarUploader = ({ onImageReady }) => {
  const [preview, setPreview] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsProcessing(true)

    const options = {
      maxSizeMB: 0.2, // Максимальный вес 200 КБ
      maxWidthOrHeight: 512, // Размер 512x512
      useWebWorker: true,
      fileType: 'image/webp', // Принудительно конвертируем в WebP
    }

    try {
      const compressedFile = await imageCompression(file, options)
      
      // Создаем ссылку для предпросмотра
      const previewUrl = URL.createObjectURL(compressedFile)
      setPreview(previewUrl)
      
      // Передаем готовый файл наверх (в форму)
      onImageReady(compressedFile)
    } catch (error) {
      console.error('Ошибка при обработке картинки:', error)
      alert('Не удалось обработать изображение. Попробуйте другое.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <label style={{ cursor: 'pointer', display: 'block' }}>
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: '#222', border: '2px dashed #555',
          margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {preview ? (
            <img src={preview} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#888', fontSize: '0.8rem' }}>Upload</span>
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
      </label>
      {isProcessing && <p style={{ color: '#f4cf4a', fontSize: '0.8rem', marginTop: '0.5rem' }}>Optimizing...</p>}
    </div>
  )
}

export default AvatarUploader
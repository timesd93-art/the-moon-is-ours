import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Scene from './components/Scene'
import Navbar from './components/Navbar'
import Modal from './components/Modal'
import AboutModal from './components/AboutModal'
import './App.css'

function Fallback({ error }) {
  return (
    <div style={{ color: 'white', padding: '2rem', textAlign: 'center', zIndex: 999 }}>
      <h2>3D Scene Error</h2>
      <pre style={{ color: '#ff6b6b', textAlign: 'left', background: '#222', padding: '1rem' }}>
        {error.message}
      </pre>
    </div>
  )
}

function App() {
  const [modalType, setModalType] = useState(null)
  const [selectedFlag, setSelectedFlag] = useState(null)

  const openModal = (type, flag = null) => {
    setModalType(type)
    setSelectedFlag(flag)
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedFlag(null)
  }

  return (
    <div className="app-container">
      <Navbar 
        onContact={() => openModal('contact')} 
        onAbout={() => openModal('about')} 
      />
      
      <ErrorBoundary FallbackComponent={Fallback}>
        <Scene onFlagClick={(flag) => openModal('claim', flag)} />
      </ErrorBoundary>

      {/* Кнопка покупки (показываем, только если модалка закрыта) */}
      {!modalType && (
        <button
          onClick={() => openModal('claim', null)}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            zIndex: 50,
            background: '#f4cf4a',
            color: '#000',
            border: 'none',
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(244, 207, 74, 0.3)',
            transition: 'transform 0.2s, boxShadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 207, 74, 0.5)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 207, 74, 0.3)'
          }}
        >
          Claim your spot
        </button>
      )}

      {/* Модальные окна */}
      {modalType === 'claim' && (
        <Modal type="claim" flag={selectedFlag} onClose={closeModal} />
      )}
      {modalType === 'contact' && (
        <Modal type="contact" onClose={closeModal} />
      )}
      {modalType === 'about' && (
        <AboutModal onClose={closeModal} />
      )}
    </div>
  )
}

export default App
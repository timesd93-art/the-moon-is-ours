const AboutModal = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(12px)', 
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
    }}>
      <div style={{
        position: 'relative', // <-- ОБЯЗАТЕЛЬНО для позиционирования крестика
        background: 'rgba(20, 20, 20, 0.85)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '24px', 
        padding: '3rem', maxWidth: '600px', width: '90%', color: '#fff',
        maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.7)', 
        backdropFilter: 'blur(20px)', 
      }}>
        
        {/* Кнопка-крестик */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '1.5rem',
            cursor: 'pointer',
            transition: 'color 0.2s',
            lineHeight: 1,
          }}
          onMouseOver={(e) => e.target.style.color = '#fff'}
          onMouseOut={(e) => e.target.style.color = '#888'}
        >
          ✕
        </button>

        <h1 style={{ color: '#f4cf4a', marginTop: 0, fontSize: '2rem' }}>THE MOON IS OURS</h1>
        
        <p style={{ lineHeight: '1.6', fontSize: '1.1rem', color: '#ccc' }}>
          Welcome to the first digital monument on the Moon. 
          What started as a viral moment has become a reality. 
          We are claiming the lunar surface, pixel by pixel.
        </p>

        <h3 style={{ color: '#fff', marginTop: '2rem' }}>How it works:</h3>
        <ul style={{ lineHeight: '1.6', color: '#aaa', paddingLeft: '1.5rem' }}>
          <li>Connect your crypto wallet or send USDT (TRC20) manually.</li>
          <li>Upload your avatar and link to your social profile (X, Instagram, etc).</li>
          <li>Your flag is permanently etched into our photorealistic 3D Moon.</li>
          <li>Anyone who clicks your flag will be taken directly to your page.</li>
        </ul>

        <p style={{ lineHeight: '1.6', fontSize: '1.1rem', color: '#ccc', marginTop: '2rem' }}>
          Secure your place in history. The Moon is Ours — and it can be Yours too.
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: '2.5rem', width: '100%', background: '#f4cf4a',
            border: 'none', color: '#000', padding: '1rem', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
          }}
        >
          Back to the Moon
        </button>
      </div>
    </div>
  )
}

export default AboutModal
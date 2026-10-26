const Navbar = ({ onContact, onAbout }) => {
  return (
    <nav style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 2rem',
      zIndex: 10,
      color: '#fff',
      pointerEvents: 'none', 
    }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', pointerEvents: 'auto' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          THE MOON IS OURS
        </div>
        <button
          onClick={onAbout}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.color = '#fff'}
          onMouseOut={(e) => e.target.style.color = '#aaa'}
        >
          About
        </button>
      </div>

      <button
        onClick={onContact}
        style={{
          background: 'transparent',
          border: '1px solid #f4cf4a',
          color: '#f4cf4a',
          padding: '0.5rem 1.2rem',
          borderRadius: '30px',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        Contact Us
      </button>
    </nav>
  )
}

export default Navbar
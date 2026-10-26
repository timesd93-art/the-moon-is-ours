import { useState, useEffect } from 'react'
import AvatarUploader from './AvatarUploader'
import { supabase } from '../lib/supabase'

// ⚠️ ВАЖНО: Замените этот адрес на ваш реальный кошелек USDT (TRC20)!
const USDT_WALLET_ADDRESS = 'TYn98NLAqhLPj1SeZoGdCdg4JyKWnmmgx6'
const USDT_CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // Официальный контракт USDT

const Modal = ({ type, flag, onClose }) => {
  const isClaim = type === 'claim'

  const [url, setUrl] = useState('')
  const [tier, setTier] = useState('standard')
  const [avatarFile, setAvatarFile] = useState(null)
  const [txHash, setTxHash] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Состояния для TronLink
  const [hasTronLink, setHasTronLink] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  // Проверяем наличие TronLink при открытии окна
  useEffect(() => {
    if (window.tronLink || window.tronWeb) {
      setHasTronLink(true)
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        setWalletAddress(window.tronWeb.defaultAddress.base58)
      }
    }
  }, [])

  const getPrice = () => (tier === 'standard' ? 10 : tier === 'prime' ? 50 : 100)

  // Функция для отправки транзакции через TronLink
  const handleTronPay = async () => {
    try {
      if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        alert('Please unlock your TronLink wallet and refresh the page.')
        return
      }

      const tronWeb = window.tronWeb
      const amount = getPrice() * 1000000 // USDT имеет 6 знаков после запятой

      const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS)
      const result = await contract.transfer(USDT_WALLET_ADDRESS, amount).send({
        feeLimit: 100_000_000,
        callValue: 0,
      })

      if (result) {
        setTxHash(result)
        alert('Transaction sent! Please wait for blockchain confirmation and click "Verify & Claim".')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed or was canceled.')
    }
  }

  // Функция проверки оплаты
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url || !avatarFile || !txHash) {
      alert('Please fill all fields, upload an avatar, and provide the transaction hash.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Загружаем аватарку в Supabase Storage
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile)

      if (uploadError) throw new Error('Failed to upload image: ' + uploadError.message)

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)

      // 2. Вызываем Edge Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('verify-payment', {
        body: {
          txHash: txHash,
          userUrl: url,
          imageUrl: publicUrlData.publicUrl,
          tier: tier,
          lat: (Math.random() * 140) - 70,
          lon: (Math.random() * 360) - 180,
        },
      })

      if (functionError) throw new Error(functionError.message)
      if (functionData.error) throw new Error(functionData.error)

      // 3. Успех
      alert('Payment verified! Your flag is now on the Moon.')
      onClose()
      window.location.reload()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Verification failed. The transaction might still be processing. Please wait a minute and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          position: 'relative', // <-- ДОБАВЛЕНО ДЛЯ КРЕСТИКА
          background: '#111',
          border: '1px solid #333',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '420px',
          width: '90%',
          color: '#fff',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Кнопка-крестик */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
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

        <h2 style={{ marginTop: 0, color: '#f4cf4a', textAlign: 'center', padding: '0 1rem' }}>
          {isClaim ? (flag ? 'Flag Details' : 'Claim this spot') : 'Contact Us'}
        </h2>

        {/* --- ФОРМА ПОКУПКИ --- */}
        {isClaim && !flag && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AvatarUploader onImageReady={(file) => setAvatarFile(file)} />

            <input
              type="url"
              placeholder="Your personal URL (X, Instagram...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
            />

            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
            >
              <option value="standard">Standard — 10 USDT</option>
              <option value="prime">Prime — 50 USDT</option>
              <option value="legacy">Legacy — 100 USDT</option>
            </select>

            {/* Блок Web3 Оплаты */}
            <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              
              {hasTronLink && !txHash && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                  <button
                    type="button"
                    onClick={handleTronPay}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: '#ff060a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Pay {getPrice()} USDT with TronLink
                  </button>
                </div>
              )}

              {(!hasTronLink || txHash) && (
                <>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Send <strong>{getPrice()} USDT (TRC20)</strong> manually to:
                  </p>
                  <code
                    style={{
                      display: 'block',
                      background: '#000',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      wordBreak: 'break-all',
                      marginBottom: '1rem',
                    }}
                  >
                    {USDT_WALLET_ADDRESS}
                  </code>
                  <p style={{ margin: '0 0 0.5rem 0' }}>Paste the Transaction Hash (TXID) below:</p>
                  <input
                    type="text"
                    placeholder="Transaction Hash"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      background: '#000',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !txHash}
              style={{
                padding: '1rem',
                background: '#f4cf4a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: isSubmitting || !txHash ? 'not-allowed' : 'pointer',
                color: '#000',
                opacity: !txHash ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Verifying Payment...' : 'Verify & Claim'}
            </button>
          </form>
        )}

        {/* --- ПРОСМОТР ЧУЖОГО ФЛАГА --- */}
        {isClaim && flag && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={flag.image_url || flag.image_path}
              alt="Avatar"
              style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #f4cf4a', marginBottom: '1rem' }}
            />
            <p>
              Owner URL: <br />
              <a href={flag.url} target="_blank" rel="noreferrer" style={{ color: '#f4cf4a' }}>
                {flag.url}
              </a>
            </p>
          </div>
        )}

        {/* --- КНОПКА CONTACT US --- */}
        {!isClaim && (
          <div style={{ textAlign: 'center' }}>
            <p>For manual payments or questions, contact us at:</p>
            <a 
              href="mailto:timesd93@gmail.com" 
              style={{ 
                color: '#f4cf4a', 
                fontSize: '1.2rem', 
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
                marginTop: '0.5rem'
              }}
            >
              timesd93@gmail.com
            </a>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            background: 'transparent',
            border: '1px solid #555',
            color: '#aaa',
            padding: '0.8rem',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default Modal
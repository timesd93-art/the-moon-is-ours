import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useFlags = () => {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFlags = async () => {
    setLoading(true)
    // Запрашиваем все флаги из базы
    const { data, error } = await supabase
      .from('flags')
      .select('*')

    if (error) {
      console.error('Ошибка загрузки флагов:', error)
    } else {
      setFlags(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFlags()
  }, [])

  // Возвращаем флаги и функцию для их обновления (пригодится после покупки)
  return { flags, loading, refetch: fetchFlags }
}
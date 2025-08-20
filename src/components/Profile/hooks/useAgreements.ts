import { useState, useCallback, useEffect } from 'react'

interface Agreements {
  personalData: boolean
  userAgreement: boolean
  marketing: boolean
}

interface UseAgreementsReturn {
  agreements: Agreements
  toggleAgreement: (key: keyof Agreements) => void
  saveAgreements: () => Promise<void>
  isLoading: boolean
  error: string | null
}

export const useAgreements = (userToken?: string): UseAgreementsReturn => {
  const [agreements, setAgreements] = useState<Agreements>({
    personalData: false,
    userAgreement: false,
    marketing: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загрузка данных с сервера
  useEffect(() => {
    if (!userToken) return
    
    // TODO: Загрузить согласия с сервера
    // socket.emit('get_agreements', { token: userToken })
  }, [userToken])

  const toggleAgreement = useCallback((key: keyof Agreements) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const saveAgreements = useCallback(async () => {
    if (!userToken) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // TODO: Отправка на сервер
      // socket.emit('save_agreements', { token: userToken, agreements })
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (err) {
      setError('Ошибка сохранения согласий')
    } finally {
      setIsLoading(false)
    }
  }, [agreements, userToken])

  return {
    agreements,
    toggleAgreement,
    saveAgreements,
    isLoading,
    error
  }
}
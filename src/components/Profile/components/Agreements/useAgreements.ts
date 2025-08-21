import { useState, useCallback, useEffect } from 'react'
import socketService from '../../../Sockets'
import { Store } from '../../../Store'

interface Agreements {
    personalData:   boolean
    userAgreement:  boolean
    marketing:      boolean
}

interface UseAgreementsReturn {
    agreements: Agreements
    toggleAgreement: (key: keyof Agreements) => void
    isLoading: boolean
    error: string | null
}

export const useAgreements = (userToken?: string): UseAgreementsReturn => {
  const [agreements, setAgreements] = useState(Store.getState().login.notifications)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socket = socketService.getSocket()

  // Загрузка данных с сервера
  useEffect(() => {
    if (!userToken) return
    
    // TODO: Загрузить согласия с сервера
    // socket.emit('get_agreements', { token: userToken })
  }, [userToken])

  const toggleAgreement = useCallback((key: keyof Agreements) => {
      agreements[key] = !agreements[key]
      socket?.emit("set_agreement", { token: Store.getState().login.token, [key]: agreements[key] })
      console.log(Store.getState().login)
      setAgreements((prev) => {return{ ...prev, [key]: agreements[key] }})

  }, [])

 

  return {
    agreements,
    toggleAgreement,
    isLoading,
    error
  }
}
import { useState, useCallback } from 'react'
import socketService from '../../../Sockets'
import { Store } from '../../../Store'


interface PassportData {
  series?: string
  number?: string
  issueDate?: string
  issuedBy?: string
  birthDate?: string
  birthPlace?: string
  regAddress?: string
  actualAddress?: string
  passportPhoto?: string
  passportRegPhoto?: string
  isVerified?: boolean
  createdDate?: string
  updatedDate?: string
}

export const usePassport = () => {
  const [passportData, setPassportData] = useState<PassportData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    setError(null)

    const socket = socketService.getSocket()
    if (!socket) {
      setError('Нет подключения')
      setIsLoading(false)
      return
    }

    const token = Store.getState().login?.token
    if (!token) {
      setError('Нет токена авторизации')
      setIsLoading(false)
      return
    }

    socket.emit('get_passport', { token })
    
    socket.once('get_passport', (response) => {
      setIsLoading(false)
      
      if (response.success) {
        setPassportData(response.data || {})
      } else {
        setError(response.message || 'Ошибка загрузки')
      }
    })
  }, [])

  const save = useCallback((data: PassportData) => {
    setIsSaving(true)
    setError(null)

    const socket = socketService.getSocket()
    if (!socket) {
      setError('Нет подключения')
      setIsSaving(false)
      return
    }

    const token = Store.getState().login?.token
    if (!token) {
      setError('Нет токена авторизации')
      setIsSaving(false)
      return
    }

    const payload = {
      ...data,
      token
    }

    socket.emit('set_passport', payload)
    
    socket.once('set_passport', (response) => {
      setIsSaving(false)
      
      if (response.success) {
        setPassportData(data)
        setError(null)
      } else {
        setError(response.message || 'Ошибка сохранения')
      }
    })
  }, [])

  return {
    passportData,
    load,
    save,
    isSaving,
    isLoading,
    error
  }
}
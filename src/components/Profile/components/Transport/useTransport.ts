import { useState, useCallback } from 'react'
import socketService from '../../../Sockets'
import { Store } from '../../../Store'

interface TransportData {
  code?: string
  name?: string
  license_plate?: string
  vin?: string
  manufacture_year?: number
  image?: string
  transport_type?: string
  experience?: number
  load_capacity?: number
}

export const useTransport = () => {
  const [transportData, setTransportData] = useState<TransportData | null>(null)
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

    socket.emit('get_transport', { token })
    
    socket.once('get_transport_data', (response) => {
      console.log("get_transport")
      setIsLoading(false)
      console.log(response)
      if (response.success) {
        setTransportData(response.data || {})
      } else {
        setError(response.message || 'Ошибка загрузки')
      }
    })
  }, [])

  const save = useCallback((data: TransportData) => {
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

    socket.emit('set_transport', payload)
    
    socket.once('set_transport', (response) => {
      setIsSaving(false)
      
      if (response.success) {
        setTransportData(data)
        setError(null)
      } else {
        setError(response.message || 'Ошибка сохранения')
      }
    })
  }, [])

  return {
    transportData,
    load,
    save,
    isSaving,
    isLoading,
    error
  }
}
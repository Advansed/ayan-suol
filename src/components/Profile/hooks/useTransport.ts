import { useState, useCallback, useEffect } from 'react'
import { Store } from '../../Store'
import socketService from '../../Sockets'

interface TransportInfo {
  guid?: string
  type?: string
  capacity?: number
  year?: number
  number?: string
  exp?: number
}

export const useTransportSave = () => {
  const [transport, setTransport] = useState<TransportInfo | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загружаем данные транспорта из Store
  useEffect(() => {
    const transportData = Store.getState().transport?.[0]
    if (transportData) {
      setTransport(transportData)
    }
  }, [])

  const save = useCallback(async (data: TransportInfo) => {
    setIsSaving(true)
    setError(null)

    try {
      const socket = socketService.getSocket()
      if (!socket) {
        throw new Error('Нет подключения к серверу')
      }

      const token = Store.getState().login?.token
      if (!token) {
        throw new Error('Необходима авторизация')
      }

      const saveData = {
        ...data,
        token,
        guid: transport?.guid
      }

      // Отправляем данные на сервер
      const success = socketService.emit('transport', saveData)
      
      if (!success) {
        throw new Error('Ошибка при отправке данных')
      }

      // Ждем ответа от сервера
      return new Promise((resolve) => {
        const handleResponse = (response: any) => {
          setIsSaving(false)
          
          if (response?.success && response?.data) {
            // Обновляем данные в Store
            Store.dispatch({ type: 'transport', data: [response.data] })
            setTransport(response.data)
            resolve(true)
          } else {
            setError(response?.message || 'Ошибка сохранения')
            resolve(false)
          }
        }

        socket.once('save_transport', handleResponse)

        // Таймаут на случай если сервер не ответит
        setTimeout(() => {
          socket.off('save_transport', handleResponse)
          setIsSaving(false)
          setError('Превышено время ожидания ответа от сервера')
          resolve(false)
        }, 10000)
      })
    } catch (err) {
      setIsSaving(false)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      return false
    }
  }, [transport])

  return {
    transport,
    save,
    isSaving,
    error
  }
}
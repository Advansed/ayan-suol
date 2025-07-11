import { useState, useCallback, useRef } from 'react'
import socketService from '../../Sockets'
import { Store } from '../../Store'
import { SAVE_DEBOUNCE_MS } from '../constants'

export const useProfileSave = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const save = useCallback((data: any) => {
    // Отменяем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Дебаунс
    timeoutRef.current = setTimeout(() => {
      setIsSaving(true)
      setError(null)

      const socket = socketService.getSocket()
      if (!socket) {
        setError('Нет подключения')
        setIsSaving(false)
        return
      }

      const payload = {
        ...data,
        token: Store.getState().login.token
      }

      socket.emit('profile', payload)
      
      socket.once('profile', (response) => {
        setIsSaving(false)
        
        if (response.success) {
          Store.dispatch({ type: 'login', data: response.data })
        } else {
          setError(response.message || 'Ошибка сохранения')
        }
      })
    }, SAVE_DEBOUNCE_MS)
  }, [])

  return { save, isSaving, error }
}
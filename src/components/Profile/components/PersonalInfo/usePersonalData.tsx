import { useState, useCallback } from 'react'
import { socketService } from '../../../Sockets'
import { Store } from '../../../Store'

interface PersonalData {
  name?:            string
  email?:           string
  user_type?:       string
  image?:           string
  password?:        string
  description?:     string
}

interface UsePersonalDataReturn {
  personalData:     PersonalData | null
  isLoading:        boolean
  isSaving:         boolean
  error:            string | null
  success:          boolean
  loadData:         () => void
  saveData:         (fields: PersonalData) => void
  savePersonalInfo: (name: string, email: string) => void
  saveAvatar:       (image: string) => void
  changePassword:   (password: string) => void
  resetStates:      () => void
}

export const usePersonalData = (): UsePersonalDataReturn => {

  const socket = socketService.getSocket()

  const [personalData, setPersonalData] = useState<PersonalData | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [success, setSuccess] = useState(false)

  // Загрузка данных
  const loadData = useCallback(() => {
    if (!socket) return

    setIsLoading(true)
    setError(null)

    socket.emit('profile', { token:  Store.getState().login.token })

    socket.on('profile', (response) => {
      setIsLoading(false)
      if (response.success) {
        setPersonalData(response.data)
      } else {
        setError(response.message || 'Ошибка загрузки данных')
      }
    })

    return () => {
      socket.off('profile')
    }
  }, [socket])

  // Сохранение данных
  const saveData = useCallback((fields: PersonalData) => {
    if (!socket) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    socket.emit('profile', { token:  Store.getState().login.token, ...fields } )

    socket.on('profile', (response) => {
      setIsSaving(false)
      if (response.success) {
        setPersonalData(prev => ({ ...prev, ...fields }))
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(response.message || 'Ошибка сохранения')
      }
    })

    return () => {
      socket.off('profile')
    }
  }, [socket])

  // Сохранение личных данных
  const savePersonalInfo = useCallback((name: string, email: string) => {
    saveData({ name, email })
  }, [saveData])

  // Сохранение аватара
  const saveAvatar = useCallback((image: string) => {
    saveData({ image })
  }, [saveData])

  // Смена пароля
  const changePassword = useCallback((password: string) => {
    saveData({ password })
  }, [saveData])

  // Сброс состояний
  const resetStates = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return {
    personalData,
    isLoading,
    isSaving,
    error,
    success,
    loadData,
    saveData,
    savePersonalInfo,
    saveAvatar,
    changePassword,
    resetStates
  }
}
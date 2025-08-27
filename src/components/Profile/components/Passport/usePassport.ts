import { useState, useCallback } from 'react'
import socketService from '../../../Sockets'
import { Store, useSelector, useStoreField } from '../../../Store'
import { useToast } from '../../../Toast'


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
  const passportData = useSelector((state) => state.passport, 51)
  const [isSaving, setIsSaving]     = useState(false)
  const [isLoading, setIsLoading]   = useState(false)

  const toast = useToast()

    const load = useCallback(() => {
      setIsLoading(true)

      
      const socket = socketService.getSocket()
      if (!socket) {
        toast.error('Нет подключения')
        setIsLoading(false)
        return
      }

      const token = Store.getState().login?.token
      if (!token) {
        toast.error('Нет токена авторизации')
        setIsLoading(false)
        return
      }

      socket.emit('get_passport', { token })
      
    }, [])

    const save = useCallback((data: PassportData) => {
      setIsSaving(true)

      const socket = socketService.getSocket()
      if (!socket) {
        toast.error('Нет подключения')
        setIsSaving(false)
        return
      }

      const token = Store.getState().login?.token
      if (!token) {
        toast.error('Нет токена авторизации')
        setIsSaving(false)
        return
      }

      const payload = {
        ...data,
        token
      }

      socket.emit('set_passport', payload)
      
      toast.info("Сохраняются паспортные данные...")
    }, [])

  return {
    passportData,
    load,
    save,
    isSaving,
    isLoading
  }
}
import { useCallback } from 'react'
import { useToast } from '../components/Toast'
import { loginGetters } from './loginStore'
import { useSocket } from './useSocket'
import { useSocketStore } from './socketStore'
import { 
  usePassportStore, 
  passportActions, 
  PassportData 
} from './passportStore'

// ============================================
// HOOK
// ============================================

export const usePassport = () => {
  const token = loginGetters.getToken()
  const { emit, once } = useSocket()
  
  // Используем хуки из нового passportStore
  const passportData = usePassportStore(state => state.data)
  const isLoading = usePassportStore(state => state.isLoading)
  const isSaving = usePassportStore(state => state.isSaving)
  const isConnected = useSocketStore(state => state.isConnected)
  
  const toast = useToast()
  
  const load = useCallback(() => {
    passportActions.setLoading(true)
            
    if (!isConnected) {
      toast.error('Нет подключения')
      passportActions.setLoading(false)
      return
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      passportActions.setLoading(false)
      return
    }

    once('get_passport', (response) => {
      passportActions.setLoading(false)
      
      if (response.success) {
        passportActions.setData(response.data)
      } else {
        toast.error(response.message || 'Ошибка загрузки паспортных данных')
      }
    })

    emit('get_passport', { token })
        
  }, [token, isConnected, once, emit ])
  
  const save = useCallback((data: PassportData) => {
    passportActions.setSaving(true)

    if (!isConnected) {
      toast.error('Нет подключения')
      passportActions.setSaving(false)
      return
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      passportActions.setSaving(false)
      return
    }

    once('set_passport', (response) => {
      passportActions.setSaving(false)
      if (response.success) {
        toast.success('Паспортные данные сохранены')
        passportActions.setData(response.data || data)
      } else {
        toast.error(response.message || "Ошибка сохранения данных")
      }
    })

    emit('set_passport', { ...data, token })
    toast.info("Сохраняются паспортные данные...")
  }, [token, isConnected, once, emit ])
  
  const updatePassportData = useCallback((data: PassportData) => {
    passportActions.setData(data)
  }, [])
  
  return {
    passportData,
    load,
    save,
    updatePassportData,
    isSaving,
    isLoading
  }
}
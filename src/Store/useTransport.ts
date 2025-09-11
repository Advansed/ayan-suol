// src/Store/useTransport.ts
import { useCallback } from 'react'
import { useToast } from '../components/Toast'
import { loginGetters } from './loginStore'
import { useSocket } from './useSocket'
import { useSocketStore } from './socketStore'
import { 
  useTransportStore, 
  transportActions, 
  TransportData 
} from './transportStore'

// ============================================
// HOOK
// ============================================

export const useTransport = () => {
  const { emit, once } = useSocket()
  const token = loginGetters.getToken()
  
  // Используем хуки из нового transportStore
  const transportData = useTransportStore(state => state.data)
  const isLoading = useTransportStore(state => state.isLoading)
  const isSaving = useTransportStore(state => state.isSaving)
  const isConnected = useSocketStore(state => state.isConnected)
  
  const toast = useToast()
  
  const loadData = useCallback(() => {
    if (!isConnected) {
      toast.error('Нет подключения')
      return
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      return
    }

    transportActions.setLoading(true)

    once('get_transport', (response) => {
      transportActions.setLoading(false)
      
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data[0] : response.data
        transportActions.setData(data)
      } else {
        toast.error(response.message || 'Ошибка загрузки данных транспорта')
      }
    })

    emit('get_transport', { token })
    
  }, [token, isConnected, once, emit, toast])

  const saveData = useCallback((data: TransportData) => {
    if (!isConnected) {
      toast.error('Нет подключения')
      return
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      return
    }

    transportActions.setSaving(true)

    once('set_transport', (response) => {
      transportActions.setSaving(false)
      
      if (response.success) {
        toast.success('Данные транспорта сохранены')
        transportActions.setData(response.data || data)
      } else {
        toast.error(response.message || 'Ошибка сохранения данных транспорта')
      }
    })

    const payload = { token, guid: transportData?.guid, ...data }
    emit('set_transport', payload)
    toast.info("Данные транспорта сохраняются...")
    
  }, [token, transportData?.guid, isConnected, once, emit, toast])

  // Алиасы для совместимости
  const load = useCallback(() => { loadData() }, [loadData])
  const save = useCallback((data: TransportData) => { saveData(data) }, [saveData])

  return {
    transportData,
    isLoading,
    isSaving,
    loadData,
    saveData,
    // Для совместимости со старым API
    load,
    save
  }
}
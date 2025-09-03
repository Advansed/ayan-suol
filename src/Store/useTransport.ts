// src/Store/useTransport.ts

import { useCallback } from 'react'
import { 
  UniversalStore, 
  useStore, 
  TState
} from './Store'
import socketService from '../components/Sockets'
import { useToast } from '../components/Toast'
import { useLogin } from './useLogin'

// ============================================
// ТИПЫ
// ============================================

export interface TransportData {
    guid?: string
    name?: string
    license_plate?: string
    vin?: string
    manufacture_year?: number
    image?: string
    transport_type?: string
    experience?: number
    load_capacity?: number
    // Альтернативные поля для совместимости
    type?: string
    capacity?: number
    year?: number
    number?: string
    exp?: number
}

export interface TransportState extends TState {
  data: TransportData | null
  isLoading: boolean
  isSaving: boolean
}

// ============================================
// STORE
// ============================================

export const transportStore = new UniversalStore<TransportState>({
  initialState: {
    data: null,
    isLoading: false,
    isSaving: false
  },
  enableLogging: true
})

// ============================================
// HOOK
// ============================================

export const useTransport = () => {
    const { token } = useLogin()
    
    const transportData = useStore((state: TransportState) => state.data, 5001, transportStore)
    const isLoading     = useStore((state: TransportState) => state.isLoading, 5002, transportStore)
    const isSaving      = useStore((state: TransportState) => state.isSaving, 5003, transportStore)
    
    const toast = useToast()
    
    const loadData = useCallback(() => {
        const socket = socketService.getSocket()
        if (!socket) {
            toast.error('Нет подключения')
            return
        }

        if (!token) {
            toast.error('Нет токена авторизации')
            return
        }

        transportStore.dispatch({ type: 'isLoading', data: true })

        socket.once('get_transport', (response) => {
            transportStore.dispatch({ type: 'isLoading', data: false })
            
            if (response.success) {
                // Берем первый элемент массива если данные приходят как массив
                const data = Array.isArray(response.data) ? response.data[0] : response.data
                transportStore.dispatch({ type: 'data', data })
            } else {
                toast.error(response.message || 'Ошибка загрузки данных транспорта')
            }
        })

        socket.emit('get_transport', { token })
        
    }, [ token ])

    const saveData = useCallback((data: TransportData) => {
        const socket = socketService.getSocket()
        if (!socket) {
            toast.error('Нет подключения')
            return
        }

        if (!token) {
            toast.error('Нет токена авторизации')
            return
        }

        transportStore.dispatch({ type: 'isSaving', data: true })

        socket.once('set_transport', (response) => {
            transportStore.dispatch({ type: 'isSaving', data: false })
            
            if (response.success) {
                toast.success('Данные транспорта сохранены')
                // Обновляем данные в сторе
                const updatedData = response.data || data
                transportStore.dispatch({ type: 'data', data: updatedData })
            } else {
                toast.error(response.message || 'Ошибка сохранения данных транспорта')
            }
        })

        // Подготавливаем данные для отправки
        const payload = {
            token,
            guid: transportData?.guid,
            ...data
        }

        socket.emit('set_transport', payload)
        toast.info("Данные транспорта сохраняются...")
        
    }, [ token, transportData?.guid])

    // Альтернативные методы для совместимости со старым API
    const load = useCallback(() => {
        loadData()
    }, [loadData])

    const save = useCallback((data: TransportData) => {
        saveData(data)
    }, [saveData])

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
// src/Store/useTransport.ts

import { useCallback } from 'react'
import { useStore } from './Store'
import { useToast } from '../components/Toast'
import { loginGetters } from './loginStore'
import { TransportData, TransportState, transportStore } from './transportStore'
import { useSocket } from './useSocket'
import { useSocketStore } from './socketStore'

// ============================================
// HOOK
// ============================================

export const useTransport = () => {
    const { emit, once } = useSocket()
    const token = loginGetters.getToken()
    
    const transportData = useStore((state: TransportState) => state.data, 5001, transportStore)
    const isLoading     = useStore((state: TransportState) => state.isLoading, 5002, transportStore)
    const isSaving      = useStore((state: TransportState) => state.isSaving, 5003, transportStore)
    const isConnected   = useSocketStore((state) => state.isConnected)  
    
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

        transportStore.dispatch({ type: 'isLoading', data: true })

        emit('get_transport', { token })
        
    }, [token])

    const saveData = useCallback((data: TransportData) => {

        if (!isConnected) {
            toast.error('Нет подключения')
            return
        }

        if (!token) {
            toast.error('Нет токена авторизации')
            return
        }

        transportStore.dispatch({ type: 'isSaving', data: true })

        once('set_transport', (response) => {
            transportStore.dispatch({ type: 'isSaving', data: false })
            
            if (response.success) {
                toast.success('Данные транспорта сохранены')
                transportStore.dispatch({ type: 'data', data: response.data || data })
            } else {
                toast.error(response.message || 'Ошибка сохранения данных транспорта')
            }
        })

        const payload = { token, guid: transportData?.guid, ...data }

        emit('set_transport', payload)

        toast.info("Данные транспорта сохраняются...")
        
    }, [token, transportData?.guid])

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
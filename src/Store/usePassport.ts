import { useCallback } from 'react'
import { useStore } from './Store'
import { useToast } from '../components/Toast'
import { loginGetters } from './loginStore'
import { PassportData, PassportState, passportStore } from './passportStore'
import { useSocket } from './useSocket'

// ============================================
// HOOK
// ============================================

export const usePassport = () => {
    const token = loginGetters.getToken()
    const { emit, once, isConnected } = useSocket()
    
    const passportData  = useStore((state: PassportState) => state.data, 3001, passportStore)
    const isLoading     = useStore((state: PassportState) => state.isLoading, 3002, passportStore)
    const isSaving      = useStore((state: PassportState) => state.isSaving, 3003, passportStore)
    
    const toast = useToast()
    
    const load = useCallback(() => {
        passportStore.dispatch({ type: 'isLoading', data: true })
                
        if (!isConnected) {
            toast.error('Нет подключения')
            passportStore.dispatch({ type: 'isLoading', data: false })
            return
        }

        if (!token) {
            toast.error('Нет токена авторизации')
            passportStore.dispatch({ type: 'isLoading', data: false })
            return
        }

        emit('get_passport', { token })
            
    }, [])
    
    const save = useCallback((data: PassportData) => {
        passportStore.dispatch({ type: 'isSaving', data: true })

        if (!isConnected) {
            toast.error('Нет подключения')
            passportStore.dispatch({ type: 'isSaving', data: false })
            return
        }

        if (!token) {
            toast.error('Нет токена авторизации')
            passportStore.dispatch({ type: 'isSaving', data: false })
            return
        }

        const payload = { ...data, token }

        once('set_passport', (response) => {
            passportStore.dispatch({ type: 'isSaving', data: false })
            if(response.success) {
                toast.success('Паспортные данные сохранены')
            } else {
                toast.error("Ошибка сохранения данных")
            }
        })

        emit('set_passport', payload)
                
        toast.info("Сохраняются паспортные данные...")
    }, [])
    
    const updatePassportData = useCallback((data: PassportData) => {
        passportStore.dispatch({ type: 'data', data })
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
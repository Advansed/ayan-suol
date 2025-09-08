import { useCallback } from 'react'
import { 
  useStore
} from './Store'
import socketService from '../components/Sockets'
import { useToast } from '../components/Toast'
import { loginGetters } from './loginStore'
import { CompanyData, CompanyState, companyStore } from './companyStore'

// ============================================
// ТИПЫ
// ============================================


// ============================================
// HOOK
// ============================================

export const useCompany = () => {
    
    const token         = loginGetters.getToken()
    
    const companyData   = useStore((state: CompanyState) => state.data,         4001, companyStore)
    const isLoading     = useStore((state: CompanyState) => state.isLoading,    4002, companyStore)
    const isSaving      = useStore((state: CompanyState) => state.isSaving,     4003, companyStore)
    
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

        companyStore.dispatch({ type: 'isLoading', data: true })

        socket.once('get_company', (response) => {
            companyStore.dispatch({ type: 'isLoading', data: false })
            
            if (response.success) {
                companyStore.dispatch({ type: 'data', data: response.data })
            } else {
                toast.error(response.message || 'Ошибка загрузки данных')
            }
        })

        socket.emit('get_company', { token })
        
    }, [token])

    const saveData = useCallback((data: CompanyData) => {
        const socket = socketService.getSocket()
        if (!socket) {
            toast.error('Нет подключения')
            return
        }

        if (!token) {
            toast.error('Нет токена авторизации')
            return
        }

        companyStore.dispatch({ type: 'isSaving', data: true })

        socket.once('set_company', (response) => {
            companyStore.dispatch({ type: 'isSaving', data: false })
            
            if (response.success) {
                toast.success('Данные компании сохранены')
                // Обновляем данные в сторе
                companyStore.dispatch({ type: 'data', data: response.data || data })
            } else {
                toast.error(response.message || 'Ошибка сохранения данных')
            }
        })

        socket.emit('set_company', { token, ...data })
        toast.info("Данные компании сохраняются...")
        
    }, [token])

    return {
        companyData,
        isLoading,
        isSaving,
        loadData,
        saveData
    }
}
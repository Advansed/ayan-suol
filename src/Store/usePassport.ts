import { useState, useCallback } from 'react'
import socketService from '../components/Sockets'
import { UniversalStore, useStore, TState } from './Store'
import { useToast } from '../components/Toast'
import { useLogin } from './useLogin'

// ============================================
// ТИПЫ
// ============================================

export interface PassportData {
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

export interface PassportState extends TState {
  data: PassportData | null
  isLoading: boolean
  isSaving: boolean
}

// ============================================
// STORE
// ============================================

export const passportStore = new UniversalStore<PassportState>({
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

export const usePassport = () => {
    const { token } = useLogin()
    
    const passportData  = useStore((state: PassportState) => state.data, 3001, passportStore)
    const isLoading     = useStore((state: PassportState) => state.isLoading, 3002, passportStore)
    const isSaving      = useStore((state: PassportState) => state.isSaving, 3003, passportStore)
    
    const toast = useToast()
    
    const load = useCallback(() => {
        passportStore.dispatch({ type: 'isLoading', data: true })
                
        const socket = socketService.getSocket()
        if (!socket) {
            toast.error('Нет подключения')
            passportStore.dispatch({ type: 'isLoading', data: false })
            return
        }

        // Получаем токен из основного Store (пока не переносим login)
        if (!token) {
        toast.error('Нет токена авторизации')
        passportStore.dispatch({ type: 'isLoading', data: false })
        return
        }

        socket.once('get_passport', (response) => {
            if(response.success){
                passportStore.dispatch({ type: 'data', data: response.data })
                passportStore.dispatch({ type: 'isLoading', data: false })

            }
            // TODO: добавить обработку ошибок response.error
        })

        socket.emit('get_passport', { token })
            
    }, [])
    
    const save = useCallback((data: PassportData) => {
        passportStore.dispatch({ type: 'isSaving', data: true })

        const socket = socketService.getSocket()
        if (!socket) {
            toast.error('Нет подключения')
            passportStore.dispatch({ type: 'isSaving', data: false })
            return
        }

        // Получаем токен из основного Store (пока не переносим login)
        if (!token) {
            toast.error('Нет токена авторизации')
            passportStore.dispatch({ type: 'isSaving', data: false })
            return
        }

        const payload = {
            ...data,
            token
        }

        socket.once('set_passport', (response) => {

            if(response.success) {
                passportStore.dispatch({ type: 'isSaving', data: false })
                toast.success('Паспортные данные сохранены')
            } else {
                toast.error("Ошибка сохранения данных")
            }

       })

        socket.emit('set_passport', payload)
                
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
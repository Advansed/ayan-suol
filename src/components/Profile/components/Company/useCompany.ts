import { useState, useCallback, useEffect } from 'react'
import { socketService } from '../../../Sockets'
import { Store, useSelector } from '../../../Store'

interface CompanyData {
    guid?: string
    company_type?: number
    inn?: string
    kpp?: string
    ogrn?: string
    name?: string
    short_name?: string
    address?: string
    postal_address?: string
    phone?: string
    email?: string
    description?: string
    bank_name?: string
    bank_bik?: string
    bank_account?: string
    bank_corr_account?: string
    is_verified?: boolean
    files?: Array<{
        file_guid: string
        file_type: string
        file_name: string
        file_path: string
    }>
}

interface UseCompanyReturn {
    companyData: CompanyData | null
    isLoading: boolean
    isSaving: boolean
    error: string | null
    success: boolean
    loadData: () => void
    saveData: (data: CompanyData) => void
    resetStates: () => void
}

export const useCompany = (): UseCompanyReturn => {
    const socket = socketService.getSocket()
    
    const companyData = useSelector((state) => state.company, 51)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(()=>{

        console.log("use")

    },[])

    // Загрузка данных
    const loadData = useCallback(() => {
        
        if (!socket) return

        setIsLoading(true)
        setError(null)

        socket.emit('get_company', { token: Store.getState().login.token })

        socket.on('get_company', (response) => {
            setIsLoading(false)
            if (response.success) {
                Store.dispatch({ type: 'company', data: response.data })
            } else {
                setError(response.message || 'Ошибка загрузки данных')
            }
        })

        return () => {
            socket.off('get_company')
        }

  }, [socket])

  // Сохранение данных
  const saveData = useCallback((data: CompanyData) => {
        if (!socket) return

        setIsSaving(true)
        setError(null)
        setSuccess(false)

        socket.emit('set_company', { 
            token: Store.getState().login.token, 
            ...data 
        })

        socket.on('set_company', (response) => {
        setIsSaving(false)
        if (response.success) {
            Store.dispatch({ type: 'company', data: data })
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } else {
            setError(response.message || 'Ошибка сохранения')
        }
        })

        return () => {
        socket.off('set_company')
        }
  }, [socket])

  // Сброс состояний
  const resetStates = useCallback(() => {
        setError(null)
        setSuccess(false)
  }, [])

  return {
        companyData,
        isLoading,
        isSaving,
        error,
        success,
        loadData,
        saveData,
        resetStates
  }
}
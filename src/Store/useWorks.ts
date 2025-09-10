// src/Store/useWorks.ts
import { useCallback } from 'react'
import { useStore } from './Store'
import { useToast } from '../components/Toast'
import { 
    workStore, 
    workGetters, 
    WorkState,
} from './workStore'
import { 
    WorkInfo, 
    WorkPageType, 
    WorkFilters, 
    OfferInfo
} from '../components/Works/types'
import { useSocket } from './useSocket'
import { loginGetters } from './loginStore'
import { useSocketStore } from './socketStore'

export const useWorks = () => {
    const token = loginGetters.getToken()
    const { emit } = useSocket()
    const toast = useToast()

    // ============================================
    // СОСТОЯНИЕ
    // ============================================
    const works             = useStore((state: WorkState) => state.works, 8001, workStore)
    const archiveWorks      = useStore((state: WorkState) => state.archiveWorks, 8002, workStore)
    const isLoading         = useStore((state: WorkState) => state.isLoading, 8003, workStore)
    const isArchiveLoading  = useStore((state: WorkState) => state.isArchiveLoading, 8004, workStore)
    const currentPage       = useStore((state: WorkState) => state.currentPage, 8005, workStore)
    const filters           = useStore((state: WorkState) => state.filters, 8006, workStore)
    const searchQuery       = useStore((state: WorkState) => state.searchQuery, 8007, workStore)
    const navigationHistory = useStore((state: WorkState) => state.navigationHistory, 8008, workStore)
    const isConnected       = useSocketStore((state) => state.isConnected)

    // ============================================
    // НАВИГАЦИЯ
    // ============================================
    const navigateTo = useCallback((page: WorkPageType) => {
        workStore.dispatch({ type: "navigationHistory", data: [...navigationHistory, page] })
        workStore.dispatch({ type: "currentPage", data: page })
    }, [navigationHistory])

    const goBack = useCallback(() => {
        workStore.dispatch({ type: 'currentPage', data: { type: 'list' } })
    }, [])

    // ============================================
    // ФИЛЬТРЫ И ПОИСК
    // ============================================
    const setFilters = useCallback((newFilters: WorkFilters) => {
        workStore.dispatch({ type: 'filters', data: newFilters })
    }, [])

    const setSearchQuery = useCallback((query: string) => {
        workStore.dispatch({ type: 'searchQuery', data: query })
    }, [])

    // ============================================
    // ОПЕРАЦИИ С ПРЕДЛОЖЕНИЯМИ
    // ============================================
    const setOffer = useCallback(async (data: OfferInfo): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        workStore.dispatch({ type: 'isLoading', data: true })
        try {
            const offerData = {
                ...data,
                status: 'pending',
                createdAt: new Date().toISOString()
            }

            emit('set_offer', { token, ...offerData })
            return true
        } catch (error) {
            console.error('Error creating offer:', error)
            toast.error('Ошибка создания предложения')
            return false
        } finally {
            workStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast])
    
    
    const setDeliver = useCallback(async (data: Partial<OfferInfo>): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        workStore.dispatch({ type: 'isLoading', data: true })
        try {
            const offerData = {
                ...data,
                status: 'pending',
                createdAt: new Date().toISOString()
            }

            emit('delivered', { token, ...offerData })
            return true
        } catch (error) {
            console.error('Error creating offer:', error)
            toast.error('Ошибка создания предложения')
            return false
        } finally {
            workStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast])


    // ============================================
    // ЗАГРУЗКА ДАННЫХ
    // ============================================
    const refreshWorks = useCallback(async (): Promise<void> => {
        if (!isConnected) return

        workStore.dispatch({ type: 'isLoading', data: true })
        emit('get_works', { token })
    }, [token, isConnected, emit])

    const loadArchiveWorks = useCallback(async (): Promise<void> => {
        if (!isConnected) return

        workStore.dispatch({ type: 'isArchiveLoading', data: true })
        emit('get_archive', { token })
    }, [token, isConnected, emit])

    // ============================================
    // УТИЛИТЫ
    // ============================================
    const getWork = useCallback((guid: string): WorkInfo | undefined => {
        return workGetters.getWork(guid) || workGetters.getArchiveWork(guid)
    }, [])

    return {
        // Состояние
        works,
        archiveWorks,
        isLoading,
        isArchiveLoading,
        currentPage,
        filters,
        searchQuery,
        navigationHistory,

        // Навигация
        navigateTo,
        goBack,

        // Фильтры
        setFilters,
        setSearchQuery,

        // Загрузка
        refreshWorks,
        loadArchiveWorks,
        setDeliver,
        setOffer,

        // Утилиты
        getWork
    }
}
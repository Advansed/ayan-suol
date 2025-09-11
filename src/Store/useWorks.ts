// src/Store/useWorks.ts
import { useCallback } from 'react'
import { useToast } from '../components/Toast'
import { useSocket } from './useSocket'
import { loginGetters } from './loginStore'
import { useSocketStore } from './socketStore'
import { 
  useWorkStore, 
  workActions, 
  workGetters 
} from './workStore'
import { 
  WorkInfo, 
  WorkPageType, 
  WorkFilters, 
  OfferInfo 
} from '../components/Works/types'

export const useWorks = () => {
  const token = loginGetters.getToken()
  const { emit } = useSocket()
  const toast = useToast()

  // ============================================
  // СОСТОЯНИЕ
  // ============================================
  const works = useWorkStore(state => state.works)
  const archiveWorks = useWorkStore(state => state.archiveWorks)
  const isLoading = useWorkStore(state => state.isLoading)
  const isArchiveLoading = useWorkStore(state => state.isArchiveLoading)
  const currentPage = useWorkStore(state => state.currentPage)
  const filters = useWorkStore(state => state.filters)
  const searchQuery = useWorkStore(state => state.searchQuery)
  const navigationHistory = useWorkStore(state => state.navigationHistory)
  const isConnected = useSocketStore(state => state.isConnected)

  // ============================================
  // НАВИГАЦИЯ
  // ============================================
  const navigateTo = useCallback((page: WorkPageType) => {
    workActions.setNavigationHistory([...navigationHistory, page])
    workActions.setCurrentPage(page)
  }, [navigationHistory])

  const goBack = useCallback(() => {
    workActions.setCurrentPage({ type: 'list' })
  }, [])

  // ============================================
  // ФИЛЬТРЫ И ПОИСК
  // ============================================
  const setFilters = useCallback((newFilters: WorkFilters) => {
    workActions.setFilters(newFilters)
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    workActions.setSearchQuery(query)
  }, [])

  // ============================================
  // ОПЕРАЦИИ С ПРЕДЛОЖЕНИЯМИ
  // ============================================
  const setOffer = useCallback(async (data: OfferInfo): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Нет соединения с сервером')
      return false
    }

    workActions.setLoading(true)
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
      workActions.setLoading(false)
    }
  }, [token, isConnected, emit, toast])
  
  const setDeliver = useCallback(async (data: Partial<OfferInfo>): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Нет соединения с сервером')
      return false
    }

    workActions.setLoading(true)
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
      workActions.setLoading(false)
    }
  }, [token, isConnected, emit, toast])

  // ============================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================
  const refreshWorks = useCallback(async (): Promise<void> => {
    if (!isConnected) return

    workActions.setLoading(true)
    emit('get_works', { token })
  }, [token, isConnected, emit])

  const loadArchiveWorks = useCallback(async (): Promise<void> => {
    if (!isConnected) return

    workActions.setArchiveLoading(true)
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
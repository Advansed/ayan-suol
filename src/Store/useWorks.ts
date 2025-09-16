// src/Store/useWorks.ts
import { useCallback }    from 'react'
import { useToast }       from '../components/Toast'
import { useSocket }      from './useSocket'
import { loginGetters }   from './loginStore'
import { useSocketStore } from './socketStore'
import { useWorkStore, workActions, workGetters } 
                          from './workStore'
import { WorkInfo, WorkFilters, OfferInfo, WorkStatus } 
                          from '../components/Works/types'

export const useWorks = () => {
  const token     = loginGetters.getToken()
  const { emit }  = useSocket()
  const toast     = useToast()

  // ============================================
  // СОСТОЯНИЕ
  // ============================================
  const works             = useWorkStore(state => state.works)
  const archiveWorks      = useWorkStore(state => state.archiveWorks)
  const isLoading         = useWorkStore(state => state.isLoading)
  const isArchiveLoading  = useWorkStore(state => state.isArchiveLoading)
  const filters           = useWorkStore(state => state.filters)
  const searchQuery       = useWorkStore(state => state.searchQuery)
  const isConnected       = useSocketStore(state => state.isConnected)

  // ============================================
  // ФИЛЬТРЫ И ПОИСК
  // ============================================
  const setFilters        = useCallback((newFilters: WorkFilters) => {
    workActions.setFilters(newFilters)
  }, [])

  const setSearchQuery    = useCallback((query: string) => {
    workActions.setSearchQuery(query)
  }, [])

  // ============================================
  // ОПЕРАЦИИ С ПРЕДЛОЖЕНИЯМИ
  // ============================================
  const setOffer          = useCallback(async ( data: OfferInfo ): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Нет соединения с сервером')
      return false
    }

    workActions.setLoading(true)
    try {
      const offerData = {
        ...data,
        createdAt:    new Date().toISOString()
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
  
  const setStatus         = useCallback(async ( work: WorkInfo ): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Нет соединения с сервером')
      return false
    }

    workActions.setLoading(true)
    try {
      const offerData = {
        guid:           work.guid,
        recipient:      work.recipient,
        status:         nextStatus(work.status),
        createdAt:      new Date().toISOString()
      }
      toast.info("emit status")
      emit('set_status', { token, ...offerData })
      return true
    } catch (error) {
      console.error('Error creating offer:', error)
      toast.error('Ошибка создания предложения')
      return false
    } finally {
      workActions.setLoading(false)
    }
  }, [token, isConnected, emit, toast])
  
  const setDeliver        = useCallback(async (data: Partial<OfferInfo>): Promise<boolean> => {
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
  const refreshWorks      = useCallback(async (): Promise<void> => {
    if (!isConnected) return

    workActions.setLoading(true)
    emit('get_works', { token })
  }, [token, isConnected, emit])

  const loadArchiveWorks  = useCallback(async (): Promise<void> => {
    if (!isConnected) return

    workActions.setArchiveLoading(true)
    emit('get_archive', { token })
  }, [token, isConnected, emit])

  // ============================================
  // УТИЛИТЫ
  // ============================================
  const getWork =          useCallback((guid: string): WorkInfo | undefined => {
    return workGetters.getWork(guid) || workGetters.getArchiveWork(guid)
  }, [])


function nextStatus( status: WorkStatus ) {

    switch(status) {
        case WorkStatus.NEW:            return 11;
        case WorkStatus.TO_LOAD:        return 13;
        case WorkStatus.LOADING:        return 15;
        case WorkStatus.IN_WORK:        return 17;
        case WorkStatus.UNLOADING:      return 19;
        case WorkStatus.REJECTED:       return 11;
        default: return 22;
    }
    
    // NEW             = "Новый",              // Доступна для предложения             10
    // OFFERED         = "Торг",               // Водитель сделал предложение          11    
    // TO_LOAD         = "На погрузку",        // Едет на погрузку                     12    
    // ON_LOAD         = "На погрузке",        // Прибыл на погрузку                   13 
    // LOADING         = "Загружается",        // Загружается                          14 
    // LOADED          = "Загружено",          // Загрузился                           15 
    // IN_WORK         = "В работе",           // Груз в работе                        16
    // TO_UNLOAD       = "Доставлено",         // Прибыл на место выгрузки             17
    // UNLOADING       = "Выгружается",        // Груз выгружается                     18
    // UNLOADED        = "Выгружено",          // Груз выгружен                        19
    // COMPLETED       = "Завершено" ,         // Работа завершена                     20
    // REJECTED        = "Отказано"            // Отказано                             21           
}

  return {
    // Состояние
    works,
    archiveWorks,
    isLoading,
    isArchiveLoading,
    filters,
    searchQuery,

    // Фильтры
    setFilters,
    setSearchQuery,

    // Загрузка
    refreshWorks,
    loadArchiveWorks,
    setDeliver,
    setStatus,
    setOffer,

    // Утилиты
    getWork
  }
}
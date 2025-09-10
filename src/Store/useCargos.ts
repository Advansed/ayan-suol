// src/Store/useCargos.ts
import { useCallback } from 'react'
import { useSocket } from './useSocket'
import { useToast } from '../components/Toast'
import { 
    useCargoStore,
    CargoInfo, 
    CargoFilters,
    PageType,
    EMPTY_CARGO,
    CargoStatus
} from './cargoStore'
import { useToken } from './loginStore'
import { useSocketStore } from './socketStore'

// ============================================
// ТИПЫ
// ============================================
export interface UseCargosReturn {
    cargos:             CargoInfo[]
    isLoading:          boolean
    currentPage:        PageType
    filters:            CargoFilters
    searchQuery:        string
    navigateTo:         (page: PageType) => void
    goBack:             () => void
    setFilters:         (filters: CargoFilters) => void  
    setSearchQuery:     (query: string) => void
    createCargo:        (data: Partial<CargoInfo>) => Promise<boolean>
    updateCargo:        (guid: string, data: Partial<CargoInfo>) => Promise<boolean>
    deleteCargo:        (guid: string) => Promise<boolean>
    publishCargo:       (guid: string) => Promise<boolean>
    getCargo:           (guid: string) => CargoInfo | undefined
    refreshCargos:      () => Promise<void>
}

// ============================================
// КОНСТАНТЫ
// ============================================
const SOCKET_EVENTS = {
    SAVE_CARGO:         'save_cargo',
    UPDATE_CARGO:       'update_cargo', 
    DELETE_CARGO:       'delete_cargo',
    PUBLISH_CARGO:      'publish_cargo',
    GET_CARGOS:         'get_cargos',
    GET_ORGS:           'get_orgs'
}

// ============================================
// HOOK
// ============================================
export const useCargos = (): UseCargosReturn => {
    const token     = useToken()
    const { emit }  = useSocket()
    const toast     = useToast()

    // zustand store
    const {
        cargos,
        isLoading,
        currentPage,
        filters,
        searchQuery,
        navigateTo: storeNavigateTo,
        goBack: storeGoBack,
        setFilters: storeSetFilters,
        setSearchQuery: storeSetSearchQuery,
        setLoading,
        setCurrentPage,
        updateCargo: storeUpdateCargo,
        publishCargo: storePublishCargo
    } = useCargoStore()

    const isConnected = useSocketStore((state) => state.isConnected)

    // ============================================
    // NAVIGATION
    // ============================================
    const navigateTo = useCallback((page: PageType) => {
        storeNavigateTo(page)
    }, [storeNavigateTo])

    const goBack = useCallback(() => {
        storeGoBack()
    }, [storeGoBack])

    // ============================================
    // FILTERS
    // ============================================
    const setFilters = useCallback((newFilters: CargoFilters) => {
        storeSetFilters(newFilters)
    }, [storeSetFilters])

    const setSearchQuery = useCallback((query: string) => {
        storeSetSearchQuery(query)
    }, [storeSetSearchQuery])

    // ============================================
    // CRUD
    // ============================================
    const createCargo = useCallback(async (data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            const newCargo: CargoInfo = {
                ...EMPTY_CARGO,
                ...data,
                guid: generateGuid(),
                status: CargoStatus.NEW,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            emit(SOCKET_EVENTS.SAVE_CARGO, { token, ...newCargo })
            setCurrentPage({ type: 'list' })

            return true
        } catch (error) {
            console.error('Error creating cargo:', error)
            toast.error('Ошибка создания груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, toast, setLoading, setCurrentPage])

    const updateCargo = useCallback(async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            const existingCargo = cargos.find(c => c.guid === guid)
            if (!existingCargo) {
                toast.error('Груз не найден')
                return false
            }

            const updatedCargo: CargoInfo = {
                ...existingCargo,
                ...data,
                updatedAt: new Date().toISOString()
            }

            storeUpdateCargo(updatedCargo.guid, updatedCargo)
            emit(SOCKET_EVENTS.SAVE_CARGO, { token, ...updatedCargo })

            return true
        } catch (error) {
            toast.error('Ошибка обновления груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, toast, cargos, setLoading, storeUpdateCargo])

    const deleteCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            emit(SOCKET_EVENTS.DELETE_CARGO, { guid, token })
            setCurrentPage({ type: 'list' })

            return true
        } catch (error) {
            toast.error('Ошибка удаления груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, toast, setLoading, setCurrentPage])

    const publishCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            const cargo = cargos.find(c => c.guid === guid)
            if (!cargo) {
                console.error('Cargo not found for publishing:', guid)
                toast.error('Груз не найден')
                return false
            }

            storePublishCargo(guid)
            emit(SOCKET_EVENTS.PUBLISH_CARGO, { guid, token })
            toast.info('Груз опубликован')

            return true
        } catch (error) {
            toast.error('Ошибка публикации груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, toast, cargos, setLoading, storePublishCargo])

    const getCargo = useCallback((guid: string): CargoInfo | undefined => {
        return cargos.find(cargo => cargo.guid === guid)
    }, [cargos])

    const refreshCargos = useCallback(async (): Promise<void> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return
        }

        setLoading(true)
        try {
            emit(SOCKET_EVENTS.GET_CARGOS, { token })
            emit(SOCKET_EVENTS.GET_ORGS, { token })
        } catch (error) {
            toast.error('Ошибка обновления данных')
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, setLoading])

    return {
        cargos,
        isLoading,
        currentPage,
        filters,
        searchQuery,
        navigateTo,
        goBack,
        setFilters,
        setSearchQuery,
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,
        getCargo,
        refreshCargos
    }
}

// ============================================
// УТИЛИТЫ
// ============================================
const generateGuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// ============================================
// ДОПОЛНИТЕЛЬНЫЙ КОД (в комментариях)
// ============================================
/* 
После внедрения нужно:

1. Удалить старые файлы:
   - Убрать import { useStore } из useCargos
   - Убрать UniversalStore из cargoStore
   - Убрать все dispatch вызовы

2. Обновить компоненты:
   - Заменить все cargoStore.dispatch на zustand actions
   - Обновить импорты в компонентах

3. Протестировать:
   - Socket обработчики
   - CRUD операции  
   - Навигацию
   - Фильтры и поиск
*/
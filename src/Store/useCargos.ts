// src/Store/useCargos.ts

import { useCallback, } from 'react'
import { useStore } from './Store'
import { useSocket } from './useSocket'
import { useToast } from '../components/Toast'
import { 
    cargoStore,
    CargoInfo, 
    CargoState, 
    CargoStatus, 
    CargoFilters,
    PageType,
    EMPTY_CARGO,
    cargoActions
} from './cargoStore'
import { loginGetters } from './loginStore'

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
    const token                     = loginGetters.getToken()
    const { emit, isConnected }     = useSocket()
    const toast                     = useToast()

    const cargos                    = useStore((state: CargoState) => state.cargos, 7001, cargoStore)
    const isLoading                 = useStore((state: CargoState) => state.isLoading, 7002, cargoStore)
    const currentPage               = useStore((state: CargoState) => state.currentPage, 7003, cargoStore)
    const filters                   = useStore((state: CargoState) => state.filters, 7004, cargoStore)
    const searchQuery               = useStore((state: CargoState) => state.searchQuery, 7005, cargoStore)
    const navigationHistory         = useStore((state: CargoState) => state.navigationHistory, 7006, cargoStore)

    // ============================================
    // НАВИГАЦИЯ
    // ============================================
    const navigateTo = useCallback((page: PageType) => {
        cargoStore.dispatch( { type: "navigationHistory", data: [...navigationHistory, page] })
        cargoStore.dispatch( { type: "currentPage", data: page })
    }, [currentPage, navigationHistory])

    const goBack = useCallback(() => {
        cargoStore.dispatch({ 
            type: 'currentPage', 
            data: { type: 'list' } 
        })
    }, [])

    // ============================================
    // ФИЛЬТРЫ И ПОИСК
    // ============================================
    const setFilters = useCallback((newFilters: CargoFilters) => {
        cargoStore.dispatch({ type: 'filters', data: newFilters })
    }, [])

    const setSearchQuery = useCallback((query: string) => {
        cargoStore.dispatch({ type: 'searchQuery', data: query })
    }, [])

    // ============================================
    // CRUD ОПЕРАЦИИ
    // ============================================
    const createCargo = useCallback(async (data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
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

            cargoStore.dispatch({ 
                type: 'currentPage', 
                data: { type: 'list' } 
            })

            return true
        } catch (error) {
            console.error('Error creating cargo:', error)
            toast.error('Ошибка создания груза')
            return false
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast])

    const updateCargo = useCallback(async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
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

            cargoActions.updateCargo( updatedCargo.guid, updatedCargo )


            emit(SOCKET_EVENTS.SAVE_CARGO, { token, ...updatedCargo })


            return true
        } catch (error) {
            toast.error('Ошибка обновления груза')
            return false
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast, cargos])

    const deleteCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
        try {
            emit(SOCKET_EVENTS.DELETE_CARGO, { guid, token })

            cargoStore.dispatch({ 
                type: 'currentPage', 
                data: { type: 'list' } 
            })

            return true
        } catch (error) {
            toast.error('Ошибка удаления груза')
            return false
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast])

    const publishCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
        try {
            const cargo = cargos.find(c => c.guid === guid)
            if (!cargo) {
                console.error('Cargo not found for publishing:', guid)
                toast.error('Груз не найден')
                return false
            }

            cargoActions.publishCargo( guid )

            emit(SOCKET_EVENTS.PUBLISH_CARGO, { guid, token })

            toast.info('Груз опубликован')

            return true
        } catch (error) {
            toast.error('Ошибка публикации груза')
            return false
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast, cargos])

    const getCargo = useCallback((guid: string): CargoInfo | undefined => {
        return cargos.find(cargo => cargo.guid === guid)
    }, [cargos])

    const refreshCargos = useCallback(async (): Promise<void> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
        try {
            emit(SOCKET_EVENTS.GET_CARGOS, { token })
            emit(SOCKET_EVENTS.GET_ORGS, { token })
        } catch (error) {
            toast.error('Ошибка обновления данных')
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit])

    // ============================================
    // ЭФФЕКТЫ
    // ============================================


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
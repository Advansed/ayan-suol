// src/Store/useCargos.ts
import { useCallback, useMemo } from 'react'
import { useSocket } from './useSocket'
import { useToast } from '../components/Toast'
import { 
    useCargoStore,
    CargoInfo, 
    CargoFilters,
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
    filters:            CargoFilters
    searchQuery:        string
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
    const token = useToken()
    const { emit } = useSocket()
    const toast = useToast()
    const isConnected = useSocketStore(state => state.isConnected)

    // Мемоизированные селекторы
    const cargos = useCargoStore(state => state.cargos)
    const isLoading = useCargoStore(state => state.isLoading)
    const filters = useCargoStore(state => state.filters)
    const searchQuery = useCargoStore(state => state.searchQuery)

    const { setLoading, setFilters, setSearchQuery, addCargo, updateCargo: storeUpdateCargo, deleteCargo: storeDeleteCargo, publishCargo: storePublishCargo } = useCargoStore()

    const createCargo = useCallback(async (data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            const newCargo = { ...EMPTY_CARGO, ...data }
            addCargo(newCargo)
            emit(SOCKET_EVENTS.SAVE_CARGO, { cargo: newCargo, token })
            toast.success('Груз создан')
            return true
        } catch (error) {
            toast.error('Ошибка создания груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, toast, setLoading, addCargo])

    const updateCargo = useCallback(async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            storeUpdateCargo(guid, data)
            emit(SOCKET_EVENTS.UPDATE_CARGO, { guid, cargo: data, token })
            toast.success('Груз обновлен')
            return true
        } catch (error) {
            toast.error('Ошибка обновления груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, toast, setLoading, storeUpdateCargo])

    const deleteCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            storeDeleteCargo(guid)
            emit(SOCKET_EVENTS.DELETE_CARGO, { guid, token })
            toast.success('Груз удален')
            return true
        } catch (error) {
            toast.error('Ошибка удаления груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, toast, setLoading, storeDeleteCargo])

    const publishCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            const cargo = cargos.find(c => c.guid === guid)
            if (!cargo) {
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
        } catch (error) {
            toast.error('Ошибка обновления данных')
        } finally {
            setLoading(false)
        }
    }, [token, isConnected, emit, setLoading])

    return {
        cargos,
        isLoading,
        filters,
        searchQuery,
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


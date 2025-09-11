// src/Store/useCargos.ts
import { useCallback, useMemo } from 'react'
import { useSocket } from './useSocket'
import { useToast } from '../components/Toast'
import { 
    useCargoStore,
    CargoInfo, 
    EMPTY_CARGO
} from './cargoStore'
import { useToken } from './loginStore'
import { useSocketStore } from './socketStore'

// ============================================
// ТИПЫ
// ============================================
export interface UseCargosReturn {
    cargos:             CargoInfo[]
    isLoading:          boolean
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
    const token                 = useToken()
    const { emit }              = useSocket()
    const toast                 = useToast()
    const isConnected           = useSocketStore(state => state.isConnected)

    // Разделяем селекторы - это решает проблему с getSnapshot
    const cargos                = useCargoStore(state => state.cargos)
    const isLoading             = useCargoStore(state => state.isLoading)
    const setLoading            = useCargoStore(state => state.setLoading)
    const addCargo              = useCargoStore(state => state.addCargo)
    const storeUpdateCargo      = useCargoStore(state => state.updateCargo)
    const storeDeleteCargo      = useCargoStore(state => state.deleteCargo)
    const storePublishCargo     = useCargoStore(state => state.publishCargo)


    // Мемоизированные стабильные функции
    const stableEmit = useCallback(emit, [])
    const stableToast = useMemo(() => ({
        error: toast.error,
        success: toast.success,
        info: toast.info
    }), []) // toast методы обычно стабильны

    const createCargo = useCallback(async (data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            stableToast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            const newCargo = { ...EMPTY_CARGO, ...data }
            addCargo(newCargo)
            stableEmit(SOCKET_EVENTS.SAVE_CARGO, { cargo: newCargo, token })
            stableToast.success('Груз создан')
            return true
        } catch (error) {
            stableToast.error('Ошибка создания груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [isConnected, stableEmit, token, stableToast, setLoading, addCargo])

    const updateCargo = useCallback(async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            stableToast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            storeUpdateCargo(guid, data)
            stableEmit(SOCKET_EVENTS.UPDATE_CARGO, { guid, cargo: data, token })
            stableToast.success('Груз обновлен')
            return true
        } catch (error) {
            stableToast.error('Ошибка обновления груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [isConnected, stableEmit, token, stableToast, setLoading, storeUpdateCargo])

    const deleteCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            stableToast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            storeDeleteCargo(guid)
            stableEmit(SOCKET_EVENTS.DELETE_CARGO, { guid, token })
            stableToast.success('Груз удален')
            return true
        } catch (error) {
            stableToast.error('Ошибка удаления груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [isConnected, stableEmit, token, stableToast, setLoading, storeDeleteCargo])

    const publishCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            stableToast.error('Нет соединения с сервером')
            return false
        }

        setLoading(true)
        try {
            const cargo = cargos.find(c => c.guid === guid)
            if (!cargo) {
                stableToast.error('Груз не найден')
                return false
            }

            storePublishCargo(guid)
            stableEmit(SOCKET_EVENTS.PUBLISH_CARGO, { guid, token })
            stableToast.info('Груз опубликован')
            return true
        } catch (error) {
            stableToast.error('Ошибка публикации груза')
            return false
        } finally {
            setLoading(false)
        }
    }, [isConnected, stableEmit, token, stableToast, cargos, setLoading, storePublishCargo])

    const getCargo = useCallback((guid: string): CargoInfo | undefined => {
        return cargos.find(cargo => cargo.guid === guid)
    }, [cargos])

    const refreshCargos = useCallback(async (): Promise<void> => {
        if (!isConnected) {
            stableToast.error('Нет соединения с сервером')
            return
        }

        setLoading(true)
        try {
            stableEmit(SOCKET_EVENTS.GET_CARGOS, { token })
        } catch (error) {
            stableToast.error('Ошибка обновления данных')
        } finally {
            setLoading(false)
        }
    }, [isConnected, stableEmit, token, stableToast, setLoading])

    // Мемоизируем возвращаемый объект
    return useMemo(() => ({
        cargos,
        isLoading,
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,
        getCargo,
        refreshCargos
    }), [
        cargos,
        isLoading,
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,
        getCargo,
        refreshCargos
    ])
}
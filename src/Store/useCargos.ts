// src/Store/useCargos.ts
import { useCallback, useMemo }     from 'react'
import { useSocket }                from './useSocket'
import { useToast }                 from '../components/Toast'
import { useCargoStore, CargoInfo
    , EMPTY_CARGO }                 from './cargoStore'
import { useToken }                 from './loginStore'

// ============================================
// ТИПЫ
// ============================================
export interface UseCargosReturn {
    cargos:                         CargoInfo[]
    isLoading:                      boolean
    createCargo:                    ( data: Partial<CargoInfo> ) => Promise<boolean>
    updateCargo:                    ( guid: string, data: Partial<CargoInfo> ) => Promise<boolean>
    deleteCargo:                    ( guid: string ) => Promise<boolean>
    publishCargo:                   ( guid: string ) => Promise<boolean>
    getCargo:                       ( guid: string ) => CargoInfo | undefined
    refreshCargos:                  ( ) => Promise<void>
}

// ============================================
// КОНСТАНТЫ
// ============================================
const SOCKET_EVENTS = {
    SAVE_CARGO:                     'set_cargo',
    UPDATE_CARGO:                   'update_cargo', 
    DELETE_CARGO:                   'delete_cargo',
    PUBLISH_CARGO:                  'publish_cargo',
    GET_CARGOS:                     'get_cargos',
    GET_ORGS:                       'get_orgs'
}

// ============================================
// HOOK
// ============================================
export const useCargos = (): UseCargosReturn => {
    const token                     = useToken()
    const { emit }                  = useSocket()
    const toast                     = useToast()

    // Разделяем селекторы - это решает проблему с getSnapshot
    const cargos                    = useCargoStore(state => state.cargos)
    const isLoading                 = useCargoStore(state => state.isLoading)
    const setLoading                = useCargoStore(state => state.setLoading)
    const addCargo                  = useCargoStore(state => state.addCargo)
    const storeUpdateCargo          = useCargoStore(state => state.updateCargo)
    const storeDeleteCargo          = useCargoStore(state => state.deleteCargo)
    const storePublishCargo         = useCargoStore(state => state.publishCargo)



    const createCargo               = useCallback(async (data: Partial<CargoInfo>): Promise<boolean> => {

        setLoading(true)
        try {
            const newCargo = { ...EMPTY_CARGO, ...data }

            emit(SOCKET_EVENTS.SAVE_CARGO, { token: token, ...newCargo })
            toast.success('Груз создан')
            return true
        } catch (error) {
            toast.error('Ошибка создания груза')
            return false
        } finally {
            setLoading(false)
        }

    }, [ token, setLoading, addCargo])

    
    const updateCargo               = useCallback(async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {

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
    }, [ token, setLoading, storeUpdateCargo])

    
    const deleteCargo               = useCallback(async (guid: string): Promise<boolean> => {

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
    }, [ token, setLoading, storeDeleteCargo])


    const publishCargo              = useCallback(async (guid: string): Promise<boolean> => {

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
    }, [ token, cargos, setLoading, storePublishCargo])


    const getCargo                  = useCallback((guid: string): CargoInfo | undefined => {
        return cargos.find(cargo => cargo.guid === guid)
    }, [cargos])


    const refreshCargos             = useCallback(async (): Promise<void> => {

        setLoading(true)
        try {
            emit(SOCKET_EVENTS.GET_CARGOS, { token })
        } catch (error) {
            toast.error('Ошибка обновления данных')
        } finally {
            setLoading(false)
        }
    }, [ token, setLoading])
    

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
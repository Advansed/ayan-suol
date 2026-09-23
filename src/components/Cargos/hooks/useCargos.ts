// src/components/Cargos/hooks/useCargos.ts
import { useCallback, useMemo } from 'react'
import { useSocket } from '../../../Store/useSocket'
import { useToast } from '../../Toast'
import {
  useCargoStore,
  CargoInfo,
  EMPTY_CARGO,
  setPendingCargoSave,
} from '../../../Store/cargoStore'
import { useToken } from '../../../Store/loginStore'

// ============================================
// ТИПЫ
// ============================================
export interface UseCargosReturn {
  cargos: CargoInfo[]
  isLoading: boolean
  createCargo: (data: Partial<CargoInfo>) => Promise<boolean>
  updateCargo: (guid: string, data: Partial<CargoInfo>) => Promise<boolean>
  deleteCargo: (guid: string) => Promise<boolean>
  publishCargo: (guid: string) => Promise<boolean>
  unpublishCargo: (guid: string) => Promise<boolean>
  getCargo: (guid: string) => CargoInfo | undefined
  refreshCargos: () => Promise<void>
}

// ============================================
// КОНСТАНТЫ
// ============================================
const SOCKET_EVENTS = {
  SAVE_CARGO: 'set_cargo',
  DELETE_CARGO: 'delete_cargo',
  PUBLISH_CARGO: 'publish_cargo',
  UNPUBLISH_CARGO: 'unpublish_cargo',
  GET_CARGOS: 'get_cargos',
  GET_ORGS: 'get_orgs',
}

// ============================================
// HOOK
// ============================================
export const useCargos = (): UseCargosReturn => {
  const token = useToken()
  const { emit } = useSocket()
  const toast = useToast()

  const cargos = useCargoStore((state) => state.cargos)
  const isLoading = useCargoStore((state) => state.isLoading)
  const setLoading = useCargoStore((state) => state.setLoading)
  const storeUpdateCargo = useCargoStore((state) => state.updateCargo)
  const storeDeleteCargo = useCargoStore((state) => state.deleteCargo)
  const storePublishCargo = useCargoStore((state) => state.publishCargo)
  const storeUnpublishCargo = useCargoStore((state) => state.unpublishCargo)

  const createCargo = useCallback(
    async (data: Partial<CargoInfo>): Promise<boolean> => {
      setLoading(true)
      try {
        const newCargo: CargoInfo = {
          ...EMPTY_CARGO,
          ...data,
          advance: Number(data.advance) || 0,
          insurance: Number(data.insurance) || 0,
        }
        setPendingCargoSave(newCargo)
        emit(SOCKET_EVENTS.SAVE_CARGO, { token, ...newCargo })
        toast.success('Груз создан')
        return true
      } catch (error) {
        setPendingCargoSave(null)
        toast.error('Ошибка создания груза')
        return false
      } finally {
        setLoading(false)
      }
    },
    [token, setLoading, emit, toast]
  )

  const updateCargo = useCallback(
    async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {
      setLoading(true)
      try {
        const cargo: CargoInfo = {
          ...EMPTY_CARGO,
          ...data,
          guid,
          advance: Number(data.advance) || 0,
          insurance: Number(data.insurance) || 0,
        }
        setPendingCargoSave(cargo)
        storeUpdateCargo(guid, cargo)
        emit(SOCKET_EVENTS.SAVE_CARGO, { token, ...cargo })
        toast.success('Груз обновлен')
        return true
      } catch (error) {
        setPendingCargoSave(null)
        toast.error('Ошибка обновления груза')
        return false
      } finally {
        setLoading(false)
      }
    },
    [token, setLoading, storeUpdateCargo, emit, toast]
  )

  const deleteCargo = useCallback(
    async (guid: string): Promise<boolean> => {
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
    },
    [token, setLoading, storeDeleteCargo, emit, toast]
  )

  const publishCargo = useCallback(
    async (guid: string): Promise<boolean> => {
      setLoading(true)
      try {
        const cargo = cargos.find((c) => c.guid === guid)
        if (!cargo) {
          toast.error('Груз не найден')
          return false
        }

        storePublishCargo(guid)
        emit(SOCKET_EVENTS.PUBLISH_CARGO, { guid, token })
        toast.success('Груз опубликован')
        return true
      } catch (error) {
        toast.error('Ошибка публикации груза')
        return false
      } finally {
        setLoading(false)
      }
    },
    [
      token,
      cargos,
      setLoading,
      storePublishCargo,
      emit,
      toast,
    ]
  )

  const unpublishCargo = useCallback(
    async (guid: string): Promise<boolean> => {
      setLoading(true)
      try {
        const cargo = cargos.find((c) => c.guid === guid)
        if (!cargo) {
          toast.error('Груз не найден')
          return false
        }
        storeUnpublishCargo(guid)
        emit(SOCKET_EVENTS.UNPUBLISH_CARGO, { guid, token })
        toast.success('Публикация отменена')
        return true
      } catch (error) {
        toast.error('Ошибка отмены публикации')
        return false
      } finally {
        setLoading(false)
      }
    },
    [token, cargos, setLoading, storeUnpublishCargo, emit, toast]
  )

  const getCargo = useCallback(
    (guid: string): CargoInfo | undefined => {
      return cargos.find((cargo) => cargo.guid === guid)
    },
    [cargos]
  )

  const refreshCargos = useCallback(async (): Promise<void> => {
    try {
      emit(SOCKET_EVENTS.GET_CARGOS, { token })
    } catch (error) {
      toast.error('Ошибка обновления данных')
    }
  }, [token, emit, toast])

  return useMemo(
    () => ({
      cargos,
      isLoading,
      createCargo,
      updateCargo,
      deleteCargo,
      publishCargo,
      unpublishCargo,
      getCargo,
      refreshCargos,
    }),
    [
      cargos,
      isLoading,
      createCargo,
      updateCargo,
      deleteCargo,
      publishCargo,
      unpublishCargo,
      getCargo,
      refreshCargos,
    ]
  )
}

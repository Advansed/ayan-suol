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
import { accountActions, accountGetters } from '../../../Store/accountStore'
import { formatters } from '../../../utils/utils'

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
  GET_CARGOS: 'get_cargos',
  GET_ORGS: 'get_orgs',
}

type SocketResult = { success: boolean; data?: any; error?: string }

// ============================================
// HOOK
// ============================================
export const useCargos = (): UseCargosReturn => {
  const token = useToken()
  const { emit, once } = useSocket()
  const toast = useToast()

  const cargos = useCargoStore((state) => state.cargos)
  const isLoading = useCargoStore((state) => state.isLoading)
  const setLoading = useCargoStore((state) => state.setLoading)
  const storeUpdateCargo = useCargoStore((state) => state.updateCargo)
  const storeDeleteCargo = useCargoStore((state) => state.deleteCargo)
  const storePublishCargo = useCargoStore((state) => state.publishCargo)

  const socketRequest = useCallback(
    (event: string, data: Record<string, unknown>): Promise<SocketResult> => {
      return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
          resolve({ success: false, error: 'Время ожидания истекло' })
        }, 10000)

        once(event, (response: any) => {
          window.clearTimeout(timer)
          if (response?.success) {
            resolve({ success: true, data: response.data })
          } else {
            resolve({
              success: false,
              error: response?.message || response?.error || 'Ошибка сервера',
            })
          }
        })

        emit(event, data)
      })
    },
    [emit, once]
  )

  const fetchBalance = useCallback(async (): Promise<number> => {
    const result = await socketRequest('get_balance', { token })
    if (result.success) {
      const balance = Number(result.data?.balance) || 0
      accountActions.updateAccountData({
        balance,
        ...(result.data?.currency ? { currency: String(result.data.currency) } : {}),
      })
      return balance
    }
    return accountGetters.getBalance()
  }, [socketRequest, token])

  const chargeDocument = useCallback(
    async (payload: {
      cargo_id: string
      prepayment: number
      description: string
      type: 1 | 2
    }): Promise<SocketResult> => {
      const currency = accountGetters.getAccountData()?.currency || 'RUB'
      const result = await socketRequest('set_document', {
        token,
        currency,
        ...payload,
      })

      if (result.success && result.data?.balance !== undefined) {
        accountActions.updateAccountData({ balance: Number(result.data.balance) || 0 })
      }

      return result
    },
    [socketRequest, token]
  )

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

        const advance = Number(cargo.advance) || 0
        const insurance = Number(cargo.insurance) || 0
        const required = advance + insurance

        const balance = await fetchBalance()

        if (required > 0 && balance < required) {
          toast.error(
            `Недостаточно средств. Нужно ${formatters.currency(required)}, на балансе ${formatters.currency(balance)}`
          )
          return false
        }

        if (advance > 0) {
          const paid = await chargeDocument({
            cargo_id: guid,
            prepayment: advance,
            description: `Предоплата за груз ${cargo.name}`,
            type: 1,
          })
          if (!paid.success) {
            toast.error(paid.error || 'Не удалось списать спецсчёт')
            return false
          }
        }

        if (insurance > 0) {
          const paid = await chargeDocument({
            cargo_id: guid,
            prepayment: insurance,
            description: `Страхование груза ${cargo.name}`,
            type: 2,
          })
          if (!paid.success) {
            toast.error(paid.error || 'Не удалось списать страховку')
            return false
          }
        }

        if (required > 0) {
          const left = accountGetters.getBalance()
          if (left === balance) {
            accountActions.updateAccountData({ balance: Math.max(0, balance - required) })
          }
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
      fetchBalance,
      chargeDocument,
    ]
  )

  const getCargo = useCallback(
    (guid: string): CargoInfo | undefined => {
      return cargos.find((cargo) => cargo.guid === guid)
    },
    [cargos]
  )

  const refreshCargos = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      emit(SOCKET_EVENTS.GET_CARGOS, { token })
    } catch (error) {
      toast.error('Ошибка обновления данных')
      setLoading(false)
    }
  }, [token, setLoading, emit, toast])

  return useMemo(
    () => ({
      cargos,
      isLoading,
      createCargo,
      updateCargo,
      deleteCargo,
      publishCargo,
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
      getCargo,
      refreshCargos,
    ]
  )
}

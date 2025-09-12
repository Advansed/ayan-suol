// src/Store/useAccount.ts
import { useCallback } from 'react'
import { useToast } from '../components/Toast'
import { useToken } from './loginStore'
import { useSocket } from './useSocket'
import { useSocketStore } from './socketStore'
import { 
  useAccountStore,
  accountActions,
  PaymentData
} from './accountStore'

// ============================================
// HOOK
// ============================================

export const useAccount = () => {
  const token = useToken()
  const { once, emit } = useSocket()
  
  // Используем хуки из accountStore
  const accountData = useAccountStore(state => state.accountData)
  const transactions = useAccountStore(state => state.transactions)
  const isLoading = useAccountStore(state => state.isLoading)
  const isSaving = useAccountStore(state => state.isSaving)
  const isLoadingTransactions = useAccountStore(state => state.isLoadingTransactions)
  const isConnected = useSocketStore(state => state.isConnected)

  const toast = useToast()
  
  // Получение баланса
  const loadBalance = useCallback(() => {
    if (!isConnected) {
      toast.error('Нет подключения')
      return
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      return
    }

    accountActions.setLoading(true)

    once('get_balance', (response) => {
      accountActions.setLoading(false)
      
      if (response.success) {
        const accountData = {
          balance: response.data?.balance || 0,
          currency: response.data?.currency || 'RUB',
          lastUpdated: new Date().toISOString()
        }
        accountActions.setAccountData(accountData)
      } else {
        toast.error(response.message || 'Ошибка загрузки баланса')
      }
    })

    emit('get_balance', { token })
    
  }, [token, isConnected, once, emit, toast])

  // Создание платежа
  const makePayment = useCallback((paymentData: PaymentData) => {
    if (!isConnected) {
      toast.error('Нет подключения')
      return Promise.resolve(false)
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      return Promise.resolve(false)
    }

    accountActions.setSaving(true)

    return new Promise<boolean>((resolve) => {
      once('set_payment', (response) => {
        accountActions.setSaving(false)
        
        if (response.success) {
          toast.success('Платеж создан успешно')
          // Обновляем баланс после создания платежа
          loadBalance()
          loadTransactions()
          resolve(true)
        } else {
          toast.error(response.message || 'Ошибка создания платежа')
          resolve(false)
        }
      })

      const payload = {
        token,
        date: paymentData.date || new Date().toISOString(),
        ...paymentData
      }

      emit('set_payment', payload)
      toast.info("Создание платежа...")
    })
    
  }, [token, isConnected, once, emit, toast, loadBalance ])

  // Получение истории транзакций
  const loadTransactions = useCallback(() => {
    if (!isConnected) {
      toast.error('Нет подключения')
      return
    }

    if (!token) {
      toast.error('Нет токена авторизации')
      return
    }

    accountActions.setLoadingTransactions(true)

    once('get_transactions', (response) => {
      accountActions.setLoadingTransactions(false)
      
      if (response.success) {
        const transactions = (response.data || []).map((item: any) => ({
          id: item.id || item.guid,
          date: item.date,
          type: item.type === 1 ? 'topup' : item.type === 2 ? 'expense' : 'payment',
          amount: item.amount || item.summ,
          description: item.description || item.message || '',
          status: item.status === 1 ? 'completed' : item.status === 0 ? 'pending' : 'failed',
          orderId: item.orderId
        }))
        
        accountActions.setTransactions(transactions)
      } else {
        toast.error(response.message || 'Ошибка загрузки истории операций')
      }
    })

    emit('get_transactions', { token })
    
  }, [token, isConnected, once, emit, toast])

  // Пополнение счета (для совместимости со старым API)
  const topUpAccount = useCallback(async (amount: number, method: string = 'card'): Promise<boolean> => {
    if (!amount || amount <= 0) {
      toast.error('Некорректная сумма')
      return false
    }

    const paymentData: PaymentData = {
      type: 1, // Тип "пополнение"
      summ: amount,
      description: `Пополнение счета через ${method}`,
      date: new Date().toISOString()
    }

    return await makePayment(paymentData)
  }, [makePayment, toast])

  // Получение текущего баланса (для совместимости)
  const getBalance = useCallback(() => {
    loadBalance()
  }, [loadBalance])

  // Получение транзакций (для совместимости) 
  const getTransactions = useCallback(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    // Данные
    accountData,
    transactions,
    balance: accountData?.balance || 0,
    
    // Состояния загрузки
    isLoading,
    isSaving,
    isLoadingTransactions,
    loading: isLoading || isSaving || isLoadingTransactions,
    
    // Основные методы
    loadBalance,
    makePayment,
    loadTransactions,
    
    // Для совместимости со старым API
    topUpAccount,
    getBalance,
    getTransactions,
    
    // Вспомогательные свойства
    error: '' // Для совместимости, ошибки теперь через toast
  }
}
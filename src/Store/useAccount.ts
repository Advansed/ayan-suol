// src/Store/useAccount.ts

import { useCallback } from 'react'
import { 
  UniversalStore, 
  useStore, 
  TState
} from './Store'
import { useToast } from '../components/Toast'
import { loginGetters } from './loginStore'
import { useSocket } from './useSocket'
import { useSocketStore } from './socketStore'

// ============================================
// ТИПЫ
// ============================================

export interface Transaction {
    id: string
    date: string
    type: 'topup' | 'expense' | 'payment'
    amount: number
    description: string
    status: 'completed' | 'pending' | 'failed'
    orderId?: string
}

export interface PaymentData {
    type: number
    summ: number
    date?: string
    orderId?: string
    description?: string
}

export interface AccountData {
    balance: number
    currency: string
    lastUpdated?: string
}

export interface AccountState extends TState {
  accountData: AccountData | null
  transactions: Transaction[]
  isLoading: boolean
  isSaving: boolean
  isLoadingTransactions: boolean
}

// ============================================
// STORE
// ============================================

export const accountStore = new UniversalStore<AccountState>({
  initialState: {
    accountData: null,
    transactions: [],
    isLoading: false,
    isSaving: false,
    isLoadingTransactions: false
  },
  enableLogging: true
})

// ============================================
// HOOK
// ============================================

export const useAccount = () => {

    const token = loginGetters.getToken()
    
    const accountData               = useStore((state: AccountState) => state.accountData,              6001, accountStore)
    const transactions              = useStore((state: AccountState) => state.transactions,             6002, accountStore)
    const isLoading                 = useStore((state: AccountState) => state.isLoading,                6003, accountStore)
    const isSaving                  = useStore((state: AccountState) => state.isSaving,                 6004, accountStore)
    const isLoadingTransactions     = useStore((state: AccountState) => state.isLoadingTransactions,    6005, accountStore)
    const isConnected               = useSocketStore((state) => state.isConnected)

    const { once, emit }              = useSocket()
    
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

        accountStore.dispatch({ type: 'isLoading', data: true })

        once('get_balance', (response) => {
            accountStore.dispatch({ type: 'isLoading', data: false })
            
            if (response.success) {
                const accountData: AccountData = {
                    balance: response.data?.balance || 0,
                    currency: response.data?.currency || 'RUB',
                    lastUpdated: new Date().toISOString()
                }
                accountStore.dispatch({ type: 'accountData', data: accountData })
            } else {
                toast.error(response.message || 'Ошибка загрузки баланса')
            }
        })

        emit('get_balance', { token })
        
    }, [token, toast])

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

        accountStore.dispatch({ type: 'isSaving', data: true })

        return new Promise<boolean>((resolve) => {
            once('set_payment', (response) => {
                accountStore.dispatch({ type: 'isSaving', data: false })
                
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
                date:   paymentData.date || new Date().toISOString(),
                ...paymentData
            }

            emit('set_payment', payload)
            toast.info("Создание платежа...")
        })
        
    }, [token, toast, loadBalance ])

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

        accountStore.dispatch({ type: 'isLoadingTransactions', data: true })

        once('get_transactions', (response) => {
            accountStore.dispatch({ type: 'isLoadingTransactions', data: false })
            
            if (response.success) {
                const transactions: Transaction[] = (response.data || []).map((item: any) => ({
                    id: item.id || item.guid,
                    date: item.date,
                    type: item.type === 1 ? 'topup' : item.type === 2 ? 'expense' : 'payment',
                    amount: item.amount || item.summ,
                    description: item.description || item.message || '',
                    status: item.status === 1 ? 'completed' : item.status === 0 ? 'pending' : 'failed',
                    orderId: item.orderId
                }))
                
                accountStore.dispatch({ type: 'transactions', data: transactions })
            } else {
                toast.error(response.message || 'Ошибка загрузки истории операций')
            }
        })

        emit('get_transactions', { token })
        
    }, [token, toast])

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
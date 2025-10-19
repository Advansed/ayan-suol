// src/Store/accountStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const TRANSACTION_ICONS = {
  TOPUP:                  '💰',
  EXPENSE:                '📤', 
  PAYMENT:                '💳'
} as const

// src/components/Profile/components/Account/types.ts

export interface AccountData {
  balance: number
  currency: string
  lastUpdated?: string
}

export interface PaymentData {
  type: number
  summ: number
  date?: string
  orderId?: string
  description?: string
}

export interface AccountProps {
  onBack: () => void
}

export interface UseAccountReturn {
  balance: number | null
  transactions: Transaction[]
  loading: boolean
  error: string | null
  topUpAccount: (amount: number, method: string) => Promise<void>
  loadBalance: () => Promise<void>
  loadTransactions: () => Promise<void>
}

export type PaymentMethod = 'card' | 'sbp' | 'bank'
export type TransactionType = 'income' | 'expense'
export type TransactionStatus = 'completed' | 'pending' | 'failed'


// ============================================
// ТИПЫ
// ============================================

export interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense' | 'new'
  amount: number
  title: string
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

export interface AccountState {
  accountData: AccountData | null
  transactions: Transaction[]
  isLoading: boolean
  isSaving: boolean
  isLoadingTransactions: boolean
  error: string | null
}

interface AccountActions {
  setAccountData: (data: AccountData | null) => void
  setTransactions: (transactions: Transaction[]) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setLoadingTransactions: (loading: boolean) => void
  setError: (error: string | null) => void
  updateAccountData: (updates: Partial<AccountData>) => void
  addTransaction: (transaction: Transaction) => void
  clearError: () => void
  reset: () => void
}

type AccountStore = AccountState & AccountActions

// ============================================
// КОНСТАНТЫ
// ============================================

export const EMPTY_ACCOUNT: AccountData = {
  balance:        0,
  currency:       'RUB',
  lastUpdated:    ''
}

// ============================================
// ZUSTAND STORE
// ============================================

export const useAccountStore = create<AccountStore>()(
  devtools(
    (set) => ({
      // STATE
      accountData:            EMPTY_ACCOUNT,
      transactions:           [],
      isLoading:              false,
      isSaving:               false,
      isLoadingTransactions:  false,
      error:                  null,

      // ACTIONS
      setAccountData: (accountData) =>{ 
        console.log("set accountData", accountData)
        set({ accountData })
      },
      setTransactions: (transactions) => set({ transactions }),
      setLoading: (isLoading) => set({ isLoading }),
      setSaving: (isSaving) => set({ isSaving }),
      setLoadingTransactions: (isLoadingTransactions) => set({ isLoadingTransactions }),
      setError: (error) => set({ error }),
      
      updateAccountData: (updates) => 
        set((state) => ({ 
          accountData: state.accountData 
            ? { ...state.accountData, ...updates } 
            : { ...EMPTY_ACCOUNT, ...updates }
        })),
      
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions]
        })),
            
      clearError: () => set({ error: null }),
      
      reset: () => set({
        accountData: null,
        transactions: [],
        isLoading: false,
        isSaving: false,
        isLoadingTransactions: false,
        error: null
      })
    }),
    { name: 'account-store' }
  )
)

// ============================================
// СЕЛЕКТИВНЫЕ ХУКИ
// ============================================

export const useAccountData = () => useAccountStore(state => state.accountData)
export const useTransactions = () => useAccountStore(state => state.transactions)
export const setTransactions = () => useAccountStore(state => state.setTransactions)
export const useAccountLoading = () => useAccountStore(state => state.isLoading)
export const useAccountSaving = () => useAccountStore(state => state.isSaving)
export const useAccountLoadingTransactions = () => useAccountStore(state => state.isLoadingTransactions)
export const useAccountError = () => useAccountStore(state => state.error)

// ============================================
// GETTERS
// ============================================

export const accountGetters = {
  getAccountData: (): AccountData | null => useAccountStore.getState().accountData,
  getTransactions: (): Transaction[] => useAccountStore.getState().transactions,
  isLoading: (): boolean => useAccountStore.getState().isLoading,
  isSaving: (): boolean => useAccountStore.getState().isSaving,
  isLoadingTransactions: (): boolean => useAccountStore.getState().isLoadingTransactions,
  getError: (): string | null => useAccountStore.getState().error,
  getBalance: (): number => useAccountStore.getState().accountData?.balance || 0
}

// ============================================
// ACTIONS
// ============================================

export const accountActions = {
  setAccountData: (data: AccountData | null) => useAccountStore.getState().setAccountData(data),
  setTransactions: (transactions: Transaction[]) => useAccountStore.getState().setTransactions(transactions),
  setLoading: (loading: boolean) => useAccountStore.getState().setLoading(loading),
  setSaving: (saving: boolean) => useAccountStore.getState().setSaving(saving),
  setLoadingTransactions: (loading: boolean) => useAccountStore.getState().setLoadingTransactions(loading),
  setError: (error: string | null) => useAccountStore.getState().setError(error),
  updateAccountData: (updates: Partial<AccountData>) => useAccountStore.getState().updateAccountData(updates),
  addTransaction: (transaction: Transaction) => useAccountStore.getState().addTransaction(transaction),
  clearError: () => useAccountStore.getState().clearError(),
  reset: () => useAccountStore.getState().reset()
}

// ============================================
// SOCKET ОБРАБОТЧИКИ
// ============================================

export const accountSocketHandlers = {
  onGetBalance: (response: any) => {
    console.log('onGetBalance response:', response)
    
    accountActions.setLoading(false)
    
    if (response.success) {
      const accountData: AccountData = {
        balance: response.data?.balance || 0,
        currency: response.data?.currency || 'RUB',
        lastUpdated: new Date().toISOString()
      }
      accountActions.setAccountData(accountData)
    } else {
      console.error('Invalid balance response:', response)
      accountActions.setError(response.message || 'Failed to load balance')
    }
  },

  onGetTransactions: (response: any) => {
    console.log('onGetTransactions response:', response)
    
    accountActions.setLoadingTransactions(false)
    
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
      
      accountActions.setTransactions(transactions)
    } else {
      console.error('Invalid transactions response:', response)
      accountActions.setError(response.message || 'Failed to load transactions')
    }
  },

  onSetPayment: (response: any) => {
    console.log('onSetPayment response:', response)
    
    accountActions.setSaving(false)
    
    if (response.success) {
      // Обновляем баланс после успешного платежа
      if (response.data?.balance !== undefined) {
        accountActions.updateAccountData({ balance: response.data.balance })
      }
    } else {
      console.error('Invalid payment response:', response)
      accountActions.setError(response.message || 'Failed to process payment')
    }
  }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ SOCKET ОБРАБОТЧИКОВ
// ============================================

export const initAccountSocketHandlers = (socket: any) => {
  if (!socket) return

  socket.on("get_balance", accountSocketHandlers.onGetBalance )
    
}

export const destroyAccountSocketHandlers = (socket: any) => {
  if (!socket) return

  socket.off("get_balance", accountSocketHandlers.onGetBalance )
  
}
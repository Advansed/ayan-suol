// src/Store/companyStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================
// ТИПЫ
// ============================================
export interface CompanyData {
  guid?: string
  company_type?: number
  inn?: string
  kpp?: string
  ogrn?: string
  name?: string
  short_name?: string
  address?: string
  postal_address?: string
  phone?: string
  email?: string
  description?: string
  bank_name?: string
  bank_bik?: string
  bank_account?: string
  bank_corr_account?: string
  is_verified?: boolean
}

export interface CompanyState {
  data: CompanyData | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface CompanyActions {
  setData: (data: CompanyData | null) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setError: (error: string | null) => void
  updateData: (updates: Partial<CompanyData>) => void
  clearError: () => void
  reset: () => void
}

type CompanyStore = CompanyState & CompanyActions

// ============================================
// КОНСТАНТЫ
// ============================================
export const COMPANY_TYPES = {
  SELF_EMPLOYED: 1,
  IP: 2,
  OOO: 3
} as const

export const EMPTY_COMPANY: CompanyData = {
  guid: '',
  company_type: undefined,
  inn: '',
  kpp: '',
  ogrn: '',
  name: '',
  short_name: '',
  address: '',
  postal_address: '',
  phone: '',
  email: '',
  description: '',
  bank_name: '',
  bank_bik: '',
  bank_account: '',
  bank_corr_account: '',
  is_verified: false
}

// ============================================
// ZUSTAND STORE
// ============================================
export const useCompanyStore = create<CompanyStore>()(
  devtools(
    (set) => ({
      // STATE
      data: null,
      isLoading: false,
      isSaving: false,
      error: null,

      // ACTIONS
      setData: (data) => set({ data }),
      setLoading: (isLoading) => set({ isLoading }),
      setSaving: (isSaving) => set({ isSaving }),
      setError: (error) => set({ error }),
      
      updateData: (updates) => 
        set((state) => ({ 
          data: state.data ? { ...state.data, ...updates } : { ...EMPTY_COMPANY, ...updates }
        })),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        data: null,
        isLoading: false,
        isSaving: false,
        error: null
      })
    }),
    { name: 'company-store' }
  )
)

// ============================================
// СЕЛЕКТИВНЫЕ ХУКИ
// ============================================
export const useCompanyData = () => useCompanyStore(state => state.data)
export const useCompanyLoading = () => useCompanyStore(state => state.isLoading)
export const useCompanySaving = () => useCompanyStore(state => state.isSaving)
export const useCompanyError = () => useCompanyStore(state => state.error)

// ============================================
// GETTERS (совместимость)
// ============================================
export const companyGetters = {
  getData: (): CompanyData | null => useCompanyStore.getState().data,
  isLoading: (): boolean => useCompanyStore.getState().isLoading,
  isSaving: (): boolean => useCompanyStore.getState().isSaving,
  getError: (): string | null => useCompanyStore.getState().error,

  getCompletionPercentage: (): number => {
    const data = useCompanyStore.getState().data
    if (!data) return 0
    
    const requiredFields = ['company_type', 'inn', 'name', 'phone', 'email'] as const
    const optionalFields = ['kpp', 'ogrn', 'short_name', 'address', 'postal_address', 'description', 'bank_name', 'bank_bik', 'bank_account', 'bank_corr_account'] as const
    
    const totalFields = requiredFields.length + optionalFields.length
    let filledCount = 0
    
    // Обязательные поля
    requiredFields.forEach(field => {
      if (data[field]) filledCount++
    })
    
    // Опциональные поля  
    optionalFields.forEach(field => {
      if (data[field]) filledCount++
    })
    
    return Math.round((filledCount / totalFields) * 100)
  }
}

// ============================================
// ACTIONS (совместимость)
// ============================================
export const companyActions = {
  setData: (data: CompanyData | null) => useCompanyStore.getState().setData(data),
  setLoading: (loading: boolean) => useCompanyStore.getState().setLoading(loading),
  setSaving: (saving: boolean) => useCompanyStore.getState().setSaving(saving),
  setError: (error: string | null) => useCompanyStore.getState().setError(error),
  updateData: (updates: Partial<CompanyData>) => useCompanyStore.getState().updateData(updates),
  clearError: () => useCompanyStore.getState().clearError(),
  reset: () => useCompanyStore.getState().reset()
}

// ============================================
// SOCKET ОБРАБОТЧИКИ
// ============================================
export const companySocketHandlers = {
  onGetCompany: (response: any) => {
    console.log('onGetCompany response:', response)
    
    companyActions.setLoading(false)
    
    if (response.success) {
      companyActions.setData(response.data)
    } else {
      console.error('Invalid company response:', response)
      companyActions.setError(response.message || 'Failed to load company data')
    }
  },

  onSaveCompany: (response: any) => {
    console.log('onSaveCompany response:', response)
    
    companyActions.setSaving(false)
    
    if (response.success && response.data) {
      companyActions.setData(response.data)
    } else {
      companyActions.setError(response.message || 'Failed to save company data')
    }
  }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ SOCKET ОБРАБОТЧИКОВ
// ============================================
export const initCompanySocketHandlers = (socket: any) => {
  if (!socket) return
  
  socket.on('get_company', companySocketHandlers.onGetCompany)
  socket.on('set_company', companySocketHandlers.onSaveCompany)
  
  console.log('Company socket handlers initialized')
}

export const destroyCompanySocketHandlers = (socket: any) => {
  if (!socket) return
  
  socket.off('get_company', companySocketHandlers.onGetCompany)
  socket.off('set_company', companySocketHandlers.onSaveCompany)

  console.log('Company socket handlers destroyed')
}
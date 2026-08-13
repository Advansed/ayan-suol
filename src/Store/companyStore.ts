// src/Store/companyStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================
// ТИПЫ
// ============================================
export interface CompanyData {
  guid?: string
  inn?: string
  kpp?: string
  ogrn?: string
  name?: string
  short_name?: string
  address?: string
  postal_address?: string
  phone?: string
  basis?: string
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
  inn: '',
  kpp: '',
  ogrn: '',
  name: '',
  basis: '',
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

/** Поля JSON для p_set_company — только их отправляем в set_company */
export const SET_COMPANY_FIELDS = [
  'guid',
  'inn',
  'kpp',
  'ogrn',
  'name',
  'basis',
  'short_name',
  'address',
  'postal_address',
  'phone',
  'email',
  'description',
  'bank_name',
  'bank_bik',
  'bank_account',
  'bank_corr_account',
] as const

export type SetCompanyPayload = Pick<CompanyData, (typeof SET_COMPANY_FIELDS)[number]>

const SET_COMPANY_LIMITS: Record<(typeof SET_COMPANY_FIELDS)[number], number> = {
  guid: 36,
  inn: 12,
  kpp: 9,
  ogrn: 15,
  name: 500,
  basis: 256,
  short_name: 255,
  address: 500,
  postal_address: 500,
  phone: 20,
  email: 255,
  description: 1000,
  bank_name: 255,
  bank_bik: 9,
  bank_account: 20,
  bank_corr_account: 20,
}

export function toSetCompanyPayload(
  data: Partial<CompanyData>
): SetCompanyPayload & { is_verified?: boolean } {
  const payload: SetCompanyPayload & { is_verified?: boolean } = {}
  for (const key of SET_COMPANY_FIELDS) {
    const raw = data[key]
    if (raw == null) continue
    const value = String(raw).trim()
    if (!value) continue
    payload[key] = value.slice(0, SET_COMPANY_LIMITS[key])
  }
  if (typeof data.is_verified === 'boolean') {
    payload.is_verified = data.is_verified
  }
  return payload
}

export function companyFromPartySuggestion(suggestion: {
  value?: string
  data?: {
    inn?: string
    kpp?: string
    ogrn?: string
    name?: { short_with_opf?: string; full_with_opf?: string }
    address?: { value?: string }
  }
}): Partial<CompanyData> {
  return {
    inn: suggestion.data?.inn,
    name: suggestion.value || suggestion.data?.name?.full_with_opf,
    short_name: suggestion.data?.name?.short_with_opf,
    kpp: suggestion.data?.kpp,
    ogrn: suggestion.data?.ogrn,
    address: suggestion.data?.address?.value,
  }
}

export function buildOrganizationSave(params: {
  company?: CompanyData | null
  party?: { value?: string; data?: any } | null
  innOrName?: string
  basis?: string
  description?: string
  bank_bik?: string
  bank_name?: string
  bank_account?: string
  bank_corr_account?: string
}): SetCompanyPayload {
  const company = params.company
  const party = params.party?.data
    ? companyFromPartySuggestion(params.party)
    : {}
  const innOrName = (params.innOrName || '').trim()
  const isInn = /^\d{10,12}$/.test(innOrName)

  return toSetCompanyPayload({
    guid: company?.guid,
    inn: party.inn || (isInn ? innOrName : company?.inn),
    name: party.name || (!isInn && innOrName ? innOrName : company?.name),
    short_name: party.short_name || company?.short_name,
    kpp: party.kpp || company?.kpp,
    ogrn: party.ogrn || company?.ogrn,
    address: party.address || company?.address,
    postal_address: company?.postal_address,
    phone: company?.phone,
    email: company?.email,
    basis: params.basis || company?.basis,
    description: params.description || company?.description,
    bank_bik: params.bank_bik || company?.bank_bik,
    bank_name: params.bank_name || company?.bank_name,
    bank_account: params.bank_account || company?.bank_account,
    bank_corr_account: params.bank_corr_account || company?.bank_corr_account,
  })
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
    
    const requiredFields = [ 'inn', 'name', 'bank_bik', 'bank_account'] as const
    const optionalFields = ['kpp', 'ogrn', 'short_name', 'address', 'postal_address', 'description', 'bank_name', 'bank_bik', 'bank_account', 'bank_corr_account'] as const
    
    const totalFields = requiredFields.length
    let filledCount = 0
    // Обязательные поля
    requiredFields.forEach(field => {
      if (data[field]) filledCount++
    })
    
    
    return Math.round((filledCount / totalFields) * 100)
  }
}

// ============================================
// ACTIONS (совместимость)
// ============================================
export const companyActions = {
  setData:      (data: CompanyData | null) => useCompanyStore.getState().setData(data),
  setLoading:   (loading: boolean) => useCompanyStore.getState().setLoading(loading),
  setSaving:    (saving: boolean) => useCompanyStore.getState().setSaving(saving),
  setError:     (error: string | null) => useCompanyStore.getState().setError(error),
  updateData:   (updates: Partial<CompanyData>) => useCompanyStore.getState().updateData(updates),
  clearError:   () => useCompanyStore.getState().clearError(),
  reset:        () => useCompanyStore.getState().reset()
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
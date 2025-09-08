import { UniversalStore, TState } from './Store';

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
    files?: Array<{
        file_guid: string
        file_type: string
        file_name: string
        file_path: string
    }>
}

export interface CompanyState extends TState {
  data: CompanyData | null
  isLoading: boolean
  isSaving: boolean
}

// ============================================
// STORE
// ============================================
export const companyStore = new UniversalStore<CompanyState>({
  initialState: {
    data:               null,
    isLoading:          false,
    isSaving:           false,
    error:              null
  },
  enableLogging:        false
});

// ============================================
// КОНСТАНТЫ
// ============================================
export const COMPANY_TYPES = {
  SELF_EMPLOYED: 1,
  IP: 2,
  OOO: 3
} as const;
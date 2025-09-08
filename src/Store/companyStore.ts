import { UniversalStore, TState } from './Store';

// ============================================
// ТИПЫ
// ============================================
export interface CompanyData {
    guid?:              string
    company_type?:      number
    inn?:               string
    kpp?:               string
    ogrn?:              string
    name?:              string
    short_name?:        string
    address?:           string
    postal_address?:    string
    phone?:             string
    email?:             string
    description?:       string
    bank_name?:         string
    bank_bik?:          string
    bank_account?:      string
    bank_corr_account?: string
    is_verified?:       boolean
}

export interface CompanyState extends TState {
  data:                 CompanyData | null
  isLoading:            boolean
  isSaving:             boolean
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

export const companyGetters = {



}

// Добавить в src/Store/companyStore.ts

export const companySocketHandlers = {
    
    onGetCompany: (response: any) => {

        console.log('onGetCompany response:', response)

        companyStore.dispatch({ type: 'isLoading', data: false })
        
        if (response.success) {

            companyStore.dispatch({ type: 'data', data: response.data })

        } else {

            console.error('Invalid company response:', response)

        }
    },

    onSaveCompany: (response: any) => {
      
        console.log('onSaveCompany response:', response)
        
        if (response.success && response.data) {

            companyStore.dispatch({ type: 'data', data: response.data })

        }
    },

}

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
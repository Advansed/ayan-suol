import { UniversalStore, TState } from './Store';

// ============================================
// ТИПЫ
// ============================================
export interface PassportAddress {
    address:            string;
    fias:               string;
    lat:                number;
    lon:                number;
}

export interface PassportData {
  series?:              string
  number?:              string
  issue_date?:          string
  issued_by?:           string
  birth_date?:          string
  birth_place?:         string
  reg_address?:         PassportAddress
  act_address?:         PassportAddress
  main_photo?:          string
  reg_photo?:           string
  isVerified?:          boolean
  createdDate?:         string
  updatedDate?:         string
}

export interface PassportState extends TState {
  data:                 PassportData | null
  isLoading:            boolean
  isSaving:             boolean
}

// ============================================
// STORE
// ============================================
export const passportStore = new UniversalStore<PassportState>({
  initialState: {
    data:               null,
    isLoading:          false,
    isSaving:           false,
    error:              null
  },
  enableLogging:        false
});

// ============================================
// GETTERS
// ============================================

export const passportGetters = {
  getData: (): PassportData | null => {
    return passportStore.getState().data
  },

  isLoading: (): boolean => {
    return passportStore.getState().isLoading
  },

  isSaving: (): boolean => {
    return passportStore.getState().isSaving
  },

  isVerified: (): boolean => {
    const data = passportStore.getState().data
    return data?.isVerified || false
  }
}

// ============================================
// ACTIONS
// ============================================

export const passportActions = {
  setData: (data: PassportData | null) => {
    passportStore.dispatch({ type: 'data', data })
  },

  setLoading: (loading: boolean) => {
    passportStore.dispatch({ type: 'isLoading', data: loading })
  },

  setSaving: (saving: boolean) => {
    passportStore.dispatch({ type: 'isSaving', data: saving })
  },

  updateData: (updates: Partial<PassportData>) => {
    const currentData = passportStore.getState().data
    const newData = currentData ? { ...currentData, ...updates } : updates
    passportStore.dispatch({ type: 'data', data: newData })
  },

  clearData: () => {
    passportStore.dispatch({ type: 'data', data: null })
  },

  setError: (error: string | null) => {
    passportStore.dispatch({ type: 'error', data: error })
  }
};

export const passportSocketHandlers = {
    
    onPassportCargos:   (response: any) => {
        console.log('onGetPassport response:', response)
        passportStore.dispatch({ type: 'isLoading', data: false })
        
        if (response.success) {
            passportStore.dispatch({ type: 'data', data: response.data })
        } else {
            console.error('Invalid passport response:', response)
        }
    },

    onSavePassport:     (response: any) => {
        console.log('onSavePassport response:', response)
        
        if (response.success && response.data) {
            
            const current = passportStore.getState().data
            
            passportStore.dispatch({ type: 'data', data: current })

        }
    },

}

export const initPassportSocketHandlers = (socket: any) => {
    if (!socket) return
    
    // Подписываемся на события
    socket.on('get_passport', passportSocketHandlers.onPassportCargos)
    
    console.log('Cargo socket handlers initialized')
}

export const destroyPassportSocketHandlers = (socket: any) => {
    if (!socket) return
    
    // Отписываемся от событий
    socket.off('get_passport', passportSocketHandlers.onPassportCargos)

    console.log('Cargo socket handlers destroyed')

}


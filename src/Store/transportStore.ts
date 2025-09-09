// src/Store/transportStore.ts

import { UniversalStore, TState } from './Store';

// ============================================
// ТИПЫ
// ============================================
export interface TransportData {
  guid?:                string
  name?:                string
  license_plate?:       string
  vin?:                 string
  manufacture_year?:    number
  image?:               string
  transport_type?:      string
  experience?:          number
  load_capacity?:       number
  // Альтернативные поля для совместимости
  type?:                string
  capacity?:            number
  year?:                number
  number?:              string
  exp?:                 number
}

export interface TransportState extends TState {
  data:                 TransportData | null
  isLoading:            boolean
  isSaving:             boolean
}

// ============================================
// STORE
// ============================================
export const transportStore = new UniversalStore<TransportState>({
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

export const transportGetters = {
  
    getData: (): TransportData | null => {
    return transportStore.getState().data
  },

  isLoading: (): boolean => {
    return transportStore.getState().isLoading
  },

  isSaving: (): boolean => {
    return transportStore.getState().isSaving
  },

  getCompletionPercentage: (data: TransportData | null): number => {
    if (!data) return 0
    
    const requiredFields = ['name', 'license_plate', 'transport_type']
    const optionalFields = ['vin', 'manufacture_year', 'image', 'experience', 'load_capacity']
    
    const totalFields = requiredFields.length + optionalFields.length
    let filledCount = 0
    
    // Обязательные поля
    requiredFields.forEach(field => {
      if (data[field as keyof TransportData]) filledCount++
    })
    
    // Опциональные поля  
    optionalFields.forEach(field => {
      if (data[field as keyof TransportData]) filledCount++
    })
    
    return Math.round((filledCount / totalFields) * 100)
  }

}

// ============================================
// SOCKET HANDLERS
// ============================================

export const transportSocketHandlers = {
    
  onGetTransport: (response: any) => {
    console.log('onGetTransport response:', response)
    transportStore.dispatch({ type: 'isLoading', data: false })
    
    if (response.success) {
      const data = Array.isArray(response.data) ? response.data[0] : response.data
      transportStore.dispatch({ type: 'data', data })
    } else {
      console.error('Invalid transport response:', response)
    }
  },

  onSaveTransport: (response: any) => {
    console.log('onSaveTransport response:', response)
    
    transportStore.dispatch({ type: 'isSaving', data: false })
    
    if (response.success && response.data) {
      transportStore.dispatch({ type: 'data', data: response.data })
    }
  }
  
}

export const initTransportSocketHandlers = (socket: any) => {
  
  if (!socket) return
  
  socket.on('get_transport', transportSocketHandlers.onGetTransport)
  socket.on('set_transport', transportSocketHandlers.onSaveTransport)
  
  console.log('Transport socket handlers initialized')

}

export const destroyTransportSocketHandlers = (socket: any) => {
  
  if (!socket) return
  
  socket.off('get_transport', transportSocketHandlers.onGetTransport)
  socket.off('set_transport', transportSocketHandlers.onSaveTransport)

  console.log('Transport socket handlers destroyed')

}
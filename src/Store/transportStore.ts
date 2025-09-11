// src/Store/transportStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================
// ТИПЫ
// ============================================
export interface TransportData {
  guid?: string
  name?: string
  license_plate?: string
  vin?: string
  manufacture_year?: number
  image?: string
  transport_type?: string
  experience?: number
  load_capacity?: number
  // Альтернативные поля для совместимости
  type?: string
  capacity?: number
  year?: number
  number?: string
  exp?: number
}

export interface TransportState {
  data: TransportData | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface TransportActions {
  setData: (data: TransportData | null) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setError: (error: string | null) => void
  updateData: (updates: Partial<TransportData>) => void
  clearError: () => void
  reset: () => void
}

type TransportStore = TransportState & TransportActions

// ============================================
// ZUSTAND STORE
// ============================================
export const useTransportData = () => useTransportStore(state => state.data)

export const useTransportStore = create<TransportStore>()(
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
          data: state.data ? { ...state.data, ...updates } : updates
        })),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        data: null,
        isLoading: false,
        isSaving: false,
        error: null
      })
    }),
    { name: 'transport-store' }
  )
)

// ============================================
// GETTERS
// ============================================
export const transportGetters = {
  getData: (): TransportData | null => useTransportStore.getState().data,
  isLoading: (): boolean => useTransportStore.getState().isLoading,
  isSaving: (): boolean => useTransportStore.getState().isSaving,
  getError: (): string | null => useTransportStore.getState().error,

  getCompletionPercentage: (): number => {
    const data = useTransportStore.getState().data
    if (!data) return 0
    
    const requiredFields = ['name', 'license_plate', 'transport_type'] as const
    const optionalFields = ['vin', 'manufacture_year', 'image', 'experience', 'load_capacity'] as const
    
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
// ACTIONS
// ============================================
export const transportActions = {
  setData: (data: TransportData | null) => useTransportStore.getState().setData(data),
  setLoading: (loading: boolean) => useTransportStore.getState().setLoading(loading),
  setSaving: (saving: boolean) => useTransportStore.getState().setSaving(saving),
  setError: (error: string | null) => useTransportStore.getState().setError(error),
  updateData: (updates: Partial<TransportData>) => useTransportStore.getState().updateData(updates),
  clearError: () => useTransportStore.getState().clearError(),
  reset: () => useTransportStore.getState().reset()
}

// ============================================
// SOCKET HANDLERS
// ============================================
export const transportSocketHandlers = {
  onGetTransport: (response: any) => {
    console.log('onGetTransport response:', response)
    
    transportActions.setLoading(false)
    
    if (response.success) {
      const data = Array.isArray(response.data) ? response.data[0] : response.data
      transportActions.setData(data)
    } else {
      console.error('Invalid transport response:', response)
      transportActions.setError(response.message || 'Failed to load transport data')
    }
  },

  onSaveTransport: (response: any) => {
    console.log('onSaveTransport response:', response)
    
    transportActions.setSaving(false)
    
    if (response.success && response.data) {
      transportActions.setData(response.data)
    } else {
      transportActions.setError(response.message || 'Failed to save transport data')
    }
  }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ SOCKET ОБРАБОТЧИКОВ
// ============================================
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
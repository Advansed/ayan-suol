// src/Store/socketStore.ts

import { UniversalStore, TState } from './Store'

// ============================================
// ТИПЫ
// ============================================

export interface SocketState extends TState {
  isConnected: boolean
  isConnecting: boolean
}

// ============================================
// STORE
// ============================================

export const socketStore = new UniversalStore<SocketState>({
  initialState: { 
    isConnected: false,
    isConnecting: false
  },
  enableLogging: true
})

// ============================================
// GETTERS
// ============================================

export const socketGetters = {

    isConnected: () => socketStore.getState().isConnected,

    isConnecting: () => socketStore.getState().isConnecting

}

// ============================================
// ACTIONS
// ============================================

export const socketActions = {

  setConnected: (connected: boolean) => {
    console.log("socketStore connect:", connected)
    socketStore.dispatch({ type: 'isConnected', data: connected })
  },
    
    
  setConnecting: (connecting: boolean) => {
    console.log("socketStore connecting:", connecting)
    socketStore.dispatch({ type: 'isConnecting', data: connecting })
  },
    
    
  updateStatus: (isConnected: boolean, isConnecting: boolean) => {
    console.log("socketStore {isConnected, isConnecting}:", isConnected, isConnecting)
    socketStore.dispatch({ type: 'isConnected', data: isConnected })
    socketStore.dispatch({ type: 'isConnecting', data: isConnecting })
  }
  
}

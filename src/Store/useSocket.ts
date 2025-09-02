// src/Store/useSocket.ts

import { useEffect, useCallback } from 'react'
import { 
  UniversalStore, 
  useStore, 
  TState
} from './Store'
import socketService from '../components/Sockets'

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
// HOOK
// ============================================

export function useSocket() {
  const isConnected = useStore((state: SocketState) => state.isConnected, 2001, socketStore)
  const isConnecting = useStore((state: SocketState) => state.isConnecting, 2002, socketStore)

  // Отслеживание состояния подключения
  useEffect(() => {
    const socket = socketService.getSocket()
    if (!socket) {
      // Проверяем начальное состояние
      socketStore.dispatch({ type: 'isConnected', data: socketService.isSocketConnected() })
      return
    }

    const handleConnect = () => {
      console.log("connected")
      socketStore.batchUpdate({
        isConnected: true,
        isConnecting: false
      })
    }

    const handleDisconnect = () => {
      socketStore.batchUpdate({
        isConnected: false,
        isConnecting: false
      })
    }

    const handleConnecting = () => {
      socketStore.dispatch({ type: 'isConnecting', data: true })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connecting', handleConnecting)

    // Установка начального состояния
    socketStore.dispatch({ type: 'isConnected', data: socketService.isSocketConnected() })

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connecting', handleConnecting)
    }
  }, [])

  const connect = useCallback(async (token: string) => {
    try {
      socketStore.dispatch({ type: 'isConnecting', data: true })
      console.log("connecting...")
      
      const success = await socketService.connect(token)
      
      socketStore.batchUpdate({
        isConnected: success && socketService.isSocketConnected(),
        isConnecting: false
      })
      
      return success
    } catch (error) {
      console.error('Socket connection failed:', error)
      socketStore.batchUpdate({
        isConnected: false,
        isConnecting: false
      })
      return false
    }
  }, [])

  const disconnect = useCallback(() => {
    socketService.disconnect()
    socketStore.batchUpdate({
      isConnected: false,
      isConnecting: false
    })
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    return socketService.emit(event, data)
  }, [])

  const on = useCallback((event: string, callback: Function) => {
    const socket = socketService.getSocket()
    if (socket) {
      socket.on(event, callback as any)
    }
    
    // Возвращаем функцию для отписки
    return () => {
      const currentSocket = socketService.getSocket()
      if (currentSocket) {
        currentSocket.off(event, callback as any)
      }
    }
  }, [])

  const off = useCallback((event: string, callback?: any) => {
    const socket = socketService.getSocket()
    if(callback) socket?.off(event, callback)
    else socket?.off(event)
  }, [])

  const once = useCallback((event: string, callback?: any) => {
    const socket = socketService.getSocket()
    if(callback)
      socket?.once(event, callback)
  }, [])

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    emit,
    on,
    off,
    once
  }
}

// ============================================
// УТИЛИТЫ
// ============================================

export const isSocketConnected = () => socketStore.getState().isConnected
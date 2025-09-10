// src/Store/useSocket.ts

import { useEffect, useCallback } from 'react'
import { socketStore, socketActions } from './socketStore'
import socketService from '../services/socketService'

// ============================================
// HOOK
// ============================================

export function useSocket() {
  // const isConnected   = useStore((state: SocketState) => state.isConnected, 2001, socketStore)
  // const isConnecting  = useStore((state: SocketState) => state.isConnecting, 2002, socketStore)
  // Отслеживание состояния подключения


  const connect     = useCallback(async (token: string) => {
    try {
      socketActions.setConnecting(true)
      
      console.log("connecting...")
      
      const success = await socketService.connect(token)
      
      socketActions.updateStatus(
        success && socketService.isSocketConnected(),
        false
      )
      
      return success
    } catch (error) {
      console.error('Socket connection failed:', error)
      socketActions.updateStatus(false, false)
      return false
    }
  }, [])

  const disconnect  = useCallback(() => {
    socketService.disconnect()
    socketActions.updateStatus(false, false)
  }, [])

  const emit        = useCallback((event: string, data?: any) => {
    return socketService.emit(event, data)
  }, [])

  const on          = useCallback((event: string, callback: Function) => {
    const socket = socketService.getSocket()
    if (socket) {
      socket.on(event, callback as any)
    }
    
    return () => {
      const currentSocket = socketService.getSocket()
      if (currentSocket) {
        currentSocket.off(event, callback as any)
      }
    }
  }, [])

  const off         = useCallback((event: string, callback?: any) => {
    const socket = socketService.getSocket()
    if(callback) socket?.off(event, callback)
    else socket?.off(event)
  }, [])

  const once        = useCallback((event: string, callback?: any) => {
    const socket = socketService.getSocket()
    if(callback) socket?.once(event, callback)
  }, [])

  const socket      = socketService.getSocket()

  return {
    socket,
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
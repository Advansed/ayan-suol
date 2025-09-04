// src/Store/useSocketManager.ts

import { useEffect, useRef } from 'react'
import socketService from '../components/Sockets'
import { useSocket } from '../Store/useSocket'
import { destroySocketHandlers, initSocketHandlers } from '../Store/Store'

// ============================================
// SOCKET MANAGER HOOK
// ============================================

export const useSocketManager = () => {
  const { isConnected } = useSocket()
  const isInitialized = useRef(false)

  useEffect(() => {
    const socket = socketService.getSocket()
    
    if (isConnected && socket && !isInitialized.current) {
      // Подключились - инициализируем handlers
      initSocketHandlers(socket)
      isInitialized.current = true
      console.log('Socket handlers initialized')
      
    } else if (!isConnected && isInitialized.current) {
      // Отключились - очищаем handlers
      if (socket) {
        destroySocketHandlers(socket)
      }
      isInitialized.current = false
      console.log('Socket handlers destroyed')
    }
    
  }, [isConnected])

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      const socket = socketService.getSocket()
      if (socket && isInitialized.current) {
        destroySocketHandlers(socket)
        isInitialized.current = false
      }
    }
  }, [])
}
// src/Store/useSocketManager.ts

import { useEffect, useRef } from 'react'
import { useSocket } from '../Store/useSocket'
import { destroyCargoSocketHandlers, initCargoSocketHandlers } from '../Store/cargoStore'
import { destroyPassportSocketHandlers, initPassportSocketHandlers } from '../Store/passportStore'
import { destroyCompanySocketHandlers, initCompanySocketHandlers } from '../Store/companyStore'
import { destroyTransportSocketHandlers, initTransportSocketHandlers } from '../Store/transportStore'
import { destroyWorkSocketHandlers, initWorkSocketHandlers } from '../Store/workStore'
import { useSocketStore } from '../Store/socketStore'
import { destroyChatSocketHandlers, initChatSocketHandlers } from '../Store/chatStore'

// ============================================
// SOCKET MANAGER HOOK
// ============================================

export const useSocketManager = () => {
  const isInitialized = useRef(false)
  const isConnected   = useSocketStore((state) => state.isConnected)
  const { socket }    = useSocket()

  useEffect(() => {
    
    if (isConnected && !isInitialized.current) {
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
    
  }, [ isConnected ] )

  // Cleanup при размонтировании
  useEffect(() => {

    return () => {
      if (socket && isInitialized.current) {
        destroySocketHandlers( socket )
        isInitialized.current = false
      }
    }
  }, [])
}


export function initSocketHandlers( socket: any) {

    initCargoSocketHandlers( socket )

    initPassportSocketHandlers( socket )

    initCompanySocketHandlers( socket )

    initTransportSocketHandlers( socket )

    initWorkSocketHandlers( socket )

    initChatSocketHandlers( socket )
    
  
}

export function destroySocketHandlers( socket: any) {

    destroyCargoSocketHandlers( socket )

    destroyPassportSocketHandlers( socket )

    destroyCompanySocketHandlers( socket )

    destroyTransportSocketHandlers( socket )
    
    destroyWorkSocketHandlers( socket )

    destroyChatSocketHandlers( socket )

}
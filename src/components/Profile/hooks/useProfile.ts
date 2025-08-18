// src/components/Profile/hooks/useProfile.ts
import { useEffect, useState, useRef } from 'react'
import { Store } from '../../Store'
import { User } from '../types'
import socketService from '../../Sockets'

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const subscriptionRef = useRef<number>()

  useEffect(() => {
    // Получаем начальные данные
    const loginData = Store.getState().login
    if( loginData ) {
      setUser( loginData )
      setIsLoading( false )
    }

    // Подписка на изменения
    const id = Date.now()
    subscriptionRef.current = id
    
    Store.subscribe({
      num: id,
      type: 'login',
      func: () => {
        const data = Store.getState().login
        setUser(data)
        setIsLoading(false)
      }
    })

    // Socket обработчик set_driver
    const socket = socketService.getSocket()
    if (socket) {
      socket.on('set_driver', (res) => {
        console.log("on... set_driver", res.data)

        // Получаем актуальные данные напрямую из Store
        const currentUser = Store.getState().login
        if (currentUser) {
          console.log("user", currentUser)
          const updatedUser = { ...currentUser, driver: res.data }
          setUser(updatedUser)
          Store.dispatch({ type: 'login', data: updatedUser })
        }
        Store.dispatch({ type: 'swap', data: res.data })
      })
    }

    return () => {
      if (subscriptionRef.current) {
        Store.unSubscribe(subscriptionRef.current)
      }
      if (socket) {
        socket.off('set_driver')
      }
    }
    
  }, []) // Убираем user из зависимостей

  const userType = user?.user_type || 1

  return { user, isLoading, userType }
}
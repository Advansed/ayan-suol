// src/components/Profile/hooks/useProfile.ts
import { useEffect, useState, useRef } from 'react'
import { Store } from '../../Store'
import { User } from '../types'
import socketService from '../../Sockets'

interface CompletionData {
  passport: number
  company: number
  transport: number
}

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completion, setCompletion] = useState<CompletionData>({
    passport: 0,
    company: 0,
    transport: 0
  })
  const subscriptionRef = useRef<number>()

  // Функция получения процентов через сокет
  const fetchCompletion = () => {
    const socket = socketService.getSocket()
    if (socket) {
      console.log('emit... get_percent')
      socket.emit('get_percent', { token: Store.getState().login.token })
    }
  }

  useEffect(() => {
    // Получаем начальные данные
    console.log("use effect")
    const loginData = Store.getState().login
    if( loginData ) {
      setUser( loginData )
      setIsLoading( false )
      // Получаем проценты после загрузки пользователя
      fetchCompletion()
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
        // Обновляем проценты при изменении пользователя
        if (data) fetchCompletion()
      }
    })

    // Socket обработчики
    const socket = socketService.getSocket()
    if (socket) {
      // Обработчик ответа get_percent
      socket.on('get_percent', (res) => {
        console.log("on... get_percent", res)
        if (res.success && res.data) {
          setCompletion(res.data)
        }
      })

      // Существующий обработчик set_driver
      socket.on('set_driver', (res) => {
        console.log("on... set_driver", res.data)
        
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
        socket.off('get_percent')
      }
    }
  }, [])

  const userType = user?.user_type || 1

  return { 
    user, 
    isLoading, 
    userType, 
    completion,
    refetchCompletion: fetchCompletion 
  }
}
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
      socket.on('set_driver', (data: boolean) => {
        console.log("on... set_driver", data)

        if (user) {
          const updatedUser = { ...user, driver: data }
          setUser(updatedUser)
          Store.dispatch({ type: 'login', data: updatedUser })
        }
        Store.dispatch({ type: 'swap', data })
      })
    }

    return () => {
      if (subscriptionRef.current) {
        Store.unSubscribe(subscriptionRef.current)
      }
      // Отписка от socket события
      if (socket) {
        socket.off('set_driver')
      }
    }
  }, [])

  const isDriver = user?.driver || false
  console.log('user.driver', user?.driver)
  console.log('isDriver', isDriver)

  return { user, isLoading, isDriver }
}
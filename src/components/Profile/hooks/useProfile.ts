import { useEffect, useState, useRef } from 'react'
import { Store } from '../../Store'
import { User } from '../types'

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const subscriptionRef = useRef<number>()

  useEffect(() => {
    // Получаем начальные данные
    const loginData = Store.getState().login
    console.log("useeffect")
    console.log( loginData )
    if( loginData ) {
      setUser( loginData )
      setIsLoading( false )
      console.log("загружен", loginData )
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

    return () => {
      if (subscriptionRef.current) {
        Store.unSubscribe(subscriptionRef.current)
      }
    }
  }, [])

  const isDriver = Store.getState().swap || user?.driver || false

  return { user, isLoading, isDriver }
}
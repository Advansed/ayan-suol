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
    if (loginData) {
      setUser(loginData)
      setIsLoading(false)
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
      }
    })

    return () => {
      if (subscriptionRef.current) {
        Store.unSubscribe(subscriptionRef.current)
      }
    }
  }, [])

  const isDriver = Store.getState().swap

  return { user, isLoading, isDriver }
}
// src/Store/useLogin.ts
import { useCallback } from 'react'
import { useSocket } from './useSocket'
import { useToast } from '../components/Toast'
import { AuthResponse, useLoginStore, UserData } from './loginStore'
import { useSocketStore } from './socketStore'

// ============================================
// УТИЛИТЫ
// ============================================

export function Phone(phone: string): string {
  if (!phone) return ''
  let str = '+'
  for (let i = 0; i < phone.length; i++) {
    const ch = phone.charCodeAt(i)
    if (ch >= 48 && ch <= 57) str = str + phone.charAt(i)
  }
  return str
}

// ============================================
// HOOK
// ============================================

export function useLogin() {
  // State subscriptions
  const {
    auth, id, name, phone, email, image, token, user_type,
    description, account, ratings, notifications, isLoading,
    setAuth, setLoading, setUser, updateUser, clearAuth
  } = useLoginStore()
  

  // Services
  const { isConnected, emit, once } = useSocket()
  const toast = useToast()

  // User object
  const user = {
    id, name, phone, email, image, token, 
    user_type, description, account, ratings, notifications
  }

  // ============================================
  // ACTIONS
  // ============================================

  const login = useCallback(async (phoneNumber: string, password: string): Promise<boolean> => {
    console.log("login")
    if (!isConnected) {
      toast.error('Нет подключения к серверу')
      return false
    }

    setLoading(true)
    setAuth(false)

    try {
      return await new Promise<boolean>((resolve) => {

        const handleAuthResponse = (response: { success: boolean; data?: AuthResponse; message?: string }) => {
          console.log("handle once login...", response)
          setLoading(false)
          
          if (response.success && response.data) {
            setUser(response.data)
            toast.success('Вход выполнен успешно')
            resolve(true)
          } else {
            toast.error(response.message || 'Ошибка входа')
            resolve(false)
          }
        }

        once('authorization', handleAuthResponse)
        emit('authorization', { phone: Phone(phoneNumber), password })
      })
    } catch (error) {
      setLoading(false)
      toast.error('Произошла ошибка при входе')
      return false
    }
  }, [isConnected, setLoading, setAuth, setUser, toast, emit, once])

  const logout = useCallback(() => {
    clearAuth()
    toast.success('Выход выполнен')
  }, [clearAuth, toast])

  const updateProfile = useCallback((updates: Partial<UserData>) => {
    updateUser(updates)
  }, [updateUser])

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    auth,
    user,
    isLoading,
    
    // Actions
    login,
    logout,
    updateProfile
  }
}
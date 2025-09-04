import { useCallback } from 'react'
import { useStore } from './Store'
import { useSocket } from './useSocket'
import { useToast } from '../components/Toast'
import { loginStore, loginActions, LoginState } from './loginStore'
import { AuthResponse, UpdateUserData, UserNotifications } from './types/auth'

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
  const auth          = useStore((state: LoginState) => state.auth, 1001, loginStore)
  const id            = useStore((state: LoginState) => state.id, 1002, loginStore)
  const name          = useStore((state: LoginState) => state.name, 1003, loginStore)
  const phone         = useStore((state: LoginState) => state.phone, 1004, loginStore)
  const email         = useStore((state: LoginState) => state.email, 1005, loginStore)
  const image         = useStore((state: LoginState) => state.image, 1006, loginStore)
  const token         = useStore((state: LoginState) => state.token, 1007, loginStore)
  const user_type     = useStore((state: LoginState) => state.user_type, 1008, loginStore)
  const description   = useStore((state: LoginState) => state.description, 1009, loginStore)
  const account       = useStore((state: LoginState) => state.account, 1010, loginStore)
  const ratings       = useStore((state: LoginState) => state.ratings, 1011, loginStore)
  const notifications = useStore((state: LoginState) => state.notifications, 1012, loginStore)
  const isLoading     = useStore((state: LoginState) => state.isLoading, 1013, loginStore)

  // Services
  const { emit, once, isConnected } = useSocket()
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
    if (!isConnected) {
      toast.error('Нет подключения к серверу')
      return false
    }

    loginActions.setLoading(true)
    loginActions.setAuth(false)

    try {
      return await new Promise<boolean>((resolve) => {
        const handleAuthResponse = (response: { success: boolean; data?: AuthResponse; message?: string }) => {
          if (response.success && response.data) {
            loginActions.setUser(response.data)
            toast.success(`Добро пожаловать, ${response.data.name}!`)
            resolve(true)
          } else {
            loginActions.setLoading(false)
            loginActions.setAuth(false)
            toast.error(response.message || 'Неверные данные для входа')
            resolve(false)
          }
        }

        once('authorization', handleAuthResponse)
        emit('authorization', { login: Phone(phoneNumber), password })
      })
    } catch (error: any) {
      loginActions.setLoading(false)
      loginActions.setAuth(false)
      toast.error('Ошибка подключения к серверу')
      return false
    }
  }, [toast, isConnected, emit, once])

  const logout = useCallback(() => {
    loginActions.clearAuth()
    toast.info("Выход из системы")
  }, [toast])

  const updateUser = useCallback(async (userData: UpdateUserData): Promise<boolean> => {
    loginActions.setLoading(true)
    
    try {
      return await new Promise<boolean>((resolve) => {
        once('set_user', (data: { success: boolean; message?: string }) => {
          if (data.success) {
            loginActions.updateUser(userData)
            toast.success(data.message || 'Данные обновлены')
            resolve(true)
          } else {
            toast.error(data.message || 'Ошибка обновления')
            resolve(false)
          }
          loginActions.setLoading(false)
        })
        
        emit('set_user', { token, ...userData })
      })
    } catch (error) {
      loginActions.setLoading(false)
      toast.error('Ошибка обновления данных')
      return false
    }
  }, [token, emit, once, toast])

  const toggleNotification = useCallback((key: keyof UserNotifications) => {
    console.log("toggle", key)
    if (!notifications || isLoading) return
    
    const newValue = !notifications[key]
    
    // Обновляем локальное состояние через actions
    loginActions.updateUser({
      notifications: { ...notifications, [key]: newValue }
    })
    
    // Отправляем на сервер
    if (token) {
      console.log("emit..", token)
      
      // Обработчик ответа от сервера
      once('set_agreement', (response: { success: boolean; message?: string }) => {
        if (response.success) {
          toast.info("Соглашение сохранено")         
        }
      })
      
      emit('set_agreement', {
        token,
        [key]: newValue
      })
    }
  }, [notifications, isLoading, token, emit, once, toast])

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    auth,
    name,
    user,
    token,
    user_type,
    isLoading,
    ratings,
    notifications,
    
    // Actions
    login,
    logout,
    updateUser,
    toggleNotification
  }
}
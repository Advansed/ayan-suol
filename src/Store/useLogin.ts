// src/Store/useLogin.ts

import { useCallback, useMemo } from 'react'
import { 
  UniversalStore, 
  useStore, 
  TState
} from './Store'
import { useToast } from '../components/Toast'
import { useSocket } from './useSocket'

// ============================================
// ТИПЫ
// ============================================

export interface UserRatings {
  orders:             number;
  rate:               number;
  payd:               number;
}

export interface UserNotifications {
  personalData:       boolean;
  userAgreement:      boolean;
  marketing:          boolean;
  market:             boolean;
}

export interface AuthResponse {
  guid:               string;
  token:              string;
  phone:              string;
  name:               string;
  email:              string;
  image:              string;
  user_type:          number;
  description:        string;
  account:            number;
  ratings:            UserRatings;
  notifications:      UserNotifications;
}

export interface AppState extends TState {
  auth:               boolean
  id:                 string | null
  name:               string | null
  phone:              string | null
  email:              string | null
  image:              string | null
  token:              string | null
  user_type:          number | null
  description:        string | null
  account:            number | null
  ratings:            UserRatings |  null
  notifications:      UserNotifications | null
  isLoading:          boolean
}

export interface UpdateUserData {
  name?:              string;
  email?:             string;
  description?:       string;
  password?:          string;
  image?:             string;
  user_type?:         string;
}

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
// STORE
// ============================================

export const appStore = new UniversalStore<AppState>({
  initialState: { 
    auth:           false,
    id:             null,
    name:           null,
    phone:          null,
    email:          null,
    image:          null,
    token:          null,
    user_type:      null,
    description:    null,
    account:        null,
    ratings:        null,
    notifications:  null,
    isLoading:      false
  },
  enableLogging:    true
})

// ============================================
// HOOK
// ============================================

export function useLogin() {
  const auth              = useStore((state: AppState) => state.auth,               1001, appStore)
  const id                = useStore((state: AppState) => state.id,                 1002, appStore)
  const name              = useStore((state: AppState) => state.name,               1003, appStore)
  const phone             = useStore((state: AppState) => state.phone,              1004, appStore)
  const email             = useStore((state: AppState) => state.email,              1005, appStore)
  const image             = useStore((state: AppState) => state.image,              1006, appStore)
  const token             = useStore((state: AppState) => state.token,              1007, appStore)
  const user_type         = useStore((state: AppState) => state.user_type,          1008, appStore)
  const description       = useStore((state: AppState) => state.description,        1009, appStore)
  const account           = useStore((state: AppState) => state.account,            1010, appStore)
  const isLoading         = useStore((state: AppState) => state.isLoading,          1011, appStore)
  const ratings           = useStore((state: AppState) => state.ratings,            1012, appStore)
  const notifications     = useStore((state: AppState) => state.notifications,      1013, appStore)

  const toast = useToast()
  const { isConnected, emit, once } = useSocket()

  const user = useMemo(() => ({
      id, name, phone, email, image, token, 
      user_type, description, account, 
      notifications, isLoading
  }), [id, name, phone, email, image, token, user_type, description, account, notifications, isLoading])

  const login = useCallback(async (phoneNumber: string, password: string): Promise<boolean> => {
    
    appStore.dispatch({ type: 'isLoading', data: true })

    try {
      if (!isConnected) {
        throw new Error('Нет подключения к серверу')
      }

      return new Promise((resolve, reject) => {
        const handleAuthResponse = (response: any) => {
          if (response.success && response.data) {
            const authData: AuthResponse = response.data

            localStorage.setItem("gvrs.login", phoneNumber )
            localStorage.setItem("gvrs.password", password )
            
            appStore.batchUpdate({
              auth:               true,
              id:                 authData.guid,
              name:               authData.name,
              phone:              authData.phone,
              email:              authData.email,
              image:              authData.image,
              token:              authData.token,
              user_type:          authData.user_type,
              description:        authData.description,
              account:            authData.account,
              ratings:           authData.ratings,
              notifications:      authData.notifications,
              isLoading:          false
            })

            toast.success(`Добро пожаловать, ${authData.name}!`)
            resolve(true)
          } else {
            appStore.dispatch({ type: 'isLoading', data: false })
            appStore.dispatch({ type: 'auth', data: false })
            
            toast.error(response.message || 'Неверные данные для входа')
            resolve(false)
          }
        }

        once('authorization', handleAuthResponse)
        emit('authorization', { login: Phone(phoneNumber), password })
      })

    } catch (error: any) {
      appStore.dispatch({ type: 'isLoading', data: false })
      appStore.dispatch({ type: 'auth', data: false })
      
      toast.error('Ошибка подключения к серверу')
      return false
    }
  }, [toast, isConnected, emit, once])

  const logout = useCallback(() => {
    appStore.batchUpdate({
      auth:               false,
      id:                 null,
      name:               null,
      phone:              null,
      email:              null,
      image:              null,
      token:              null,
      user_type:          null,
      description:        null,
      account:            null
    })

    toast.info("Выход из системы")
  }, [toast])

  const updateUser = useCallback(async (userData: UpdateUserData): Promise<boolean> => {
    appStore.dispatch({ type: 'isLoading', data: true })
    try {
      once('set_user', (data) => {
        if (data.success) {
          Object.entries(userData).forEach(([key, value]) => {
            appStore.dispatch({ type: key, data: value })
          })
          toast.success( data.message )
        } else {
          toast.error( data.message )
        }
        appStore.dispatch({ type: 'isLoading', data: false })
      })
      
      console.log('emit...', userData );
      const success = emit('set_user', { ...userData, token: token })
      if (!success) {
        toast.error('Ошибка подключения')
        appStore.dispatch({ type: 'isLoading', data: false })
        return false
      }
      return true
    } catch (error) {
      toast.error('Ошибка обновления')
      appStore.dispatch({ type: 'isLoading', data: false })
      return false
    }
  }, [emit, once])

  const toggleNotification = useCallback((key: keyof UserNotifications) => {
      if (!notifications || isLoading) return

      const newValue = !notifications[key]
      
      // Обновляем локальное состояние
      appStore.dispatch({ 
        type: 'notifications', 
        data: { ...notifications, [key]: newValue } 
      })

      // Отправляем на сервер
      if (token) {
        emit('set_agreement', { 
          token, 
          [key]: newValue 
        })
      }
    }, [notifications, isLoading, token, emit])

  return {
    auth,
    user, 
    id,
    name,
    phone,
    email,
    image,
    token,
    user_type,
    description,
    account,
    isLoading,
    ratings,
    notifications,
    socketConnected: isConnected,
    toggleNotification,
    login,
    logout,
    updateUser
  }
}

// ============================================
// УТИЛИТЫ
// ============================================

export const getToken           = () => appStore.getState().token
export const getName            = () => appStore.getState().name || ''
export const getId              = () => appStore.getState().id || ''
export const getAccount         = () => appStore.getState().account || 0
export const isAuthenticated    = () => appStore.getState().auth
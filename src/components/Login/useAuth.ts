import { useState, useEffect, useCallback, useRef } from 'react'
import socketService from '../Sockets'
import { Store } from '../Store'

// ======================
// ТИПЫ
// ======================

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  driver?: boolean
  token: string
  ratings?: {
    orders: number
    rate: number
    invoices: number
    payd: number
  }
  notifications?: {
    email: boolean
    sms: boolean
    orders: boolean
    market: boolean
  }
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string
  currentForm: 'login' | 'register' | 'recovery'
  formData: Record<string, any>
  formErrors: Record<string, string>
  socketStatus: 'connected' | 'disconnected' | 'connecting'
}

export interface LoginCredentials {
  phone: string
  password: string
}

export interface SocketResponse {
  success: boolean
  data?: any
  message?: string
}

export interface UseAuthReturn extends AuthState {
  // Основные действия
  login: (credentials: LoginCredentials) => Promise<void>
  
  // Навигация форм
  showLoginForm: () => void
  showRegisterForm: () => void
  showRecoveryForm: () => void
  
  // Утилиты
  clearErrors: () => void
  validateField: (field: string, value: any) => string | null
  updateFormData: (field: string, value: any) => void
}

// ======================
// УТИЛИТЫ
// ======================

export const validateField = (field: string, value: any): string | null => {
  switch (field) {
    case 'phone':
      if (!value || value.trim() === '') return 'Заполните телефон'
      const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/
      return phoneRegex.test(value) ? null : 'Некорректный формат номера телефона'
      
    case 'password':
      if (!value || value.trim() === '') return 'Заполните пароль'
      return value.length < 4 ? 'Пароль должен содержать минимум 4 символа' : null
      
    default:
      return null
  }
}

export const validateForm = (formType: string, data: any): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (formType === 'login') {
    const phoneError = validateField('phone', data.phone)
    const passwordError = validateField('password', data.password)
    if (phoneError) errors.phone = phoneError
    if (passwordError) errors.password = passwordError
  }
  
  return errors
}

export const Phone = (phone: string): string => {
  if (!phone) return ''
  let str = '+'
  for (let i = 0; i < phone.length; i++) {
    const ch = phone.charCodeAt(i)
    if (ch >= 48 && ch <= 57) str = str + phone.charAt(i)
  }
  return str
}

export const secureStorage = {
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },
  
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }
}

export const STORAGE_KEYS = {
  PHONE: 'serv-tm1.phone',
  TOKEN: 'serv-tm1.token'
}

// ======================
// ХУК АВТОРИЗАЦИИ
// ======================

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: '',
  currentForm: 'login',
  formData: {},
  formErrors: {},
  socketStatus: 'disconnected'
}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>(INITIAL_STATE)
  const isMountedRef = useRef(true)

  // ======================
  // УТИЛИТЫ СОСТОЯНИЯ
  // ======================

  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }))
    }
  }, [])

  const clearErrors = useCallback(() => {
    updateState({ error: '', formErrors: {} })
  }, [updateState])

  const updateFormData = useCallback((field: string, value: any) => {
    updateState({
      formData: { ...state.formData, [field]: value }
    })
  }, [state.formData, updateState])

  // ======================
  // НАВИГАЦИЯ ФОРМ
  // ======================

  const showLoginForm = useCallback(() => {
    updateState({ 
      currentForm: 'login', 
      error: '', 
      formErrors: {},
      formData: {}
    })
  }, [updateState])

  const showRegisterForm = useCallback(() => {
    updateState({ 
      currentForm: 'register', 
      error: '', 
      formErrors: {},
      formData: {}
    })
  }, [updateState])

  const showRecoveryForm = useCallback(() => {
    updateState({ 
      currentForm: 'recovery', 
      error: '',
      formErrors: {},
      formData: {}
    })
  }, [updateState])

  // ======================
  // ВАЛИДАЦИЯ
  // ======================

  const validateFieldCallback = useCallback((field: string, value: any): string | null => {
    const error = validateField(field, value)
    updateState({
      formErrors: { ...state.formErrors, [field]: error || '' }
    })
    return error
  }, [state.formErrors, updateState])

  // ======================
  // ОСНОВНЫЕ ДЕЙСТВИЯ
  // ======================

  const login = useCallback(async (credentials: LoginCredentials) => {
    updateState({ isLoading: true, error: '' })

    try {
      // Валидация
      const errors = validateForm('login', credentials)
      if (Object.keys(errors).length > 0) {
        updateState({ formErrors: errors, isLoading: false })
        return
      }

      // Сохраняем телефон
      secureStorage.set(STORAGE_KEYS.PHONE, credentials.phone)

      // Socket запрос
      const success = socketService.emit('authorization', {
        login: Phone(credentials.phone),
        password: credentials.password
      })

      if (!success) {
        throw new Error('Нет подключения к серверу')
      }

    } catch (error) {
      console.error('Login error:', error)
      updateState({ 
        error: error instanceof Error ? error.message : 'Ошибка входа', 
        isLoading: false 
      })
    }
  }, [updateState])

  // ======================
  // SOCKET ОБРАБОТЧИКИ
  // ======================

  useEffect(() => {
    isMountedRef.current = true

    // Загружаем сохраненный телефон
    const savedPhone = secureStorage.get(STORAGE_KEYS.PHONE)
    if (savedPhone) {
      updateState({
        formData: { phone: savedPhone }
      })
    }

    const socket = socketService.getSocket()
    if (!socket) return

    const handleAuth = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      updateState({ isLoading: false })

      if (response.success) {
        Store.dispatch({ type: "login", data: response.data })
        Store.dispatch({ type: "auth", data: true })
        
      } else {
        updateState({ error: response.message || 'Ошибка авторизации' })
      }
    }

    // Подписываемся только на авторизацию
    socket.on('authorization', handleAuth)

    return () => {
      isMountedRef.current = false
      
      if (socket) {
        socket.off('authorization', handleAuth)
      }
    }
  }, [updateState])

  // ======================
  // ВОЗВРАТ ИНТЕРФЕЙСА
  // ======================

  return {
    // Состояние
    ...state,
    
    // Основные действия
    login,
    
    // Навигация форм
    showLoginForm,
    showRegisterForm,
    showRecoveryForm,
    
    // Утилиты
    clearErrors,
    validateField: validateFieldCallback,
    updateFormData
  }
}
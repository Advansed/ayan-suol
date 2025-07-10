/**
 * 🔥 ГЛАВНЫЙ ХУК useAuth - ВСЯ ЛОГИКА АУТЕНТИФИКАЦИИ
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { AuthState, LoginCredentials, RegistrationData, RecoveryData, PasswordData, UseAuthReturn, SocketResponse } from './types'
import { validateField, validateForm, formatPhone, Phone, secureStorage, STORAGE_KEYS } from './utils'
import socketService from '../Sockets'
import { Store } from '../Store'

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: '',
  currentForm: 'login',
  formData: {},
  formErrors: {},
  registrationStep: 0,
  registrationData: {
    phone: '',
    name: '',
    email: ''
  },
  recoveryStep: 0,
  recoveryData: {
    phone: ''
  },
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

  const updateRegistrationData = useCallback((field: string, value: any) => {
    updateState({
      registrationData: { ...state.registrationData, [field]: value }
    })
  }, [state.registrationData, updateState])

  const updateRecoveryData = useCallback((field: string, value: any) => {
    updateState({
      recoveryData: { ...state.recoveryData, [field]: value }
    })
  }, [state.recoveryData, updateState])

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
      formData: {},
      registrationStep: 0
    })
  }, [updateState])

  const showRecoveryForm = useCallback(() => {
    updateState({ 
      currentForm: 'recovery', 
      error: '', 
      formErrors: {},
      formData: {},
      recoveryStep: 0
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

  const register = useCallback(async (userData: RegistrationData) => {
    updateState({ isLoading: true, error: '' })

    try {
      const phone = Phone(userData.phone)
      if (phone.length !== 12) {
        updateState({ error: 'Заполните телефон', isLoading: false })
        return
      }
      if (userData.name.length === 0) {
        updateState({ error: 'Заполните ФИО', isLoading: false })
        return
      }

      const success = socketService.emit('check_registration', {
        code: phone,
        name: userData.name.trim(),
        email: userData.email?.trim() || ''
      })

      if (!success) {
        throw new Error('Нет подключения к серверу')
      }

    } catch (error) {
      console.error('Registration error:', error)
      updateState({ 
        error: error instanceof Error ? error.message : 'Ошибка регистрации', 
        isLoading: false 
      })
    }
  }, [updateState])

  const recoverPassword = useCallback(async (data: RecoveryData) => {
    updateState({ isLoading: true, error: '' })

    try {
      const phone = Phone(data.phone)
      if (phone.length !== 12) {
        updateState({ error: 'Введите корректный номер телефона', isLoading: false })
        return
      }

      const success = socketService.emit('check_restore', {
        phone: phone
      })

      if (!success) {
        throw new Error('Нет подключения к серверу')
      }

    } catch (error) {
      console.error('Recovery error:', error)
      updateState({ 
        error: error instanceof Error ? error.message : 'Ошибка восстановления', 
        isLoading: false 
      })
    }
  }, [updateState])

  // ======================
  // РЕГИСТРАЦИЯ ШАГИ
  // ======================

  const nextRegistrationStep = useCallback(() => {
    updateState({ 
      registrationStep: Math.min(state.registrationStep + 1, 3) 
    })
  }, [state.registrationStep, updateState])

  const prevRegistrationStep = useCallback(() => {
    updateState({ 
      registrationStep: Math.max(state.registrationStep - 1, 0) 
    })
  }, [state.registrationStep, updateState])

  const submitRegistrationStep = useCallback(async () => {
    switch (state.registrationStep) {
      case 0:
        await register(state.registrationData as RegistrationData)
        break
      case 1:
        window.open(`tel:${state.registrationData.call_phone}`)
        updateState({ registrationStep: 2 })
        break
      case 2:
        socketService.emit('test_call', state.registrationData)
        break
      case 3:
        const passwordData: PasswordData = {
          token: state.registrationData.token || '',
          password: state.formData.password || '',
          password1: state.formData.password1 || ''
        }

        const errors = validateForm('password', passwordData)
        if (Object.keys(errors).length > 0) {
          updateState({ formErrors: errors })
          return
        }

        socketService.emit('save_password', passwordData)
        break
    }
  }, [state.registrationStep, state.registrationData, state.formData, register, updateState])

  // ======================
  // ВОССТАНОВЛЕНИЕ ШАГИ
  // ======================

  const nextRecoveryStep = useCallback(() => {
    updateState({ 
      recoveryStep: Math.min(state.recoveryStep + 1, 3) 
    })
  }, [state.recoveryStep, updateState])

  const prevRecoveryStep = useCallback(() => {
    updateState({ 
      recoveryStep: Math.max(state.recoveryStep - 1, 0) 
    })
  }, [state.recoveryStep, updateState])

  const submitRecoveryStep = useCallback(async () => {
    console.log(" submit recovery step", state.recoveryData )
    switch (state.recoveryStep) {
      case 0:
        await recoverPassword(state.recoveryData)
        break
      case 1:
        window.open(`tel:${state.recoveryData.call_phone}`)
        updateState({ recoveryStep: 2 })
        break
      case 2:
        socketService.emit('test_restore_call', state.recoveryData)
        break
      case 3:
        const passwordData: PasswordData = {
          token: state.recoveryData.token || '',
          password: state.formData.password || '',
          password1: state.formData.password1 || '',
          phone: state.recoveryData.phone
        }

        const errors = validateForm('password', passwordData)
        if (Object.keys(errors).length > 0) {
          updateState({ formErrors: errors })
          return
        }

        socketService.emit('save_password', passwordData)
        break
    }
  }, [state.recoveryStep, state.recoveryData, state.formData, recoverPassword, updateState])

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

    // Обработчик авторизации
    const handleAuth = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      updateState({ isLoading: false })
      
      if (response.success) {
        updateState({ 
          isAuthenticated: true, 
          user: response.data 
        })
        Store.dispatch({ type: "login", data: response.data })
        Store.dispatch({ type: "auth", data: true })
        
        if (response.data.driver) {
          Store.dispatch({ type: "swap", data: true })
        }
      } else {
        updateState({ error: response.message || 'Ошибка авторизации' })
      }
    }

    // Обработчик регистрации
    const handleRegistration = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      updateState({ isLoading: false })
      
      if (response.success) {
        updateRegistrationData('status', response.data.status)
        updateRegistrationData('check_id', response.data.check_id)
        updateRegistrationData('call_phone', response.data.call_phone)
        updateRegistrationData('token', response.data.token)
        nextRegistrationStep()
      } else {
        updateState({ error: response.message || 'Ошибка регистрации' })
      }
    }

    // Обработчик восстановления
    const handleRestore = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      updateState({ isLoading: false })
      
      if (response.success) {
        updateRecoveryData('status', response.data.status)
        updateRecoveryData('check_id', response.data.check_id)
        updateRecoveryData('call_phone', response.data.call_phone)
        updateRecoveryData('token', response.data.token)
        updateRecoveryData('user_data', response.data.user_data)
        nextRecoveryStep()
      } else {
        updateState({ error: response.message || 'Пользователь с таким номером не найден' })
      }
    }

    // Обработчик проверки звонка
    const handleTestCall = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      if (response.data.check_status === 400) {
        updateState({ error: response.data.check_status_text })
      }
      if (response.data.check_status === 401) {
        nextRegistrationStep()
      }
    }

    // Обработчик проверки звонка для восстановления
    const handleTestRestoreCall = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      if (response.data.check_status === 400) {
        updateState({ error: response.data.check_status_text || 'Звонок не подтвержден' })
      }
      if (response.data.check_status === 401) {
        nextRecoveryStep()
      }
    }

    // Обработчик сохранения пароля
    const handleSavePassword = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      if (response.success) {
        Store.dispatch({ type: "login", data: response.data })
        Store.dispatch({ type: "auth", data: true })
        
        if (response.data.driver) {
          Store.dispatch({ type: "swap", data: true })
        }
      } else {
        updateState({ error: response.message || 'Ошибка сохранения пароля' })
      }
    }

    // Подписываемся на события
    socket.on('authorization', handleAuth)
    socket.on('check_registration', handleRegistration)
    socket.on('check_restore', handleRestore)
    socket.on('test_call', handleTestCall)
    socket.on('test_restore_call', handleTestRestoreCall)
    socket.on('save_password', handleSavePassword)

    return () => {
      isMountedRef.current = false
      
      if (socket) {
        socket.off('authorization', handleAuth)
        socket.off('check_registration', handleRegistration)
        socket.off('check_restore', handleRestore)
        socket.off('test_call', handleTestCall)
        socket.off('test_restore_call', handleTestRestoreCall)
        socket.off('save_password', handleSavePassword)
      }
    }
  }, [updateState, updateRegistrationData, updateRecoveryData, nextRegistrationStep, nextRecoveryStep])

  // ======================
  // ВОЗВРАТ ИНТЕРФЕЙСА
  // ======================

  return {
    // Состояние
    ...state,
    
    // Основные действия
    login,
    register,
    recoverPassword,
    
    // Навигация форм
    showLoginForm,
    showRegisterForm,
    showRecoveryForm,
    
    // Валидация
    validateField: validateFieldCallback,
    
    // Шаги регистрации
    nextRegistrationStep,
    prevRegistrationStep,
    submitRegistrationStep,
    
    // Шаги восстановления
    nextRecoveryStep,
    prevRecoveryStep,
    submitRecoveryStep,
    
    // Утилиты
    clearErrors,
    updateFormData,
    updateRegistrationData,
    updateRecoveryData
  }
}
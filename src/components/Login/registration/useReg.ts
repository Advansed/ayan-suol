import { useState, useEffect, useCallback, useRef } from 'react'
import socketService from '../../Sockets'
import { Store } from '../../Store'

// ======================
// ТИПЫ РЕГИСТРАЦИИ  
// ======================

export interface RegistrationData {
  phone: string
  name: string
  email?: string
  userType: '0' | '1' | '2'
  token?: string
  status?: string
  check_id?: string
  call_phone?: string
}

export interface RegistrationState {
  registrationStep: number
  registrationData: RegistrationData
  formData: Record<string, any>
  formErrors: Record<string, string>
  isLoading: boolean
  error: string
}

export interface UseRegReturn extends RegistrationState {
  // Основные действия
  register: (data: RegistrationData) => Promise<void>
  
  // Навигация по шагам
  nextStep: () => void
  prevStep: () => void
  submitStep: () => Promise<void>
  
  // Утилиты
  updateRegistrationData: (field: string, value: any) => void
  updateFormData: (field: string, value: any) => void
  clearErrors: () => void
  validateField: (field: string, value: any) => string | null
}

export interface SocketResponse {
  success: boolean
  data?: any
  message?: string
}

export interface PasswordData {
  token:      string
  password:   string
  password1:  string
  phone?:     string
  userType?:  string
}

// ======================
// УТИЛИТЫ РЕГИСТРАЦИИ
// ======================

export const validateRegistrationField = (field: string, value: any): string | null => {
  switch (field) {
    case 'phone':
      if (!value || value.trim() === '') return 'Заполните телефон'
      const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/
      return phoneRegex.test(value) ? null : 'Некорректный формат номера телефона'
      
    case 'name':
      if (!value || value.trim() === '') return 'Заполните ФИО'
      return value.length < 2 ? 'Имя должно содержать минимум 2 символа' : null
      
    case 'email':
      if (!value || value.trim() === '') return null // email необязательный
      const emailRegex = /\S+@\S+\.\S+/
      return emailRegex.test(value) ? null : 'Неверный формат email'
      
    case 'password':
      if (!value || value.trim() === '') return 'Заполните пароль'
      return value.length < 4 ? 'Пароль должен содержать минимум 4 символа' : null
      
    case 'password1':
      if (!value || value.trim() === '') return 'Подтвердите пароль'
      return null
      
    case 'userType':
      if (!value) return 'Выберите тип аккаунта'
      return null
      
    default:
      return null
  }
}

export const validateRegistrationForm = (formType: string, data: any): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  switch (formType) {
    case 'register':
      const phoneError = validateRegistrationField('phone', data.phone)
      const nameError = validateRegistrationField('name', data.name)
      const emailError = validateRegistrationField('email', data.email)
      const userTypeError = validateRegistrationField('userType', data.userType)
      if (phoneError) errors.phone = phoneError
      if (nameError) errors.name = nameError
      if (emailError) errors.email = emailError
      if (userTypeError) errors.userType = userTypeError
      break
      
    case 'password':
      const pwd1Error = validateRegistrationField('password', data.password)
      const pwd2Error = validateRegistrationField('password1', data.password1)
      if (pwd1Error) errors.password = pwd1Error
      if (pwd2Error) errors.password1 = pwd2Error
      if (data.password && data.password1 && data.password !== data.password1) {
        errors.password1 = 'Пароли не совпадают'
      }
      break
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

// ======================
// ХУК РЕГИСТРАЦИИ
// ======================

const INITIAL_REG_STATE: RegistrationState = {
  registrationStep: 0,
  registrationData: {
    phone: '',
    name: '',
    email: '',
    userType: '1',
    token: '',
    status: '',
    check_id: '',
    call_phone: ''
  },
  formData: {},
  formErrors: {},
  isLoading: false,
  error: ''
}

export const useReg = (): UseRegReturn => {
  const [state, setState] = useState<RegistrationState>(INITIAL_REG_STATE)
  const isMountedRef = useRef(true)

  // ======================
  // УТИЛИТЫ СОСТОЯНИЯ
  // ======================

  const updateState = useCallback((updates: Partial<RegistrationState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }))
    }
  }, [])

  const clearErrors = useCallback(() => {
    updateState({ error: '', formErrors: {} })
  }, [updateState])

  const updateFormData = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }))
  }, [])

  const updateRegistrationData = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      registrationData: { ...prev.registrationData, [field]: value }
    }))
  }, [])


  // ======================
  // ВАЛИДАЦИЯ
  // ======================

  const validateFieldCallback = useCallback((field: string, value: any): string | null => {
    const error = validateRegistrationField(field, value)
    updateState({
      formErrors: { ...state.formErrors, [field]: error || '' }
    })
    return error
  }, [state.formErrors, updateState])

  // ======================
  // ОСНОВНЫЕ ДЕЙСТВИЯ
  // ======================

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
        email: userData.email?.trim() || '',
        userType: userData.userType
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

  const checkSMS = useCallback(async (data: { token?: string; pincode?: string }) => {
    updateState({ isLoading: true, error: '' })

    try {
      console.log("check_sms")
      const success = socketService.emit('check_sms', {
        token: data.token,
        pincode: data.pincode
      })

      if (!success) {
        throw new Error('Нет подключения к серверу')
      }

    } catch (error) {
      console.error('SMS check error:', error)
      updateState({ 
        error: error instanceof Error ? error.message : 'Ошибка проверки SMS', 
        isLoading: false 
      })
    }
  }, [updateState])

  // ======================
  // НАВИГАЦИЯ ПО ШАГАМ
  // ======================

  const nextStep = useCallback(() => {
    updateState({ 
      registrationStep: Math.min(state.registrationStep + 1, 3)
    })
  }, [state.registrationStep, updateState])

  const prevStep = useCallback(() => {
    updateState({ 
      registrationStep: Math.max(state.registrationStep - 1, 0) 
    })
  }, [state.registrationStep, updateState])

  const submitStep = useCallback(async () => {
    console.log(state.formData)
    switch (state.registrationStep) {
      case 0:
        // Шаг выбора роли - просто переходим дальше
        break
      case 1:
        // Отправка данных регистрации с userType
        await register({
          ...state.formData,
          userType: state.registrationData.userType
        } as RegistrationData)
        break
      case 2:
        await checkSMS({
          token: state.registrationData.token,
          pincode: state.formData.pincode
        })
        break      
      case 3:
        const passwordData: PasswordData = {
          token: state.registrationData.token || '',
          password: state.formData.password || '',
          password1: state.formData.password1 || '',
          userType: state.formData.userType || 1
        }

        const errors = validateRegistrationForm('password', passwordData)
        if (Object.keys(errors).length > 0) {
          updateState({ formErrors: errors })
          return
        }

        socketService.emit('save_password', passwordData)
        break
    }
  }, [state.registrationStep, state.registrationData, state.formData, register, updateState])

  // ======================
  // SOCKET ОБРАБОТЧИКИ
  // ======================

  useEffect(() => {
    isMountedRef.current = true

    const socket = socketService.getSocket()
    if (!socket) return

    const handleRegistration = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      updateState({ isLoading: false })

      if (response.success) {
        updateRegistrationData('token', response.data.token)
        updateRegistrationData('status', response.data.status)
        updateRegistrationData('check_id', response.data.check_id)
        updateRegistrationData('call_phone', response.data.call_phone)
        nextStep()
      } else {
        updateState({ error: response.message || 'Ошибка регистрации' })
      }
    }

    const handleSMSCheck = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      updateState({ isLoading: false })

      console.log(response)

      if (response.success) {
        console.log("success")
        nextStep()
      } else {
        console.log("unsuccess")
        updateState({ error: response.message || 'Неверный код' })
      }
    }

    const handleSavePassword = (response: SocketResponse) => {
      if (!isMountedRef.current) return

      updateState({ isLoading: false })

      if (response.success) {
        // Успешная регистрация - можно показать успех или перенаправить
        console.log("Registration completed successfully")
        updateState({ error: '', registrationStep: 0 }) // Сброс формы
        Store.dispatch({ type: "auth", data: true })
        Store.dispatch({ type: "login", data: response.data })
      } else {
        updateState({ error: response.message || 'Ошибка сохранения пароля' })
      }
    }

    // Подписываемся на события
    socket.on('check_registration', handleRegistration)
    socket.on('check_sms', handleSMSCheck)
    socket.on('save_password', handleSavePassword)

    return () => {
      isMountedRef.current = false
      
      if (socket) {
        socket.off('check_registration', handleRegistration)
        socket.off('check_sms', handleSMSCheck)
        socket.off('save_password', handleSavePassword)
      }
    }
  }, [updateState, updateRegistrationData, nextStep])

  // ======================
  // ВОЗВРАТ ИНТЕРФЕЙСА
  // ======================

  return {
    // Состояние
    ...state,
    
    // Основные действия
    register,
    
    // Навигация по шагам
    nextStep,
    prevStep,
    submitStep,
    
    // Утилиты
    updateRegistrationData,
    updateFormData,
    clearErrors,
    validateField: validateFieldCallback
  }
}
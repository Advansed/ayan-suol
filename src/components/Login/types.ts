/**
 * Все TypeScript типы для Login модуля
 */

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
  isAuthenticated:  boolean
  user:             User | null
  isLoading:        boolean
  error:            string
  currentForm:      'login' | 'register' | 'recovery'
  formData:         Record<string, any>
  formErrors:       Record<string, string>
  registrationStep: number
  registrationData: RegistrationData
  recoveryStep:     number
  recoveryData:     RecoveryData
  socketStatus:     'connected' | 'disconnected' | 'connecting'
}

export interface LoginCredentials {
  phone: string
  password: string
}

export interface RegistrationData {
  phone: string
  name: string
  email?: string
  token?: string
  status?: string
  check_id?: string
  call_phone?: string
}

export interface RecoveryData {
  phone:          string
  token?:         string
  status?:        string
  check_id?:      string
  call_phone?:    string
  password?:      string
  password1?:     string
  pincode?:        string
  user_data?: {
    name: string
  }
}

export interface PasswordData {
  token: string
  password: string
  password1: string
  phone?: string
}

export interface SocketResponse {
  success: boolean
  data?: any
  message?: string
}

export interface UseAuthReturn extends AuthState {
  // Основные действия
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegistrationData) => Promise<void>
  recoverPassword: (data: any) => Promise<void>
  
  // Навигация форм
  showLoginForm: () => void
  showRegisterForm: () => void
  showRecoveryForm: () => void
  
  // Валидация
  validateField: (field: string, value: any) => string | null
  
  // Шаги регистрации
  nextRegistrationStep: () => void
  prevRegistrationStep: () => void
  submitRegistrationStep: () => Promise<void>
  
  // Шаги восстановления
  nextRecoveryStep: () => void
  prevRecoveryStep: () => void
  submitRecoveryStep: () => Promise<void>
  
  // Утилиты
  clearErrors: () => void
  updateFormData: (field: string, value: any) => void
  updateRegistrationData: (field: string, value: any) => void
  updateRecoveryData: (field: string, value: any) => void
}
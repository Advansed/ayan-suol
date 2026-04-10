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
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string
  currentForm: 'login' | 'register' | 'recovery'
  formData: Record<string, any>
  formErrors: Record<string, string>
  registrationStep: number
  recoveryStep: number
  recoveryData: RecoveryData
  socketStatus: 'connected' | 'disconnected' | 'connecting'
}

export interface LoginCredentials {
  phone: string
  password: string
}

/** Устаревший тип формы регистрации (актуальные данные — в loginStore) */
export interface RegistrationData {
  phone: string
  name: string
  email?: string
  userType: '0' | '1' | '2'
  partner?: string
  token?: string
}

export interface RecoveryData {
  phone: string
  token?: string
  status?: string
  check_id?: string
  call_phone?: string
  password?: string
  password1?: string
  pincode?: string
  user_data?: {
    name: string
  }
}

export interface PasswordData {
  token: string
  password: string
  password1: string
  userType?: string
}

export interface SocketResponse {
  success: boolean
  data?: any
  message?: string
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegistrationData) => Promise<void>
  recoverPassword: (data: any) => Promise<void>

  showLoginForm: () => void
  showRegisterForm: () => void
  showRecoveryForm: () => void

  validateField: (field: string, value: any) => string | null

  nextRegistrationStep: () => void
  prevRegistrationStep: () => void
  submitRegistrationStep: () => Promise<void>

  nextRecoveryStep: () => void
  prevRecoveryStep: () => void
  submitRecoveryStep: () => Promise<void>

  clearErrors: () => void
  updateFormData: (field: string, value: any) => void
  updateRecoveryData: (field: string, value: any) => void
}

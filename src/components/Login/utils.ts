/**
 * Все утилиты для Login модуля
 */

// ======================
// ВАЛИДАЦИЯ
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
      
    case 'password1':
      if (!value || value.trim() === '') return 'Подтвердите пароль'
      return null
      
    case 'name':
      if (!value || value.trim() === '') return 'Заполните ФИО'
      return value.length < 2 ? 'Имя должно содержать минимум 2 символа' : null
      
    case 'email':
      if (!value || value.trim() === '') return null // email необязательный
      const emailRegex = /\S+@\S+\.\S+/
      return emailRegex.test(value) ? null : 'Неверный формат email'
      
    default:
      return null
  }
}

export const validateForm = (formType: string, data: any): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  switch (formType) {
    case 'login':
      const phoneError = validateField('phone', data.phone)
      const passwordError = validateField('password', data.password)
      if (phoneError) errors.phone = phoneError
      if (passwordError) errors.password = passwordError
      break
      
    case 'register':
      const regPhoneError = validateField('phone', data.phone)
      const nameError = validateField('name', data.name)
      const emailError = validateField('email', data.email)
      if (regPhoneError) errors.phone = regPhoneError
      if (nameError) errors.name = nameError
      if (emailError) errors.email = emailError
      break
      
    case 'password':
      const pwd1Error = validateField('password', data.password)
      const pwd2Error = validateField('password1', data.password1)
      if (pwd1Error) errors.password = pwd1Error
      if (pwd2Error) errors.password1 = pwd2Error
      if (data.password && data.password1 && data.password !== data.password1) {
        errors.password1 = 'Пароли не совпадают'
      }
      break
  }
  
  return errors
}

// ======================
// ФОРМАТИРОВАНИЕ
// ======================

export const formatPhone = (phone: string): string => {
  if (!phone) return ''
  // Убираем все кроме цифр
  const digits = phone.replace(/\D/g, '')
  
  // Добавляем +7 если нужно
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`
  }
  if (digits.length === 10) {
    return `+7${digits}`
  }
  
  return `+${digits}`
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

export const formatPhoneDisplay = (phone: string): string => {
  if (!phone || phone.length < 10) return phone
  return `${phone.substring(0, 2)} (${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8, 10)}-${phone.substring(10)}`
}

// ======================
// БЕЗОПАСНОЕ ХРАНЕНИЕ
// ======================

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

// ======================
// КОНСТАНТЫ
// ======================

export const STORAGE_KEYS = {
  PHONE: 'serv-tm1.phone',
  TOKEN: 'serv-tm1.token'
}

export const VALIDATION_PATTERNS = {
  phone: /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/,
  email: /\S+@\S+\.\S+/
}
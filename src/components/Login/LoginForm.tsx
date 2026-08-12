// src/components/Login/LoginForm.tsx

import React, { useState, useCallback, useEffect } from 'react'
import { IonCard } from '@ionic/react'
import { MaskedInput, PasswordInput, FormButtons, NavigationLinks } from './SharedComponents'
import { validateLoginPhoneRaw } from './phone'

// ============================================
// ТИПЫ
// ============================================

interface LoginFormProps {
  onLogin: (phone: string, password: string) => Promise<boolean>
  onSwitchToRegister: () => void
  onSwitchToRecovery: () => void
}

interface FormData {
  phone: string
  password: string
}

interface FormErrors {
  phone?: string
  password?: string
}

// ============================================
// УТИЛИТЫ ВАЛИДАЦИИ
// ============================================

const normalizeString = (value: unknown): string => {
  return typeof value === 'string' ? value : (value ?? '').toString()
}

const validateField = (field: string, value: unknown): string | null => {
  const v = normalizeString(value)
  switch (field) {
    case 'phone':
      if (!v || v.trim() === '') return 'Заполните телефон'
      return validateLoginPhoneRaw(v)
      
    case 'password':
      if (!v || v.trim() === '') return 'Заполните пароль'
      return v.length < 4 ? 'Пароль должен содержать минимум 4 символа' : null
      
    default:
      return null
  }
}

// ============================================
// КОМПОНЕНТ
// ============================================

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  onSwitchToRegister, 
  onSwitchToRecovery 
}) => {
  
  // Локальное состояние формы
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    password: ''
  })
  
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(()=>{
    const login = localStorage.getItem("gvrs.login")
    if(login){
      setFormData({
        phone: login,
        password: localStorage.getItem("gvrs.password") ?? '',
      })
    }
  },[])

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const updateFormData = useCallback((field: keyof FormData, value: unknown) => {
    const safeValue = normalizeString(value)
    setFormData(prev => ({ ...prev, [field]: safeValue }))
    
    // Очищаем ошибку при изменении поля
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [formErrors])

  const validateFormField = useCallback((field: keyof FormData, value: unknown) => {
    const error = validateField(field, value)
    setFormErrors(prev => ({ ...prev, [field]: error || undefined }))
    return !error
  }, [])

  // Обработчик отправки формы
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    // Валидация всех полей
    const phoneValid = validateFormField('phone', formData.phone)
    const passwordValid = validateFormField('password', formData.password)
    
    if (!phoneValid || !passwordValid) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onLogin(formData.phone, formData.password)
      // Успех обрабатывается через Toast в useLogin
    } catch (error) {
      // Ошибки обрабатываются через Toast в useLogin
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onLogin, validateFormField])

  // Обработчик нажатия Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }, [handleSubmit])

  // Валидация полей при потере фокуса
  const handlePhoneBlur = useCallback(() => {
    if (formData.phone) {
      validateFormField('phone', formData.phone)
    }
  }, [formData.phone, validateFormField])

  const handlePasswordBlur = useCallback(() => {
    if (formData.password) {
      validateFormField('password', formData.password)
    }
  }, [formData.password, validateFormField])

  // ============================================
  // КОНФИГУРАЦИЯ
  // ============================================

  // Навигационные ссылки
  const navigationLinks = [
    {
      text: 'Забыли пароль? Восстановить',
      onClick: onSwitchToRecovery
    },
    {
      text: 'Нет аккаунта? Регистрация',
      onClick: onSwitchToRegister
    }
  ]

  // Проверка заполненности формы
  const phone = normalizeString(formData.phone)
  const password = normalizeString(formData.password)
  const isFormValid =
    phone.trim() &&
    password.trim() &&
    !formErrors.phone &&
    !formErrors.password

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <div className="container">
      <IonCard className="login-container">
        <div className="a-center">
          <h2>Авторизация</h2>
        </div>

        <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
          {/* Поле телефона */}
          <div className="mt-1">
            <MaskedInput
              placeholder="Телефон: +7… или международный +…"
              value={formData.phone}
              onChange={(value) => updateFormData('phone', value)}
              onBlur={handlePhoneBlur}
              error={formErrors.phone}
            />
          </div>

          {/* Поле пароля */}
          <div className="mt-1">
            <PasswordInput
              placeholder="Пароль"
              value={formData.password}
              onChange={(value) => updateFormData('password', value)}
              onBlur={handlePasswordBlur}
              error={formErrors.password}
              autocomplete="current-password"
            />
          </div>

          {/* Кнопка входа */}
          <FormButtons
            onNext={handleSubmit}
            nextText="Войти"
            disabled={!isFormValid}
            loading={isSubmitting}
          />
        </form>

        {/* Навигационные ссылки */}
        <NavigationLinks links={navigationLinks} />
      </IonCard>
    </div>
  )
}
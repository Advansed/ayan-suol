/**
 * Форма входа в систему
 */

import React, { useCallback } from 'react'
import { IonCard } from '@ionic/react'
import { UseAuthReturn } from './types'
import { MaskedInput, PasswordInput, FormButtons, NavigationLinks } from './SharedComponents'

interface LoginFormProps {
  auth: UseAuthReturn
}

export const LoginForm: React.FC<LoginFormProps> = ({ auth }) => {
  
  // Обработчик отправки формы
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    await auth.login({
      phone: auth.formData.phone || '',
      password: auth.formData.password || ''
    })
  }, [auth])

  // Обработчик нажатия Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }, [handleSubmit])

  // Валидация полей при потере фокуса
  const handlePhoneBlur = useCallback(() => {
    if (auth.formData.phone) {
      auth.validateField('phone', auth.formData.phone)
    }
  }, [auth])

  const handlePasswordBlur = useCallback(() => {
    if (auth.formData.password) {
      auth.validateField('password', auth.formData.password)
    }
  }, [auth])

  // Навигационные ссылки
  const navigationLinks = [
    {
      text: 'Забыли пароль? Восстановить',
      onClick: auth.showRecoveryForm
    },
    {
      text: 'Нет аккаунта? Регистрация',
      onClick: auth.showRegisterForm
    }
  ]

  return (
    <div className="container">
      <IonCard className="login-container">
        <div className="a-center">
          <h2>Авторизация</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Поле телефона */}
          <div className="mt-1">
            <MaskedInput
              placeholder="+7 (XXX) XXX-XXXX"
              value={auth.formData.phone || ''}
              onChange={(value) => auth.updateFormData('phone', value)}
              onBlur={handlePhoneBlur}
              error={auth.formErrors.phone}
            />
          </div>

          {/* Поле пароля */}
          <div className="mt-1">
            <PasswordInput
              placeholder="Пароль"
              value={auth.formData.password || ''}
              onChange={(value) => auth.updateFormData('password', value)}
              onBlur={handlePasswordBlur}
              error={auth.formErrors.password}
              autocomplete="current-password"
            />
          </div>

          {/* Кнопка входа */}
          <FormButtons
            onNext={handleSubmit}
            nextText="Войти"
            disabled={!auth.formData.phone?.trim() || !auth.formData.password?.trim()}
            loading={auth.isLoading}
          />
        </form>

        {/* Навигационные ссылки */}
        <NavigationLinks links={navigationLinks} />
      </IonCard>
    </div>
  )
}
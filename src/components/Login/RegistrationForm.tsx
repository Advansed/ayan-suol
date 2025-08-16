/**
 * Форма регистрации + все шаги в одном файле
 */

import React, { useCallback } from 'react'
import { IonCard } from '@ionic/react'
import { 
  MaskedInput, 
  TextInput, 
  PasswordInput, 
  ProgressBar, 
  FormButtons, 
  NavigationLinks 
} from './SharedComponents'
import { formatPhoneDisplay } from './utils'
import { UseAuthReturn } from './useAuth'

interface RegistrationFormProps {
  auth: UseAuthReturn
}

// ======================
// ШАГ 0: ВЫБОР РОЛИ
// ======================

const RoleSelector: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleNext = useCallback(() => {
    if (auth.formData.userType) {
      auth.updateRegistrationData('user_type', auth.formData.userType)
      auth.nextRegistrationStep()
    }
  }, [auth])

  const navigationLinks = [{
    text: 'Есть аккаунт? Авторизироваться',
    onClick: auth.showLoginForm
  }]

  return (
    <div className="login-container">
      <div className="a-center">
        <h2>Кто вы?</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Выберите ваш тип аккаунта
      </div>

      <div className="mt-1">
        <div className="role-selection-buttons">
          <button
            type="button"
            className={`role-button ${auth.formData.userType === '1' ? 'selected' : ''}`}
            onClick={() => auth.updateFormData('userType', '1')}
          >
            <div className="role-icon">📦</div>
            <div>Заказчик</div>
          </button>
          <button
            type="button"
            className={`role-button ${auth.formData.userType === '2' ? 'selected' : ''}`}
            onClick={() => auth.updateFormData('userType', '2')}
          >
            <div className="role-icon">🚛</div>
            <div>Водитель</div>
          </button>
          <button
            type="button"
            className={`role-button ${auth.formData.userType === '0' ? 'selected' : ''}`}
            onClick={() => auth.updateFormData('userType', '0')}
          >
            <div className="role-icon">🤝</div>
            <div>Партнер</div>
          </button>
        </div>
      </div>

      <FormButtons
        onNext={handleNext}
        nextText="Продолжить"
        disabled={!auth.formData.userType}
      />

      <NavigationLinks links={navigationLinks} />
    </div>
  )
}

// ======================
// ШАГ 1: ЛИЧНЫЕ ДАННЫЕ
// ======================

const StepPersonalInfo: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleNext = useCallback(() => {
    console.log(auth.formData)
    auth.submitRegistrationStep()
  }, [auth])

  const handlePhoneBlur = useCallback(() => {
    if (auth.formData.phone) {
      auth.validateField('phone', auth.formData.phone)
    }
  }, [auth])

  const handleNameBlur = useCallback(() => {
    if (auth.formData.name) {
      auth.validateField('name', auth.formData.name)
    }
  }, [auth])

  const handleEmailBlur = useCallback(() => {
    if (auth.formData.email) {
      auth.validateField('email', auth.formData.email)
    }
  }, [auth])

  const navigationLinks = [{
    text: 'Есть аккаунт? Авторизироваться',
    onClick: auth.showLoginForm
  }]

  return (
    <div className="login-container">
      <div className="a-center">
        <h2>Регистрация</h2>
      </div>

      {/* Телефон */}
      <div className="mt-1">
        <MaskedInput
          placeholder="+7 (XXX) XXX-XXXX"
          value={auth.formData.phone || ''}
          onChange={(value) => auth.updateFormData('phone', value)}
          onBlur={handlePhoneBlur}
          error={auth.formErrors.phone}
        />
      </div>

      {/* Имя */}
      <div className="mt-1">
        <TextInput
          placeholder="Имя и Фамилия"
          value={auth.formData.name || ''}
          onChange={(value) => auth.updateFormData('name', value)}
          onBlur={handleNameBlur}
          error={auth.formErrors.name}
        />
      </div>

      {/* Email (необязательно) */}
      <div className="mt-1">
        <TextInput
          type="email"
          placeholder="Email (необязательно)"
          value={auth.formData.email || ''}
          onChange={(value) => auth.updateFormData('email', value)}
          onBlur={handleEmailBlur}
          error={auth.formErrors.email}
        />
      </div>

      <FormButtons
        onNext={handleNext}
        nextText="Зарегистрироваться"
        disabled={!auth.formData.phone?.trim() || !auth.formData.name?.trim()}
        loading={auth.isLoading}
      />

      <NavigationLinks links={navigationLinks} />
    </div>
  )
}

// ======================
// ШАГ 2: ВЕРИФИКАЦИЯ
// ======================

const StepVerification: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleCall = useCallback(() => {
    auth.submitRegistrationStep()
  }, [auth])

  const handlePinChange = (value: string, index: number) => {
    const pin = (auth.recoveryData.pincode || '').split('')
    pin[index] = value.slice(-1)
    const newPin = pin.join('')
    auth.updateRecoveryData('pincode', newPin)
    
    if (value && index < 3) {
      const nextInput = document.querySelector(`input[data-pin-index="${index + 1}"]`) as HTMLInputElement
      nextInput?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const pin = (auth.recoveryData.pincode || '').split('')
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-pin-index="${index - 1}"]`) as HTMLInputElement
      prevInput?.focus()
    }
  }

  const pin = (auth.recoveryData.pincode || '').split('')

  const navigationLinks = [{
    text: 'Есть аккаунт? Авторизироваться',
    onClick: auth.showLoginForm
  }]

  return (
    <div className="login-container">
      <div className="a-center">
        <h2>Регистрация</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Введите код из SMS или дождитесь звонка
      </div>

      <div className="a-center fs-14 mt-2 mb-2">
        <b>{formatPhoneDisplay(auth.registrationData.call_phone || '')}</b>
      </div>

      {/* PIN код */}
      <div className="mt-1">
        <div className="pin-input-container">
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={pin[index] || ''}
              onChange={(e) => handlePinChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              data-pin-index={index}
              className="pin-input"
            />
          ))}
        </div>
      </div>

      <FormButtons
        onNext={handleCall}
        nextText="Проверить"
        loading={auth.isLoading}
      />

      <NavigationLinks links={navigationLinks} />
    </div>
  )
}

// ======================
// ШАГ 3: УСТАНОВКА ПАРОЛЯ
// ======================

const StepSetPassword: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleSave = useCallback(() => {
    auth.submitRegistrationStep()
  }, [auth])

  const handlePasswordBlur = useCallback(() => {
    if (auth.formData.password) {
      auth.validateField('password', auth.formData.password)
    }
  }, [auth])

  const handlePassword1Blur = useCallback(() => {
    if (auth.formData.password1) {
      auth.validateField('password1', auth.formData.password1)
      
      if (auth.formData.password && auth.formData.password1) {
        if (auth.formData.password !== auth.formData.password1) {
          auth.updateFormData('password1Error', 'Пароли не совпадают')
        } else {
          auth.updateFormData('password1Error', '')
        }
      }
    }
  }, [auth])

  const passwordsMatch = auth.formData.password && auth.formData.password1 && 
                        auth.formData.password === auth.formData.password1

  const navigationLinks = [{
    text: 'Есть аккаунт? Авторизироваться',
    onClick: auth.showLoginForm
  }]

  return (
    <div className="login-container">
      <div className="a-center">
        <h2>Регистрация</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Сделайте пароль и подтвердите его
      </div>

      {/* Пароль */}
      <div className="mt-1">
        <PasswordInput
          placeholder="Пароль"
          value={auth.formData.password || ''}
          onChange={(value) => auth.updateFormData('password', value)}
          onBlur={handlePasswordBlur}
          error={auth.formErrors.password}
          autocomplete="new-password"
        />
      </div>

      {/* Подтверждение пароля */}
      <div className="mt-1">
        <PasswordInput
          placeholder="Подтверждение"
          value={auth.formData.password1 || ''}
          onChange={(value) => auth.updateFormData('password1', value)}
          onBlur={handlePassword1Blur}
          error={auth.formErrors.password1 || auth.formData.password1Error}
          autocomplete="new-password"
        />
      </div>

      <FormButtons
        onNext={handleSave}
        nextText="Сохранить"
        disabled={!passwordsMatch}
        loading={auth.isLoading}
      />

      <NavigationLinks links={navigationLinks} />
    </div>
  )
}

// ======================
// ГЛАВНЫЙ КОМПОНЕНТ РЕГИСТРАЦИИ
// ======================

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ auth }) => {
  const steps = [
    <RoleSelector auth={auth} />,        // Шаг 0: Выбор роли
    <StepPersonalInfo auth={auth} />,    // Шаг 1: Личные данные  
    <StepVerification auth={auth} />,    // Шаг 2: Верификация
    <StepSetPassword auth={auth} />      // Шаг 3: Пароль
  ]

  return (
    <div className="container">
        {/* <ProgressBar current={auth.registrationStep} total={3} /> */}
        {steps[auth.registrationStep]}
    </div>
  )
}
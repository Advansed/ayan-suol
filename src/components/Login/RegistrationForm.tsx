/**
 * Форма регистрации + все шаги в одном файле
 */

import React, { useCallback } from 'react'
import { IonCard } from '@ionic/react'
import { UseAuthReturn } from './types'
import { 
  MaskedInput, 
  TextInput, 
  PasswordInput, 
  ProgressBar, 
  FormButtons, 
  NavigationLinks 
} from './SharedComponents'
import { formatPhoneDisplay } from './utils'

interface RegistrationFormProps {
  auth: UseAuthReturn
}

// ======================
// ШАГ 1: ЛИЧНЫЕ ДАННЫЕ
// ======================

const StepPersonalInfo: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleNext = useCallback(() => {
    auth.updateRegistrationData('phone', auth.formData.phone || '')
    auth.updateRegistrationData('name', auth.formData.name || '')
    auth.updateRegistrationData('email', auth.formData.email || '')
    
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
    <div className="step-personal-info">
      <div className="a-center">
        <h2>Регистрация</h2>
      </div>

      {/* Телефон */}
      <MaskedInput
        placeholder="+7 (XXX) XXX-XXXX"
        value={auth.formData.phone || ''}
        onChange={(value) => auth.updateFormData('phone', value)}
        onBlur={handlePhoneBlur}
        error={auth.formErrors.phone}
      />

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

  const navigationLinks = [{
    text: 'Есть аккаунт? Авторизироваться',
    onClick: auth.showLoginForm
  }]

  return (
    <div className="step-verification">
      <div className="a-center">
        <h2>Регистрация</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Для верификации номера позвоните по этот бесплатный номер
      </div>

      <div className="a-center fs-14 mt-2 mb-2">
        <b>{formatPhoneDisplay(auth.registrationData.call_phone || '')}</b>
      </div>

      <FormButtons
        onNext={handleCall}
        nextText="Позвонить"
        loading={auth.isLoading}
      />

      <NavigationLinks links={navigationLinks} />
    </div>
  )
}

// ======================
// ШАГ 3: ПОДТВЕРЖДЕНИЕ ЗВОНКА
// ======================

const StepConfirmCall: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleCheck = useCallback(() => {
    auth.submitRegistrationStep()
  }, [auth])

  const navigationLinks = [{
    text: 'Есть аккаунт? Авторизироваться',
    onClick: auth.showLoginForm
  }]

  return (
    <div className="step-confirm">
      <div className="a-center">
        <h2>Регистрация</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Надо проверить результаты верификации
      </div>

      <div className="a-center fs-14 mt-2 mb-2">
        <b>{formatPhoneDisplay(auth.registrationData.call_phone || '')}</b>
      </div>

      <FormButtons
        onNext={handleCheck}
        nextText="Проверить"
        loading={auth.isLoading}
      />

      <NavigationLinks links={navigationLinks} />
    </div>
  )
}

// ======================
// ШАГ 4: УСТАНОВКА ПАРОЛЯ
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
      
      // Проверяем совпадение паролей
      if (auth.formData.password && auth.formData.password1) {
        if (auth.formData.password !== auth.formData.password1) {
          auth.updateFormData('password1Error', 'Пароли не совпадают')
        } else {
          auth.updateFormData('password1Error', '')
        }
      }
    }
  }, [auth])

  const navigationLinks = [{
    text: 'Есть аккаунт? Авторизироваться',
    onClick: auth.showLoginForm
  }]

  const passwordsMatch = auth.formData.password && auth.formData.password1 && 
                        auth.formData.password === auth.formData.password1

  return (
    <div className="step-password">
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
    <StepPersonalInfo key="personal" auth={auth} />,
    <StepVerification key="verification" auth={auth} />,
    <StepConfirmCall key="confirm" auth={auth} />,
    <StepSetPassword key="password" auth={auth} />
  ]

  return (
    <div className="container">
      <IonCard className="login-container">
        {/* Прогресс-бар */}
        <ProgressBar current={auth.registrationStep} total={4} />
        
        {/* Текущий шаг */}
        {steps[auth.registrationStep]}
      </IonCard>
    </div>
  )
}
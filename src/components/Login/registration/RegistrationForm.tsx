/**
 * Форма регистрации + все шаги в одном файле
 */

import React, { useCallback, useState } from 'react'
import { IonCard } from '@ionic/react'
import { useReg, UseRegReturn } from './useReg'
import { 
  MaskedInput, 
  TextInput, 
  PasswordInput, 
  ProgressBar, 
  FormButtons, 
  NavigationLinks 
} from '../SharedComponents'
import styles from '../../Profile/components/Agreements/Agreements.module.css'
import EULA from './eula'

interface RegistrationFormProps {
  onLoginForm?: () => void
  onRecoveryForm?: () => void
}

// Утилита для форматирования телефона
const formatPhoneDisplay = (phone: string): string => {
  if (!phone || phone.length < 10) return phone
  return `${phone.substring(0, 2)} (${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8, 10)}-${phone.substring(10)}`
}

// ======================
// ШАГ 0: ВЫБОР РОЛИ
// ======================

const RoleSelector: React.FC<{ reg: UseRegReturn }> = ({ reg }) => {
  const handleNext = useCallback(() => {
    if (reg.formData.userType) {
      reg.updateRegistrationData('userType', reg.formData.userType)
      reg.nextStep()
    }
  }, [reg])
   const [showAgreement, setShowAgreement] = useState(false)

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
            className={`role-button ${reg.formData.userType === '1' ? 'selected' : ''}`}
            onClick={() => reg.updateFormData('userType', '1')}
          >
            <div className="role-icon">📦</div>
            <div>Заказчик</div>
          </button>
          <button
            type="button"
            className={`role-button ${reg.formData.userType === '2' ? 'selected' : ''}`}
            onClick={() => reg.updateFormData('userType', '2')}
          >
            <div className="role-icon">🚛</div>
            <div>Водитель</div>
          </button>
        </div>
      </div>

{/* Чекбокс согласия с пользовательским соглашением */}
      <div className="mt-3">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={reg.formData.agreementAccepted || false}
            onChange={(e) => reg.updateFormData('agreementAccepted', e.target.checked)}
            className="mt-1 flex-shrink-0"
          />
          <span>
            Я принимаю условия{' '}
            <button
              type="button"
              className="text-blue-600 underline hover:text-blue-800"
              onClick={() => setShowAgreement(true)}
            >
              Пользовательского соглашения
            </button>
          </span>
        </label>
        {reg.formErrors.agreementAccepted && (
          <div className="text-red-500 text-xs mt-1">{reg.formErrors.agreementAccepted}</div>
        )}
      </div>

      <FormButtons
        onNext={handleNext}
        nextText="Далее"
        disabled={!reg.formData.userType}
        loading={reg.isLoading}
      />


      {showAgreement && (
        <div className={styles.modalOverlay} onClick={() => setShowAgreement(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowAgreement(false)}>
              ×
            </button>
            <EULA />
          </div>
        </div>
      )}
    </div>
  )
}

// ======================
// ШАГ 1: ЛИЧНЫЕ ДАННЫЕ
// ======================

const StepPersonalInfo: React.FC<{ reg: UseRegReturn }> = ({ reg }) => {
  const handleNext = useCallback(() => {
    reg.submitStep()
  }, [reg])

  const handlePhoneBlur = useCallback(() => {
    if (reg.formData.phone) {
      reg.validateField('phone', reg.formData.phone)
    }
  }, [reg])

  const handleNameBlur = useCallback(() => {
    if (reg.formData.name) {
      reg.validateField('name', reg.formData.name)
    }
  }, [reg])

  const handleEmailBlur = useCallback(() => {
    if (reg.formData.email) {
      reg.validateField('email', reg.formData.email)
    }
  }, [reg])

  const handlePartnerBlur = useCallback(() => {
    if (reg.formData.partner) {
      reg.validateField('partner', reg.formData.partner)
    }
  }, [reg])

  return (
    <div className="login-container">
      <div className="a-center">
        <h2>Регистрация</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Заполните ваши данные для регистрации
      </div>

      {/* Телефон */}
      <div className="mt-1">
        <MaskedInput
          placeholder="+7 (XXX) XXX-XXXX"
          value={reg.formData.phone || ''}
          onChange={(value) => reg.updateFormData('phone', value)}
          onBlur={handlePhoneBlur}
          error={reg.formErrors.phone}
        />
      </div>

      {/* ФИО */}
      <div className="mt-1">
        <TextInput
          placeholder="ФИО"
          value={reg.formData.name || ''}
          onChange={(value) => reg.updateFormData('name', value)}
          onBlur={handleNameBlur}
          error={reg.formErrors.name}
        />
      </div>

      {/* Email (необязательно) */}
      <div className="mt-1">
        <TextInput
          placeholder="Email (необязательно)"
          value={reg.formData.email || ''}
          onChange={(value) => reg.updateFormData('email', value)}
          onBlur={handleEmailBlur}
          error={reg.formErrors.email}
        />
      </div>

      <FormButtons
        onNext={handleNext}
        onBack={reg.prevStep}
        nextText="Зарегистрироваться"
        disabled={!reg.formData.phone?.trim() || !reg.formData.name?.trim()}
        loading={reg.isLoading}
      />
      
    </div>
  )
}

// ======================
// ШАГ 2: ПОДТВЕРЖДЕНИЕ SMS
// ======================

const StepVerification: React.FC<{ reg: UseRegReturn }> = ({ reg }) => {
  const [pin, setPin] = React.useState(['', '', '', ''])

  React.useEffect(() => {
    const pinString = pin.join('')
    reg.updateFormData('pincode', pinString)
  }, [pin]) // Убрать reg из зависимостей

  const handlePinChange = (value: string, index: number) => {
    const newPin = [...pin]
    newPin[index] = value.slice(-1) // Только последний символ
    setPin(newPin)
    
    // Автофокус на следующее поле
    if (value && index < 3) {
      const nextInput = document.querySelector(`input[data-pin-index="${index + 1}"]`) as HTMLInputElement
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-pin-index="${index - 1}"]`) as HTMLInputElement
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  const handleCall = useCallback(() => {
    reg.submitStep()
  }, [reg])

  return (
    <div className="login-container">
      <div className="a-center">
        <h2>Подтверждение</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Введите код из SMS или дождитесь звонка
      </div>

      <div className="a-center fs-14 mt-2 mb-2">
        <b>{formatPhoneDisplay(reg.registrationData.call_phone || '')}</b>
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
        onBack={reg.prevStep}
        nextText="Проверить"
        loading={reg.isLoading}
      />
    </div>
  )
}

// ======================
// ШАГ 3: УСТАНОВКА ПАРОЛЯ
// ======================

const StepSetPassword: React.FC<{ reg: UseRegReturn }> = ({ reg }) => {
  const handleSave = useCallback(() => {
    reg.submitStep()
  }, [reg])

  const handlePasswordBlur = useCallback(() => {
    if (reg.formData.password) {
      reg.validateField('password', reg.formData.password)
    }
  }, [reg])

  const handlePassword1Blur = useCallback(() => {
    if (reg.formData.password1) {
      reg.validateField('password1', reg.formData.password1)
      
      if (reg.formData.password && reg.formData.password1) {
        if (reg.formData.password !== reg.formData.password1) {
          reg.updateFormData('password1Error', 'Пароли не совпадают')
        } else {
          reg.updateFormData('password1Error', '')
        }
      }
    }
  }, [reg])

  const passwordsMatch = reg.formData.password && reg.formData.password1 && 
                        reg.formData.password === reg.formData.password1

  return (
    <div className="login-container">
      <div className="a-center">
        <h2>Создание пароля</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Создайте пароль и подтвердите его
      </div>

      {/* Пароль */}
      <div className="mt-1">
        <PasswordInput
          placeholder="Пароль"
          value={reg.formData.password || ''}
          onChange={(value) => reg.updateFormData('password', value)}
          onBlur={handlePasswordBlur}
          error={reg.formErrors.password}
          autocomplete="new-password"
        />
      </div>

      {/* Подтверждение пароля */}
      <div className="mt-1">
        <PasswordInput
          placeholder="Подтверждение"
          value={reg.formData.password1 || ''}
          onChange={(value) => reg.updateFormData('password1', value)}
          onBlur={handlePassword1Blur}
          error={reg.formErrors.password1 || reg.formData.password1Error}
          autocomplete="new-password"
        />
      </div>

      <FormButtons
        onNext={handleSave}
        onBack={reg.prevStep}
        nextText="Сохранить"
        disabled={!passwordsMatch}
        loading={reg.isLoading}
      />
    </div>
  )
}

// ======================
// ГЛАВНЫЙ КОМПОНЕНТ РЕГИСТРАЦИИ
// ======================

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onLoginForm, onRecoveryForm }) => {
  const reg = useReg()
  
  const steps = [
    <RoleSelector reg={reg} />,        // Шаг 0: Выбор роли
    <StepPersonalInfo reg={reg} />,    // Шаг 1: Личные данные  
    <StepVerification reg={reg} />,    // Шаг 2: Верификация
    <StepSetPassword reg={reg} />      // Шаг 3: Пароль
  ]

  const navigationLinks = [
    ...(onLoginForm ? [{
      text: 'Есть аккаунт? Авторизироваться',
      onClick: onLoginForm
    }] : []),
    ...(onRecoveryForm ? [{
      text: 'Забыли пароль? Восстановить',
      onClick: onRecoveryForm
    }] : [])
  ]

  return (
    <div className="container">
      <IonCard className="login-container">
        {/* Показываем ошибки */}
        {reg.error && (
          <div className="error-alert">
            <div className="error-message">{reg.error}</div>
            <button onClick={reg.clearErrors}>×</button>
          </div>
        )}
        
        {/* Прогресс бар */}
        <ProgressBar current={reg.registrationStep} total={4} />
        
        {/* Текущий шаг */}
        {steps[reg.registrationStep]}
        
        {/* Навигационные ссылки на последнем шаге */}
        {reg.registrationStep === 3 && navigationLinks.length > 0 && (
          <NavigationLinks links={navigationLinks} />
        )}
      </IonCard>
    </div>
  )
}

export default RegistrationForm
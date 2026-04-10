/**
 * Форма регистрации + все шаги в одном файле
 */

import React, { useCallback, memo, lazy, Suspense, useState, useRef } from 'react'
import { IonCard } from '@ionic/react'
import {
  MaskedInput,
  TextInput,
  PasswordInput,
  FormButtons,
  NavigationLinks
} from '../SharedComponents'
import { useReg, UseRegReturn } from './hooks/useReg'
import { loginActions } from '../../../Store/loginStore'
import { useEULA, UseEULAReturn } from './hooks/useEULA'
import type { OtpTransport } from '../otpTransport'

const EULA = lazy(() => import('./eula'))

interface RegistrationFormProps {
  onSwitchToLogin?: () => void
  onSwitchToRecovery?: () => void
}

// ======================
// ШАГ 0: ВЫБОР РОЛИ
// ======================

const RoleSelector: React.FC<{
  reg: UseRegReturn,
  eula: UseEULAReturn
}> = memo(({ reg, eula }) => {

  const handleNext = () => {
    // Проверяем соглашение перед переходом
    const eulaError = eula.validateEULA()
    if (eulaError) {
      reg.updateFormData('agreementError', eulaError)
      return
    }

    if (reg.formData.userType) {
      loginActions.updateUser({ user_type: Number(reg.formData.userType) })
      reg.updateFormData('agreementAccepted', eula.isEULAAccepted)
      reg.nextStep()
    }
  }

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
            checked={eula.isEULAAccepted}
            onChange={(e) => {
              eula.setEULAAccepted(e.target.checked)
              reg.updateFormData('agreementAccepted', e.target.checked)
              reg.updateFormData('agreementError', '')
            }}
            className="mt-1 flex-shrink-0"
          />
          <span>
            Я принимаю условия{' '}
            <button
              type="button"
              className="ml-05 t-underline text-blue-600 hover:text-blue-800"
              onClick={eula.openEULA}
            >
              Пользовательского соглашения
            </button>
          </span>
        </label>
        {reg.formData.agreementError && (
          <div className="text-red-500 text-xs mt-1">{reg.formData.agreementError}</div>
        )}
      </div>

      <FormButtons
        onNext={handleNext}
        nextText="Далее"
        disabled={!reg.formData.userType || !eula.isEULAAccepted}
        loading={reg.isLoading}
      />
    </div>
  )
})

// ======================
// ШАГ 1: ЛИЧНЫЕ ДАННЫЕ
// ======================

const StepPersonalInfo: React.FC<{ reg: UseRegReturn }> = memo(({ reg }) => {
  const otpTransport: OtpTransport =
    reg.formData.otpTransport === 'telegram' ? 'telegram' : 'sms'

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
          placeholder="Телефон: +7… или международный +…"
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

      <div className="mt-2">
        <div className="fs-11 a-center mb-1">Как получить код подтверждения?</div>
        <div className="role-selection-buttons">
          <button
            type="button"
            className={`role-button ${otpTransport === 'sms' ? 'selected' : ''}`}
            onClick={() => reg.updateFormData('otpTransport', 'sms')}
          >
            <div className="role-icon">💬</div>
            <div>SMS</div>
          </button>
          <button
            type="button"
            className={`role-button ${otpTransport === 'telegram' ? 'selected' : ''}`}
            onClick={() => reg.updateFormData('otpTransport', 'telegram')}
          >
            <div className="role-icon">✈️</div>
            <div>Telegram</div>
          </button>
        </div>
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
})

// ======================
// ШАГ 2: ПОДТВЕРЖДЕНИЕ SMS
// ======================

const StepVerification: React.FC<{ reg: UseRegReturn }> = memo(({ reg }) => {
  const otpTransport: OtpTransport =
    reg.formData.otpTransport === 'telegram' ? 'telegram' : 'sms'

  const [pin, setPin] = useState(['', '', '', '']);

  // Создаем массив рефов для прямого управления фокусом без поиска по DOM
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = useCallback((value: string, index: number) => {
    const digits = value.replace(/\D/g, '')
    const newPin = [...pin]

    if (digits.length === 0) {
      newPin[index] = ''
    } else if (digits.length === 1) {
      newPin[index] = digits
    } else {
      for (let i = 0; i < digits.length && index + i < 4; i++) {
        newPin[index + i] = digits[i]!
      }
    }

    setPin(newPin)
    reg.updateFormData('pincode', newPin.join(''))

    if (digits.length > 0) {
      const firstEmpty = newPin.findIndex((c) => c === '')
      requestAnimationFrame(() => {
        if (firstEmpty >= 0) {
          inputRefs.current[firstEmpty]?.focus()
        } else {
          inputRefs.current[3]?.focus()
        }
      })
    }
  }, [reg, pin])

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Возврат на предыдущее поле при удалении
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="login-container">
      <div className="a-center">
        <h2>Подтверждение</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        {otpTransport === 'telegram'
          ? 'Введите код из Telegram'
          : 'Введите код из SMS'}
      </div>

      <div className="mt-1">
        <div className="pin-input-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)} // Привязка рефа
              type="tel" // Вызываем цифровую клавиатуру на мобильных
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              autoCapitalize="off"
              spellCheck={false}
              maxLength={1}
              value={pin[index]}
              onChange={(e) => handlePinChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="pin-input"
              style={{
                width: '45px',
                height: '50px',
                textAlign: 'center',
                fontSize: '20px',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
            />
          ))}
        </div>
      </div>

      <FormButtons
        onNext={() => reg.submitStep()}
        onBack={reg.prevStep}
        nextText="Проверить"
        loading={reg.isLoading}
        disabled={pin.some(d => d === '')} // Кнопка активна только при полном заполнении
      />
    </div>
  );
});

// ======================
// ШАГ 3: УСТАНОВКА ПАРОЛЯ
// ======================

const StepSetPassword: React.FC<{ reg: UseRegReturn, toLogin: (() => void) | undefined }> = memo(({ reg, toLogin }) => {
  const handleSave = useCallback(() => {
    reg.submitStep()
    toLogin?.()
  }, [reg, toLogin])

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
})

// ======================
// ГЛАВНЫЙ КОМПОНЕНТ РЕГИСТРАЦИИ
// ======================

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSwitchToLogin, onSwitchToRecovery }) => {
  const reg = useReg()
  const eula = useEULA(false)

  const navigationLinks = [
    ...(onSwitchToLogin ? [{ text: 'Есть аккаунт? Авторизироваться', onClick: onSwitchToLogin }] : []),
    ...(onSwitchToRecovery ? [{ text: 'Забыли пароль? Восстановить', onClick: onSwitchToRecovery }] : [])
  ]

  const renderStep = () => {
    switch (reg.registrationStep) {
      case 0: return <RoleSelector reg={reg} eula={eula} />
      case 1: return <StepPersonalInfo reg={reg} />
      case 2: return <StepVerification reg={reg} />
      case 3: return <StepSetPassword reg={reg} toLogin={onSwitchToLogin} />
      default: return null
    }
  }

  return (
    <div className="container">
      <IonCard className="login-container">
        {renderStep()}
        {reg.registrationStep === 3 && navigationLinks.length > 0 && (
          <NavigationLinks links={navigationLinks} />
        )}
        {reg.registrationStep !== 3 && onSwitchToLogin && (
          <div className="ml-3 pb-1" onClick={onSwitchToLogin} role="button" tabIndex={0}>
            Есть аккаунт? Авторизироваться
          </div>
        )}
      </IonCard>
      <Suspense fallback={null}>
        <EULA
          check={eula.isEULAAccepted}
          onClose={eula.closeEULA}
          isOpen={eula.isEULAOpen}
          setCheck={eula.setEULAAccepted}
        />
      </Suspense>
    </div>
  )
}

export default RegistrationForm
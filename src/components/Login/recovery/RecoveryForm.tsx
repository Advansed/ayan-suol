import React from 'react'
import { IonCard } from '@ionic/react'
import { useRecovery } from './hooks/useRecovery'
import type { OtpTransport } from '../otpTransport'
import {
  MaskedInput,
  PasswordInput,
  FormButtons,
  NavigationLinks,
  ProgressBar
} from '../SharedComponents'

interface RecoveryFormProps {
  onSwitchToLogin: () => void
  onSwitchToRegister: () => void
}

// ======================
// ШАГ 1: ВВОД ТЕЛЕФОНА
// ======================

const StepPhone: React.FC<{
  recovery: ReturnType<typeof useRecovery>
  onSwitchToLogin: () => void
  onSwitchToRegister: () => void
}> = ({ recovery, onSwitchToLogin, onSwitchToRegister }) => {
  const otpTransport: OtpTransport =
    recovery.formData.transport === 'telegram' ? 'telegram' : 'sms'

  const handleSubmit = () => {
    recovery.submitRecoveryStep()
  }

  const handlePhoneBlur = () => {
    if (recovery.formData.phone) {
      recovery.validateField('phone', recovery.formData.phone)
    }
  }

  return (
    <>
      <div className="a-center">
        <h2>Восстановление пароля</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        Введите номер телефона, привязанный к вашему аккаунту
      </div>

      <MaskedInput
        placeholder="Телефон: +7… или международный +…"
        value={recovery.formData.phone || ''}
        onChange={(value) => recovery.updateFormData('phone', value)}
        onBlur={handlePhoneBlur}
        error={recovery.errors.phone}
      />

      <div className="mt-2">
        <div className="fs-11 a-center mb-1">Как получить код?</div>
        <div className="role-selection-buttons">
          <button
            type="button"
            className={`role-button ${otpTransport === 'sms' ? 'selected' : ''}`}
            onClick={() => recovery.updateFormData('transport', 'sms')}
          >
            <div className="role-icon">💬</div>
            <div>SMS</div>
          </button>
          <button
            type="button"
            className={`role-button ${otpTransport === 'telegram' ? 'selected' : ''}`}
            onClick={() => recovery.updateFormData('transport', 'telegram')}
          >
            <div className="role-icon">✈️</div>
            <div>Telegram</div>
          </button>
        </div>
      </div>

      <FormButtons
        onNext={handleSubmit}
        nextText="Далее"
        loading={recovery.isLoading}
        disabled={!recovery.formData.phone?.trim()}
      />

      <NavigationLinks
        links={[
          { text: 'Вспомнили пароль? Авторизироваться', onClick: onSwitchToLogin },
          { text: 'Нет аккаунта? Регистрация', onClick: onSwitchToRegister }
        ]}
      />
    </>
  )
}

// ======================
// ШАГ 2: КОД ИЗ SMS / TELEGRAM
// ======================

const StepOtp: React.FC<{
  recovery: ReturnType<typeof useRecovery>
  onSwitchToLogin: () => void
}> = ({ recovery, onSwitchToLogin }) => {
  const [pin, setPin] = React.useState(['', '', '', ''])
  const pinRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handlePinChange = (value: string, index: number) => {
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
    recovery.updateFormData('pincode', newPin.join(''))

    if (digits.length > 0) {
      const firstEmpty = newPin.findIndex((c) => c === '')
      requestAnimationFrame(() => {
        if (firstEmpty >= 0) {
          pinRefs.current[firstEmpty]?.focus()
        } else {
          pinRefs.current[3]?.focus()
        }
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = () => {
    recovery.submitRecoveryStep()
  }

  return (
    <>
      <div className="a-center">
        <h2>Восстановление пароля</h2>
      </div>

      <div className="fs-11 a-center mb-2">
        {recovery.otpTransport === 'telegram'
          ? 'Введите код из Telegram'
          : 'Введите код из SMS'}
      </div>

      <div className="mt-1">
        <div className="pin-input-container">
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              ref={(el) => {
                pinRefs.current[index] = el
              }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              autoCapitalize="off"
              spellCheck={false}
              maxLength={1}
              value={pin[index] || ''}
              onChange={(e) => handlePinChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="pin-input"
            />
          ))}
        </div>
        {recovery.errors.sms && (
          <div className="text-red-500 text-xs mt-2 text-center">{recovery.errors.sms}</div>
        )}
      </div>

      <FormButtons
        onNext={handleSubmit}
        onBack={recovery.prevStep}
        nextText="Проверить"
        disabled={pin.join('').length !== 4}
        loading={recovery.isLoading}
      />

      <NavigationLinks
        links={[{ text: 'Вспомнили пароль? Авторизироваться', onClick: onSwitchToLogin }]}
      />
    </>
  )
}

// ======================
// ШАГ 3: НОВЫЙ ПАРОЛЬ
// ======================

const StepNewPassword: React.FC<{
  recovery: ReturnType<typeof useRecovery>
  onSwitchToLogin: () => void
}> = ({ recovery, onSwitchToLogin }) => {
  const handleSubmit = () => {
    recovery.submitRecoveryStep()
  }

  const handlePasswordBlur = () => {
    if (recovery.formData.password) {
      recovery.validateField('password', recovery.formData.password)
    }
  }

  const handlePassword1Blur = () => {
    if (recovery.formData.password1) {
      recovery.validateField('password1', recovery.formData.password1)
    }
  }

  const match =
    recovery.formData.password &&
    recovery.formData.password1 &&
    recovery.formData.password === recovery.formData.password1

  return (
    <>
      <div className="a-center">
        <h2>Новый пароль</h2>
      </div>

      <div className="fs-11 a-center mb-2">Придумайте новый пароль для входа</div>

      <div className="mt-1">
        <PasswordInput
          placeholder="Новый пароль"
          value={recovery.formData.password || ''}
          onChange={(value) => recovery.updateFormData('password', value)}
          onBlur={handlePasswordBlur}
          error={recovery.errors.password}
          autocomplete="new-password"
        />
      </div>

      <div className="mt-1">
        <PasswordInput
          placeholder="Подтверждение пароля"
          value={recovery.formData.password1 || ''}
          onChange={(value) => recovery.updateFormData('password1', value)}
          onBlur={handlePassword1Blur}
          error={recovery.errors.password1}
          autocomplete="new-password"
        />
      </div>

      <FormButtons
        onNext={handleSubmit}
        onBack={recovery.prevStep}
        nextText="Сохранить пароль"
        disabled={!match}
        loading={recovery.isLoading}
      />

      <NavigationLinks
        links={[{ text: 'Вспомнили пароль? Авторизироваться', onClick: onSwitchToLogin }]}
      />
    </>
  )
}

// ======================
// ГЛАВНЫЙ КОМПОНЕНТ
// ======================

export const RecoveryForm: React.FC<RecoveryFormProps> = ({
  onSwitchToLogin,
  onSwitchToRegister
}) => {
  const recovery = useRecovery(onSwitchToLogin)

  const steps = [
    <StepPhone
      key="phone"
      recovery={recovery}
      onSwitchToLogin={onSwitchToLogin}
      onSwitchToRegister={onSwitchToRegister}
    />,
    <StepOtp key="otp" recovery={recovery} onSwitchToLogin={onSwitchToLogin} />,
    <StepNewPassword key="password" recovery={recovery} onSwitchToLogin={onSwitchToLogin} />
  ]

  return (
    <div className="container">
      <IonCard className="login-container">
        <ProgressBar current={recovery.recoveryStep} total={3} />
        {steps[recovery.recoveryStep]}
      </IonCard>
    </div>
  )
}

export default RecoveryForm

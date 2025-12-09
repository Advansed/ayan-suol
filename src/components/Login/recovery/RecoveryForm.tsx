import React from 'react'
import { IonCard } from '@ionic/react'
import { useRecovery } from './hooks/useRecovery'
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
  
  const handleSubmit = () => {
    recovery.submitRecoveryStep()
  }

  const handlePhoneBlur = () => {
    if (recovery.recoveryData.phone) {
      recovery.validateField('phone', recovery.recoveryData.phone)
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
        placeholder="+7 (XXX) XXX-XXXX"
        value={recovery.recoveryData.phone || ''}
        onChange={(value) => recovery.updateRecoveryData('phone', value)}
        onBlur={handlePhoneBlur}
        error={recovery.errors.phone}
      />

      <FormButtons 
        onNext={handleSubmit} 
        nextText="Восстановить пароль" 
        loading={recovery.isLoading}
        disabled={!recovery.recoveryData.phone?.trim()}
      />
      
      <NavigationLinks links={[
        { text: 'Вспомнили пароль? Авторизироваться', onClick: onSwitchToLogin },
        { text: 'Нет аккаунта? Регистрация', onClick: onSwitchToRegister }
      ]} />
    </>
  )
}

// ======================
// ШАГ 2: ПОДТВЕРЖДЕНИЕ SMS
// ======================

const StepSmsAndPassword: React.FC<{ 
  recovery: ReturnType<typeof useRecovery>
  onSwitchToLogin: () => void
}> = ({ recovery, onSwitchToLogin }) => {
  const [pin, setPin] = React.useState(['', '', '', ''])

  // Используем useCallback для стабильной функции
  const updateSmsCode = React.useCallback((smsCode: string) => {
    recovery.updateRecoveryData('sms', smsCode)
  }, [recovery])

  // Фиксируем useEffect с правильными зависимостями
  React.useEffect(() => {
    const smsCode = pin.join('')
    if (smsCode.length === 4) {
      updateSmsCode(smsCode)
    }
  }, [pin ]) // Только pin и updateSmsCode в зависимостях

  const handlePinChange = (value: string, index: number) => {
    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)
    
    // Также обновляем recoveryData сразу при изменении
    const smsCode = newPin.join('')
    recovery.updateRecoveryData('sms', smsCode)
    
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

  const handleSubmit = () => {
    recovery.submitRecoveryStep()
  }

  const handlePasswordBlur = () => {
    if (recovery.recoveryData.password) {
      recovery.validateField('password', recovery.recoveryData.password)
    }
  }

  const handlePassword1Blur = () => {
    if (recovery.recoveryData.password1) {
      recovery.validateField('password1', recovery.recoveryData.password1)
    }
  }

  const isFormValid = pin.join('').length === 4 && 
                     recovery.recoveryData.password && 
                     recovery.recoveryData.password1 && 
                     recovery.recoveryData.password === recovery.recoveryData.password1

  return (
    <>
      <div className="a-center">
        <h2>Восстановление пароля</h2>
      </div>
      
      <div className="fs-11 a-center mb-2">
        Введите код из SMS и новый пароль
      </div>

      {/* SMS код */}
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
        {recovery.errors.sms && (
          <div className="text-red-500 text-xs mt-2 text-center">
            {recovery.errors.sms}
          </div>
        )}
      </div>

      {/* Пароль */}
      <div className="mt-1">
        <PasswordInput
          placeholder="Новый пароль"
          value={recovery.recoveryData.password || ''}
          onChange={(value) => recovery.updateRecoveryData('password', value)}
          onBlur={handlePasswordBlur}
          error={recovery.errors.password}
          autocomplete="new-password"
        />
      </div>

      {/* Подтверждение пароля */}
      <div className="mt-1">
        <PasswordInput
          placeholder="Подтверждение пароля"
          value={recovery.recoveryData.password1 || ''}
          onChange={(value) => recovery.updateRecoveryData('password1', value)}
          onBlur={handlePassword1Blur}
          error={recovery.errors.password1}
          autocomplete="new-password"
        />
      </div>

      <FormButtons 
        onNext={handleSubmit}
        onBack={recovery.prevStep}
        nextText="Сохранить пароль"
        disabled={!isFormValid}
        loading={recovery.isLoading}
      />

      <NavigationLinks links={[
        { text: 'Вспомнили пароль? Авторизироваться', onClick: onSwitchToLogin }
      ]} />
    </>
  )
}


// ======================
// ГЛАВНЫЙ КОМПОНЕНТ ВОССТАНОВЛЕНИЯ
// ======================

export const RecoveryForm: React.FC<RecoveryFormProps> = ({ 
  onSwitchToLogin, 
  onSwitchToRegister 
}) => {
  const recovery = useRecovery( onSwitchToLogin )

   const steps = [
    <StepPhone 
      key="phone" 
      recovery={recovery}
      onSwitchToLogin={onSwitchToLogin}
      onSwitchToRegister={onSwitchToRegister}
    />,
    <StepSmsAndPassword 
      key="sms-password" 
      recovery={recovery}
      onSwitchToLogin={onSwitchToLogin}
    />
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
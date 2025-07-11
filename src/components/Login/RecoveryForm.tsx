/**
 * RecoveryForm.tsx - Форма восстановления пароля
 */

import React from 'react'
import { IonCard } from '@ionic/react'
import { UseAuthReturn } from './types'
import { MaskedInput, PasswordInput, FormButtons, NavigationLinks, ProgressBar } from './SharedComponents'

interface RecoveryFormProps {
  auth: UseAuthReturn
}

// Шаг 1: Ввод телефона
const StepPhone: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleSubmit = () => {
    if (!auth.recoveryData.phone?.trim()) {
      auth.updateRecoveryData('phoneError', 'Введите номер телефона')
      return
    }
    console.log(auth.recoveryData)
    auth.submitRecoveryStep()
  }

  return (
    <>
      <div className="a-center"><h2>Восстановление пароля</h2></div>
      <div className="fs-11 a-center mb-2">Введите номер телефона, привязанный к вашему аккаунту</div>
      
      <MaskedInput
        placeholder="+7 (XXX) XXX-XXXX"
        value={auth.recoveryData.phone || ''}
        onChange={(value) => auth.updateRecoveryData('phone', value)}
        error={auth.formErrors.phone}
      />

      <FormButtons onNext={handleSubmit} nextText="Восстановить пароль" loading={auth.isLoading} />
      
      <NavigationLinks links={[
        { text: 'Вспомнили пароль? Авторизироваться', onClick: auth.showLoginForm },
        { text: 'Нет аккаунта? Регистрация', onClick: auth.showRegisterForm }
      ]} />
    </>
  )
}

// Шаг 2: Подтверждение звонка  
const StepVerifyCall_: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleSubmit = () => auth.submitRecoveryStep()

  return (
    <>
      <div className="a-center"><h2>Подтверждение</h2></div>
      <div className="fs-11 a-center mb-2">
        Мы отправили на ваш номер СМС.<br/>
        Введите полученный СМС для подтверждения вашего номера
      </div>

      <div className="l-input-1">
        <input
          className   = 'w-100'
          placeholder = "0000"
          maxLength   = { 4 }
          value       = { auth.recoveryData.pincode || '' }
          onChange={(e) => auth.updateRecoveryData('pincode', e.target.value)}
        />
      </div>

      <FormButtons 
        onNext={handleSubmit} 
        onBack={auth.prevRecoveryStep}
        nextText="Подтвердить"
        loading={auth.isLoading}
      />
    </>
  )
}

const StepVerifyCall: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleSubmit = () => auth.submitRecoveryStep()
  
  const handlePinChange = (value: string, index: number) => {
    const pin = (auth.recoveryData.pincode || '').split('')
    pin[index] = value.slice(-1) // Только последний символ
    const newPin = pin.join('')
    auth.updateRecoveryData('pincode', newPin)
    
    // Автофокус на следующее поле
    if (value && index < 3) {
      const nextInput = document.querySelector(`input[data-pin-index="${index + 1}"]`) as HTMLInputElement
      nextInput?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-pin-index="${index - 1}"]`) as HTMLInputElement
      prevInput?.focus()
    }
  }

  const pin = (auth.recoveryData.pincode || '').split('')

  return (
    <>
      <div className="a-center"><h2>Подтверждение</h2></div>
      <div className="fs-11 a-center mb-2">
        Мы отправили на ваш номер СМС.<br/>
        Введите полученный СМС для подтверждения вашего номера
      </div>

      <div className="pin-inputs" style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
        {[0,1,2,3].map(i => (
          <input
            key={i}
            data-pin-index={i}
            className="pin-input"
            style={{width: '50px', height: '50px', textAlign: 'center', fontSize: '20px'}}
            maxLength={1}
            value={pin[i] || ''}
            onChange={(e) => handlePinChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>

      <FormButtons 
        onNext={handleSubmit} 
        onBack={auth.prevRecoveryStep}
        nextText="Подтвердить"
        loading={auth.isLoading}
      />
    </>
  )
}
// Шаг 3: Новый пароль
const StepNewPassword: React.FC<{ auth: UseAuthReturn }> = ({ auth }) => {
  const handleSubmit = () => {
    if (auth.recoveryData.password !== auth.recoveryData.password1) {
      auth.updateRecoveryData('password1Error', 'Пароли не совпадают')
      return
    }
    auth.submitRecoveryStep()
  }

  return (
    <>
      <div className="a-center"><h2>Новый пароль</h2></div>
      <div className="fs-11 a-center mb-2">Придумайте новый пароль для входа</div>

      <div className='mt-1'>
        <PasswordInput
          placeholder="Пароль"
          value={auth.formData.password || ''}
          onChange={(value) => auth.updateFormData('password', value)}
          error={auth.formErrors.password}
        />
      </div>

      <div className='mt-1'>
        <PasswordInput
          placeholder="Подтверждение"
          value={auth.formData.password1 || ''}
          onChange={(value) => auth.updateFormData('password1', value)}
          error={auth.formErrors.password1}
        />
      </div>

      <FormButtons 
        onNext={handleSubmit}
        nextText="Сохранить пароль"
        disabled={!auth.formData.password || auth.formData.password !== auth.formData.password1}
        loading={auth.isLoading}
      />
    </>
  )
}

export const RecoveryForm: React.FC<RecoveryFormProps> = ({ auth }) => {
  const steps = [
    <StepPhone key="phone" auth={auth} />,
    <StepVerifyCall key="verify" auth={auth} />,
    <StepNewPassword key="password" auth={auth} />
  ]

  return (
    <div className="container">
      <IonCard className="login-container">
        <ProgressBar current={auth.recoveryStep} total={3} />
        {steps[auth.recoveryStep]}
      </IonCard>
    </div>
  )
}
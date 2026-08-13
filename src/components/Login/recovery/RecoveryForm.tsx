/**
 * Восстановление пароля — тот же auth-стиль, что вход / регистрация
 */

import React, { useRef, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { useRecovery } from './hooks/useRecovery'
import type { OtpTransport } from '../otpTransport'
import { PhoneCountryField } from '../PhoneCountryField'
import '../Login.css'

interface RecoveryFormProps {
  onSwitchToLogin: () => void
  onSwitchToRegister: () => void
}

type RecoveryApi = ReturnType<typeof useRecovery>

// ======================
// ШАГ 0: ТЕЛЕФОН
// ======================

const StepPhone: React.FC<{
  recovery: RecoveryApi
  onSwitchToLogin: () => void
  onSwitchToRegister: () => void
}> = ({ recovery, onSwitchToLogin, onSwitchToRegister }) => {
  const otpTransport: OtpTransport =
    recovery.formData.transport === 'telegram' ? 'telegram' : 'sms'

  const canSubmit = Boolean(recovery.formData.phone?.trim()) && !recovery.isLoading

  return (
    <form
      className="auth-form auth-form-relaxed"
      onSubmit={(e) => {
        e.preventDefault()
        void recovery.submitRecoveryStep()
      }}
    >
      <p className="auth-step-lead">
        Введите номер телефона, привязанный к аккаунту
      </p>

      <div className="auth-fields auth-fields-relaxed">
        <div className="auth-field">
          <PhoneCountryField
            id="recovery-phone"
            value={recovery.formData.phone || ''}
            onChange={(value) => recovery.updateFormData('phone', value)}
            onBlur={() => {
              if (recovery.formData.phone) {
                recovery.validateField('phone', recovery.formData.phone)
              }
            }}
            error={recovery.errors.phone}
          />
        </div>

        <div className="auth-field">
          <div className="auth-label" id="recovery-otp-label">
            Куда отправить код
          </div>
          <div className="auth-otp-tabs" role="tablist" aria-labelledby="recovery-otp-label">
            <button
              type="button"
              role="tab"
              aria-selected={otpTransport === 'sms'}
              className={otpTransport === 'sms' ? 'auth-otp-tab is-active' : 'auth-otp-tab'}
              onClick={() => recovery.updateFormData('transport', 'sms')}
            >
              <MessageSquare size={18} strokeWidth={2} aria-hidden />
              SMS
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={otpTransport === 'telegram'}
              className={otpTransport === 'telegram' ? 'auth-otp-tab is-active' : 'auth-otp-tab'}
              onClick={() => recovery.updateFormData('transport', 'telegram')}
            >
              <Send size={18} strokeWidth={2} aria-hidden />
              Telegram
            </button>
          </div>
          <p className="auth-hint">
            {otpTransport === 'telegram'
              ? 'Код придёт в Telegram на указанный номер'
              : 'Код придёт в текстовом сообщении на номер телефона'}
          </p>
        </div>
      </div>

      {recovery.error && (
        <div className="auth-error auth-error-block">{recovery.error}</div>
      )}

      <div className="auth-form-actions">
        <button type="submit" className="auth-btn-primary" disabled={!canSubmit}>
          {recovery.isLoading ? 'Отправка…' : 'Получить код'}
        </button>
      </div>

      <p className="auth-footer-text">
        — Вспомнили пароль?{' '}
        <button type="button" className="auth-footer-action" onClick={onSwitchToLogin}>
          Войти
        </button>
      </p>
      <p className="auth-footer-text">
        — Нет аккаунта?{' '}
        <button type="button" className="auth-footer-action" onClick={onSwitchToRegister}>
          Регистрация
        </button>
      </p>
    </form>
  )
}

// ======================
// ШАГ 1: КОД
// ======================

const StepOtp: React.FC<{
  recovery: RecoveryApi
  onSwitchToLogin: () => void
}> = ({ recovery, onSwitchToLogin }) => {
  const [pin, setPin] = useState(['', '', '', ''])
  const pinRefs = useRef<(HTMLInputElement | null)[]>([])

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
        if (firstEmpty >= 0) pinRefs.current[firstEmpty]?.focus()
        else pinRefs.current[3]?.focus()
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus()
    }
  }

  return (
    <form
      className="auth-form auth-form-relaxed auth-form-verify"
      onSubmit={(e) => {
        e.preventDefault()
        void recovery.submitRecoveryStep()
      }}
    >
      <p className="auth-step-lead">
        {recovery.otpTransport === 'telegram'
          ? 'Введите код из Telegram'
          : 'Введите код из SMS'}
      </p>
      <p className="auth-hint auth-hint-center">{recovery.formData.phone || ''}</p>

      <div className="auth-pin-row">
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
            className="auth-pin-input"
          />
        ))}
      </div>

      {(recovery.error || recovery.errors.sms) && (
        <div className="auth-error auth-error-block">
          {recovery.error || recovery.errors.sms}
        </div>
      )}

      <div className="auth-form-actions">
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={pin.join('').length !== 4 || recovery.isLoading}
        >
          {recovery.isLoading ? 'Проверка…' : 'Подтвердить'}
        </button>
        <button
          type="button"
          className="auth-btn-secondary auth-btn-spaced"
          onClick={recovery.prevStep}
        >
          Изменить номер
        </button>
      </div>

      <p className="auth-footer-text">
        — Вспомнили пароль?{' '}
        <button type="button" className="auth-footer-action" onClick={onSwitchToLogin}>
          Войти
        </button>
      </p>
    </form>
  )
}

// ======================
// ШАГ 2: НОВЫЙ ПАРОЛЬ
// ======================

const StepNewPassword: React.FC<{
  recovery: RecoveryApi
  onSwitchToLogin: () => void
}> = ({ recovery, onSwitchToLogin }) => {
  const match =
    recovery.formData.password &&
    recovery.formData.password1 &&
    recovery.formData.password === recovery.formData.password1

  return (
    <form
      className="auth-form auth-form-relaxed"
      onSubmit={(e) => {
        e.preventDefault()
        void recovery.submitRecoveryStep()
      }}
    >
      <p className="auth-step-lead">Придумайте новый пароль для входа</p>

      <div className="auth-fields auth-fields-relaxed">
        <div className="auth-field">
          <label className="auth-label" htmlFor="recovery-password">
            Новый пароль
          </label>
          <input
            id="recovery-password"
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="••••"
            value={recovery.formData.password || ''}
            onChange={(e) => recovery.updateFormData('password', e.target.value)}
            onBlur={() => {
              if (recovery.formData.password) {
                recovery.validateField('password', recovery.formData.password)
              }
            }}
          />
          {recovery.errors.password && (
            <div className="auth-error">{recovery.errors.password}</div>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="recovery-password1">
            Подтверждение
          </label>
          <input
            id="recovery-password1"
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="••••"
            value={recovery.formData.password1 || ''}
            onChange={(e) => recovery.updateFormData('password1', e.target.value)}
            onBlur={() => {
              if (recovery.formData.password1) {
                recovery.validateField('password1', recovery.formData.password1)
              }
            }}
          />
          {recovery.errors.password1 && (
            <div className="auth-error">{recovery.errors.password1}</div>
          )}
        </div>
      </div>

      {recovery.error && <div className="auth-error auth-error-block">{recovery.error}</div>}

      <div className="auth-form-actions">
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={!match || recovery.isLoading}
        >
          {recovery.isLoading ? 'Сохранение…' : 'Сохранить пароль'}
        </button>
        <button
          type="button"
          className="auth-btn-secondary auth-btn-spaced"
          onClick={recovery.prevStep}
        >
          Назад
        </button>
      </div>

      <p className="auth-footer-text">
        — Вспомнили пароль?{' '}
        <button type="button" className="auth-footer-action" onClick={onSwitchToLogin}>
          Войти
        </button>
      </p>
    </form>
  )
}

// ======================
// КОРЕНЬ
// ======================

export const RecoveryForm: React.FC<RecoveryFormProps> = ({
  onSwitchToLogin,
  onSwitchToRegister,
}) => {
  const recovery = useRecovery(onSwitchToLogin)

  const titles = ['Восстановление пароля', 'Подтверждение', 'Новый пароль'] as const
  const title = titles[recovery.recoveryStep] ?? 'Восстановление пароля'

  return (
    <div className="auth-page auth-page-reg auth-page-relaxed auth-page-recovery">
      <header className="auth-hero">
        <h1 className="auth-hero-title">{title}</h1>
        <p className="auth-hero-sub">Груз в Рейс / PAITZA</p>
      </header>

      <div className="auth-card auth-card-reg auth-card-relaxed auth-card-recovery">
        {recovery.recoveryStep === 0 && (
          <StepPhone
            recovery={recovery}
            onSwitchToLogin={onSwitchToLogin}
            onSwitchToRegister={onSwitchToRegister}
          />
        )}
        {recovery.recoveryStep === 1 && (
          <StepOtp recovery={recovery} onSwitchToLogin={onSwitchToLogin} />
        )}
        {recovery.recoveryStep === 2 && (
          <StepNewPassword recovery={recovery} onSwitchToLogin={onSwitchToLogin} />
        )}
      </div>
    </div>
  )
}

export default RecoveryForm

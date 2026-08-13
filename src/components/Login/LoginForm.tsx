// src/components/Login/LoginForm.tsx

import React, { useState, useCallback, useEffect } from 'react'
import { parseLoginPhone, validateLoginPhoneRaw } from './phone'
import { PhoneCountryField } from './PhoneCountryField'
import './Login.css'

interface LoginFormProps {
  onLogin: (phone: string, password: string) => Promise<boolean>
  onSwitchToRegister: () => void
  onSwitchToRecovery: () => void
}

interface FormErrors {
  phone?: string
  password?: string
}

const normalizeString = (value: unknown): string => {
  return typeof value === 'string' ? value : (value ?? '').toString()
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onSwitchToRegister,
  onSwitchToRecovery,
}) => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const login = localStorage.getItem('gvrs.login')
    if (login) {
      setPhone(login)
      setPassword(localStorage.getItem('gvrs.password') ?? '')
    }
  }, [])

  const clearError = (field: keyof FormErrors) => {
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    clearError('phone')
  }

  const handlePasswordChange = (value: string) => {
    setPassword(normalizeString(value))
    clearError('password')
  }

  const validate = useCallback(() => {
    const phoneErr = validateLoginPhoneRaw(phone) || undefined
    const pass = normalizeString(password)
    let passwordErr: string | undefined
    if (!pass.trim()) passwordErr = 'Заполните пароль'
    else if (pass.length < 4) passwordErr = 'Пароль должен содержать минимум 4 символа'

    setFormErrors({
      phone: phoneErr,
      password: passwordErr,
    })
    return !phoneErr && !passwordErr
  }, [phone, password])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      if (!validate()) return

      const parsed = parseLoginPhone(phone)
      if (!parsed.ok) {
        setFormErrors((prev) => ({ ...prev, phone: parsed.error }))
        return
      }

      setIsSubmitting(true)
      try {
        await onLogin(parsed.e164, normalizeString(password))
      } finally {
        setIsSubmitting(false)
      }
    },
    [validate, phone, password, onLogin]
  )

  const phoneOk = phone.trim().length > 0 && !formErrors.phone
  const passwordOk = normalizeString(password).trim().length > 0 && !formErrors.password
  const canSubmit = phoneOk && passwordOk && !isSubmitting

  return (
    <div className="auth-page">
      <header className="auth-hero">
        <h1 className="auth-hero-title">Вход в платформу</h1>
        <p className="auth-hero-sub">Груз в Рейс / PAITZA</p>
      </header>

      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <PhoneCountryField
            id="login-phone"
            value={phone}
            onChange={handlePhoneChange}
            error={formErrors.phone}
            onBlur={() => {
              if (phone) {
                const err = validateLoginPhoneRaw(phone)
                setFormErrors((p) => ({ ...p, phone: err || undefined }))
              }
            }}
          />

          <label className="auth-label auth-label-spaced" htmlFor="login-password">
            Пароль
          </label>
          <input
            id="login-password"
            className="auth-input"
            type="password"
            autoComplete="current-password"
            placeholder="••••"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={() => {
              const pass = normalizeString(password)
              if (!pass.trim()) setFormErrors((p) => ({ ...p, password: 'Заполните пароль' }))
              else if (pass.length < 4)
                setFormErrors((p) => ({ ...p, password: 'Пароль должен содержать минимум 4 символа' }))
            }}
          />
          {formErrors.password && <div className="auth-error">{formErrors.password}</div>}

          <button type="button" className="auth-link" onClick={onSwitchToRecovery}>
            Забыли пароль?
          </button>

          <button type="submit" className="auth-btn-primary" disabled={!canSubmit}>
            {isSubmitting ? 'Вход…' : 'Войти'}
          </button>

          <div className="auth-divider" role="separator">
            <span>или</span>
          </div>

          <button type="button" className="auth-btn-secondary" onClick={onSwitchToRegister}>
            Создать аккаунт
          </button>
        </form>
      </div>
    </div>
  )
}

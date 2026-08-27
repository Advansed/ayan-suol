// src/components/Login/Login.tsx

import React, { useState } from 'react'
import { ChevronDown, Lock, ShieldCheck, Truck, User } from 'lucide-react'
import { useLogin } from '../../Store/useLogin'
import { LoginForm } from './LoginForm'
import { LoadingSpinner } from './SharedComponents'
import { RegistrationForm } from './registration'
import './Login.css'
import RecoveryForm from './recovery/RecoveryForm'

type CurrentForm = 'login' | 'register' | 'recovery'

const Login: React.FC = () => {
  const { isLoading, login } = useLogin()
  const [currentForm, setCurrentForm] = useState<CurrentForm>('login')

  const handleLogin = async (phone: string, password: string): Promise<boolean> => {
    return await login(phone, password)
  }

  return (
    <div className="login-root">
      {isLoading && <LoadingSpinner />}

      <div className="login-split">
        <aside className="login-promo" aria-label="О платформе">
          <div className="login-promo-brand">
            <span className="login-logo-mark" aria-hidden>
              <Truck size={22} strokeWidth={2} />
            </span>
            <span>Груз в рейс</span>
          </div>

          <div className="login-promo-body">
            <h1 className="login-promo-title">
              Логистическая платформа для перевозчиков и заказчиков
            </h1>
            <ul className="login-promo-list">
              <li>
                <Lock size={18} strokeWidth={2} aria-hidden />
                Безопасная оплата через эскроу
              </li>
              <li>
                <User size={18} strokeWidth={2} aria-hidden />
                Отслеживание груза на каждом этапе
              </li>
              <li>
                <ShieldCheck size={18} strokeWidth={2} aria-hidden />
                Проверенные перевозчики и заказчики
              </li>
            </ul>
          </div>

          <footer className="login-promo-foot">
            <span>© 2026 Груз в рейс</span>
          </footer>
        </aside>

        <section className="login-panel">
          <button type="button" className="login-lang" aria-label="Язык">
            RU
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          {currentForm === 'login' && (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => setCurrentForm('register')}
              onSwitchToRecovery={() => setCurrentForm('recovery')}
            />
          )}

          {currentForm === 'register' && (
            <RegistrationForm
              onSwitchToLogin={() => setCurrentForm('login')}
              onSwitchToRecovery={() => setCurrentForm('recovery')}
            />
          )}

          {currentForm === 'recovery' && (
            <RecoveryForm
              onSwitchToLogin={() => setCurrentForm('login')}
              onSwitchToRegister={() => setCurrentForm('register')}
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default Login

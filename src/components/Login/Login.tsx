// src/components/Login/Login.tsx

import React, { useState } from 'react'
import { useLogin } from '../../Store/useLogin'
import { LoginForm } from './LoginForm'
import { LoadingSpinner } from './SharedComponents'
import { RegistrationForm } from './registration'
import './Login.css'

// ============================================
// ТИПЫ
// ============================================

type CurrentForm = 'login' | 'register' | 'recovery'

// ============================================
// КОМПОНЕНТ
// ============================================

const Login: React.FC = () => {
  // Хук авторизации
  const { isLoading, login } = useLogin()
  
  // Локальное состояние форм
  const [currentForm, setCurrentForm] = useState<CurrentForm>('login')

  // ============================================
  // ОБРАБОТЧИКИ
  // ============================================

  const handleLogin = async (phone: string, password: string): Promise<boolean> => {
    return await login(phone, password)
  }

  const handleSwitchToRegister = () => {
    setCurrentForm('register')
  }

  const handleSwitchToLogin = () => {
    setCurrentForm('login')
  }

  const handleSwitchToRecovery = () => {
    setCurrentForm('recovery')
  }

  // ============================================
  // РЕНДЕР
  // ============================================

  return (
    <>
      {/* Глобальный спиннер загрузки */}
      {isLoading && <LoadingSpinner />}
      
      {/* Условный рендеринг форм */}
      {currentForm === 'login' && (
        <LoginForm 
          onLogin             = { handleLogin }
          onSwitchToRegister  = { handleSwitchToRegister }
          onSwitchToRecovery  = { handleSwitchToRecovery }
        />
      )}
      
      {currentForm === 'register' && (
        <RegistrationForm 
          onSwitchToLogin     = { handleSwitchToLogin }
          onSwitchToRecovery  = { handleSwitchToRecovery }
        />
      )}
      
      {/* Форма восстановления - пока закомментирована
      {currentForm === 'recovery' && (
        <RecoveryForm 
          onSwitchToLogin={handleSwitchToLogin}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}
      */}
    </>
  )
}

export default Login
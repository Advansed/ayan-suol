/**
 * Главный контейнер Login модуля
 */

import React from 'react'
import { useAuth } from './useAuth'
import { LoginForm } from './LoginForm'
import { RegistrationForm } from './RegistrationForm'
import { RecoveryForm } from './RecoveryForm'
import { ErrorAlert, LoadingSpinner } from './SharedComponents'
import './Login.css'

const Login: React.FC = () => {
  const auth = useAuth()
  
  return (
    <>
      {/* Глобальный спиннер загрузки */}
      {auth.isLoading && <LoadingSpinner />}
      
      {/* Алерт ошибки */}
      {auth.error && (
        <ErrorAlert 
          error={auth.error} 
          onClose={auth.clearErrors} 
        />
      )}
      
      {/* Условный рендеринг форм */}
      {auth.currentForm === 'login' && (
        <LoginForm auth={auth} />
      )}
      
      {auth.currentForm === 'register' && (
        <RegistrationForm auth={auth} />
      )}
      
      {auth.currentForm === 'recovery' && (
        <RecoveryForm auth={auth} />
      )}
    </>
  )
}

export default Login
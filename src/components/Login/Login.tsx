/**
 * Главный контейнер Login модуля
 */

import React from 'react'
import { useAuth } from './useAuth'
import { LoginForm } from './LoginForm'
// Подготовка к новой структуре:
import { ErrorAlert, LoadingSpinner } from './SharedComponents'
import './Login.css'
import { RegistrationForm } from './registration'

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
        <RegistrationForm />
      )}
      
      {/*
      {auth.currentForm === 'recovery' && (
        <RecoveryForm auth={auth} />
      )} */}
    </>
  )
}

export default Login
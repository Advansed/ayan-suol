// src/components/ServerConnectionGuard/ServerConnectionGuard.tsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '../../Store/useSocket';
import { setupSocketHandlers } from '../Store';
import { ReconnectToServerForm } from '../ReconnectToServerForm/ReconnectToServerForm';

interface ServerConnectionGuardProps {
  children: React.ReactNode;
}

export const ServerConnectionGuard: React.FC<ServerConnectionGuardProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const { isConnecting, isConnected, connect } = useSocket();

  const checkServerConnection = async () => {
    console.log("check server");
    setError(null);

    try {
      if (isConnected) {
        console.log("connected");
      } else {
        const success = await connect('');
        // Устанавливаем обработчики ПОСЛЕ успешного подключения
        if (success) {
          setupSocketHandlers();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Сервер недоступен');
    }
  };

  useEffect(() => {
    checkServerConnection();
  }, []);

  // Если сервер доступен - показываем приложение
  if (isConnected) {
    console.log("show children")
    return <>{children}</>;
  }

  // Показываем форму переподключения
  return (
    <ReconnectToServerForm 
      isConnecting  = { isConnecting }
      error         = { error }
      onRetry       = { checkServerConnection }
    />
  );
};
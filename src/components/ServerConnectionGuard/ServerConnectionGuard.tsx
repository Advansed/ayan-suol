// src/components/ServerConnectionGuard/ServerConnectionGuard.tsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '../../Store/useSocket';
import { ReconnectToServerForm } from '../ReconnectToServerForm/ReconnectToServerForm';
import { useSocketStore } from '../../Store/socketStore';

interface ServerConnectionGuardProps {
  children: React.ReactNode;
}

export const ServerConnectionGuard: React.FC<ServerConnectionGuardProps> = ({ children }) => {
  
  const [error, setError] = useState<string | null>(null);
  const { connect } = useSocket();

  const isConnected = useSocketStore((state) => state.isConnected)
  const isConnecting = useSocketStore((state) => state.isConnecting)
  
  console.log("ServerConnectionGuard render, isConnected:", isConnected)

  const checkServerConnection = async () => {
    console.log("check server");
    setError(null);

    try {
      if (isConnected) {
        console.log("check connected");
      } else {
        await connect('');
        // Устанавливаем обработчики ПОСЛЕ успешного подключения
      }
    } catch (err: any) {
      setError(err.message || 'Сервер недоступен');
    }
  };

  useEffect(() => {
    checkServerConnection();
  }, [isConnected]);

  console.log("isConnected", isConnected)
  // Если сервер доступен - показываем приложение
  if (isConnected) {
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
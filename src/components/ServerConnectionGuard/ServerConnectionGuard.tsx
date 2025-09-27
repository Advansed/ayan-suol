// src/components/ServerConnectionGuard/ServerConnectionGuard.tsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '../../Store/useSocket';
import { ReconnectToServerForm } from '../ReconnectToServerForm/ReconnectToServerForm';
import { useSocketStore } from '../../Store/socketStore';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';

interface ServerConnectionGuardProps {
  children: React.ReactNode;
}

export const ServerConnectionGuard: React.FC<ServerConnectionGuardProps> = ({ children }) => {
  
  const [error, setError] = useState<string | null>(null);
  const { connect } = useSocket();

  const isConnected = useSocketStore((state) => state.isConnected)
  const isConnecting = useSocketStore((state) => state.isConnecting)
  
  const checkServerConnection = async () => {
    setError(null);

    try {
      if (isConnected) {
      } else {
        let token = localStorage.getItem("gvr.io.token") as string || ''
        if(!token){ 
            token = await generateToken() || ''
            localStorage.setItem("gvr.io.token", token)
        }

        console.log(token)

        await connect( token );
        // Устанавливаем обработчики ПОСЛЕ успешного подключения
      }
    } catch (err: any) {
      setError(err.message || 'Сервер недоступен');
    }
  };

  useEffect(() => {
    checkServerConnection();
  }, [isConnected]);

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

async function generateToken() {
  const uniqueId = uuidv4(); // генерируем уникальный UUID
  console.log( uniqueId )
  const token = await new SignJWT({ uid: uniqueId })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(new TextEncoder().encode('секретный_ключ'));
  return token;
}
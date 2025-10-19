import React, { useCallback, useRef, useState } from 'react';
import { PageData } from '../../DataEditor/types';
import DataEditor from '../../DataEditor';
import { useToast } from '../../Toast';
import { useLoginStore, UserData, useToken } from '../../../Store/loginStore';
import { useSocket } from '../../../Store/useSocket';
import { IonLoading } from '@ionic/react';

interface PersonalInfoProps {
    user:   Partial<UserData>
    onSave: (user: Partial<UserData>) => void 
    onBack: () => void;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ user, onBack, onSave }) => {
  const { loading, updUser } = useData( onBack )

  const getFormData = (): PageData => [
    {
      title: 'Основная информация',
      data: [
        { 
          label: 'ФИО', 
          type: 'string', 
          data: user?.name || '', 
          validate: true 
        },
        { 
          label: 'Email', 
          type: 'string', 
          data: user?.email || '', 
          validate: true 
        },
        { 
          label: 'Аватар', 
          type: 'image', 
          data: user?.image || '', 
          validate: false 
        }
      ]
    },
    {
      title: 'Изменение пароля',
      data: [
        { 
          label: 'Новый пароль', 
          type: 'password', 
          data: '', 
          validate: false 
        },
        { 
          label: 'Подтверждение пароля', 
          type: 'password', 
          data: '', 
          validate: false 
        }
      ]
    }
  ];


  return (
    <>
      <IonLoading isOpen = { loading } message = { "Подождите..." } />
      <DataEditor 
          data    = { getFormData() }
          onSave  = { updUser }
          onBack  = { onBack }
          title   = "Личные данные"
      />
    </>
    
  );
};

const useData = ( onBack )=> {
  const [loading, setLoading]   = useState(false)
  const pendingRequests         = useRef<Map<string, { resolve: Function, reject: Function }>>(new Map());
  const updateUser              = useLoginStore(state => state.updateUser )
  const name                    = useLoginStore(state => state.name )
  const email                   = useLoginStore(state => state.email )
  const image                   = useLoginStore(state => state.image )
  const socket                  = useSocket()
  const token                   = useToken()
  const toast                   = useToast()

  const socketRequest           = useCallback((event: string, data: any, responseEvent: string): Promise<any> => {
        return new Promise((resolve, reject) => {
          const requestId = `${event}_${Date.now()}`;
          if(!socket) return
          
          // Сохраняем промис для данного запроса
          pendingRequests.current.set(requestId, { resolve, reject });
          
          // Обработчик успешного ответа
          const onSuccess = (response: any) => {
            if( response.success ){
    
              const pending = pendingRequests.current.get( requestId );
              if (pending) {
                pendingRequests.current.delete(requestId);
                pending.resolve({ success: true, data: response.data });
              }
    
            } else {
              const pending = pendingRequests.current.get( requestId );
              if (pending) {
                pendingRequests.current.delete(requestId);
                pending.resolve({ success: false, error: response.message || 'Ошибка сервера' });
              }
            }
    
            socket.off(responseEvent, onSuccess);
          
          };
          
          // Подписываемся на события
          socket.on(responseEvent, onSuccess);
          
          // Таймаут
          setTimeout(() => {
            const pending = pendingRequests.current.get(requestId);
            if (pending) {
              pendingRequests.current.delete(requestId);
              socket.off(responseEvent, onSuccess);
              pending.resolve({ success: false, error: 'Время ожидания истекло' });
            }
          }, 10000); // 10 сек таймаут
          
          // Отправляем запрос
          socket.emit(event, { ...data, requestId });
        });
      }, []);
  

  const updUser              = async( data: any ) => {
      setLoading( true )
  
      try {
        // Валидация паролей
        const newPassword = data[1].data[0].data;
        const confirmPassword = data[1].data[1].data;

        if (newPassword && newPassword !== confirmPassword) {
          toast.error('Пароли не совпадают');
          return;
        }

        const updateData: Partial<UserData> = {
          name:     data[0].data[0].data,
          email:    data[0].data[1].data,
          image:    data[0].data[2].data
        };

        // Добавляем пароль только если он указан
        if (newPassword) {
          updateData.password = newPassword;
        }

        console.log( updateData )
            
        const result = await socketRequest(
          'set_user', 
          { token, ...updateData },
          'set_user'
        );
              
        updateUser( {name: updateData.name || name, email: updateData.email || email, image: updateData.image || image } )

        toast.success("Данные пользователя обновлены")

        onBack()

      } catch (err) {
        toast.success( err instanceof Error ? err.message : 'Неизвестная ошибка' )
      } finally {
        setLoading( false );
      }
  }

  return {
      loading,
      updUser
  }

}
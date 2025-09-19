import React from 'react';
import { PageData } from '../../DataEditor/types';
import DataEditor from '../../DataEditor';
import { useToast } from '../../Toast';
import { UserData } from '../../../Store/loginStore';

interface PersonalInfoProps {
    user:   Partial<UserData>
    onSave: (user: Partial<UserData>) => void 
    onBack: () => void;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ user, onBack, onSave }) => {
  const toast = useToast()

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

  const handleSave = async (data: PageData) => {
    const newPassword = data[1].data[0].data;
    const confirmPassword = data[1].data[1].data;

    // Валидация паролей
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

     await onSave( updateData )

     onBack()

  };

  return (
    <DataEditor
        data    = { getFormData() }
        onSave  = { handleSave }
        onBack  = { onBack }
        title   = "Личные данные"
    />
  );
};
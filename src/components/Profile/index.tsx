import React from 'react';
import { useHistory } from 'react-router-dom';
import { WizardHeader } from '../Header/WizardHeader';
import styles from './Profile.module.css';
import { useProfile } from './useProfile';
import { GeneralInfo } from '../Settings/components/GeneralInfo';
import { useLoginStore } from '../../Store/loginStore';

/** Профиль — только персональные данные. Организация и транспорт — в Настройках. */
export const Profile: React.FC = () => {
  const history = useHistory();
  const { image, name, phone, email, setUser } = useProfile();
  const personalDataConsent = useLoginStore((s) => s.agreements.personalData);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!personalDataConsent) {
      e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
        alert('Формат файла должен быть PNG или JPG');
        return;
      }

      if (file.size > 12 * 1024 * 1024) {
        alert('Размер файла не должен превышать 12 МБ');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser({ image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneralInfoSave = async (data: {
    name: string;
    phone: string;
    email: string;
    additionalPhone: string;
    phoneOnlyForRegistration: boolean;
    displayAdditionalAsPrimary: boolean;
  }) => {
    await setUser({
      name: data.name,
      phone: data.phone,
      email: data.email,
    });
  };

  return (
    <div className={styles.profileContainer}>
      <WizardHeader title="Профиль" onBack={() => history.push('/')} />

      <div className={styles.content}>
        <GeneralInfo
          image={image}
          name={name}
          phone={phone}
          email={email}
          onImageUpload={handleImageUpload}
          onSave={handleGeneralInfoSave}
        />
      </div>
    </div>
  );
};

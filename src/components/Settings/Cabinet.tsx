import React from 'react';
import { WizardHeader } from '../Header/WizardHeader';
import { useProfile } from '../Profile/useProfile';
import { GeneralInfo } from './components/GeneralInfo';
import { useHistory } from 'react-router-dom';
import { useLoginStore } from '../../Store/loginStore';
import styles from './Settings.module.css';

export interface CabinetProps {
  onBack?: () => void;
}

export const Cabinet: React.FC<CabinetProps> = ({ onBack }) => {
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
      email: data.email
    });
  };

  const handleMenuClick = () => {
    if (onBack) {
      onBack();
    } else {
      history.goBack();
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <WizardHeader title="Персональные данные" onBack={handleMenuClick} />

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

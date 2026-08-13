import React, { useState } from 'react';
import { WizardHeader } from '../Header/WizardHeader';
import { useProfile } from '../Profile/useProfile';
import { GeneralInfo } from './components/GeneralInfo';
import { useHistory } from 'react-router-dom';
import { useLoginStore } from '../../Store/loginStore';
import { useToast } from '../Toast';
import { uploadProfilePhoto } from '../../utils/fileUpload';
import styles from './Settings.module.css';

export interface CabinetProps {
  onBack?: () => void;
}

export const Cabinet: React.FC<CabinetProps> = ({ onBack }) => {
  const history = useHistory();
  const { image, name, phone, email, setUser } = useProfile();
  const personalDataConsent = useLoginStore((s) => s.agreements.personalData);
  const toast = useToast();
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!personalDataConsent) {
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
      toast.error('Формат файла должен быть PNG, JPG или WebP');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 12 МБ');
      return;
    }

    setPhotoLoading(true);
    try {
      const { filePath } = await uploadProfilePhoto(file);
      if (!filePath) {
        throw new Error('Сервер не вернул filePath');
      }
      await setUser({ image: filePath });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Не удалось загрузить фото');
    } finally {
      setPhotoLoading(false);
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
          photoLoading={photoLoading}
          onImageUpload={handleImageUpload}
          onSave={handleGeneralInfoSave}
        />
      </div>
    </div>
  );
};

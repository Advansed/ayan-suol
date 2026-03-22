import React from 'react';
import { WizardHeader } from '../../Header/WizardHeader';
import { DriverInfo } from './DriverInfo';
import { useProfile } from '../useProfile';
import styles from '../Settings.module.css';

export interface TransportEditPageProps {
  onBack: () => void;
}

export const TransportEditPage: React.FC<TransportEditPageProps> = ({ onBack }) => {
  const { transportData, updateTransport } = useProfile();

  const handleTransportImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        updateTransport({ image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <WizardHeader title="Транспорт" onBack={onBack} />
      <div className={styles.content}>
        <DriverInfo
          transportData={transportData}
          onSave={async (data) => {
            await updateTransport(data);
          }}
          onImageUpload={handleTransportImageUpload}
        />
      </div>
    </div>
  );
};

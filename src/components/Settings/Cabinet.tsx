import React, { useState, useEffect } from 'react';
import { IonIcon, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import { personOutline, carOutline } from 'ionicons/icons';
import { WizardHeader } from '../Header/WizardHeader';
import { useProfile } from '../Profile/useProfile';
import { GeneralInfo } from './components/GeneralInfo';
import { CustomerInfo } from './components/CustomerInfo';
import { DriverInfo } from './components/DriverInfo';
import { useHistory } from 'react-router-dom';
import styles from './Settings.module.css';

export const Cabinet: React.FC = () => {
  const history = useHistory();
  const { 
    user_type, 
    image, 
    name, 
    phone, 
    email, 
    setUser,
    companyData,
    updateCompany,
    transportData,
    updateTransport
  } = useProfile();

  // Пагинация между кабинетом заказчика и водителя
  const [activeTab, setActiveTab] = useState<'customer' | 'driver'>(user_type === 1 ? 'customer' : 'driver');

  // Синхронизация activeTab с user_type при изменении
  useEffect(() => {
    setActiveTab(user_type === 1 ? 'customer' : 'driver');
  }, [user_type]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCustomerInfoSave = async (data: any) => {
    await updateCompany(data);
  };

  const handleDriverInfoSave = async (data: any) => {
    await updateTransport(data);
  };

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

  const handleMenuClick = () => {
    history.goBack();
  };

  return (
    <div className={styles.settingsContainer}>
      <WizardHeader 
        title={user_type === 1 ? "Личный кабинет заказчика" : "Личный кабинет водителя"}
        onMenu={handleMenuClick}
      />

      <div className={styles.content}>
        {/* Переключатель между кабинетом заказчика и водителя */}
        <div className={styles.tabSwitcher}>
          <IonSegment 
            value={activeTab}
            onIonChange={(e) => {
              const tab = e.detail.value as 'customer' | 'driver';
              setActiveTab(tab);
              if (tab === 'customer' && user_type !== 1) {
                setUser({ user_type: 1 });
              } else if (tab === 'driver' && user_type !== 2) {
                setUser({ user_type: 2 });
              }
            }}
            className={styles.segment}
          >
            <IonSegmentButton value="customer">
              <IonIcon icon={personOutline} />
              <IonLabel>Кабинет Заказчика</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="driver">
              <IonIcon icon={carOutline} />
              <IonLabel>Кабинет Водителя</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Общие сведения (показываются всегда) */}
        <GeneralInfo
          image={image}
          name={name}
          phone={phone}
          email={email}
          onImageUpload={handleImageUpload}
          onSave={handleGeneralInfoSave}
        />

        {/* Сведения заказчика */}
        {activeTab === 'customer' && (
          <CustomerInfo
            companyData={companyData}
            onSave={handleCustomerInfoSave}
          />
        )}

        {/* Сведения водителя */}
        {activeTab === 'driver' && (
          <DriverInfo
            transportData={transportData}
            onSave={handleDriverInfoSave}
            onImageUpload={handleTransportImageUpload}
          />
        )}
      </div>
    </div>
  );
};

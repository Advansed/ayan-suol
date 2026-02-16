import React from 'react';
import { IonIcon, IonToggle, IonButton } from '@ionic/react';
import { peopleOutline, personOutline, carOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { WizardHeader } from '../Header/WizardHeader';
import styles from './Profile.module.css';
import { useProfile } from './useProfile';
import { GeneralInfo } from './components/GeneralInfo';
import { CustomerInfo } from './components/CustomerInfo';
import { DriverInfo } from './components/DriverInfo';

export const Profile: React.FC = () => {
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

    const handleToggleChange = (e: CustomEvent) => {
        setUser({ user_type: user_type === 1 ? 2 : 1 })
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Проверка формата
            if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
                alert('Формат файла должен быть PNG или JPG');
                return;
            }
            
            // Проверка размера (12 МБ)
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
            // Проверка формата
            if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
                alert('Формат файла должен быть PNG или JPG');
                return;
            }
            
            // Проверка размера (12 МБ)
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
        history.push('/settings');
    };

    return (
        <div className={styles.profileContainer}>
            <WizardHeader 
                title = { user_type == 1 ? "Лич ный кабинет заказчика" : "Лич ный кабинет водителя" }
                onMenu={handleMenuClick}
            />

            <div className={styles.content}>

                {/* Секция: Общие сведения */}
                <GeneralInfo
                    image={image}
                    name={name}
                    phone={phone}
                    email={email}
                    onImageUpload={handleImageUpload}
                    onSave={handleGeneralInfoSave}
                />

                {/* Секция: Сведения заказчика */}
                {user_type === 1 && (
                    <CustomerInfo
                        companyData={companyData}
                        onSave={handleCustomerInfoSave}
                    />
                )}

                {/* Секция: Сведения водителя */}
                {user_type === 2 && (
                    <DriverInfo
                        transportData={transportData}
                        onSave={handleDriverInfoSave}
                        onImageUpload={handleTransportImageUpload}
                    />
                )}
            </div>

            {/* Кнопки действий */}
            <div className={styles.actionButtons}>
                <IonButton
                    color="primary"
                    className={styles.actionButton}
                    onClick={() => console.log('К моим заказам')}
                >
                    К моим заказам
                </IonButton>
            </div>
        </div>
    );
};

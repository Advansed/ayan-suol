import React, { useState, useEffect } from 'react';
import { IonIcon, IonButton, IonCheckbox } from '@ionic/react';
import { personOutline, cameraOutline } from 'ionicons/icons';
import styles from '../Profile.module.css';

interface GeneralInfoProps {
    image: string | null;
    name: string;
    phone: string;
    email: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: (data: {
        name: string;
        phone: string;
        email: string;
        additionalPhone: string;
        phoneOnlyForRegistration: boolean;
        displayAdditionalAsPrimary: boolean;
    }) => Promise<void>;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
    image,
    name: initialName,
    phone: initialPhone,
    email: initialEmail,
    onImageUpload,
    onSave
}) => {
    const [formData, setFormData] = useState({
        name: initialName,
        phone: initialPhone,
        email: initialEmail,
        additionalPhone: '',
        phoneOnlyForRegistration: false,
        displayAdditionalAsPrimary: false
    });

    // Синхронизация с внешними данными
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            name: initialName || prev.name,
            phone: initialPhone || prev.phone,
            email: initialEmail || prev.email
        }));
    }, [initialName, initialPhone, initialEmail]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        await onSave(formData);
    };
    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Общие сведения</h3>

            <div className={styles.photoSection}>
                <div className={styles.photoPlaceholder}>
                    {image ? (
                        <img 
                            src={image} 
                            alt="Profile" 
                            className={styles.profileImage}
                        />
                    ) : (
                        <IonIcon icon={personOutline} className={styles.photoIcon} />
                    )}
                </div>

                <div className={styles.uploadSection}>
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={onImageUpload}
                        id="photo-upload"
                        className={styles.fileInput}
                    />
                    <IonButton
                        color="primary"
                        className={styles.uploadButton}
                        onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                        <IonIcon icon={cameraOutline} slot="start" />
                        Загрузить фото
                    </IonButton>
                    
                    <p className={styles.uploadInfo}>
                        Формат png или jpg не более 12 Мб
                    </p>
                </div>
            </div>

            <div className={styles.formFields}>
                <div className={styles.field}>
                    <label className={styles.label}>Имя</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Введите имя"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Мобильный телефон</label>
                    <input
                        type="tel"
                        className={styles.input}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+ 123 456 789"
                    />
                    <div className={styles.checkboxWrapper}>
                        <IonCheckbox
                            checked={formData.phoneOnlyForRegistration}
                            onIonChange={(e) => handleInputChange('phoneOnlyForRegistration', e.detail.checked)}
                        />
                        <label className={styles.checkboxLabel}>
                            Использовать только для регистрации
                        </label>
                    </div>
                    <p className={styles.hintText}>
                        (скроется для остальных участников при нажатии)
                    </p>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input
                        type="email"
                        className={styles.input}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@email.com"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Дополнительный телефон</label>
                    <input
                        type="tel"
                        className={styles.input}
                        value={formData.additionalPhone}
                        onChange={(e) => handleInputChange('additionalPhone', e.target.value)}
                        placeholder="+ 123 456 789"
                    />
                    <div className={styles.checkboxWrapper}>
                        <IonCheckbox
                            checked={formData.displayAdditionalAsPrimary}
                            onIonChange={(e) => handleInputChange('displayAdditionalAsPrimary', e.detail.checked)}
                        />
                        <label className={styles.checkboxLabel}>
                            Отображать как основной телефон
                        </label>
                    </div>
                    <p className={styles.hintText}>
                        (Будет виден всем участникам приложения)
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '1em' }}>
                <IonButton
                    color="primary"
                    onClick={handleSave}
                    style={{ width: '100%' }}
                >
                    Сохранить общие сведения
                </IonButton>
            </div>
        </div>
    );
};

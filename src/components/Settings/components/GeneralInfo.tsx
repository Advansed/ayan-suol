import React, { useState, useEffect } from 'react';
import { IonIcon, IonButton, IonCheckbox } from '@ionic/react';
import { personOutline, cameraOutline } from 'ionicons/icons';
import styles from '../../Profile/Profile.module.css';
import { useAgreements } from '../../ProfileOld/components/Agreements/useAgreements';
import { useProfile } from '../../Profile/useProfile';
import { useToast } from '../../Toast';
import { PersonalDataAgreementModal } from './PersonalDataAgreementModal';

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
    const { agreements, toggleAgreement, isLoading } = useAgreements();
    const { setUser: saveProfile } = useProfile();
    const toast = useToast();
    const [pdModalOpen, setPdModalOpen] = useState(false);
    const [consentBusy, setConsentBusy] = useState(false);

    const fieldsLocked = !agreements.personalData || isLoading || consentBusy;

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
        if (!agreements.personalData) {
            toast.info('Сначала нужно принять согласие на обработку персональных данных');
            return;
        }
        await onSave(formData);
    };

    const anonymizedPayload = {
        name: '',
        phone: '',
        email: '',
        image: ''
    };

    const handlePersonalDataCheckbox = async (checked: boolean) => {
        if (checked === agreements.personalData || isLoading || consentBusy) return;

        if (!checked && agreements.personalData) {
            setConsentBusy(true);
            try {
                const ok = await saveProfile(anonymizedPayload);
                if (!ok) {
                    toast.error('Не удалось удалить персональные данные на сервере');
                    return;
                }
                setFormData((prev) => ({
                    ...prev,
                    name: '',
                    phone: '',
                    email: '',
                    additionalPhone: '',
                    phoneOnlyForRegistration: false,
                    displayAdditionalAsPrimary: false
                }));
                toggleAgreement('personalData');
            } finally {
                setConsentBusy(false);
            }
            return;
        }

        toggleAgreement('personalData');
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
                        disabled={fieldsLocked}
                        onClick={() => {
                            if (fieldsLocked) return;
                            document.getElementById('photo-upload')?.click();
                        }}
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
                        disabled={fieldsLocked}
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
                        disabled={fieldsLocked}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+ 123 456 789"
                    />
                    <div className={styles.checkboxWrapper}>
                        <IonCheckbox
                            checked={formData.phoneOnlyForRegistration}
                            disabled={fieldsLocked}
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
                        disabled={fieldsLocked}
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
                        disabled={fieldsLocked}
                        onChange={(e) => handleInputChange('additionalPhone', e.target.value)}
                        placeholder="+ 123 456 789"
                    />
                    <div className={styles.checkboxWrapper}>
                        <IonCheckbox
                            checked={formData.displayAdditionalAsPrimary}
                            disabled={fieldsLocked}
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

            <div className={`${styles.field} ${styles.consentBlock}`}>
                <div className={styles.checkboxWrapper}>
                    <IonCheckbox
                        checked={agreements.personalData}
                        disabled={isLoading || consentBusy}
                        onIonChange={(e) => void handlePersonalDataCheckbox(e.detail.checked)}
                    />
                    <div className={styles.consentCheckboxText}>
                        <span className={styles.checkboxLabel}>
                            Я согласен(на) на обработку персональных данных
                        </span>
                        <button
                            type="button"
                            className={styles.consentTextLink}
                            onClick={() => setPdModalOpen(true)}
                        >
                            Текст согласия
                        </button>
                    </div>
                </div>
            </div>

            <PersonalDataAgreementModal isOpen={pdModalOpen} onClose={() => setPdModalOpen(false)} />

            <div style={{ marginTop: '1em' }}>
                <IonButton
                    color="primary"
                    onClick={handleSave}
                    disabled={isLoading || consentBusy || !agreements.personalData}
                    style={{ width: '100%' }}
                >
                    Сохранить общие сведения
                </IonButton>
            </div>
        </div>
    );
};

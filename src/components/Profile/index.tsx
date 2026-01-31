import React, { useState } from 'react';
import { IonIcon, IonToggle, IonButton } from '@ionic/react';
import { peopleOutline, personOutline, carOutline, cameraOutline } from 'ionicons/icons';
import { WizardHeader } from '../Header/WizardHeader';
import styles from './Profile.module.css';
import { useUserType } from '../../Store/loginStore';

export const Profile: React.FC = () => {
    const [isDriverMode, setIsDriverMode] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const { user_type } = useUserType();

    const handleToggleChange = (e: CustomEvent) => {
        setIsDriverMode(e.detail.checked);
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
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMenuClick = () => {
        // Обработка клика по меню
        console.log('Menu clicked');
    };

    return (
        <div className={styles.profileContainer}>
            <WizardHeader 
                title = { user_type == 1 ? "Личный кабинет заказчика" : "Личный кабинет водителя" }
                onMenu={handleMenuClick}
            />

            <div className={styles.content}>
                {/* Секция: Режим работы */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <IonIcon icon={peopleOutline} className={styles.cardIcon} />
                        <h3 className={styles.cardTitle}>Режим работы</h3>
                    </div>
                    
                    <p className={styles.cardDescription}>
                        Переключение между ролями заказчика и водителя
                    </p>

                    <div className={styles.roleSwitcher}>
                        <div className={styles.roleContainer}>
                            <div className={`${styles.roleItem} ${!isDriverMode ? styles.roleActive : ''}`}>
                                <IonIcon icon={personOutline} className={styles.roleIcon} />
                                <span className={styles.roleText}>Заказчик</span>
                            </div>
                            
                            <div className={styles.roleSeparator}></div>
                            
                            <div className={`${styles.roleItem} ${isDriverMode ? styles.roleActive : ''}`}>
                                <IonIcon icon={carOutline} className={styles.roleIcon} />
                                <span className={styles.roleText}>Водитель</span>
                            </div>
                        </div>
                        
                        <IonToggle
                            checked={isDriverMode}
                            onIonChange={handleToggleChange}
                            className={styles.toggle}
                        />
                    </div>

                    <p className={styles.instructionText}>
                        Выберите профиль для редактирования
                    </p>
                </div>

                {/* Секция: Общие сведения */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Общие сведения</h3>

                    <div className={styles.photoSection}>
                        <div className={styles.photoPlaceholder}>
                            {profileImage ? (
                                <img 
                                    src={profileImage} 
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
                                onChange={handleImageUpload}
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
                </div>
            </div>
        </div>
    );
};

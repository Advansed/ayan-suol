import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { cameraOutline } from 'ionicons/icons';
import styles from '../Profile.module.css';
import { TransportData } from '../../../Store/transportStore';

interface DriverInfoProps {
    transportData: TransportData | null;
    onSave: (data: Partial<TransportData>) => Promise<void>;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DriverInfo: React.FC<DriverInfoProps> = ({
    transportData,
    onSave,
    onImageUpload
}) => {
    const [formData, setFormData] = useState({
        transportType: '',
        licensePlate: '',
        vin: '',
        manufactureYear: '',
        loadCapacity: '',
        experience: ''
    });

    // Синхронизация с данными транспорта из store
    useEffect(() => {
        if (transportData) {
            setFormData({
                transportType: transportData.transport_type || transportData.type || '',
                licensePlate: transportData.license_plate || transportData.number || '',
                vin: transportData.vin || '',
                manufactureYear: transportData.manufacture_year?.toString() || transportData.year?.toString() || '',
                loadCapacity: transportData.load_capacity?.toString() || transportData.capacity?.toString() || '',
                experience: transportData.experience?.toString() || transportData.exp?.toString() || ''
            });
        }
    }, [transportData]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Все поля опциональны - сохраняем только заполненные
        const saveData: Partial<TransportData> = {};

        if (formData.transportType.trim()) {
            saveData.transport_type = formData.transportType.trim();
        }

        if (formData.licensePlate.trim()) {
            saveData.license_plate = formData.licensePlate.trim();
        }

        if (formData.vin.trim()) {
            saveData.vin = formData.vin.trim();
        }

        if (formData.manufactureYear.trim()) {
            const year = parseInt(formData.manufactureYear.trim());
            if (!isNaN(year)) {
                saveData.manufacture_year = year;
            }
        }

        if (formData.loadCapacity.trim()) {
            const capacity = parseFloat(formData.loadCapacity.trim());
            if (!isNaN(capacity)) {
                saveData.load_capacity = capacity;
            }
        }

        if (formData.experience.trim()) {
            const exp = parseInt(formData.experience.trim());
            if (!isNaN(exp)) {
                saveData.experience = exp;
            }
        }

        await onSave(saveData);
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Сведения водителя</h3>
            
            <div className={styles.formFields}>
                <div className={styles.field}>
                    <label className={styles.label}>Тип транспорта</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.transportType}
                        onChange={(e) => handleInputChange('transportType', e.target.value)}
                        placeholder="Прицеп"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Гос. номер</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.licensePlate}
                        onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                        placeholder="к227кв"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>VIN номер</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.vin}
                        onChange={(e) => handleInputChange('vin', e.target.value)}
                        placeholder="15536474"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Год выпуска</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.manufactureYear}
                        onChange={(e) => handleInputChange('manufactureYear', e.target.value)}
                        placeholder="2022"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Грузоподъемность (т)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.loadCapacity}
                        onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                        placeholder="40"
                        step="0.1"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Опыт (лет)</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="5"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Фото транспорта</label>
                    <div className={styles.uploadSection}>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={onImageUpload}
                            id="transport-photo-upload"
                            className={styles.fileInput}
                        />
                        <IonButton
                            color="primary"
                            className={styles.uploadButton}
                            onClick={() => document.getElementById('transport-photo-upload')?.click()}
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

            <div style={{ marginTop: '1em' }}>
                <IonButton
                    color="primary"
                    onClick={handleSave}
                    style={{ width: '100%' }}
                >
                    Сохранить сведения водителя
                </IonButton>
            </div>
        </div>
    );
};

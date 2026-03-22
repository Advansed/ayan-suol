import React, { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { cubeOutline, checkmarkOutline } from 'ionicons/icons';
import { CheckField } from '../../../DataEditor/fields/CheckField';
import { ImagesField } from '../../../DataEditor/fields/ImagesField';
import { WorkInfo } from '../../types';
import styles from './OfferCard.module.css';
import { FitTextLine } from './FitTextLine';

export interface LoadedCardData {
    verified: boolean;
    cargoPhotos: string[];
    sealPhotos: string[];
}

interface LoadedCardProps {
    work: WorkInfo;
    onLoaded: (data: LoadedCardData) => Promise<void>;
    isLoading?: boolean;
}

export const LoadedCard: React.FC<LoadedCardProps> = ({ work, onLoaded, isLoading = false }) => {
    const [verified, setVerified] = useState(false);
    const [cargoPhotos, setCargoPhotos] = useState<string[]>([]);
    const [sealPhotos, setSealPhotos] = useState<string[]>([]);
    const [error, setError] = useState('');

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };
    const price = work.currentOffer?.price ?? work.price;
    const weight = work.currentOffer?.weight ?? work.weight;
    const volume = work.currentOffer?.volume ?? work.volume;

    const handleSubmit = async () => {
        setError('');

        if (!verified) {
            setError('Подтвердите, что груз проверен');
            return;
        }
        if (cargoPhotos.length === 0) {
            setError('Добавьте фото загруженного груза');
            return;
        }
        if (sealPhotos.length === 0) {
            setError('Добавьте фото пломбы');
            return;
        }

        try {
            await onLoaded({ verified, cargoPhotos, sealPhotos });
        } catch (err) {
            setError('Ошибка при отправке');
        }
    };

    return (
        <div className={styles.offerCard}>
            <div className={styles.notificationCard}>
                <div className={styles.notificationHeader}>
                    <div className={styles.notificationTitleRow}>
                        <IonIcon icon={cubeOutline} className={styles.notificationIcon} />
                        <h2 className={styles.notificationTitle}>
                            {work.name || 'Груз'}
                        </h2>
                    </div>
                    <p className={styles.notificationSubtitle}>
                        Загрузите груз и приложите фото
                    </p>
                </div>
            </div>

            <div className={styles.detailsCard}>
                <div className={styles.infoRow}>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Цена (₽)</label>
                        <FitTextLine className={styles.value}>
                            {formatPrice(price)} (₽)
                        </FitTextLine>
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Объем (м³)</label>
                        <FitTextLine className={styles.value}>
                            {volume.toFixed(1)} м³
                        </FitTextLine>
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Вес (т)</label>
                        <FitTextLine className={styles.value}>
                            {weight.toFixed(1)} тонн
                        </FitTextLine>
                    </div>
                </div>
            </div>

            <div className={styles.detailsCard}>
                <div className={styles.loadedForm}>
                    <CheckField
                        label="Проверен"
                        value={verified}
                        onChange={setVerified}
                        description="Груз осмотрен и проверен"
                    />
                    <ImagesField
                        label="Фото загруженного груза"
                        value={cargoPhotos}
                        onChange={setCargoPhotos}
                        placeholder="Добавить фото груза"
                        maxImages={5}
                    />
                    <ImagesField
                        label="Фото пломбы"
                        value={sealPhotos}
                        onChange={setSealPhotos}
                        placeholder="Добавить фото пломбы"
                        maxImages={5}
                    />
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
                <IonButton
                    className={styles.submitButton}
                    expand="block"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    <IonIcon icon={checkmarkOutline} slot="start" />
                    <span>Загружен</span>
                </IonButton>
            </div>
        </div>
    );
};


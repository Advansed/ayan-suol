import React, { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { checkmarkOutline, cubeOutline } from 'ionicons/icons';
import { ImagesField } from '../../../DataEditor/fields/ImagesField';
import { WorkInfo } from '../../types';
import styles from './OfferCard.module.css';
import { FitTextLine } from './FitTextLine';

export interface UnloadingCompleteData {
    bodyPhotos: string[];
}

interface UnloadingCardProps {
    work: WorkInfo;
    onCompleted: (data: UnloadingCompleteData) => Promise<void>;
    isLoading?: boolean;
}

export const UnloadingCard: React.FC<UnloadingCardProps> = ({ work, onCompleted, isLoading = false }) => {
    const [bodyPhotos, setBodyPhotos] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    const price = work.currentOffer?.price ?? work.price;
    const weight = work.currentOffer?.weight ?? work.weight;
    const volume = work.currentOffer?.volume ?? work.volume;

    const handleSubmit = async () => {
        setError('');
        if (bodyPhotos.length === 0) {
            setError('Добавьте фото кузова после разгрузки');
            return;
        }
        setIsSubmitting(true);
        try {
            await onCompleted({ bodyPhotos });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ошибка при отправке');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.offerCard}>
            <div className={styles.notificationCard}>
                <div className={styles.notificationHeader}>
                    <div className={styles.notificationTitleRow}>
                        <IonIcon icon={cubeOutline} className={styles.notificationIcon} />
                        <h2 className={styles.notificationTitle}>
                            Товар разгружается
                        </h2>
                    </div>
                    <p className={styles.notificationSubtitle}>
                        После разгрузки сфотографируйте кузов и подтвердите завершение
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
                    <ImagesField
                        label="Фото кузова после разгрузки"
                        value={bodyPhotos}
                        onChange={setBodyPhotos}
                        placeholder="Добавить фото кузова"
                        maxImages={5}
                        light
                    />
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
                <IonButton
                    className={styles.submitButton}
                    expand="block"
                    onClick={handleSubmit}
                    disabled={isLoading || isSubmitting}
                >
                    <IonIcon icon={checkmarkOutline} slot="start" />
                    <span>Разгружено</span>
                </IonButton>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { checkmarkOutline, cubeOutline } from 'ionicons/icons';
import { CheckField } from '../../../DataEditor/fields/CheckField';
import { ImagesField } from '../../../DataEditor/fields/ImagesField';
import { WorkInfo } from '../../types';
import styles from './OfferCard.module.css';
import { FitTextLine } from './FitTextLine';

export interface InWorkUnloadData {
    verified: boolean;
    cargoPhotos: string[];
    sealPhotos: string[];
}

interface InWorkCardProps {
    work: WorkInfo;
    onArrivedUnload: (data: InWorkUnloadData) => Promise<void>;
    isLoading?: boolean;
}

export const InWorkCard: React.FC<InWorkCardProps> = ({ work, onArrivedUnload, isLoading = false }) => {
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
            setError('Подтвердите, что с грузом и пломбой всё в порядке');
            return;
        }
        if (cargoPhotos.length === 0) {
            setError('Добавьте фото груза');
            return;
        }
        if (sealPhotos.length === 0) {
            setError('Добавьте фото пломбы');
            return;
        }

        try {
            await onArrivedUnload({ verified, cargoPhotos, sealPhotos });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ошибка при отправке');
        }
    };

    return (
        <div className={styles.offerCard}>
            <div className={styles.notificationCard}>
                <div className={styles.notificationHeader}>
                    <div className={styles.notificationTitleRow}>
                        <IonIcon icon={cubeOutline} className={styles.notificationIcon} />
                        <h2 className={styles.notificationTitle}>
                            {work.name || 'Груз в работе'}
                        </h2>
                    </div>
                    <p className={styles.notificationSubtitle}>
                        Товар загружен и опечатан. Прибыв на место выгрузки, сфотографируйте груз и пломбу и
                        подтвердите осмотр.
                    </p>
                </div>
            </div>

            <div className={styles.detailsCard}>
                <div className={styles.infoRow}>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Цена (₽)</label>
                        <FitTextLine className={styles.value}>{formatPrice(price)} (₽)</FitTextLine>
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Объем (м³)</label>
                        <FitTextLine className={styles.value}>{volume.toFixed(1)} м³</FitTextLine>
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Вес (т)</label>
                        <FitTextLine className={styles.value}>{weight.toFixed(1)} тонн</FitTextLine>
                    </div>
                </div>
            </div>

            <div className={styles.detailsCard}>
                <div className={styles.loadedForm}>
                    <CheckField
                        label="Всё в порядке"
                        value={verified}
                        onChange={setVerified}
                        description="Груз и пломба в порядке, замечаний нет"
                    />
                    <ImagesField
                        label="Фото груза"
                        value={cargoPhotos}
                        onChange={setCargoPhotos}
                        placeholder="Добавить фото груза"
                        maxImages={5}
                        light
                    />
                    <ImagesField
                        label="Фото пломбы"
                        value={sealPhotos}
                        onChange={setSealPhotos}
                        placeholder="Добавить фото пломбы"
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
                    disabled={isLoading}
                >
                    <IonIcon icon={checkmarkOutline} slot="start" />
                    <span>Прибыл на выгрузку</span>
                </IonButton>
            </div>
        </div>
    );
};

import React from 'react';
import { IonIcon } from '@ionic/react';
import { paperPlaneOutline } from 'ionicons/icons';
import { WorkInfo } from '../../types';
import styles from './OfferCard.module.css';
import { FitTextLine } from './FitTextLine';

interface LoadedWaitDispatchCardProps {
    work: WorkInfo;
}

/** После подтверждения загрузки водителем: груз загружен, ждём отправки заказчиком */
export const LoadedWaitDispatchCard: React.FC<LoadedWaitDispatchCardProps> = ({ work }) => {
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };
    const price = work.currentOffer?.price ?? work.price;
    const weight = work.currentOffer?.weight ?? work.weight;
    const volume = work.currentOffer?.volume ?? work.volume;

    return (
        <div className={styles.offerCard}>
            <div className={styles.notificationCard}>
                <div className={styles.notificationHeader}>
                    <div className={styles.notificationTitleRow}>
                        <IonIcon icon={paperPlaneOutline} className={styles.notificationIcon} />
                        <h2 className={styles.notificationTitle}>
                            {work.name || 'Груз загружен'}
                        </h2>
                    </div>
                    <p className={styles.notificationSubtitle}>
                        Вы подтвердили окончание загрузки. Груз загружен — ожидайте, пока заказчик отправит
                        транспорт в путь.
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
        </div>
    );
};

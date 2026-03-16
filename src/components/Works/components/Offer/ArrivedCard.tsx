import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { WorkInfo } from '../../types';
import styles from './OfferCard.module.css';

interface ArrivedCardProps {
    work: WorkInfo;
    onArrivedClick: () => void;
}

export const ArrivedCard: React.FC<ArrivedCardProps> = ({ work, onArrivedClick }) => {
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };
    const price = work.currentOffer?.price ?? work.price;
    const weight = work.currentOffer?.weight ?? work.weight;
    const volume = work.currentOffer?.volume ?? work.volume;

    return (
        <div className={styles.offerCard}>
            {/* Card 1: Cargo name */}
            <div className={styles.notificationCard}>
                <div className={styles.notificationHeader}>
                    <div className={styles.notificationTitleRow}>
                        <IonIcon icon={locationOutline} className={styles.notificationIcon} />
                        <h2 className={styles.notificationTitle}>
                            {work.name || 'Груз'}
                        </h2>
                    </div>
                    <p className={styles.notificationSubtitle}>
                        Договор подписан. Прибывайте на место погрузки.
                    </p>
                </div>
            </div>

            {/* Card 2: Details */}
            <div className={styles.detailsCard}>
                <div className={styles.infoRow}>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Цена (₽)</label>
                        <div className={styles.value}>
                            {formatPrice(price)} (₽)
                        </div>
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Объем (м³)</label>
                        <div className={styles.value}>
                            {volume.toFixed(1)} м³
                        </div>
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Вес (т)</label>
                        <div className={styles.value}>
                            {weight.toFixed(1)} тонн
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className={styles.actions}>
                <IonButton
                    className={styles.submitButton}
                    expand="block"
                    onClick={onArrivedClick}
                >
                    <span>Приехал на погрузку</span>
                </IonButton>
            </div>
        </div>
    );
};

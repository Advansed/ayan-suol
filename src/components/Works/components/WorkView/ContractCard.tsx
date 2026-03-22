import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, documentTextOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { WorkInfo } from '../../types';
import styles from './OfferCard.module.css';
import { FitTextLine } from './FitTextLine';

interface ContractCardProps {
    work: WorkInfo;
    onSignContract: () => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({ work, onSignContract }) => {
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
                        <IonIcon icon={checkmarkCircleOutline} className={styles.notificationIcon} />
                        <h2 className={styles.notificationTitle}>
                            Предложение принято, договор подписан
                        </h2>
                    </div>
                    <p className={styles.notificationSubtitle}>
                        Подпишите договор со своей стороны (Исполнитель/Перевозчик)
                    </p>
                </div>
            </div>

            <div className={styles.detailsCard}>
                <div className={styles.infoRow}>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Вес (т)</label>
                        <FitTextLine className={styles.value}>
                            {weight.toFixed(1)} тонн
                        </FitTextLine>
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Объем (м³)</label>
                        <FitTextLine className={styles.value}>
                            {volume.toFixed(1)} м³
                        </FitTextLine>
                    </div>
                    <div className={styles.infoField}>
                        <label className={styles.label}>Цена (₽)</label>
                        <FitTextLine className={styles.value}>
                            {formatPrice(price)} (₽)
                        </FitTextLine>
                    </div>
                </div>
            </div>

            <div className={styles.secureCard}>
                <IonIcon icon={shieldCheckmarkOutline} className={styles.secureIcon} />
                <h3 className={styles.secureTitle}>Безопасная оплата через платформу</h3>
                <p className={styles.secureDescription}>
                    Все платежи проходят через специальный счет приложения. Комиссия платформы 5% обеспечивает защиту обеих сторон и гарантию выполнения сделки.
                </p>
            </div>

            <div className={styles.actions}>
                <IonButton
                    className={styles.submitButton}
                    expand="block"
                    onClick={onSignContract}
                >
                    <IonIcon icon={documentTextOutline} slot="start" />
                    <span>Подписать договор</span>
                </IonButton>
            </div>
        </div>
    );
};


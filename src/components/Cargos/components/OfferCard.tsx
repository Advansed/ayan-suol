import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { mailOutline } from 'ionicons/icons';
import { DriverInfo } from '../../../Store/cargoStore';
import styles from './OfferCard.module.css';

interface OfferCardProps {
    info: DriverInfo;
    onAccept?: (info: DriverInfo) => void;
    onReject?: (info: DriverInfo) => void;
    isLoading?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({ 
    info, 
    onAccept, 
    onReject, 
    isLoading = false 
}) => {
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    return (
        <div className={styles.offerCard}>
            {/* Header */}
            <div className={styles.header}>
                <IonIcon icon={mailOutline} className={styles.headerIcon} />
                <h2 className={styles.title}>
                    <b>Предложение от водителя</b>
                </h2>
            </div>

            {/* Info Fields Row */}
            <div className={styles.infoRow}>
                <div className={styles.infoField}>
                    <label className={styles.label}>⚖️ Вес (т)</label>
                    <div className={styles.value}>
                        <b>{info.weight.toFixed(1)}</b>
                    </div>
                </div>

                <div className={styles.infoField}>
                    <label className={styles.label}>📦 Объем (м³)</label>
                    <div className={styles.value}>
                        <b>{info.volume.toFixed(1)}</b>
                    </div>
                </div>

                <div className={styles.infoField}>
                    <label className={styles.label}>💰 Цена (₽)</label>
                    <div className={styles.value}>
                        <b>{formatPrice(info.price)}</b>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
                <div className={styles.buttonsRow}>
                    {onReject && (
                        <IonButton
                            className   = {styles.rejectButton}
                            color       = "warning"
                            expand      = "block"
                            onClick     = {() => onReject( info )}
                            disabled    = {isLoading}
                        >
                            <span><b>Отказать</b></span>
                        </IonButton>
                    )}
                    {onAccept && (
                        <IonButton
                            className   = {styles.acceptButton}
                            color       = "success"
                            expand      = "block"
                            onClick     = { () => onAccept( info ) }
                            disabled    = { isLoading }
                        >
                            <span><b>Принять</b></span>
                        </IonButton>
                    )}
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, documentTextOutline } from 'ionicons/icons';
import { WorkInfo } from '../../types';
import styles from '../../../Cargos/components/DriverCard.module.css';

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
        <div className={styles.contractSignedCard}>
            <div className={styles.header}>
                <IonIcon icon={checkmarkCircleOutline} className={styles.headerIcon + ' w-15 h-15'} />
                <h2 className={styles.title}><b>Предложение принято, договор подписан</b></h2>
            </div>
            <div className={styles.infoRow}>
                <div className={styles.infoField}>
                    <label className={styles.label}>Вес (т)</label>
                    <div className={styles.value + ' cl-white fs-11'}>
                        <b>{weight.toFixed(1)}</b>
                    </div>
                </div>
                <div className={styles.infoField}>
                    <label className={styles.label}>Объем (м³)</label>
                    <div className={styles.value + ' cl-white fs-11'}>
                        <b>{volume.toFixed(1)}</b>
                    </div>
                </div>
                <div className={styles.infoField}>
                    <label className={styles.label}>Цена (₽)</label>
                    <div className={styles.value + ' cl-white fs-11'}>
                        <b>{formatPrice(price)}</b>
                    </div>
                </div>
            </div>
            <div className={styles.message + ' fs-11'}>
                Подпишите договор со своей стороны (Исполнитель/Перевозчик)
            </div>
            <IonButton
                color="success"
                expand="block"
                onClick={onSignContract}
            >
                <IonIcon icon={documentTextOutline} className={styles.buttonIcon + ' fs-14'} color="light" />
                <span className="ml-05 cl-white"><b>Подписать договор</b></span>
            </IonButton>
        </div>
    );
};

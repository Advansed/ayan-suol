import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { checkmarkCircleOutline, chatboxEllipsesOutline, cubeOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { DriverInfo } from '../../../Store/cargoStore';
import { OfferCard } from './OfferCard';
import styles from './DriverCard.module.css';
import offerStyles from './OfferCard.module.css';

interface DriverInfoProps {

    info: DriverInfo;

    onAccept?: (info: DriverInfo) => void;

    onReject?: (info: DriverInfo) => void;

    onChat?: (info: DriverInfo) => void;

    onStartLoading?: (info: DriverInfo) => void;

    isLoading?: boolean;

}

const contractSigned = (
    info: DriverInfo,
    onChat?: (info: DriverInfo) => void,
    isLoading?: boolean
) => {
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    return (
        <div className={styles.contractSignedCard}>
            {/* Header */}
            <div className={styles.header}>
                <IonIcon icon={checkmarkCircleOutline} className={styles.headerIcon + " w-15 h-15"} />
                <h2 className={styles.title}> <b> Предложение принято, договор подписан</b></h2>
            </div>

            {/* Info Fields Row */}
            <div className={styles.infoRow}>
                <div className={styles.infoField}>
                    <label className={styles.label}>Вес (т)</label>
                    <div className={styles.value + ' cl-white fs-11'}>
                        <b>{info.weight.toFixed(1)}</b>
                    </div>
                </div>

                <div className={styles.infoField}>
                    <label className={styles.label}>Объем (м³)</label>
                    <div className={styles.value + ' cl-white fs-11'}>
                        <b>{info.volume.toFixed(1)}</b>
                    </div>
                </div>

                <div className={styles.infoField}>
                    <label className={styles.label}>Цена (₽)</label>
                    <div className={styles.value + ' cl-white fs-11'}>
                        <b>{formatPrice(info.price)}</b>
                    </div>
                </div>
            </div>

            {/* Message */}
            <div className={styles.message + " fs-11"}>
                Ждем подписания договора водителем
            </div>

            {/* Chat Button */}
            {onChat && (
                <IonButton
                    // className={styles.submitButton}
                    color="success"
                    expand="block"
                    onClick={() => { if (onChat) onChat(info) }}
                    disabled={isLoading}
                >
                    <IonIcon icon={chatboxEllipsesOutline} className={styles.buttonIcon + " fs-14"} color="light" />
                    <span className='ml-05 cl-white' ><b>Чат</b></span>
                </IonButton>
            )}
        </div>
    );
};

const onLoadingCard = (
    info: DriverInfo,
    onChat?: (info: DriverInfo) => void,
    onStartLoading?: (info: DriverInfo) => void,
    isLoading?: boolean
) => {
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    return (
        <div className={offerStyles.offerCard}>
            {/* Card 1: Notification */}
            <div className={offerStyles.notificationCard}>
                <div className={offerStyles.notificationHeader}>
                    <div className={offerStyles.notificationTitleRow}>
                        <IonIcon icon={cubeOutline} className={offerStyles.notificationIcon} />
                        <h2 className={offerStyles.notificationTitle}>
                            На погрузке
                        </h2>
                    </div>
                    <p className={offerStyles.notificationSubtitle}>
                        Водитель прибыл на место погрузки
                    </p>
                </div>
            </div>

            {/* Card 2: Details */}
            <div className={offerStyles.detailsCard}>
                <div className={offerStyles.infoRow}>
                    <div className={offerStyles.infoField}>
                        <label className={offerStyles.label}>Цена (₽)</label>
                        <div className={offerStyles.value}>
                            {formatPrice(info.price)} (₽)
                        </div>
                    </div>
                    <div className={offerStyles.infoField}>
                        <label className={offerStyles.label}>Объем (м³)</label>
                        <div className={offerStyles.value}>
                            {info.volume.toFixed(1)} м³
                        </div>
                    </div>
                    <div className={offerStyles.infoField}>
                        <label className={offerStyles.label}>Вес (т)</label>
                        <div className={offerStyles.value}>
                            {info.weight.toFixed(1)} тонн
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 3: Secure Payment */}
            {/* <div className={offerStyles.secureCard}>
                <IonIcon icon={shieldCheckmarkOutline} className={offerStyles.secureIcon} />
                <h3 className={offerStyles.secureTitle}>Безопасная оплата через платформу</h3>
                <p className={offerStyles.secureDescription}>
                    Все платежи проходят через специальный счет приложения. Комиссия платформы 5% обеспечивает защиту обеих сторон и гарантию выполнения сделки.
                </p>
            </div> */}

            {/* Action Buttons */}
            <div className={offerStyles.actions}>
                <div className={offerStyles.buttonsRow}>
                    {onStartLoading && (
                        <IonButton
                            className={offerStyles.acceptButton}
                            expand="block"
                            onClick={() => onStartLoading(info)}
                            disabled={isLoading}
                        >
                            <span>Начать погрузку</span>
                        </IonButton>
                    )}
                    {onChat && (
                        <IonButton
                            fill="outline"
                            className={offerStyles.rejectButton}
                            expand="block"
                            onClick={() => onChat(info)}
                            disabled={isLoading}
                        >
                            <IonIcon icon={chatboxEllipsesOutline} slot="start" />
                            <span>Чат</span>
                        </IonButton>
                    )}
                </div>
            </div>
        </div>
    );
};


export const DriverCard: React.FC<DriverInfoProps> = ({
    info,
    onAccept,
    onReject,
    onChat,
    onStartLoading,
    isLoading = false
}) => {
    return (
        <div>

            {
                info.status === "Заказано"
                    ? <OfferCard
                        info={info}
                        onAccept={onAccept}
                        onReject={onReject}
                        isLoading={isLoading}
                    />
                : info.status === "Принято"
                    ? contractSigned(info, onChat, isLoading)
                : info.status === "На погрузке"
                    ? onLoadingCard(info, onChat, onStartLoading, isLoading)
                : <></>
            }

        </div>
    );
};


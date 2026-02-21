import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { personCircleOutline, chatboxEllipsesOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { DriverInfo } from '../../../Store/cargoStore';
import { formatters } from '../../../utils/utils';
import { Capacitor } from '@capacitor/core';
import styles from './DriverCard.module.css';

interface DriverInfoProps {
    info: DriverInfo;
    onAccept?: (info: DriverInfo) => void;
    onReject?: (info: DriverInfo) => void;
    onChat?: (info: DriverInfo) => void;
    isLoading?: boolean;
}

const offer = (
    info: DriverInfo,
    onAccept?: (info: DriverInfo) => void,
    onReject?: (info: DriverInfo) => void,
    onChat?: (info: DriverInfo) => void,
    isLoading?: boolean
) => {
    // Показываем только на мобильных устройствах
    const isMobile = Capacitor.getPlatform() !== 'web';
    
    if (!isMobile) {
        return null;
    }

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    return (
        <div className={styles.offerCard}>
            {/* Header */}
            <div className={styles.offerHeader}>
                <h2 className={styles.offerTitle}>
                    <b>Предложение от водителя</b>
                </h2>
            </div>

            {/* Info Fields Row */}
            <div className={styles.offerInfoRow}>
                <div className={styles.offerInfoField}>
                    <label className={styles.offerLabel}>⚖️ Вес (т)</label>
                    <div className={styles.offerValue + ' fs-11'}>
                        <b>{info.weight.toFixed(1)}</b>
                    </div>
                </div>

                <div className={styles.offerInfoField}>
                    <label className={styles.offerLabel}>📦 Объем (м³)</label>
                    <div className={styles.offerValue + ' fs-11'}>
                        <b>{info.volume.toFixed(1)}</b>
                    </div>
                </div>

                <div className={styles.offerInfoField}>
                    <label className={styles.offerLabel}>💰 Цена (₽)</label>
                    <div className={styles.offerValue + ' fs-11'}>
                        <b>{formatPrice(info.price)}</b>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.offerActions}>
                {onChat && (
                    <IonButton
                        className={styles.offerChatButton}
                        color="light"
                        expand="block"
                        onClick={() => { if(onChat) onChat(info); }}
                        disabled={isLoading}
                    >
                        <IonIcon icon={chatboxEllipsesOutline} className={styles.offerButtonIcon + " fs-14"} />
                        <span className="ml-05 cl-dark"><b>Чат</b></span>
                    </IonButton>
                )}

                <div className={styles.offerButtonsRow}>
                    {onReject && (
                        <IonButton
                            className={styles.offerRejectButton}
                            color="warning"
                            expand="block"
                            onClick={() => onReject(info)}
                            disabled={isLoading}
                        >
                            <span className="fs-1 cl-white"><b>Отказать</b></span>
                        </IonButton>
                    )}
                    {onAccept && (
                        <IonButton
                            className={styles.offerAcceptButton}
                            color="success"
                            expand="block"
                            onClick={() => { if(onAccept) onAccept(info); }}
                            disabled={isLoading}
                        >
                            <span className="fs-1 cl-white"><b>Принять</b></span>
                        </IonButton>
                    )}
                </div>
            </div>
        </div>
    );
};

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
                    color       = "success"
                    expand      = "block"
                    onClick     = { () => { if(onChat) onChat(info)} }
                    disabled    = { isLoading }
                >
                    <IonIcon icon={chatboxEllipsesOutline} className={styles.buttonIcon + " fs-14"} color = "light"/>
                    <span className = 'ml-05 cl-white' ><b>Чат</b></span>
                </IonButton>
            )}
        </div>
    );
};



export const DriverCard: React.FC<DriverInfoProps> = ({ 
    info, 
    onAccept, 
    onReject, 
    onChat,
    isLoading = false 
}) => {
    return (
        <div>
            <div className="borders">
                {/* Основная информация о водителе */}
                <div className="flex fl-space mt-1">
                    <div className="flex">
                        <IonIcon 
                            icon={personCircleOutline} 
                            color="primary" 
                            className="w-3 h-3"
                        />
                        <div className="fs-1 ml-05">
                            <div className="fs-12">
                                <b>{info.client}</b>
                            </div>
                            <div className="fs-12">⭐ {info.rating}</div>
                        </div>
                    </div>
                </div>

                {/* Детали транспорта */}
                <div className="fs-1 mt-05 flex fl-space">
                    <div>
                        🚚 <b>Транспорт:</b>
                    </div>
                    <div className="fs-12 cl-black">
                        <b>{info.transport}</b>
                    </div>
                </div>
            </div>

            {
                  info.status === "Заказано"
                    ? offer(info, onAccept, onReject, onChat, isLoading)
                : info.status === "Принято" 
                    ? contractSigned(info, onChat, isLoading)
                : <></>
            }
            
        </div>
    );
};


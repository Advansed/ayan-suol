import React from 'react';
import { IonIcon, IonText } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { formatters, statusUtils } from '../utils';
import { CargoInfo, CargoStatus } from '../../../Store/cargoStore';
import styles from './CargoCard.module.css';

interface CargoCardProps {
    cargo: CargoInfo;
    mode?: 'view' | 'list';
    onClick?: () => void;
}

export const CargoCard: React.FC<CargoCardProps> = ({ cargo, mode = 'list', onClick }) => {
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    // Теги под статусом (используются и в view, и в list)
    const tags: Array<{ text: string; className: string }> = [];

    // Гарантированная оплата (если есть предоплата)
    if (cargo.advance > 0) {
        const isFullAdvance = cargo.advance >= cargo.price;
        tags.push({
            text: 'Гарантированная оплата',
            className: isFullAdvance
                ? `${styles.tag} ${styles.tagGreen}`
                : `${styles.tag} ${styles.tagOrange}`
        });
    }

    // Застраховано
    if (cargo.insurance > 0) {
        tags.push({
            text: 'Застраховано',
            className: `${styles.tag} ${styles.tagGreen}`
        });
    }

    // Несколько водителей (если больше одного предложения)
    if (cargo.invoices && cargo.invoices.length > 1) {
        tags.push({
            text: 'Несколько водителей',
            className: `${styles.tag} ${styles.tagPurple}`
        });
    }

    // Торг
    if (cargo.status === CargoStatus.NEGOTIATION) {
        tags.push({
            text: 'Торг',
            className: `${styles.tag} ${styles.tagBargain}`
        });
    }

    const CardInner = (
        <>
            {/* Верхняя строка: статус, ID, цена */}
            <div className={styles.topRow}>
                <div className={styles.topLeft}>
                    <div className={getCircle(cargo)}></div>
                    <div className={'ml-05 ' + statusUtils.getClassName(cargo.status)}>
                        {cargo.status}
                    </div>
                    <IonText className="ml-1 fs-07 cl-gray">
                        {'ID: ' + formatters.shortId(cargo.guid)}
                    </IonText>
                </div>
                <div className={styles.topRight}>
                    <IonText className="fs-09 cl-prim">
                        <b>{formatters.currency(cargo.price)}</b>
                    </IonText>
                    {mode === 'view' && (
                        <div className="fs-08 cl-black">
                            <b>{formatters.weight(cargo.weight, cargo.weight1)}</b>
                        </div>
                    )}
                </div>
            </div>

            {/* Вторая строка: теги */}
            {tags.length > 0 && (
                <div className={styles.tagsRow}>
                    {tags.map((tag, index) => (
                        <span key={index} className={tag.className}>
                            {tag.text}
                        </span>
                    ))}
                </div>
            )}

            {/* Название груза */}
            <div className="fs-09 mt-05 cl-black">
                <b>{cargo.name}</b>
            </div>

            {/* Блок маршрута в две строки */}
            <div className={styles.routeSection + ' mt-05'}>
                {/* Откуда + дата загрузки */}
                <div className={styles.routeRow}>
                    <div className={styles.routeLeft}>
                        <IonIcon icon={locationOutline} className={`${styles.routeIcon} ${styles.routeIconGreen}`} />
                        <div className={styles.routeTextGroup}>
                            <span className={styles.routeLabel}>Откуда:</span>
                            <span className={styles.routeCity}>
                                {cargo.address?.city.city || 'Не указано'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.routeRight}>
                        <div>
                            <span className={styles.routeDateLabel}>Дата загрузки:</span>
                        </div>
                        
                        <div>
                            <span className={styles.routeDateValue}>
                                {formatters.date(cargo.pickup_date || '')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Куда + дата выгрузки */}
                <div className={styles.routeRow}>
                    <div className={styles.routeLeft}>
                        <IonIcon icon={locationOutline} className={`${styles.routeIcon} ${styles.routeIconRed}`} />
                        <div className={styles.routeTextGroup}>
                            <span className={styles.routeLabel}>Куда:</span>
                            <span className={styles.routeCity}>
                                {cargo.destiny?.city.city || 'Не указано'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.routeRight}>
                        <div>
                            <span className={styles.routeDateLabel}>Дата выгрузки:</span>
                        </div>
                        <div>
                            <span className={styles.routeDateValue}>
                                {formatters.date(cargo.delivery_date || '')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Детали груза */}
            <div className={styles.cargoDetails + ' mt-05'}>
                <div className={styles.cargoDetailsTitle}>Детали груза:</div>
                <div className={styles.cargoDetailsList}>
                    <div className={styles.cargoDetailItem}>
                        Вес (т): <span className={styles.cargoDetailValue}>{cargo.weight}</span>
                    </div>
                    <div className={styles.cargoDetailItem}>
                        Объем (м³): <span className={styles.cargoDetailValue}>{cargo.volume}</span>
                    </div>
                </div>
                {cargo.description && (
                    <div className={styles.cargoDescription}>
                        {cargo.description}
                    </div>
                )}
            </div>
        </>
    );

    // Обёртка для разных режимов
    if (mode === 'view') {
        return (
            <div className="cr-card cargo-card-view">
                {CardInner}
            </div>
        );
    }

    // Режим для списка (новый компактный дизайн по образцу WorkCard)
    return (
        <div
            className="cr-card mt-1 cargo-card-list"
            onClick={handleClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {CardInner}
        </div>
    );
};


function getCircle( cargo: CargoInfo) {
   if(cargo.advance === cargo.price) return 'circle-1'
   if(cargo.advance !== 0 ) return 'circle-2'
   return 'circle-3'
}

function getCSS( cargo: CargoInfo) {
   if(cargo.advance === cargo.price) return 'cr-status-6'
   if(cargo.advance !== 0 ) return 'cr-status-2'
   return 'cr-status-5'
}
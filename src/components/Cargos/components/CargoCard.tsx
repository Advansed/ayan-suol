import React from 'react';
import { IonIcon, IonText } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { formatters, statusUtils } from '../../../utils/utils';
import { CargoInfo, CargoStatus } from '../../../Store/cargoStore';
import { useCompanyData } from '../../../Store/companyStore';
import { normalizeCargoStatus } from '../cargoStatusFlow';
import styles from './CargoCard.module.css';

function getCargoCompanyName(cargo: CargoInfo, companyName?: string | null): string {
    return cargo.company?.name || companyName || cargo.client || '';
}

interface CargoCardProps {
    cargo: CargoInfo;
    mode?: 'view' | 'list';
    selected?: boolean;
    onClick?: () => void;
}

const SURFACE_BY_STATUS: Record<CargoStatus, string> = {
    [CargoStatus.NEW]: styles.surfaceNew,
    [CargoStatus.WAITING]: styles.surfaceWaiting,
    [CargoStatus.HAS_ORDERS]: styles.surfaceHasOrders,
    [CargoStatus.ACCEPTED]: styles.surfaceAccepted,
    [CargoStatus.WAIT_LOAD]: styles.surfaceWaitLoad,
    [CargoStatus.LOADING]: styles.surfaceLoading,
    [CargoStatus.HAS_LOADED]: styles.surfaceHasLoaded,
    [CargoStatus.IN_TRANSIT]: styles.surfaceInTransit,
    [CargoStatus.HAS_DELIVERED]: styles.surfaceHasDelivered,
    [CargoStatus.UNLOADING]: styles.surfaceUnloading,
    [CargoStatus.WAIT_COMPLETE]: styles.surfaceWaitComplete,
    [CargoStatus.COMPLETED]: styles.surfaceCompleted,
    [CargoStatus.PROBLEMS]: styles.surfaceProblems,
};

export const CargoCard: React.FC<CargoCardProps> = ({ cargo, mode = 'list', selected, onClick }) => {
    const companyData = useCompanyData();
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const publishedAt = cargo.publish_date || '';

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

    if (cargo.status === CargoStatus.PROBLEMS) {
        tags.push({
            text: 'Проблемы',
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
                        {normalizeCargoStatus(cargo.status)}
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

            {publishedAt && (
                <div className={styles.publishedRow} title={formatters.date(publishedAt)}>
                    <span className={styles.publishedLabel}>Опубликовано</span>
                    <span className={styles.publishedValue}>{formatters.date(publishedAt)}</span>
                    {formatters.published(publishedAt) !== formatters.date(publishedAt) && (
                        <span className={styles.publishedRel}>{formatters.published(publishedAt)}</span>
                    )}
                </div>
            )}

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

    const surfaceClass = `${styles.cardSurface} ${SURFACE_BY_STATUS[normalizeCargoStatus(cargo.status)] ?? styles.surfaceNew}`;

    if (mode === 'view') {
        return (
            <div className={`cr-card cargo-card-view ${surfaceClass}`}>
                {CardInner}
            </div>
        );
    }

    const status = normalizeCargoStatus(cargo.status);
    const badge = feedBadge(status);
    const fromCity = cargo.address?.city.city || 'Не указано';
    const toCity = cargo.destiny?.city.city || 'Не указано';
    const distance = routeDistanceKm(cargo);
    const offers = cargo.invoices?.length ?? 0;
    const companyName = getCargoCompanyName(cargo, companyData?.name || companyData?.short_name);
    const publishedDate = publishedAt ? formatters.date(publishedAt) : '';
    const payment =
      cargo.advance > 0 && cargo.advance >= cargo.price
        ? 'Полная предоплата'
        : cargo.advance > 0
          ? 'Предоплата'
          : 'Безналичный';

    return (
        <button
            type="button"
            className={`${styles.feedCard} ${selected ? styles.feedCardSelected : ''}`}
            onClick={handleClick}
        >
            <div className={styles.feedTop}>
                <span className={`${styles.feedBadge} ${badge.className}`}>{badge.label}</span>
                <span className={styles.feedId}>ЗК-{formatters.shortId(cargo.guid)}</span>
                <span className={styles.feedPrice}>{formatters.currency(cargo.price)}</span>
            </div>

            <h3 className={styles.feedTitle}>{cargo.name || 'Без названия'}</h3>
            {(publishedDate || companyName) && (
                <div className={styles.feedPublished}>
                    <span className={styles.feedPublishedDate}>
                        {publishedDate ? `Дата ${publishedDate}` : ''}
                    </span>
                    {companyName && <span className={styles.feedCompany}>{companyName}</span>}
                </div>
            )}
            <div className={styles.feedPay}>{payment}</div>

            <div className={styles.feedRoute}>
                <span>{fromCity}</span>
                <span className={styles.feedArrow} aria-hidden>→</span>
                <span>{toCity}</span>
                {distance != null && (
                    <span className={styles.feedKm}>· {distance} км</span>
                )}
            </div>

            <div className={styles.feedMeta}>
                <span>
                    {Number(cargo.weight) || 0} т · {Number(cargo.volume) || 0} м³
                </span>
                <span className={styles.feedRight}>
                    {offers > 0 && (
                        <span className={styles.feedOffers}>{offersLabel(offers)}</span>
                    )}
                </span>
            </div>
        </button>
    );
};

function feedBadge(status: CargoStatus): { label: string; className: string } {
    if (status === CargoStatus.NEW || status === CargoStatus.WAITING) {
        return { label: 'Новый', className: styles.badgeNew };
    }
    if (status === CargoStatus.HAS_ORDERS) {
        return { label: 'Торги', className: styles.badgeBids };
    }
    if (status === CargoStatus.COMPLETED) {
        return { label: 'Завершён', className: styles.badgeDone };
    }
    if (status === CargoStatus.PROBLEMS) {
        return { label: 'Проблемы', className: styles.badgeAlert };
    }
    return { label: 'В работе', className: styles.badgeWork };
}

function offersLabel(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} предложение`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} предложения`;
    return `${count} предложений`;
}

function routeDistanceKm(cargo: CargoInfo): number | null {
    const from = cargo.address;
    const to = cargo.destiny;
    if (!from?.lat || !from?.lon || !to?.lat || !to?.lon) return null;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(to.lat - from.lat);
    const dLon = toRad(to.lon - from.lon);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
    const km = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
    return km > 0 ? Math.round(km) : null;
}


function getCircle( cargo: CargoInfo) {
   if(cargo.advance === cargo.price) return 'circle-1'
   if(cargo.advance !== 0 ) return 'circle-2'
   return 'circle-3'
}

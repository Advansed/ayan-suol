/**
 * Компонент карточки работы (новый дизайн по Figma)
 */

import React from 'react';
import { IonIcon } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { WorkInfo, WorkStatus } from '../types';
import { workFormatters, workStatusUtils } from '../utils';
import styles from './WorkCard.module.css';

interface WorkCardProps {
    work: WorkInfo;
    mode?: 'list' | 'view';
    onClick?: () => void;
}

export const WorkCard: React.FC<WorkCardProps> = ({ 
    work, 
    mode = 'list',
    onClick
}) => {
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    // Определяем теги для второй строки
    const getBottomTags = () => {
        const tags: Array<{ text: string; className: string }> = [];
        
        // Гарантированная оплата (если advance > 0)
        if (work.advance > 0) {
            const isFullAdvance = work.advance >= work.price;
            tags.push({
                text: 'Гарантированная оплата',
                className: isFullAdvance ? styles.tagGreen : styles.tagOrange
            });
        }
        
        // Застраховано (если insurance > 0)
        if (work.insurance > 0) {
            const isFullAdvance = work.advance >= work.price;
            tags.push({
                text: 'Застраховано',
                className: isFullAdvance ? styles.tagGreen : styles.tagOrange
            });
        }
        
        return tags;
    };

    const hasOffer = work.status === WorkStatus.OFFERED;
    const bottomTags = getBottomTags();

    // Режим для списка (новый дизайн)
    return (
        <div 
            className={styles.workCard}
            onClick={handleClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {/* Верхняя строка: два тега "Торг", ID, цена */}
            <div className={styles.topRow}>
                <div className={styles.topRowLeft}>
                    <span className={`${styles.statusBadge} ${styles.statusBargaining}`}>
                        { work.status }
                    </span>
                    <span className={'fs-08 cl-gray'}>
                        ID: {workFormatters.shortId(work.guid)}
                    </span>
                </div>
                <div className={styles.topRowRight}>
                    <span className={`${styles.statusBadge} ${styles.statusBargaining}`}>
                        Торг
                    </span>
                    <span className={`${styles.statusBadge} ${styles.statusWaiting}`}>
                        ₽ {work.price.toLocaleString('ru-RU').replace(/,/g, ' ')}
                    </span>
                </div>
            </div>

            {/* Вторая строка: теги */}
            {bottomTags.length > 0 && (
                <div className={styles.tagsRow}>
                    {bottomTags.map((tag, index) => (
                        <span key={index} className={`${styles.tag} ${tag.className}`}>
                            { tag.text }
                        </span>
                    ))}
                </div>
            )}

            {/* Название груза */}
            <div className={styles.cargoName}>
                <span className={styles.cargoNameText}>
                    <b className='fs-09'>{work.name}</b>
                </span>
            </div>

            {/* Маршрут в две строки, как в дизайне */}
            <div className={styles.routeSection + ' mt-05'}>
                {/* Откуда + дата загрузки */}
                <div className={styles.routeRow}>
                    <div className={styles.routeLeft}>
                        <IonIcon icon={locationOutline} className={`${styles.routeIcon} ${styles.routeIconGreen}`} />
                        <div className={styles.routeTextGroup}>
                            <span className={styles.routeLabel}>Откуда:</span>
                            <span className={styles.routeCity}>
                                {work.address?.city.city || 'Не указано'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.routeRight}>
                        <span className={styles.routeDateLabel}>Дата загрузки:</span>
                        <span className={styles.routeDateValue}>
                            {workFormatters.date(work.pickup_date || '')}
                        </span>
                    </div>
                </div>

                {/* Куда + дата загрузки (как в макете) */}
                <div className={styles.routeRow}>
                    <div className={styles.routeLeft}>
                        <IonIcon icon={locationOutline} className={`${styles.routeIcon} ${styles.routeIconRed}`} />
                        <div className={styles.routeTextGroup}>
                            <span className={styles.routeLabel}>Куда:</span>
                            <span className={styles.routeCity}>
                                {work.destiny?.city.city || 'Не указано'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.routeRight}>
                        <span className={styles.routeDateLabel}>Дата загрузки:</span>
                        <span className={styles.routeDateValue}>
                            {workFormatters.date(work.pickup_date || '')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Детали груза */}
            <div className={styles.cargoDetails}>
                <div className={styles.cargoDetailsTitle}>Детали груза:</div>
                <div className={styles.cargoDetailsList}>
                    <div className={styles.cargoDetailItem}>
                        Вес (т): <span className={styles.cargoDetailValue}>{work.weight}</span>
                    </div>
                    <div className={styles.cargoDetailItem}>
                        Объем (м³): <span className={styles.cargoDetailValue}>{work.volume}</span>
                    </div>
                </div>
                {work.description && (
                    <div className={styles.cargoDescription}>
                        {work.description}
                    </div>
                )}
            </div>
        </div>
    );
};

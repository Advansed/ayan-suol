import React from 'react';
import { WorkInfo, WorkStatus } from '../types';
import { getWorkCustomerName, workFormatters } from '../utils';
import { normalizeWorkStatus } from '../statusFlow';
import styles from './WorkCard.module.css';

interface WorkCardProps {
  work: WorkInfo;
  mode?: 'list' | 'view';
  selected?: boolean;
  onClick?: () => void;
}

export const WorkCard: React.FC<WorkCardProps> = ({ work, selected, onClick }) => {
  const status = normalizeWorkStatus(work.status);
  const badge = feedBadge(status);
  const fromCity = work.address?.city.city || 'Не указано';
  const toCity = work.destiny?.city.city || 'Не указано';
  const distance = routeDistanceKm(work);
  const offers = work.offers?.length ?? 0;
  const publishedAt = work.publish_date || '';
  const payment =
    work.advance > 0 && work.advance >= work.price
      ? 'Полная предоплата'
      : work.advance > 0
        ? 'Наличный расчёт'
        : 'Безналичный';
  const bodyType =
    work.transport && !looksLikeGuid(work.transport) ? work.transport : null;
  const customerName = getWorkCustomerName(work);
  const publishedDate = publishedAt ? workFormatters.date(publishedAt) : '';

  return (
    <button
      type="button"
      className={`${styles.feedCard} ${selected ? styles.feedCardSelected : ''}`}
      onClick={onClick}
    >
      <div className={styles.feedTop}>
        <span className={`${styles.feedBadge} ${badge.className}`}>{badge.label}</span>
        <span className={styles.feedId}>ЗК-{workFormatters.shortId(work.guid || work.cargo)}</span>
        <span className={styles.feedPrice}>{workFormatters.currency(work.price)}</span>
      </div>

      <h3 className={styles.feedTitle}>{work.name || 'Без названия'}</h3>
      {(publishedDate || customerName) && (
        <div className={styles.feedPublished}>
          <span className={styles.feedPublishedDate}>
            {publishedDate ? `Дата ${publishedDate}` : ''}
          </span>
          {customerName && <span className={styles.feedCompany}>{customerName}</span>}
        </div>
      )}
      <div className={styles.feedPay}>
        {payment}
        {bodyType ? ` · ${bodyType}` : ''}
      </div>

      <div className={styles.feedRoute}>
        <span>{fromCity}</span>
        <span className={styles.feedArrow} aria-hidden>
          →
        </span>
        <span>{toCity}</span>
        {distance != null && <span className={styles.feedKm}>· {distance} км</span>}
      </div>

      <div className={styles.feedMeta}>
        <span>
          {Number(work.weight) || 0} т · {Number(work.volume) || 0} м³
        </span>
        <span className={styles.feedRight}>
          {offers > 0 && <span className={styles.feedOffers}>{offersLabel(offers)}</span>}
        </span>
      </div>
    </button>
  );
};

function feedBadge(status: WorkStatus): { label: string; className: string } {
  if (status === WorkStatus.NEW) return { label: 'Новый', className: styles.badgeNew };
  if (status === WorkStatus.OFFERED) return { label: 'Торги', className: styles.badgeBids };
  if (status === WorkStatus.COMPLETED) return { label: 'Завершён', className: styles.badgeDone };
  if (status === WorkStatus.REJECTED) return { label: 'Отказано', className: styles.badgeAlert };
  return { label: 'В работе', className: styles.badgeWork };
}

function offersLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} предложение`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} предложения`;
  return `${count} предложений`;
}

function looksLikeGuid(value: string): boolean {
  return /^[0-9a-f-]{16,}$/i.test(value.trim());
}

function routeDistanceKm(work: WorkInfo): number | null {
  const from = work.address;
  const to = work.destiny;
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

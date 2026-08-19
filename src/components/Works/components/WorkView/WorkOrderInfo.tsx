import React from 'react';
import { MapPin, Package, Calendar, User, Phone, Shield, Wallet, Building2 } from 'lucide-react';
import { WorkInfo } from '../../types';
import { workFormatters } from '../../utils';
import styles from './WorkOrderInfo.module.css';

type WorkOrderInfoProps = {
  work: WorkInfo;
};

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={styles.row}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.rowBody}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
}

export const WorkOrderInfo: React.FC<WorkOrderInfoProps> = ({ work }) => {
  const price = work.currentOffer?.price ?? work.price;
  const weight = work.currentOffer?.weight ?? work.weight;
  const volume = work.currentOffer?.volume ?? work.volume;
  const fromCity = work.address?.city?.city || 'Не указано';
  const toCity = work.destiny?.city?.city || 'Не указано';
  const fromAddress = work.address?.address || '';
  const toAddress = work.destiny?.address || '';
  const publishedAt = work.publish_date || '';
  const customerName = work.company?.name || work.client;
  const contactName = work.face && work.face !== customerName ? work.face : '';

  return (
    <section className={styles.card} aria-label="Информация о заказе">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>Информация о заказе</div>
          <h2 className={styles.title}>{work.name || 'Без названия'}</h2>
        </div>
        <div className={styles.price}>{workFormatters.currency(price)}</div>
      </div>

      <div className={styles.route}>
        <div className={styles.routePoint}>
          <span className={`${styles.dot} ${styles.dotFrom}`} />
          <div className={styles.routeBody}>
            <div className={styles.routeLabel}>Откуда</div>
            <div className={styles.routeCity}>{fromCity}</div>
            {fromAddress && <div className={styles.routeAddr}>{fromAddress}</div>}
          </div>
        </div>
        <span className={styles.routeArrow} aria-hidden>
          →
        </span>
        <div className={styles.routePoint}>
          <span className={`${styles.dot} ${styles.dotTo}`} />
          <div className={styles.routeBody}>
            <div className={styles.routeLabel}>Куда</div>
            <div className={styles.routeCity}>{toCity}</div>
            {toAddress && <div className={styles.routeAddr}>{toAddress}</div>}
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <Row
          icon={<Package size={16} strokeWidth={1.75} />}
          label="Вес / объём"
          value={`${weight} т · ${volume} м³`}
        />
        <Row
          icon={<Calendar size={16} strokeWidth={1.75} />}
          label="Загрузка"
          value={workFormatters.date(work.pickup_date || '')}
        />
        <Row
          icon={<Calendar size={16} strokeWidth={1.75} />}
          label="Доставка"
          value={workFormatters.date(work.delivery_date || '')}
        />
        <Row
          icon={<Calendar size={16} strokeWidth={1.75} />}
          label="Опубликовано"
          value={publishedAt ? workFormatters.date(publishedAt) : null}
        />
        <Row
          icon={<Building2 size={16} strokeWidth={1.75} />}
          label="Заказчик"
          value={customerName || work.face}
        />
        <Row
          icon={<User size={16} strokeWidth={1.75} />}
          label="Контакт"
          value={customerName ? contactName : null}
        />
        <Row
          icon={<Phone size={16} strokeWidth={1.75} />}
          label="Телефон"
          value={work.phone}
        />
        <Row
          icon={<Wallet size={16} strokeWidth={1.75} />}
          label="Аванс"
          value={work.advance > 0 ? workFormatters.currency(work.advance) : null}
        />
        <Row
          icon={<Shield size={16} strokeWidth={1.75} />}
          label="Страховка"
          value={work.insurance > 0 ? workFormatters.currency(work.insurance) : null}
        />
        <Row
          icon={<MapPin size={16} strokeWidth={1.75} />}
          label="Маршрут"
          value={`${fromCity} → ${toCity}`}
        />
      </div>

      {work.description && (
        <div className={styles.desc}>
          <div className={styles.label}>Описание</div>
          <p>{work.description}</p>
        </div>
      )}
    </section>
  );
};

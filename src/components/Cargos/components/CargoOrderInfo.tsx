import React from 'react';
import { MapPin, Package, Calendar, User, Phone, Shield, Wallet, Building2 } from 'lucide-react';
import { CargoInfo } from '../../../Store/cargoStore';
import { useCompanyData } from '../../../Store/companyStore';
import { formatters } from '../../../utils/utils';
import styles from './CargoOrderInfo.module.css';

type CargoOrderInfoProps = {
  cargo: CargoInfo;
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

export const CargoOrderInfo: React.FC<CargoOrderInfoProps> = ({ cargo }) => {
  const companyData = useCompanyData();
  const fromCity = cargo.address?.city?.city || 'Не указано';
  const toCity = cargo.destiny?.city?.city || 'Не указано';
  const fromAddress = cargo.address?.address || '';
  const toAddress = cargo.destiny?.address || '';
  const publishedAt = cargo.publish_date || '';
  const companyName = cargo.company?.name || companyData?.name || companyData?.short_name || cargo.client;
  const contactName = cargo.face && cargo.face !== companyName ? cargo.face : '';

  return (
    <section className={styles.card} aria-label="Информация о заказе">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>Информация о заказе</div>
          <h2 className={styles.title}>{cargo.name || 'Без названия'}</h2>
        </div>
        <div className={styles.price}>{formatters.currency(cargo.price)}</div>
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
          value={`${cargo.weight} т · ${cargo.volume} м³`}
        />
        <Row
          icon={<Calendar size={16} strokeWidth={1.75} />}
          label="Загрузка"
          value={formatters.date(cargo.pickup_date || '')}
        />
        <Row
          icon={<Calendar size={16} strokeWidth={1.75} />}
          label="Доставка"
          value={formatters.date(cargo.delivery_date || '')}
        />
        <Row
          icon={<Calendar size={16} strokeWidth={1.75} />}
          label="Опубликовано"
          value={publishedAt ? formatters.date(publishedAt) : null}
        />
        <Row
          icon={<Building2 size={16} strokeWidth={1.75} />}
          label="Заказчик"
          value={companyName || cargo.face}
        />
        <Row
          icon={<User size={16} strokeWidth={1.75} />}
          label="Контакт"
          value={companyName ? contactName : null}
        />
        <Row
          icon={<Phone size={16} strokeWidth={1.75} />}
          label="Телефон"
          value={cargo.phone}
        />
        <Row
          icon={<Wallet size={16} strokeWidth={1.75} />}
          label="Аванс"
          value={cargo.advance > 0 ? formatters.currency(cargo.advance) : null}
        />
        <Row
          icon={<Shield size={16} strokeWidth={1.75} />}
          label="Страховка"
          value={cargo.insurance > 0 ? formatters.currency(cargo.insurance) : null}
        />
        <Row
          icon={<MapPin size={16} strokeWidth={1.75} />}
          label="Маршрут"
          value={`${fromCity} → ${toCity}`}
        />
      </div>

      {cargo.description && (
        <div className={styles.desc}>
          <div className={styles.label}>Описание</div>
          <p>{cargo.description}</p>
        </div>
      )}
    </section>
  );
};

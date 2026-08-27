import React, { useMemo } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Box,
  Calendar,
  Gauge,
  Plus,
  Truck,
  User,
} from 'lucide-react';
import { TransportData, asTransportType, transportDisplayName, transportDriverName } from '../../../Store/transportStore';
import { resolveImageSrc } from '../../../utils/fileUpload';
import { useWorkStore } from '../../Works/workStore';
import { MY_WORK_STATUSES, normalizeWorkStatus } from '../../Works/statusFlow';
import { plural } from '../../Works/feedFormat';
import styles from './FleetPage.module.css';

export type FleetStatus = 'free' | 'trip' | 'service';

type FleetPageProps = {
  vehicles: TransportData[];
  onAdd: () => void;
  onOpen: (vehicle: TransportData) => void;
};

const STATUS_LABEL: Record<FleetStatus, string> = {
  free: 'Свободна',
  trip: 'В рейсе',
  service: 'На ТО',
};

export const FleetPage: React.FC<FleetPageProps> = ({ vehicles, onAdd, onOpen }) => {
  const works = useWorkStore((s) => s.works);

  const rows = useMemo(
    () => vehicles.map((vehicle) => ({ vehicle, status: resolveStatus(vehicle, works) })),
    [vehicles, works]
  );

  const total = rows.length;
  const free = rows.filter((row) => row.status === 'free').length;
  const trip = rows.filter((row) => row.status === 'trip').length;

  return (
    <div className={styles.root}>
      <header className={styles.head}>
        <div>
          <div className={styles.kicker}>Автопарк</div>
          <h1 className={styles.title}>Мои машины</h1>
          <p className={styles.sub}>
            {total} {plural(total, 'машина', 'машины', 'машин')} · {free} свободно · {trip} в
            рейсе
          </p>
        </div>
        <button type="button" className={styles.addBtn} onClick={onAdd}>
          <Plus size={18} strokeWidth={2.25} />
          Добавить машину
        </button>
      </header>

      <div className={styles.stats}>
        <article className={styles.statCard}>
          <div className={styles.statLabel}>Всего машин</div>
          <div className={styles.statValue}>{total}</div>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statLabel}>Свободны сейчас</div>
          <div className={`${styles.statValue} ${styles.statGreen}`}>{free}</div>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statLabel}>В рейсе</div>
          <div className={`${styles.statValue} ${styles.statBlue}`}>{trip}</div>
        </article>
      </div>

      <div className={styles.grid}>
        {rows.map(({ vehicle, status }) => (
          <VehicleCard
            key={vehicle.guid || vehicle.license_plate || vehicle.name}
            vehicle={vehicle}
            status={status}
            onClick={() => onOpen(vehicle)}
          />
        ))}
        <button type="button" className={styles.addCard} onClick={onAdd}>
          <span className={styles.addCardIcon}>
            <Plus size={22} strokeWidth={2.25} />
          </span>
          Добавить машину в парк
        </button>
      </div>
    </div>
  );
};

function VehicleCard({
  vehicle,
  status,
  onClick,
}: {
  vehicle: TransportData;
  status: FleetStatus;
  onClick: () => void;
}) {
  const type = asTransportType(vehicle.transport_type);
  const title = transportDisplayName(vehicle) || 'Без названия';
  const plate = vehicle.license_plate || vehicle.number || '';
  const body = type?.name || '—';
  const tons = vehicle.load_capacity ?? vehicle.capacity;
  const volume = vehicle.volume;
  const year = vehicle.manufacture_year || vehicle.year;
  const mileage = vehicle.mileage;
  const driver = transportDriverName(vehicle) || 'Не назначен';
  const verified = vehicle.verified ?? Boolean(vehicle.vin && vehicle.image);
  const needsVerify = !vehicle.vin || !vehicle.image;
  const capacityLabel = [
    tons != null ? `${formatNum(tons)} т` : '',
    volume != null ? `${formatNum(volume)} м³` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const yearLabel = [
    year ? String(year) : '',
    mileage != null ? `${formatMileage(mileage)} тыс. км` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const photo = vehicle.image ? resolveImageSrc(vehicle.image) : '';

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.cardPhoto}>
        {photo ? (
          <img src={photo} alt="" />
        ) : (
          <span className={styles.cardPhotoEmpty} aria-hidden>
            <Truck size={28} strokeWidth={1.5} />
          </span>
        )}
      </div>
      <div className={styles.cardHead}>
        <div className={styles.cardId}>
          <div className={styles.cardName}>
            {title}
            {verified && (
              <BadgeCheck size={16} strokeWidth={2} className={styles.verified} aria-label="Проверена" />
            )}
          </div>
          {plate && <div className={styles.cardPlate}>{plate}</div>}
        </div>
        <span className={`${styles.badge} ${
          status === 'trip' ? styles.badge_trip : status === 'service' ? styles.badge_service : styles.badge_free
        }`}>{STATUS_LABEL[status]}</span>
      </div>

      <div className={styles.meta}>
        <Meta icon={<Box size={15} />} label="Кузов" value={body} />
        <Meta icon={<Gauge size={15} />} label="Грузоподъёмность" value={capacityLabel || '—'} />
        <Meta icon={<User size={15} />} label="Водитель" value={driver} />
        <Meta icon={<Calendar size={15} />} label="Год · пробег" value={yearLabel || '—'} />
      </div>

      {needsVerify && (
        <div className={styles.warn}>
          <AlertTriangle size={14} strokeWidth={2} />
          Требуется верификация — загрузите СТС в профиле
        </div>
      )}
    </button>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.metaItem}>
      <span className={styles.metaIcon}>{icon}</span>
      <div>
        <div className={styles.metaLabel}>{label}</div>
        <div className={styles.metaValue}>{value}</div>
      </div>
    </div>
  );
}

function resolveStatus(
  vehicle: TransportData,
  works: { transport?: string; status: string }[]
): FleetStatus {
  if (vehicle.status === 'service' || vehicle.status === 'trip' || vehicle.status === 'free') {
    return vehicle.status;
  }
  const guid = vehicle.guid;
  if (guid) {
    const onTrip = works.some((work) => {
      if (work.transport !== guid) return false;
      return MY_WORK_STATUSES.includes(normalizeWorkStatus(work.status));
    });
    if (onTrip) return 'trip';
  }
  return 'free';
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',');
}

function formatMileage(km: number): string {
  const thousands = km >= 1000 ? Math.round(km / 1000) : km;
  return String(thousands);
}

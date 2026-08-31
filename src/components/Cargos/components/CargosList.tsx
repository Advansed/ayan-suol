import React, { useMemo, useState } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { CargoCard } from './CargoCard';
import { CargoInfo, CargoStatus } from '../../../Store/cargoStore';
import { cargoFeedKind, resolveCargoProgressStatus } from '../cargoStatusFlow';
import styles from './CargosList.module.css';

type FilterId = 'all' | 'new' | 'bids' | 'work' | 'done';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новый' },
  { id: 'bids', label: 'Торги' },
  { id: 'work', label: 'В работе' },
  { id: 'done', label: 'Завершён' },
];

function matchesFilter(status: CargoStatus, filter: FilterId): boolean {
  if (filter === 'all') return true;
  const kind = cargoFeedKind(status);
  if (filter === 'work') return kind === 'work' || kind === 'alert';
  if (filter === 'new') return kind === 'new' || kind === 'waiting';
  return kind === filter;
}

function activeOrdersLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 0) return 'нет активных заказов';
  if (mod10 === 1 && mod100 !== 11) return `${count} активный заказ`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} активных заказа`;
  return `${count} активных заказов`;
}

interface CargosListProps {
  cargos: CargoInfo[];
  isLoading?: boolean;
  onCreateNew: () => void;
  onCargoClick: (cargo: CargoInfo) => void;
  onRefresh?: () => Promise<void>;
}

export const CargosList: React.FC<CargosListProps> = ({
  cargos,
  isLoading = false,
  onCreateNew,
  onCargoClick,
}) => {
  const [filter, setFilter] = useState<FilterId>('all');

  const visible = useMemo(
    () =>
      cargos.filter((cargo) =>
        matchesFilter(resolveCargoProgressStatus(cargo), filter)
      ),
    [cargos, filter]
  );

  return (
    <div className={styles.feed}>
      <header className={styles.pageHead}>
        <div className={styles.pageHeadText}>
          <h1 className={styles.pageTitle}>Лента заказов</h1>
          <p className={styles.pageSub}>
            {activeOrdersLabel(cargos.length)} · обновлено только что
          </p>
        </div>
        <button type="button" className={styles.createBtn} onClick={onCreateNew}>
          <Plus size={16} strokeWidth={2.25} />
          Новый груз
        </button>
      </header>

      <div className={styles.legend} aria-label="Светофор безопасной оплаты">
        <span className={styles.legendTitle}>Светофор безопасной оплаты</span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotFull}`} />
          Полная оплата на эскроу
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotPartial}`} />
          Частичная оплата
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotNone}`} />
          Без безопасной оплаты
        </span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Фильтр заказов">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`${styles.tab} ${filter === item.id ? styles.tabActive : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className={styles.filterBtn}>
          <SlidersHorizontal size={15} strokeWidth={2} />
          Фильтры
        </button>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loading}>Загрузка грузов…</div>
        ) : visible.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>
              {cargos.length === 0 ? 'Грузы не найдены' : 'Нет заказов в этом фильтре'}
            </p>
            <p className={styles.emptyHint}>
              {cargos.length === 0
                ? 'Создайте первый груз для перевозки'
                : 'Переключите фильтр или создайте новый заказ'}
            </p>
          </div>
        ) : (
          visible.map((cargo) => (
            <CargoCard
              key={cargo.guid}
              cargo={cargo}
              mode="list"
              onClick={() => onCargoClick(cargo)}
            />
          ))
        )}
      </div>
    </div>
  );
};

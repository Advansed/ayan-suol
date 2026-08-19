import React, { useMemo, useState } from 'react';
import { ChevronLeft, Plus, SlidersHorizontal } from 'lucide-react';
import { CargoCard } from './CargoCard';
import { CargoOrderInfo } from './CargoOrderInfo';
import { CargoStatusTimeline } from './CargoStatusTimeline';
import { CargoInfo, CargoStatus } from '../../../Store/cargoStore';
import { getCargoActionHint, normalizeCargoStatus, resolveCargoProgressStatus } from '../cargoStatusFlow';
import styles from './CargosList.module.css';

type FilterId = 'all' | 'new' | 'bids' | 'work' | 'done';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новые' },
  { id: 'bids', label: 'Торги' },
  { id: 'work', label: 'В работе' },
  { id: 'done', label: 'Завершённые' },
];

const NEW_STATUSES = new Set<CargoStatus>([CargoStatus.NEW, CargoStatus.WAITING]);
const BID_STATUSES = new Set<CargoStatus>([CargoStatus.HAS_ORDERS]);
const DONE_STATUSES = new Set<CargoStatus>([CargoStatus.COMPLETED]);

function matchesFilter(status: CargoStatus, filter: FilterId): boolean {
  if (filter === 'all') return true;
  if (filter === 'new') return NEW_STATUSES.has(status);
  if (filter === 'bids') return BID_STATUSES.has(status);
  if (filter === 'done') return DONE_STATUSES.has(status);
  return !NEW_STATUSES.has(status) && !BID_STATUSES.has(status) && !DONE_STATUSES.has(status);
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
  const [selectedGuid, setSelectedGuid] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      cargos.filter((cargo) =>
        matchesFilter(normalizeCargoStatus(cargo.status), filter)
      ),
    [cargos, filter]
  );

  const selected = useMemo(
    () => (selectedGuid ? cargos.find((cargo) => cargo.guid === selectedGuid) ?? null : null),
    [cargos, selectedGuid]
  );

  return (
    <div className={styles.feed}>
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
        <div className={styles.toolbarActions}>
          <button type="button" className={styles.filterBtn}>
            <SlidersHorizontal size={15} strokeWidth={2} />
            Фильтры
          </button>
          <button type="button" className={styles.createBtn} onClick={onCreateNew}>
            <Plus size={16} strokeWidth={2.25} />
            Новый груз
          </button>
        </div>
      </div>

      <div className={`${styles.split} ${selected ? styles.splitSelected : ''}`}>
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
                selected={cargo.guid === selectedGuid}
                onClick={() => setSelectedGuid(cargo.guid)}
              />
            ))
          )}
        </div>

        <aside className={`${styles.detail} ${selected ? styles.detailOpen : ''}`}>
          {selected ? (
            <>
              <button
                type="button"
                className={styles.detailBack}
                onClick={() => setSelectedGuid(null)}
              >
                <ChevronLeft size={18} strokeWidth={2} />
                К списку
              </button>
              <CargoStatusTimeline cargo={selected} />
              <CargoOrderInfo cargo={selected} />
              <button
                type="button"
                className={styles.detailAction}
                onClick={() => onCargoClick(selected)}
              >
                <span className={styles.detailActionTitle}>Действие по статусу</span>
                <span className={styles.detailActionHint}>
                  {getCargoActionHint(resolveCargoProgressStatus(selected))}
                </span>
              </button>
            </>
          ) : (
            <>
              <h3 className={styles.detailTitle}>Выберите заказ</h3>
              <p className={styles.detailHint}>
                Нажмите на любой заказ, чтобы увидеть все детали и отклики
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

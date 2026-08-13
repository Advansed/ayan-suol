import React, { useMemo, useState } from 'react';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { WorkInfo, WorkStatus } from '../types';
import { WorkCard } from './WorkCard';
import { WorkOrderInfo } from './WorkView/WorkOrderInfo';
import { normalizeWorkStatus } from '../statusFlow';
import styles from './WorksList.module.css';

type FilterId = 'all' | 'new' | 'bids' | 'work' | 'done';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новые' },
  { id: 'bids', label: 'Торги' },
  { id: 'work', label: 'В работе' },
  { id: 'done', label: 'Завершённые' },
];

function matchesFilter(status: WorkStatus, filter: FilterId): boolean {
  if (filter === 'all') return true;
  if (filter === 'new') return status === WorkStatus.NEW;
  if (filter === 'bids') return status === WorkStatus.OFFERED;
  if (filter === 'done') return status === WorkStatus.COMPLETED;
  return status !== WorkStatus.NEW && status !== WorkStatus.OFFERED && status !== WorkStatus.COMPLETED;
}

function workKey(work: WorkInfo): string {
  return work.guid || work.cargo;
}

interface WorksListProps {
  works: WorkInfo[];
  isLoading?: boolean;
  onWorkClick: (work: WorkInfo) => void;
  onRefresh?: () => Promise<void>;
  emptyTitle?: string;
  emptyHint?: string;
  variant?: 'feed' | 'simple';
}

const WorksListInner: React.FC<WorksListProps> = ({
  works,
  isLoading = false,
  onWorkClick,
  emptyTitle = 'Нет доступных заказов',
  emptyHint = 'Доступные заказы появятся здесь, когда их опубликуют заказчики',
  variant = 'simple',
}) => {
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      variant === 'feed'
        ? works.filter((work) => matchesFilter(normalizeWorkStatus(work.status), filter))
        : works,
    [works, filter, variant]
  );

  const selected = useMemo(
    () => (selectedKey ? works.find((work) => workKey(work) === selectedKey) ?? null : null),
    [works, selectedKey]
  );

  const list = (
    <>
      {isLoading ? (
        <div className={styles.loading}>Загрузка заказов…</div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{emptyTitle}</p>
          <p className={styles.emptyHint}>{emptyHint}</p>
        </div>
      ) : (
        visible.map((work) => (
          <WorkCard
            key={workKey(work)}
            work={work}
            mode="list"
            selected={variant === 'feed' && workKey(work) === selectedKey}
            onClick={() => {
              if (variant === 'feed') {
                setSelectedKey(workKey(work));
                return;
              }
              onWorkClick(work);
            }}
          />
        ))
      )}
    </>
  );

  if (variant !== 'feed') {
    return <div className={styles.list}>{list}</div>;
  }

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
        <button type="button" className={styles.filterBtn}>
          <SlidersHorizontal size={15} strokeWidth={2} />
          Фильтры
        </button>
      </div>

      <div className={`${styles.split} ${selected ? styles.splitSelected : ''}`}>
        <div className={styles.list}>{list}</div>
        <aside className={`${styles.detail} ${selected ? styles.detailOpen : ''}`}>
          {selected ? (
            <>
              <button
                type="button"
                className={styles.detailBack}
                onClick={() => setSelectedKey(null)}
              >
                <ChevronLeft size={18} strokeWidth={2} />
                К списку
              </button>
              <WorkOrderInfo work={selected} />
              <button
                type="button"
                className={styles.detailAction}
                onClick={() => onWorkClick(selected)}
              >
                Открыть
              </button>
            </>
          ) : (
            <>
              <h3 className={styles.detailTitle}>Выберите заказ</h3>
              <p className={styles.detailHint}>
                Нажмите на любой заказ, чтобы увидеть все детали и откликнуться
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export const WorksList = React.memo(WorksListInner);

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { List, Map, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { WorkInfo, WorkStatus } from '../types';
import { WorkCard } from './WorkCard';
import { normalizeWorkStatus } from '../statusFlow';
import { FeedRoutesMap } from '../../Maps/FeedRoutesMap';
import { ordersToFeedRoutes } from '../../Maps/mockFeedRoutes';
import styles from './WorksList.module.css';

type FilterId = 'all' | 'new' | 'bids' | 'work' | 'done';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новый' },
  { id: 'bids', label: 'Торги' },
  { id: 'work', label: 'В работе' },
  { id: 'done', label: 'Завершён' },
];

function matchesFilter(status: WorkStatus, filter: FilterId): boolean {
  if (filter === 'all') return true;
  if (filter === 'new') return status === WorkStatus.NEW;
  if (filter === 'bids') return status === WorkStatus.OFFERED;
  if (filter === 'done') return status === WorkStatus.COMPLETED;
  // «В работе»: после торгов и до завершения (без отказа)
  return (
    status !== WorkStatus.NEW &&
    status !== WorkStatus.OFFERED &&
    status !== WorkStatus.COMPLETED &&
    status !== WorkStatus.REJECTED
  );
}

function workKey(work: WorkInfo): string {
  return work.guid || work.cargo;
}

function activeOrdersLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 0) return 'нет активных заказов';
  if (mod10 === 1 && mod100 !== 11) return `${count} активный заказ`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} активных заказа`;
  return `${count} активных заказов`;
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

function updatedLabel(at: number): string {
  const mins = Math.floor((Date.now() - at) / 60000);
  if (mins < 1) return 'обновлено только что';
  if (mins === 1) return 'обновлено 1 минуту назад';
  const time = new Date(at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `обновлено в ${time}`;
}

const WorksListInner: React.FC<WorksListProps> = ({
  works,
  isLoading = false,
  onWorkClick,
  onRefresh,
  emptyTitle = 'Нет доступных заказов',
  emptyHint = 'Доступные заказы появятся здесь, когда их опубликуют заказчики',
  variant = 'simple',
}) => {
  const [filter, setFilter] = useState<FilterId>('all');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const waitingRefresh = useRef(false);

  const visible = useMemo(
    () =>
      variant === 'feed'
        ? works.filter((work) => matchesFilter(normalizeWorkStatus(work.status), filter))
        : works,
    [works, filter, variant]
  );

  const mapRoutes = useMemo(() => ordersToFeedRoutes(visible), [visible]);

  useEffect(() => {
    if (!waitingRefresh.current) return;
    waitingRefresh.current = false;
    setRefreshing(false);
    setUpdatedAt(Date.now());
  }, [works]);

  useEffect(() => {
    if (!refreshing) return;
    const timer = window.setTimeout(() => {
      waitingRefresh.current = false;
      setRefreshing(false);
      setUpdatedAt(Date.now());
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [refreshing]);

  const handleRefresh = () => {
    if (!onRefresh || refreshing) return;
    waitingRefresh.current = true;
    setRefreshing(true);
    void onRefresh();
  };

  const list = (
    <>
      {isLoading && works.length === 0 ? (
        <div className={styles.loading}>Загрузка заказов…</div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>
            {works.length === 0 ? emptyTitle : 'Нет заказов в этом фильтре'}
          </p>
          <p className={styles.emptyHint}>
            {works.length === 0 ? emptyHint : 'Переключите фильтр, чтобы увидеть другие заказы'}
          </p>
        </div>
      ) : (
        visible.map((work) => (
          <WorkCard
            key={workKey(work)}
            work={work}
            mode="list"
            onClick={() => onWorkClick(work)}
          />
        ))
      )}
    </>
  );

  if (variant !== 'feed') {
    return <div className={styles.list}>{list}</div>;
  }

  return (
    <div className={`${styles.feed} ${view === 'map' ? styles.feedFill : ''}`} data-feed-view={view}>
      <header className={styles.pageHead}>
        <div className={styles.pageHeadText}>
          <h1 className={styles.pageTitle}>Лента заказов</h1>
          <p className={styles.pageSub}>
            {activeOrdersLabel(works.length)} · {updatedLabel(updatedAt)}
          </p>
        </div>
        <div className={styles.pageHeadActions}>
          <div className={styles.viewToggle} role="tablist" aria-label="Вид ленты">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'list'}
              className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
              onClick={() => setView('list')}
            >
              <List size={16} strokeWidth={2} />
              Список
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'map'}
              className={`${styles.viewBtn} ${view === 'map' ? styles.viewBtnActive : ''}`}
              onClick={() => setView('map')}
            >
              <Map size={16} strokeWidth={2} />
              Карта
            </button>
          </div>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={refreshing || !onRefresh}
            aria-label="Обновить ленту"
            title="Обновить"
          >
            <RefreshCw size={18} strokeWidth={2.25} className={refreshing ? styles.refreshSpin : undefined} />
            Обновить
          </button>
        </div>
      </header>

      {view === 'map' ? (
        <>
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
          </div>
          <FeedRoutesMap
            routes={mapRoutes}
            onRouteClick={(routeId) => {
              const work = visible.find(
                (item) => item.guid === routeId || item.cargo === routeId
              );
              if (work) onWorkClick(work);
            }}
          />
        </>
      ) : (
        <>
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

          <div className={styles.list}>{list}</div>
        </>
      )}
    </div>
  );
};

export const WorksList = React.memo(WorksListInner);

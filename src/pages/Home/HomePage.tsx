import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Banknote,
  Check,
  ChevronRight,
  FileText,
  IdCard,
  LifeBuoy,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  Send,
  Star,
  Truck,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLoginStore } from '../../Store/loginStore';
import { useTransportData } from '../../Store/transportStore';
import { useCompanyData } from '../../Store/companyStore';
import { PanelFrame } from '../../layout/PanelFrame';
import styles from './HomePage.module.css';

type ActivityItem = {
  id: string;
  title: string;
  time: string;
  icon: LucideIcon;
};

const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: 'delivered',
    title: 'Рейс ЗК-10468 доставлен в Екатеринбург',
    time: '2 часа назад',
    icon: PackageCheck,
  },
  {
    id: 'payout',
    title: 'Выплата 26 000 ₽ зачислена на баланс',
    time: '3 часа назад',
    icon: Banknote,
  },
  {
    id: 'message',
    title: 'Новое сообщение от ООО "СтройГрад"',
    time: '5 часов назад',
    icon: MessageCircle,
  },
  {
    id: 'offer',
    title: 'Вы откликнулись на заказ ЗК-10482',
    time: 'Вчера, 18:24',
    icon: Send,
  },
];

export const HomePage: React.FC = () => {
  const history = useHistory();
  const name = useLoginStore((s) => s.name);
  const userType = useLoginStore((s) => s.user_type);
  const ratings = useLoginStore((s) => s.ratings);
  const account = useLoginStore((s) => s.account);
  const transport = useTransportData();
  const company = useCompanyData();

  const isCarrier = userType === 2;
  const displayName = name?.trim() || 'Пользователь';

  const checklist = useMemo(() => {
    const items = [
      {
        id: 'passport',
        label: 'Пройти верификацию паспорта',
        done: false,
        icon: IdCard,
        path: '/verification',
      },
      {
        id: 'sts',
        label: 'Загрузить фото СТС',
        done: Boolean(transport?.image),
        icon: FileText,
        path: '/vehicles',
        roles: [2],
      },
      {
        id: 'transport',
        label: 'Указать данные транспорта',
        done: Boolean(transport?.name || transport?.license_plate || transport?.number),
        icon: Truck,
        path: '/vehicles',
        roles: [2],
      },
      {
        id: 'address',
        label: isCarrier ? 'Заполнить адрес регистрации' : 'Заполнить данные организации',
        done: isCarrier
          ? Boolean(transport?.name)
          : Boolean(company?.name || company?.inn),
        icon: MapPin,
        path: '/profile',
      },
    ];
    return items.filter((i) => !i.roles || i.roles.includes(userType));
  }, [transport, company, isCarrier, userType]);

  const doneCount = checklist.filter((i) => i.done).length;
  const progress = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;
  const needsFill = progress < 100;

  const activeOrders = ratings?.orders ?? 0;
  const earnings = ratings?.payd ?? 0;
  const rate = ratings?.rate ?? 0;
  const tripCount = ratings?.invoices ?? ratings?.orders ?? 0;
  const reviewHint = tripCount
    ? `На основе ${tripCount} рейсов`
    : 'Пока нет рейсов';

  const pendingPayout = account ? Number(account) || 0 : 15000;

  return (
    <PanelFrame title={`Добро пожаловать, ${displayName}`} bare>
      <div className={styles.page}>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statHead}>
              <span className={styles.statLabel}>
                {isCarrier ? 'Активные рейсы' : 'Активные заказы'}
              </span>
              <span className={styles.trendBadge}>+12% за неделю</span>
            </div>
            <div className={styles.statValue}>{activeOrders}</div>
            <div className={styles.spark} aria-hidden />
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHead}>
              <span className={styles.statLabel}>
                {isCarrier ? 'Заработок за месяц' : 'Оплачено за месяц'}
              </span>
            </div>
            <div className={styles.statValue}>
              {earnings.toLocaleString('ru-RU')} ₽
            </div>
            <div className={styles.statSub}>
              Ожидается к выплате: {pendingPayout.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHead}>
              <span className={styles.statLabel}>
                {isCarrier ? 'Рейтинг перевозчика' : 'Рейтинг заказчика'}
              </span>
            </div>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{rate ? rate.toFixed(1) : '—'}</span>
              <span className={styles.stars} aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(rate) ? '#f5a524' : 'none'}
                    color="#f5a524"
                    strokeWidth={1.5}
                  />
                ))}
              </span>
            </div>
            <div className={styles.statSub}>{reviewHint}</div>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>Последние действия</h2>
                <p className={styles.cardSub}>Недавние события по вашему аккаунту</p>
              </div>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => history.push('/feed')}
              >
                Всё
              </button>
            </div>
            <ul className={styles.activityList}>
              {DEMO_ACTIVITY.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id} className={styles.activityItem}>
                    <span className={styles.activityIcon}>
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <span className={styles.activityTitle}>{item.title}</span>
                    <span className={styles.activityTime}>{item.time}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className={styles.sideCol}>
            <section className={styles.card}>
              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle}>Статус профиля</h2>
                {needsFill && (
                  <span className={styles.warnBadge}>Требует заполнения</span>
                )}
              </div>

              <div className={styles.progressBlock}>
                <div className={styles.progressLabel}>
                  <span>Верификация</span>
                  <span>{progress}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.progressHint}>
                  Заполнено {doneCount} из {checklist.length} шагов профиля и документов
                </p>
              </div>

              <ul className={styles.checkList}>
                {checklist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`${styles.checkItem} ${item.done ? styles.done : ''}`}
                        onClick={() => history.push(item.path)}
                      >
                        <span className={styles.checkIcon}>
                          <Icon size={18} strokeWidth={1.75} />
                        </span>
                        <span className={styles.checkLabel}>{item.label}</span>
                        {item.done ? (
                          <span className={styles.doneBadge}>
                            <Check size={12} strokeWidth={2.5} />
                            Готово
                          </span>
                        ) : (
                          <ChevronRight size={18} className={styles.chevron} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Быстрые действия</h2>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primaryAction}
                  onClick={() => history.push('/feed')}
                >
                  <Search size={18} strokeWidth={1.75} />
                  {isCarrier ? 'Найти груз' : 'Создать заказ'}
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={() => history.push('/finance')}
                >
                  <Wallet size={18} strokeWidth={1.75} />
                  Пополнить баланс
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={() => history.push('/documents')}
                >
                  <FileText size={18} strokeWidth={1.75} />
                  Мои документы
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={() => history.push('/support')}
                >
                  <LifeBuoy size={18} strokeWidth={1.75} />
                  Поддержка
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PanelFrame>
  );
};

export default HomePage;

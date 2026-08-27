import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonIcon, IonInput, IonSpinner } from '@ionic/react';
import {
  addOutline,
  businessOutline,
  cardOutline,
  phonePortraitOutline,
  receiptOutline,
} from 'ionicons/icons';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Lock,
  Plus,
  TrendingUp,
  X,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import walletStyles from './WalletPage.module.css';
import { useToast } from '../../Toast';
import { useLogin } from '../../../Store/useLogin';
import { openUrlInApp } from '../../../utils/openUrlInApp';
import { InvoiceModal } from './InvoiceModal/InvoiceModal';
import type { Transaction } from '../../../Store/accountStore';
import { plural } from '../../Works/feedFormat';

export interface WalletPageProps {
  onBack: () => void;
  initialAmount?: number | string | null;
}

type PayMethod = 'invoice' | 'sbp' | 'acquiring';

const formatAmountInput = (value: number | string): string => {
  if (value === '' || value === null || value === undefined) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const parseAmountInput = (value: string): number => {
  const digits = String(value).replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

const WALLET_POLL_MS = 12_000;
const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const MONTHS_NOM = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];
const MONTHS_DAT = [
  'январю',
  'февралю',
  'марту',
  'апрелю',
  'маю',
  'июню',
  'июлю',
  'августу',
  'сентябрю',
  'октябрю',
  'ноябрю',
  'декабрю',
];

function parseTxDate(raw: string): Date | null {
  if (!raw) return null;
  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return iso;
  const m = String(raw).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function isIncome(t: Transaction): boolean {
  return t.type === 'income' || (t.amount > 0 && t.type !== 'inv' && t.type !== 'expense');
}

function isExpense(t: Transaction): boolean {
  return t.type === 'expense' || t.amount < 0;
}

function formatTxWhen(raw: string): string {
  const date = parseTxDate(raw);
  if (!date) return raw || '';
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (sameDay && time !== '00:00') return `Сегодня, ${time}`;
  if (sameDay) return 'Сегодня';
  return date.toLocaleDateString('ru-RU');
}

function MonthChart({ bars }: { bars: { key: string; label: string; value: number }[] }) {
  const width = 560;
  const height = 168;
  const padX = 18;
  const padTop = 12;
  const padBottom = 28;
  const max = Math.max(...bars.map((bar) => bar.value), 1);
  const points = bars.map((bar, i) => {
    const x = padX + (i / Math.max(bars.length - 1, 1)) * (width - padX * 2);
    const y = padTop + (1 - bar.value / max) * (height - padTop - padBottom);
    return { ...bar, x, y };
  });
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  const first = points[0];
  const area = `${line} L${last.x.toFixed(1)} ${height - padBottom} L${first.x.toFixed(1)} ${height - padBottom} Z`;

  return (
    <svg className={walletStyles.chartSvg} viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden>
      <defs>
        <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b5adc" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2b5adc" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#incomeArea)" />
      <path d={line} fill="none" stroke="#2b5adc" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p) => (
        <circle key={p.key} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#2b5adc" strokeWidth="2" />
      ))}
      {points.map((p) => (
        <text key={`${p.key}-l`} x={p.x} y={height - 8} textAnchor="middle" className={walletStyles.chartSvgLabel}>
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export const WalletPage: React.FC<WalletPageProps> = ({
  onBack: _onBack,
  initialAmount,
}) => {
  const toast = useToast();
  const { user } = useLogin();
  const {
    accountData,
    transactions,
    isLoading,
    formattedBalance,
    load,
    refreshWallet,
    set_payment,
    set_invoice,
    get_invoice,
    seller_id,
  } = useWallet();

  const [amount, setAmount] = useState(() => {
    const n = Number(initialAmount);
    return Number.isFinite(n) && n > 0 ? formatAmountInput(Math.ceil(n)) : '';
  });
  const [showTopUp, setShowTopUp] = useState(() => Number(initialAmount) > 0);
  const [payLoading, setPayLoading] = useState<PayMethod | null>(null);
  const [invoiceModalData, setInvoiceModalData] = useState<unknown>();
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const n = Number(initialAmount);
    if (Number.isFinite(n) && n > 0) {
      setAmount(formatAmountInput(Math.ceil(n)));
      setShowTopUp(true);
    }
  }, [initialAmount]);

  useEffect(() => {
    if (!showTopUp) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !payLoading) setShowTopUp(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showTopUp, payLoading]);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshWallet({ silent: true });
    }, WALLET_POLL_MS);
    return () => window.clearInterval(id);
  }, [refreshWallet]);

  const formatMoney = (n: number) => {
    try {
      return n.toLocaleString('ru-RU', {
        style: 'currency',
        currency: accountData?.currency || 'RUB',
        maximumFractionDigits: 0,
      });
    } catch {
      return `${n} ₽`;
    }
  };

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const stats = useMemo(() => {
    const list = transactions || [];
    let monthIncome = 0;
    let prevMonthIncome = 0;
    let pending = 0;
    let pendingCount = 0;

    const bars = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(thisYear, thisMonth - 5 + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS_SHORT[d.getMonth()], value: 0 };
    });

    for (const t of list) {
      const date = parseTxDate(t.date);
      if (t.type === 'new') {
        pending += Math.abs(t.amount);
        pendingCount += 1;
      }
      if (!isIncome(t)) continue;
      const value = Math.abs(t.amount);
      if (date) {
        if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) monthIncome += value;
        const prev = new Date(thisYear, thisMonth - 1, 1);
        if (date.getMonth() === prev.getMonth() && date.getFullYear() === prev.getFullYear()) {
          prevMonthIncome += value;
        }
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const bar = bars.find((b) => b.key === key);
        if (bar) bar.value += value;
      }
    }

    const trend =
      prevMonthIncome > 0
        ? Math.round(((monthIncome - prevMonthIncome) / prevMonthIncome) * 100)
        : null;

    return { monthIncome, pending, pendingCount, bars, trend };
  }, [transactions, thisMonth, thisYear]);

  const amountNumber = useMemo(() => parseAmountInput(amount), [amount]);

  const canPay = amountNumber > 0 && !isLoading && !payLoading;
  const displayName = user?.name?.trim() || 'Пользователь';

  const deposit = Number(accountData?.deposit ?? 0);
  const depositPaid = deposit > 0;

  const closeTopUp = () => {
    if (payLoading) return;
    setShowTopUp(false);
  };

  const handleOpenInvoicePdf = async (invoiceId: string) => {
    if (invoiceLoadingId !== null) return;
    setInvoiceLoadingId(invoiceId);
    try {
      const res = await get_invoice(invoiceId, { silent: true });
      if (res?.success) setInvoiceModalData(res.data);
      else toast.error(res?.error || 'Не удалось загрузить счёт');
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  const handlePayOnline = async (method: 'sbp' | 'acquiring') => {
    if (amountNumber <= 0) return;
    setPayLoading(method);
    try {
      const res = await set_payment({
        type: 1,
        amount: amountNumber,
        description: `Пополнение лицевого счета ${user?.id || ''}`.trim(),
      });
      if (!res?.success) {
        toast.error(res?.error || 'Ошибка пополнения');
        return;
      }

      if (method === 'acquiring') {
        const url = res?.data?.payment_url || res?.data?.paymentUrl;
        if (url) {
          try {
            await openUrlInApp(url);
            setShowTopUp(false);
            void refreshWallet({ silent: true });
          } catch {
            toast.error('Не удалось открыть страницу оплаты');
          }
        } else {
          toast.info('Ссылка на оплату не найдена в ответе сервера');
        }
      } else {
        const payload = res?.data?.sbp_payload || res?.data?.sbpPayload;
        if (payload) {
          try {
            await openUrlInApp(payload);
            setShowTopUp(false);
            void refreshWallet({ silent: true });
          } catch {
            toast.error('Не удалось открыть СБП');
          }
        } else {
          toast.info('SBP-пейлоад не найден в ответе сервера');
        }
      }
    } finally {
      setPayLoading(null);
    }
  };

  const handleCreateInvoice = async () => {
    if (amountNumber <= 0) return;
    setPayLoading('invoice');
    try {
      const payload = {
        invoice_date: new Date().toISOString().split('T')[0],
        seller_id,
        payment_due: '10 дней',
        payment_purpose: `Пополнение счета от ${new Date().toLocaleDateString()}`,
        signer: 'Егоров Д.Н.',
        total_amount: amountNumber,
        vat_amount: 0,
        items: [
          {
            item_name: 'Пополнение баланса',
            qty: 1,
            unit: 'шт.',
            price: amountNumber,
            total: amountNumber,
          },
        ],
      };
      const res = await set_invoice(payload);
      if (!res?.success) {
        toast.error(res?.error || 'Не удалось сформировать счёт');
        return;
      }

      let invoice = res.data;
      const invoiceId =
        invoice?.invoiceNumber ||
        invoice?.id ||
        invoice?.guid ||
        invoice?.invoice_id;

      if ((!invoice?.items || !invoice?.invoiceNumber) && invoiceId) {
        const loaded = await get_invoice(String(invoiceId), { silent: true });
        if (loaded?.success && loaded.data) invoice = loaded.data;
      }

      if (!invoice) {
        toast.error('Счёт создан, но данные для просмотра не получены');
        void refreshWallet({ silent: true });
        return;
      }

      setShowTopUp(false);
      setInvoiceModalData(invoice);
      void refreshWallet({ silent: true });
    } finally {
      setPayLoading(null);
    }
  };

  const txIcon = (t: Transaction) => {
    if (isIncome(t)) return { className: walletStyles.txIconIn, icon: <ArrowDownLeft size={18} strokeWidth={2.25} /> };
    if (t.type === 'inv') return { className: walletStyles.txIconInv, icon: <ArrowUpRight size={18} strokeWidth={2.25} /> };
    return { className: walletStyles.txIconOut, icon: <ArrowUpRight size={18} strokeWidth={2.25} /> };
  };

  return (
    <div className={walletStyles.page}>
      {invoiceModalData !== undefined && (
        <InvoiceModal
          isOpen={invoiceModalData !== undefined}
          onClose={() => setInvoiceModalData(undefined)}
          inv={invoiceModalData as any}
        />
      )}

      {showTopUp && (
        <div className={walletStyles.modalOverlay} role="presentation" onClick={closeTopUp}>
          <div
            className={walletStyles.modalDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="topup-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={walletStyles.modalHead}>
              <div>
                <h2 id="topup-title" className={walletStyles.modalTitle}>
                  Пополнить баланс
                </h2>
                <p className={walletStyles.modalSub}>Укажите сумму и способ оплаты</p>
              </div>
              <button
                type="button"
                className={walletStyles.modalClose}
                onClick={closeTopUp}
                aria-label="Закрыть"
                disabled={Boolean(payLoading)}
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className={walletStyles.amountWrap}>
              <IonInput
                id="wallet-amount"
                className={walletStyles.amountInput}
                inputMode="numeric"
                value={amount}
                placeholder="0"
                onIonInput={(e) => setAmount(formatAmountInput(String(e.detail.value ?? '')))}
              />
              <span className={walletStyles.amountCurrency}>₽</span>
            </div>

            <div className={walletStyles.quickRow}>
              {[1000, 5000, 10000, 25000].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`${walletStyles.quickChip} ${amountNumber === q ? walletStyles.quickChipActive : ''}`}
                  onClick={() => setAmount(formatAmountInput(q))}
                  disabled={Boolean(payLoading)}
                >
                  {q.toLocaleString('ru-RU')} ₽
                </button>
              ))}
            </div>

            <div className={walletStyles.payMethods}>
              <button
                type="button"
                className={walletStyles.payMethod}
                disabled={!canPay}
                onClick={() => void handleCreateInvoice()}
              >
                <span className={walletStyles.payMethodIcon}>
                  {payLoading === 'invoice' ? <IonSpinner name="bubbles" /> : <IonIcon icon={businessOutline} />}
                </span>
                <span className={walletStyles.payMethodText}>
                  <strong>Счёт на оплату</strong>
                  <span>Для юридических лиц</span>
                </span>
              </button>

              <button
                type="button"
                className={walletStyles.payMethod}
                disabled={!canPay}
                onClick={() => void handlePayOnline('sbp')}
              >
                <span className={walletStyles.payMethodIcon}>
                  {payLoading === 'sbp' ? <IonSpinner name="bubbles" /> : <IonIcon icon={phonePortraitOutline} />}
                </span>
                <span className={walletStyles.payMethodText}>
                  <strong>СБП</strong>
                  <span>Система быстрых платежей</span>
                </span>
              </button>

              <button
                type="button"
                className={walletStyles.payMethod}
                disabled={!canPay}
                onClick={() => void handlePayOnline('acquiring')}
              >
                <span className={walletStyles.payMethodIcon}>
                  {payLoading === 'acquiring' ? <IonSpinner name="bubbles" /> : <IonIcon icon={cardOutline} />}
                </span>
                <span className={walletStyles.payMethodText}>
                  <strong>Эквайринг</strong>
                  <span>Банковская карта</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={walletStyles.stats}>
        <section className={`${walletStyles.statCard} ${walletStyles.statHero}`}>
          <div className={walletStyles.statHead}>
            <span className={walletStyles.statIconHero} aria-hidden>
              <ArrowUpRight size={18} strokeWidth={2.25} />
            </span>
            <span className={walletStyles.statLabel}>Доступно к выводу</span>
          </div>
          <div className={walletStyles.statValue}>{formattedBalance}</div>
          <div className={walletStyles.statSub}>В обработке: {formatMoney(stats.pending)}</div>
          <div className={walletStyles.statActions}>
            <button
              type="button"
              className={walletStyles.heroGhost}
              onClick={() => toast.info('Вывод средств скоро будет доступен')}
            >
              <ArrowUpRight size={16} strokeWidth={2.25} />
              Вывести
            </button>
            <button
              type="button"
              className={walletStyles.heroPrimary}
              onClick={() => {
                setShowTopUp(true);
                window.setTimeout(() => document.getElementById('wallet-amount')?.focus(), 50);
              }}
            >
              <Plus size={16} strokeWidth={2.25} />
              Пополнить
            </button>
          </div>
        </section>

        <section className={walletStyles.statCard}>
          <div className={walletStyles.statHead}>
            <span className={`${walletStyles.statIcon} ${walletStyles.statIconGreen}`} aria-hidden>
              <TrendingUp size={16} strokeWidth={2.25} />
            </span>
            <span className={walletStyles.statLabel}>Доход за {MONTHS_NOM[thisMonth]}</span>
          </div>
          <div className={walletStyles.statValue}>{formatMoney(stats.monthIncome)}</div>
          {stats.trend != null && (
            <div className={stats.trend >= 0 ? walletStyles.trendUp : walletStyles.trendDown}>
              {stats.trend >= 0 ? '+' : ''}
              {stats.trend}% к {MONTHS_DAT[(thisMonth + 11) % 12]}
            </div>
          )}
        </section>

        <section className={walletStyles.statCard}>
          <div className={walletStyles.statHead}>
            <span className={`${walletStyles.statIcon} ${walletStyles.statIconOrange}`} aria-hidden>
              <Clock size={16} strokeWidth={2.25} />
            </span>
            <span className={walletStyles.statLabel}>Ожидает выплаты</span>
          </div>
          <div className={walletStyles.statValue}>{formatMoney(stats.pending)}</div>
          <div className={walletStyles.statSub}>
            {stats.pendingCount} {plural(stats.pendingCount, 'рейс', 'рейса', 'рейсов')} в обработке
          </div>
        </section>

        <section className={walletStyles.statCard}>
          <div className={walletStyles.statHead}>
            <span className={`${walletStyles.statIcon} ${walletStyles.statIconBlue}`} aria-hidden>
              <Lock size={16} strokeWidth={2.25} />
            </span>
            <span className={walletStyles.statLabel}>Гарантийный депозит</span>
            <span className={`${walletStyles.depositBadge} ${depositPaid ? walletStyles.depositOn : walletStyles.depositOff}`}>
              {depositPaid ? 'Внесён' : 'Не внесён'}
            </span>
          </div>
          <div className={walletStyles.statValue}>{formatMoney(deposit)}</div>
          <p className={walletStyles.depositHint}>
            Заблокирован на кошельке — требуется для верификации и покрытия ущерба, если рейс
            срывается или груз повреждён по вашей вине.
          </p>
        </section>
      </div>

      <div className={walletStyles.midGrid}>
        <section className={walletStyles.card}>
          <h2 className={walletStyles.cardTitle}>Доход по месяцам</h2>
          <p className={walletStyles.cardSub}>Последние 6 месяцев, тыс. ₽</p>
          <MonthChart bars={stats.bars} />
        </section>

        <section className={walletStyles.card}>
          <h2 className={walletStyles.cardTitle}>Способ выплаты</h2>
          <div className={walletStyles.bankCard} aria-label="Карта для выплат">
            <div className={walletStyles.bankCardTop}>
              <span className={walletStyles.chip} aria-hidden />
              <span className={walletStyles.bankBadge}>Основная</span>
            </div>
            <div className={walletStyles.bankNumber}>•• •• •• 4417</div>
            <div className={walletStyles.bankWho}>{displayName} · МИР</div>
          </div>
          <button
            type="button"
            className={walletStyles.addCardBtn}
            onClick={() => toast.info('Привязка карты для выплат появится позже')}
          >
            <IonIcon icon={addOutline} />
            Добавить карту
          </button>
        </section>
      </div>

      <section className={walletStyles.card} id="statement">
        <h2 className={walletStyles.cardTitle}>История операций</h2>
        {isLoading ? (
          <div className={walletStyles.loadingWrap}>
            <IonSpinner name="bubbles" />
          </div>
        ) : (transactions || []).length === 0 ? (
          <div className={walletStyles.empty}>
            <IonIcon icon={receiptOutline} />
            <p>Операций пока нет</p>
            <span>Здесь появятся поступления и списания</span>
          </div>
        ) : (
          <ul className={walletStyles.txList}>
            {(transactions || []).slice(0, 50).map((t) => {
              const inv = t.type === 'inv';
              const icon = txIcon(t);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className={walletStyles.txItem}
                    disabled={!inv}
                    onClick={inv ? () => void handleOpenInvoicePdf(t.id) : undefined}
                  >
                    <span className={`${walletStyles.txIcon} ${icon.className}`} aria-hidden>
                      {icon.icon}
                    </span>
                    <div className={walletStyles.txText}>
                      <div className={walletStyles.txTitle}>{t.title || 'Операция'}</div>
                      {(t.subtitle || '').trim() ? (
                        <div className={walletStyles.txSub}>{t.subtitle}</div>
                      ) : null}
                    </div>
                    <div className={walletStyles.txRight}>
                      <div
                        className={
                          isIncome(t)
                            ? walletStyles.txPlus
                            : isExpense(t)
                              ? walletStyles.txMinus
                              : walletStyles.txNeutral
                        }
                      >
                        {t.amount > 0 ? '+' : ''}
                        {formatMoney(t.amount)}
                      </div>
                      <span className={walletStyles.txWhen}>
                        {inv && invoiceLoadingId === t.id ? 'Загрузка…' : formatTxWhen(t.date)}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

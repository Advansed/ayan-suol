import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonIcon, IonInput, IonSpinner } from '@ionic/react';
import {
  addOutline,
  businessOutline,
  cardOutline,
  phonePortraitOutline,
  receiptOutline,
} from 'ionicons/icons';
import { useWallet } from '../hooks/useWallet';
import walletStyles from './WalletPage.module.css';
import { useToast } from '../../Toast';
import { useLogin } from '../../../Store/useLogin';
import { openUrlInApp } from '../../../utils/openUrlInApp';
import { InvoiceModal } from './InvoiceModal/InvoiceModal';
import type { Transaction } from '../../../Store/accountStore';

export interface WalletPageProps {
  onBack: () => void;
  initialAmount?: number | string | null;
}

const WALLET_POLL_MS = 12_000;
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
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
    return Number.isFinite(n) && n > 0 ? String(Math.ceil(n)) : '';
  });
  const [payLoading, setPayLoading] = useState<'card' | 'sbp' | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState<unknown>();
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(() => Number(initialAmount) > 0);

  useEffect(() => {
    const n = Number(initialAmount);
    if (Number.isFinite(n) && n > 0) {
      setAmount(String(Math.ceil(n)));
      setShowTopUp(true);
    }
  }, [initialAmount]);

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

  const maxBar = Math.max(...stats.bars.map((b) => b.value), 1);

  const amountNumber = useMemo(() => {
    const v = parseFloat(amount.replace(',', '.'));
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [amount]);

  const canPay = amountNumber > 0 && !isLoading;
  const displayName = user?.name?.trim() || 'Пользователь';

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

  const handlePay = async (method: 'card' | 'sbp') => {
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
      if (method === 'card') {
        const url = res?.data?.payment_url || res?.data?.paymentUrl;
        if (url) {
          try {
            await openUrlInApp(url);
            void refreshWallet({ silent: true });
          } catch {
            toast.error('Не удалось открыть страницу оплаты');
          }
        } else toast.info('Ссылка на оплату не найдена в ответе сервера');
      } else {
        const payload = res?.data?.sbp_payload || res?.data?.sbpPayload;
        if (payload) {
          try {
            await openUrlInApp(payload);
            void refreshWallet({ silent: true });
          } catch {
            toast.error('Не удалось открыть СБП');
          }
        } else toast.info('SBP-пейлоад не найден в ответе сервера');
      }
    } finally {
      setPayLoading(null);
    }
  };

  const handleCreateInvoice = async () => {
    if (amountNumber <= 0) return;
    setInvoiceLoading(true);
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
        toast.error(res?.error || 'Не удалось сформировать счет');
        return;
      }
      toast.success('Счёт для юр. лиц сформирован — появится в истории');
      void refreshWallet({ silent: true });
    } finally {
      setInvoiceLoading(false);
    }
  };

  const txStatus = (t: Transaction) => {
    if (t.type === 'new') return { label: 'В обработке', className: walletStyles.statusPending };
    if (t.type === 'inv') return { label: 'Счёт', className: walletStyles.statusInv };
    return { label: 'Исполнено', className: walletStyles.statusDone };
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

      <div className={walletStyles.stats}>
        <section className={walletStyles.statCard}>
          <div className={walletStyles.statLabel}>Доступно к выводу</div>
          <div className={walletStyles.statValue}>{formattedBalance}</div>
          <div className={walletStyles.statSub}>
            В обработке: {formatMoney(stats.pending)}
          </div>
          <div className={walletStyles.statActions}>
            <button
              type="button"
              className={walletStyles.ghostBtn}
              onClick={() => toast.info('Вывод средств скоро будет доступен')}
            >
              Вывести
            </button>
            <button
              type="button"
              className={walletStyles.primaryBtn}
              onClick={() => {
                setShowTopUp(true);
                window.setTimeout(() => document.getElementById('wallet-amount')?.focus(), 50);
              }}
            >
              Пополнить
            </button>
          </div>
        </section>

        <section className={walletStyles.statCard}>
          <div className={walletStyles.statLabel}>Доход за {MONTHS_GEN[thisMonth]}</div>
          <div className={walletStyles.statValue}>{formatMoney(stats.monthIncome)}</div>
          {stats.trend != null && (
            <div className={stats.trend >= 0 ? walletStyles.trendUp : walletStyles.trendDown}>
              {stats.trend >= 0 ? '+' : ''}
              {stats.trend}% к {MONTHS_GEN[(thisMonth + 11) % 12]}
            </div>
          )}
        </section>

        <section className={walletStyles.statCard}>
          <div className={walletStyles.statLabel}>Ожидает выплаты</div>
          <div className={walletStyles.statValue}>{formatMoney(stats.pending)}</div>
          <div className={walletStyles.statSub}>
            {stats.pendingCount} {stats.pendingCount === 1 ? 'рейс' : 'рейсов'} в обработке
          </div>
        </section>
      </div>

      <div className={walletStyles.midGrid}>
        <section className={walletStyles.card}>
          <h2 className={walletStyles.cardTitle}>Доход по месяцам</h2>
          <p className={walletStyles.cardSub}>Последние 6 месяцев, тыс. ₽</p>
          <div className={walletStyles.chart} aria-hidden>
            {stats.bars.map((bar) => (
              <div key={bar.key} className={walletStyles.chartCol}>
                <div className={walletStyles.chartTrack}>
                  <div
                    className={walletStyles.chartBar}
                    style={{ height: `${Math.max(6, (bar.value / maxBar) * 100)}%` }}
                  />
                </div>
                <span className={walletStyles.chartLabel}>{bar.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={walletStyles.card}>
          <h2 className={walletStyles.cardTitle}>Способ выплаты</h2>
          <div className={walletStyles.payMethod}>
            <div className={walletStyles.payIcon} aria-hidden>
              <IonIcon icon={cardOutline} />
            </div>
            <div className={walletStyles.payMeta}>
              <span className={walletStyles.payBadge}>Основная</span>
              <div className={walletStyles.payNumber}>•••• •••• •••• ———</div>
              <div className={walletStyles.payWho}>{displayName} · карта</div>
            </div>
          </div>
          <button
            type="button"
            className={walletStyles.addCardBtn}
            onClick={() => {
              setShowTopUp(true);
              toast.info('Привязка карты для выплат появится позже. Сейчас можно пополнить баланс.');
            }}
          >
            <IonIcon icon={addOutline} />
            Добавить карту
          </button>
        </section>
      </div>

      {showTopUp && (
        <section className={walletStyles.card} id="top-up">
          <h2 className={walletStyles.cardTitle}>Пополнить баланс</h2>
          <p className={walletStyles.cardSub}>Укажите сумму и способ оплаты</p>
          <div className={walletStyles.amountWrap}>
            <IonInput
              id="wallet-amount"
              className={walletStyles.amountInput}
              inputMode="decimal"
              value={amount}
              placeholder="0"
              onIonChange={(e) => setAmount(String(e.detail.value ?? ''))}
            />
            <span className={walletStyles.amountCurrency}>₽</span>
          </div>
          <div className={walletStyles.quickRow}>
            {[1000, 5000, 10000, 25000].map((q) => (
              <button
                key={q}
                type="button"
                className={`${walletStyles.quickChip} ${amountNumber === q ? walletStyles.quickChipActive : ''}`}
                onClick={() => setAmount(String(q))}
              >
                {q.toLocaleString('ru-RU')} ₽
              </button>
            ))}
          </div>
          <div className={walletStyles.methodList}>
            <button
              type="button"
              className={walletStyles.methodBtn}
              disabled={!canPay || payLoading !== null}
              onClick={() => void handlePay('card')}
            >
              {payLoading === 'card' ? <IonSpinner name="bubbles" /> : <IonIcon icon={cardOutline} />}
              Банковская карта
            </button>
            <button
              type="button"
              className={walletStyles.methodBtn}
              disabled={!canPay || payLoading !== null}
              onClick={() => void handlePay('sbp')}
            >
              {payLoading === 'sbp' ? <IonSpinner name="bubbles" /> : <IonIcon icon={phonePortraitOutline} />}
              СБП
            </button>
            <button
              type="button"
              className={walletStyles.methodBtn}
              disabled={!canPay || invoiceLoading || payLoading !== null}
              onClick={() => void handleCreateInvoice()}
            >
              {invoiceLoading ? <IonSpinner name="bubbles" /> : <IonIcon icon={businessOutline} />}
              Счёт для юрлица
            </button>
          </div>
        </section>
      )}

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
            <span>Пополните баланс — запись появится здесь</span>
          </div>
        ) : (
          <ul className={walletStyles.txList}>
            {(transactions || []).slice(0, 50).map((t) => {
              const status = txStatus(t);
              const inv = t.type === 'inv';
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className={walletStyles.txItem}
                    disabled={!inv}
                    onClick={inv ? () => void handleOpenInvoicePdf(t.id) : undefined}
                  >
                    <div className={walletStyles.txText}>
                      <div className={walletStyles.txTitle}>{t.title || 'Операция'}</div>
                      <div className={walletStyles.txSub}>{t.date}</div>
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
                      <span className={`${walletStyles.status} ${status.className}`}>
                        {inv && invoiceLoadingId === t.id ? 'Загрузка…' : status.label}
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

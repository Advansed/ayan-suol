import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/react';
import {
  addOutline,
  arrowDownOutline,
  arrowUpOutline,
  businessOutline,
  cardOutline,
  documentTextOutline,
  phonePortraitOutline,
  receiptOutline,
  timeOutline,
  walletOutline,
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
  /** Предзаполнить сумму пополнения (из спецсчёта / страховки) */
  initialAmount?: number | string | null;
}

const WALLET_POLL_MS = 12_000;

type TxFilter = 'all' | 'income' | 'expense' | 'inv';

const TX_FILTERS: { id: TxFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'income', label: 'Поступления' },
  { id: 'expense', label: 'Списания' },
  { id: 'inv', label: 'Счета' },
];

function txMeta(t: Transaction): {
  icon: string;
  iconClass: string;
  badge: string;
  badgeClass: string;
} {
  switch (t.type) {
    case 'inv':
      return {
        icon: documentTextOutline,
        iconClass: walletStyles.txIconInv,
        badge: 'Счёт',
        badgeClass: walletStyles.badgeInv,
      };
    case 'new':
      return {
        icon: timeOutline,
        iconClass: walletStyles.txIconPending,
        badge: 'В обработке',
        badgeClass: walletStyles.badgePending,
      };
    case 'income':
      return {
        icon: arrowDownOutline,
        iconClass: walletStyles.txIconIncome,
        badge: 'Поступление',
        badgeClass: walletStyles.badgeIncome,
      };
    case 'expense':
      return {
        icon: arrowUpOutline,
        iconClass: walletStyles.txIconExpense,
        badge: 'Списание',
        badgeClass: walletStyles.badgeExpense,
      };
    default:
      return {
        icon: receiptOutline,
        iconClass: walletStyles.txIconNeutral,
        badge: 'Операция',
        badgeClass: walletStyles.badgeNeutral,
      };
  }
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
  const [txFilter, setTxFilter] = useState<TxFilter>('all');

  useEffect(() => {
    const n = Number(initialAmount);
    if (Number.isFinite(n) && n > 0) {
      setAmount(String(Math.ceil(n)));
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

  const stats = useMemo(() => {
    const list = transactions || [];
    let income = 0;
    let expense = 0;
    let pendingInv = 0;
    for (const t of list) {
      if (t.type === 'inv' || t.type === 'new') pendingInv += 1;
      if (t.type === 'income' || (t.amount > 0 && t.type !== 'inv' && t.type !== 'expense')) {
        income += Math.abs(t.amount);
      } else if (t.type === 'expense' || t.amount < 0) {
        expense += Math.abs(t.amount);
      }
    }
    return { income, expense, pendingInv, total: list.length };
  }, [transactions]);

  const filteredOps = useMemo(() => {
    const list = (transactions || []).slice(0, 50);
    if (txFilter === 'all') return list;
    if (txFilter === 'income') {
      return list.filter((t) => t.type === 'income' || (t.amount > 0 && t.type !== 'inv' && t.type !== 'expense'));
    }
    if (txFilter === 'expense') {
      return list.filter((t) => t.type === 'expense' || t.amount < 0);
    }
    return list.filter((t) => t.type === 'inv' || t.type === 'new');
  }, [transactions, txFilter]);

  const formatMoney = (n: number) => {
    if (!accountData) return `${n}`;
    try {
      return n.toLocaleString('ru-RU', {
        style: 'currency',
        currency: accountData.currency || 'RUB',
        maximumFractionDigits: 0,
      });
    } catch {
      return `${n} ${accountData.currency || 'RUB'}`;
    }
  };

  const amountNumber = useMemo(() => {
    const v = parseFloat(amount.replace(',', '.'));
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [amount]);

  const canPay = amountNumber > 0 && !isLoading;

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
      setTxFilter('inv');
      void refreshWallet({ silent: true });
    } finally {
      setInvoiceLoading(false);
    }
  };

  const quickAmounts = [1000, 5000, 10000, 25000];

  return (
    <div className={walletStyles.financeRoot}>
      {invoiceModalData !== undefined && (
        <InvoiceModal
          isOpen={invoiceModalData !== undefined}
          onClose={() => setInvoiceModalData(undefined)}
          inv={invoiceModalData as any}
        />
      )}

      {/* Баланс + сводка */}
      <section className={walletStyles.hero}>
        <div className={walletStyles.heroMain}>
          <div className={walletStyles.heroIcon} aria-hidden>
            <IonIcon icon={walletOutline} />
          </div>
          <div className={walletStyles.heroText}>
            <div className={walletStyles.kicker}>Доступно к оплате</div>
            <div className={walletStyles.balanceValue}>{formattedBalance}</div>
            <p className={walletStyles.balanceHint}>
              Лицевой счёт для предоплаты заказов, страховки и услуг платформы
            </p>
          </div>
        </div>

        <div className={walletStyles.statGrid}>
          <div className={walletStyles.statCard}>
            <span className={walletStyles.statLabel}>Поступления</span>
            <span className={`${walletStyles.statValue} ${walletStyles.statPositive}`}>
              {formatMoney(stats.income)}
            </span>
          </div>
          <div className={walletStyles.statCard}>
            <span className={walletStyles.statLabel}>Списания</span>
            <span className={`${walletStyles.statValue} ${walletStyles.statNegative}`}>
              {formatMoney(stats.expense)}
            </span>
          </div>
          <div className={walletStyles.statCard}>
            <span className={walletStyles.statLabel}>Счета и ожидание</span>
            <span className={walletStyles.statValue}>
              {stats.pendingInv}
              <span className={walletStyles.statUnit}> шт.</span>
            </span>
          </div>
        </div>
      </section>

      <div className={walletStyles.financeGrid}>
        {/* Пополнение */}
        <section className={walletStyles.topUpCard}>
          <div className={walletStyles.cardHead}>
            <div className={walletStyles.cardIcon} aria-hidden>
              <IonIcon icon={addOutline} />
            </div>
            <div>
              <h3 className={walletStyles.cardTitle}>Пополнить счёт</h3>
              <p className={walletStyles.cardSub}>
                Укажите сумму и выберите способ оплаты
              </p>
            </div>
          </div>

          <div className={walletStyles.topUpForm}>
            <label className={walletStyles.fieldLabel} htmlFor="wallet-amount">
              Сумма пополнения
            </label>
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
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`${walletStyles.quickChip} ${
                    amountNumber === q ? walletStyles.quickChipActive : ''
                  }`}
                  onClick={() => setAmount(String(q))}
                >
                  {q.toLocaleString('ru-RU')} ₽
                </button>
              ))}
            </div>

            <p className={walletStyles.methodsLabel}>Как оплатить</p>
            <div className={walletStyles.methodList}>
              <button
                type="button"
                className={walletStyles.methodCard}
                disabled={!canPay || payLoading !== null}
                onClick={() => void handlePay('card')}
              >
                <div className={`${walletStyles.methodIcon} ${walletStyles.methodIconCard}`}>
                  {payLoading === 'card' ? (
                    <IonSpinner name="bubbles" />
                  ) : (
                    <IonIcon icon={cardOutline} />
                  )}
                </div>
                <div className={walletStyles.methodText}>
                  <span className={walletStyles.methodTitle}>Банковская карта</span>
                  <span className={walletStyles.methodDesc}>
                    Visa, Mastercard, Мир — зачисление сразу после оплаты
                  </span>
                </div>
              </button>

              <button
                type="button"
                className={walletStyles.methodCard}
                disabled={!canPay || payLoading !== null}
                onClick={() => void handlePay('sbp')}
              >
                <div className={`${walletStyles.methodIcon} ${walletStyles.methodIconSbp}`}>
                  {payLoading === 'sbp' ? (
                    <IonSpinner name="bubbles" />
                  ) : (
                    <IonIcon icon={phonePortraitOutline} />
                  )}
                </div>
                <div className={walletStyles.methodText}>
                  <span className={walletStyles.methodTitle}>СБП</span>
                  <span className={walletStyles.methodDesc}>
                    Оплата через приложение вашего банка по QR / ссылке
                  </span>
                </div>
              </button>

              <button
                type="button"
                className={walletStyles.methodCard}
                disabled={!canPay || invoiceLoading || payLoading !== null}
                onClick={() => void handleCreateInvoice()}
              >
                <div className={`${walletStyles.methodIcon} ${walletStyles.methodIconInv}`}>
                  {invoiceLoading ? (
                    <IonSpinner name="bubbles" />
                  ) : (
                    <IonIcon icon={businessOutline} />
                  )}
                </div>
                <div className={walletStyles.methodText}>
                  <span className={walletStyles.methodTitle}>Счёт для юрлица</span>
                  <span className={walletStyles.methodDesc}>
                    Сформируем PDF-счёт — оплатите по реквизитам с расчётного счёта
                  </span>
                </div>
              </button>
            </div>

            {!canPay && (
              <p className={walletStyles.hintTextCompact}>
                Введите сумму больше нуля, чтобы выбрать способ оплаты
              </p>
            )}
            {canPay && (
              <p className={walletStyles.hintTextCompact}>
                К зачислению: <strong>{formatMoney(amountNumber)}</strong>. История обновится
                автоматически после оплаты.
              </p>
            )}
          </div>
        </section>

        {/* История */}
        <section className={walletStyles.txCard}>
          <div className={walletStyles.cardHead}>
            <div className={walletStyles.cardIcon} aria-hidden>
              <IonIcon icon={receiptOutline} />
            </div>
            <div>
              <h3 className={walletStyles.cardTitle}>История операций</h3>
              <p className={walletStyles.cardSub}>
                {stats.total > 0
                  ? `${stats.total} записей · нажмите на счёт, чтобы открыть PDF`
                  : 'Пополнения, списания и выставленные счета'}
              </p>
            </div>
          </div>

          <div className={walletStyles.filterRow} role="tablist" aria-label="Фильтр операций">
            {TX_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={txFilter === f.id}
                className={`${walletStyles.filterChip} ${
                  txFilter === f.id ? walletStyles.filterChipActive : ''
                }`}
                onClick={() => setTxFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className={walletStyles.loadingWrap}>
              <IonSpinner name="bubbles" />
            </div>
          ) : (
            <div className={walletStyles.txList}>
              {filteredOps.length > 0 ? (
                filteredOps.map((t) => {
                  const inv = t.type === 'inv';
                  const meta = txMeta(t);
                  return (
                    <div
                      key={t.id}
                      role={inv ? 'button' : undefined}
                      tabIndex={inv ? 0 : undefined}
                      className={`${walletStyles.txItem} ${
                        inv ? walletStyles.txItemInvClickable : ''
                      }`}
                      onClick={inv ? () => void handleOpenInvoicePdf(t.id) : undefined}
                      onKeyDown={
                        inv
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                void handleOpenInvoicePdf(t.id);
                              }
                            }
                          : undefined
                      }
                    >
                      <div className={walletStyles.txItemRow}>
                        <div className={walletStyles.txIconWrap} aria-hidden>
                          {inv && invoiceLoadingId === t.id ? (
                            <IonSpinner name="bubbles" className={walletStyles.txRowSpinner} />
                          ) : (
                            <IonIcon
                              icon={meta.icon}
                              className={`${walletStyles.txTypeIcon} ${meta.iconClass}`}
                            />
                          )}
                        </div>
                        <div className={walletStyles.txLeft}>
                          <div className={walletStyles.txTitleRow}>
                            <span className={walletStyles.txTitle}>{t.title}</span>
                            <span className={`${walletStyles.txBadge} ${meta.badgeClass}`}>
                              {meta.badge}
                            </span>
                          </div>
                          <div className={walletStyles.txDate}>
                            {t.date}
                            {inv ? ' · Открыть счёт' : ''}
                          </div>
                        </div>
                        <div className={walletStyles.txRight}>
                          <div
                            className={
                              t.amount > 0
                                ? walletStyles.txAmountPositive
                                : t.amount < 0 || t.type === 'expense'
                                  ? walletStyles.txAmountNegative
                                  : walletStyles.txAmountNeutral
                            }
                          >
                            {t.amount > 0 ? '+' : ''}
                            {formatMoney(t.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={walletStyles.emptyState}>
                  <div className={walletStyles.emptyIcon} aria-hidden>
                    <IonIcon icon={receiptOutline} />
                  </div>
                  <p>
                    {txFilter === 'all'
                      ? 'Операций пока нет'
                      : 'Нет операций в этом фильтре'}
                  </p>
                  <span>
                    {txFilter === 'all'
                      ? 'Пополните баланс слева — запись появится здесь'
                      : 'Выберите другой фильтр или пополните счёт'}
                  </span>
                  {txFilter === 'all' && (
                    <IonButton
                      fill="outline"
                      color="primary"
                      className={walletStyles.emptyCta}
                      onClick={() => {
                        document.getElementById('wallet-amount')?.focus();
                      }}
                    >
                      Перейти к пополнению
                    </IonButton>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

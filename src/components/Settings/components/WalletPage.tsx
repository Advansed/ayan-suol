import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/react';
import {
  addOutline,
  arrowDown,
  arrowUp,
  ellipsisHorizontal,
  printOutline,
  receiptOutline,
  walletOutline
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

/** Периодическое обновление баланса и операций, пока открыт экран кошелька */
const WALLET_POLL_MS = 12_000;

export const WalletPage: React.FC<WalletPageProps> = ({ onBack: _onBack, initialAmount }) => {
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
    seller_id
  } = useWallet();
  const [amount, setAmount] = useState(() => {
    const n = Number(initialAmount);
    return Number.isFinite(n) && n > 0 ? String(Math.ceil(n)) : '';
  });
  const [payLoading, setPayLoading] = useState<'card' | 'sbp' | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState<unknown>();
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null);

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

  const topUpOperations = useMemo(() => {
    return (transactions || []).slice(0, 30);
  }, [transactions]);

  const formatMoney = (n: number) => {
    if (!accountData) return `${n}`;
    try {
      return n.toLocaleString('ru-RU', {
        style: 'currency',
        currency: accountData.currency || 'RUB',
        maximumFractionDigits: 0
      });
    } catch {
      return `${n} ${accountData.currency || 'RUB'}`;
    }
  };

  const canPay = useMemo(() => {
    const v = parseFloat(amount.replace(',', '.'));
    return !Number.isNaN(v) && v > 0 && !isLoading;
  }, [amount, isLoading]);

  const isInvoiceTx = (t: Transaction) => t.type === 'inv';

  const txTypeIcon = (t: Transaction) => {
    switch (t.type) {
      case 'inv':
        return printOutline;
      case 'new':
        return ellipsisHorizontal;
      case 'income':
        return arrowDown;
      case 'expense':
        return arrowUp;
      default:
        return ellipsisHorizontal;
    }
  };

  const txTypeIconClass = (t: Transaction) => {
    switch (t.type) {
      case 'inv':
        return walletStyles.txIconInv;
      case 'new':
        return walletStyles.txIconPending;
      case 'income':
        return walletStyles.txIconIncome;
      case 'expense':
        return walletStyles.txIconExpense;
      default:
        return walletStyles.txIconNeutral;
    }
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

  const handlePay = async (method: 'card' | 'sbp') => {
    const v = parseFloat(amount.replace(',', '.'));
    if (!v || Number.isNaN(v) || v <= 0) return;

    setPayLoading(method);
    try {
      const res = await set_payment({
        type: 1,
        amount: v,
        description: `Пополнение лицевого счета ${user?.id || ''}`.trim()
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
    const v = parseFloat(amount.replace(',', '.'));
    if (!v || Number.isNaN(v) || v <= 0) return;

    setInvoiceLoading(true);
    try {
      const payload = {
        invoice_date: new Date().toISOString().split('T')[0],
        seller_id,
        payment_due: '10 дней',
        payment_purpose: `Пополнение счета от ${new Date().toLocaleDateString()}`,
        signer: 'Егоров Д.Н.',
        total_amount: v,
        vat_amount: 0,
        items: [{ item_name: 'Пополнение баланса', qty: 1, unit: 'шт.', price: v, total: v }]
      };

      const res = await set_invoice(payload);
      if (!res?.success) {
        toast.error(res?.error || 'Не удалось сформировать счет');
        return;
      }

      toast.success('Счет для юр. лиц сформирован');
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

      <div className={walletStyles.financeGrid}>
        <div className={walletStyles.leftCol}>
          <section className={walletStyles.balanceCard}>
            <div className={walletStyles.balanceTop}>
              <div className={walletStyles.balanceIcon} aria-hidden>
                <IonIcon icon={walletOutline} />
              </div>
              <div>
                <div className={walletStyles.kicker}>Доступный баланс</div>
                <div className={walletStyles.balanceValue}>{formattedBalance}</div>
              </div>
            </div>
            <p className={walletStyles.balanceHint}>
              Средства на счёте для оплаты услуг платформы
            </p>
          </section>

          <section className={walletStyles.topUpCard}>
            <div className={walletStyles.cardHead}>
              <IonIcon icon={addOutline} className={walletStyles.cardHeadIcon} />
              <h3 className={walletStyles.cardTitle}>Пополнение</h3>
            </div>

            <div className={walletStyles.topUpForm}>
              <label className={walletStyles.fieldLabel}>Сумма, ₽</label>
              <IonInput
                className={walletStyles.amountInput}
                inputMode="decimal"
                value={amount}
                placeholder="0"
                onIonChange={(e) => setAmount(String(e.detail.value ?? ''))}
              />

              <div className={walletStyles.quickRow}>
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={walletStyles.quickChip}
                    onClick={() => setAmount(String(q))}
                  >
                    {q.toLocaleString('ru-RU')} ₽
                  </button>
                ))}
              </div>

              <div className={walletStyles.payButtonsRow}>
                <IonButton
                  className={walletStyles.payBtn}
                  color="primary"
                  disabled={!canPay || payLoading !== null}
                  onClick={() => handlePay('card')}
                >
                  {payLoading === 'card' ? <IonSpinner name="bubbles" /> : 'Карта'}
                </IonButton>

                <IonButton
                  className={walletStyles.payBtn}
                  color="primary"
                  disabled={!canPay || payLoading !== null}
                  onClick={() => handlePay('sbp')}
                >
                  {payLoading === 'sbp' ? <IonSpinner name="bubbles" /> : 'СБП'}
                </IonButton>

                <IonButton
                  className={walletStyles.payBtn}
                  fill="outline"
                  color="primary"
                  disabled={!canPay || invoiceLoading || payLoading !== null}
                  onClick={handleCreateInvoice}
                >
                  {invoiceLoading ? <IonSpinner name="bubbles" /> : 'Счёт (юр.)'}
                </IonButton>
              </div>

              <p className={walletStyles.hintTextCompact}>
                После оплаты список операций обновится автоматически.
              </p>
            </div>
          </section>
        </div>

        <section className={walletStyles.txCard}>
          <div className={walletStyles.cardHead}>
            <IonIcon icon={receiptOutline} className={walletStyles.cardHeadIcon} />
            <div>
              <h3 className={walletStyles.cardTitle}>Операции</h3>
              <div className={walletStyles.txCount}>
                {topUpOperations.length > 0
                  ? `${topUpOperations.length} записей`
                  : 'История пуста'}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={walletStyles.loadingWrap}>
              <IonSpinner name="bubbles" />
            </div>
          ) : (
            <div className={walletStyles.txList}>
              {topUpOperations.length > 0 ? (
                topUpOperations.map((t) => {
                  const inv = isInvoiceTx(t);
                  return (
                    <div
                      key={t.id}
                      role={inv ? 'button' : undefined}
                      tabIndex={inv ? 0 : undefined}
                      className={`${walletStyles.txItem} ${inv ? walletStyles.txItemInvClickable : ''}`}
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
                              icon={txTypeIcon(t)}
                              className={`${walletStyles.txTypeIcon} ${txTypeIconClass(t)}`}
                            />
                          )}
                        </div>
                        <div className={walletStyles.txLeft}>
                          <div className={walletStyles.txTitle}>{t.title}</div>
                          <div className={walletStyles.txDate}>{t.date}</div>
                        </div>
                        <div className={walletStyles.txRight}>
                          <div
                            className={
                              t.amount > 0
                                ? walletStyles.txAmountPositive
                                : walletStyles.txAmountNegative
                            }
                          >
                            {t.amount > 0 ? '+' : ''}
                            {formatMoney(t.amount)}
                          </div>
                        </div>
                      </div>
                      {inv && (
                        <p className={walletStyles.txInvoiceHint}>
                          Нажмите, чтобы открыть счёт на оплату
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={walletStyles.emptyState}>
                  <div className={walletStyles.emptyIcon} aria-hidden>
                    <IonIcon icon={receiptOutline} />
                  </div>
                  <p>Операций пока нет</p>
                  <span>Пополните баланс — история появится здесь</span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/react';
import {
  addOutline,
  arrowDown,
  arrowUp,
  ellipsisHorizontal,
  printOutline,
  walletOutline
} from 'ionicons/icons';
import { WizardHeader } from '../../Header/WizardHeader';
import { useWallet } from '../hooks/useWallet';
import walletStyles from './WalletPage.module.css';
import settingsStyles from '../Settings.module.css';
import { useToast } from '../../Toast';
import { useLogin } from '../../../Store/useLogin';
import { openUrlInApp } from '../../../utils/openUrlInApp';
import { InvoiceModal } from './InvoiceModal/InvoiceModal';
import type { Transaction } from '../../../Store/accountStore';

export interface WalletPageProps {
  onBack: () => void;
}

/** Периодическое обновление баланса и операций, пока открыт экран кошелька */
const WALLET_POLL_MS = 12_000;

export const WalletPage: React.FC<WalletPageProps> = ({ onBack }) => {
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
  const [amount, setAmount] = useState('');
  const [payLoading, setPayLoading] = useState<'card' | 'sbp' | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState<unknown>();
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null);

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
    return (transactions || []).slice(0, 20);
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

  return (
    <div className={settingsStyles.settingsContainer}>
      <WizardHeader title="Кошелёк" onBack={onBack} />

      {invoiceModalData !== undefined && (
        <InvoiceModal
          isOpen={invoiceModalData !== undefined}
          onClose={() => setInvoiceModalData(undefined)}
          inv={invoiceModalData as any}
        />
      )}

      <div className={settingsStyles.content}>
        <div className={settingsStyles.section}>
          <div className={settingsStyles.sectionHeader}>
            <IonIcon icon={walletOutline} className={settingsStyles.sectionIcon} />
            <h3 className={settingsStyles.sectionTitle}>Доступный баланс</h3>
          </div>

          <div className={walletStyles.balanceValue}>{formattedBalance}</div>
        </div>

        <div className={`${settingsStyles.section} ${walletStyles.topUpSection}`}>
          <div className={`${settingsStyles.sectionHeader} ${walletStyles.topUpSectionHeader}`}>
            <IonIcon icon={addOutline} className={settingsStyles.sectionIcon} />
            <h3 className={settingsStyles.sectionTitle}>Пополнение</h3>
          </div>

          <div className={walletStyles.topUpForm}>
            <div className={walletStyles.amountRow}>
              <label className={walletStyles.fieldLabel}>Сумма</label>
              <IonInput
                className={walletStyles.amountInput}
                inputMode="decimal"
                value={amount}
                placeholder="0"
                onIonChange={(e) => setAmount(String(e.detail.value ?? ''))}
              />
            </div>

            <div className={walletStyles.payButtonsRow}>
              <IonButton
                size="small"
                className={walletStyles.payBtn}
                color="primary"
                disabled={!canPay || payLoading !== null}
                onClick={() => handlePay('card')}
              >
                {payLoading === 'card' ? <IonSpinner name="bubbles" /> : 'Карта'}
              </IonButton>

              <IonButton
                size="small"
                className={walletStyles.payBtn}
                color="primary"
                disabled={!canPay || payLoading !== null}
                onClick={() => handlePay('sbp')}
              >
                {payLoading === 'sbp' ? <IonSpinner name="bubbles" /> : 'СБП'}
              </IonButton>

              <IonButton
                size="small"
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
              Список операций ниже обновится после оплаты.
            </p>
          </div>
        </div>

        <div className={settingsStyles.section}>
          <div className={settingsStyles.sectionHeader}>
            <IonIcon icon={addOutline} className={settingsStyles.sectionIcon} />
            <h3 className={settingsStyles.sectionTitle}>Операции</h3>
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
                            <IonIcon icon={txTypeIcon(t)} className={`${walletStyles.txTypeIcon} ${txTypeIconClass(t)}`} />
                          )}
                        </div>
                        <div className={walletStyles.txLeft}>
                          <div className={walletStyles.txTitle}>{t.title}</div>
                          <div className={walletStyles.txDate}>{t.date}</div>
                        </div>
                        <div className={walletStyles.txRight}>
                          <div
                            className={
                              t.amount > 0 ? walletStyles.txAmountPositive : walletStyles.txAmountNegative
                            }
                          >
                            {t.amount > 0 ? '+' : ''}
                            {formatMoney(t.amount)}
                          </div>
                        </div>
                      </div>
                      {inv && (
                        <p className={walletStyles.txInvoiceHint}>Нажми чтобы скачать счет на оплату</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={walletStyles.emptyState}>Операций пока нет</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


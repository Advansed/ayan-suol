import React, { useState } from 'react';
import styles from './Account.module.css';
import { useAccount } from '../../../../Store/useAccount';
import { WizardHeader } from '../../../DataEditor/components/WizardHeader';

export const TRANSACTION_ICONS = {
  TOPUP:                  '💰',
  EXPENSE:                '📤', 
  PAYMENT:                '💳'
} as const

// src/components/Profile/components/Account/types.ts

export interface AccountData {
  balance: number
  currency: string
  lastUpdated?: string
}

export interface Transaction {
  id: string
  date: string
  type: 'topup' | 'expense' | 'payment'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed'
  orderId?: string
}

export interface PaymentData {
  type: number
  summ: number
  date?: string
  orderId?: string
  description?: string
}

export interface AccountProps {
  onBack: () => void
}

export interface UseAccountReturn {
  balance: number | null
  transactions: Transaction[]
  loading: boolean
  error: string | null
  topUpAccount: (amount: number, method: string) => Promise<void>
  loadBalance: () => Promise<void>
  loadTransactions: () => Promise<void>
}

export type PaymentMethod = 'card' | 'sbp' | 'bank'
export type TransactionType = 'topup' | 'expense' | 'payment'
export type TransactionStatus = 'completed' | 'pending' | 'failed'
export const Account: React.FC<AccountProps> = ({ onBack }) => {
  const { balance, transactions, loading, error, topUpAccount } = useAccount();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('card');

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    await topUpAccount(parseFloat(amount), method);
    setAmount('');
  };

  if (loading && !balance) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>{ "Загрузка данных..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* WizardHeader от DataEditor */}
      <WizardHeader
        title={ "Финансовый счет" }
        pages=""
        onBack={ onBack }
        onForward={() => {}} // Не используется
        onSave={ onBack } // Не используется
        isLastStep={true}
        canGoBack={true}
        canGoForward={false}
      />

      <div className={styles.content}>
        {/* Карточка баланса */}
        <div className={styles.balanceCard}>
          <div className={styles.balanceHeader}>
            <h2 className={styles.balanceTitle}>{ "Текущий счет" }</h2>
            <span className={styles.balanceStatus}>{ "Активен" }</span>
          </div>
          <div className={styles.balanceAmount}>
            {balance?.toLocaleString('ru-RU', { 
              style: 'currency', 
              currency: 'RUB',
              maximumFractionDigits: 0 
            })}
          </div>
          <div className={styles.balanceSubtext}>{ "Доступно для операций" }</div>
        </div>

        {/* Карточка пополнения */}
        <div className={styles.topUpCard}>
          <h2 className={styles.cardTitle}>{ "Пополнение счета" }</h2>
          <form className={styles.topUpForm} onSubmit={handleTopUp}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>{ "Сумма пополнения" }</label>
              <div className={styles.inputWrapper}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className={styles.input}
                  min={ 1 }
                  step={ 1 }
                />
                <span className={styles.currency}>{ "₽" }</span>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>{ "Способ пополнения" }</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className={styles.select}
              >
                <option value={ "card" }>{ "Банковская карта" }</option>
                <option value={ "sbp" }>{ "Система быстрых платежей" }</option>
                <option value={ "bank" }>{ "Банковский перевод" }</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
              disabled={!amount || parseFloat(amount) <= 0 || loading}
            >
              {loading ? "Обработка..." : "Пополнить счет"}
            </button>
          </form>
        </div>

        {/* История транзакций */}
        {/* <div className={styles.transactionsCard}>
          <h2 className={styles.cardTitle}>{ "История операций" }</h2>
          {transactions && transactions.length > 0 ? (
            <div className={styles.transactionsList}>
              {transactions.map((transaction) => (
                <div key={transaction.id} className={styles.transaction}>
                  <div className={styles.transactionIcon}>
                    {TRANSACTION_ICONS[transaction.type.toUpperCase() as keyof typeof TRANSACTION_ICONS] || TRANSACTION_ICONS.PAYMENT}
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionTitle}>
                      {transaction.description}
                    </div>
                    <div className={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className={`${styles.transactionAmount} ${
                    transaction.type === 'topup' ? styles.positive : styles.negative
                  }`}>
                    {transaction.type === 'topup' ? '+' : '-'}
                    {Math.abs(transaction.amount).toLocaleString('ru-RU')} { "₽" }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <p>{ "История операций пуста" }</p>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};
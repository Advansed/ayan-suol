import React, { useState } from 'react';
import styles from './Account.module.css';
import { useAccount } from '../../../../Store/useAccount';

interface AccountProps {
  onBack: () => void;
}

export const Account: React.FC<AccountProps> = ({ onBack }) => {
  const { balance, transactions, loading, error, topUpAccount } = useAccount();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');

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
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Хедер */}
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <h1 className={styles.title}>Финансовый счет</h1>
      </header>

      <div className={styles.content}>
        {/* Баланс */}
        <section className={styles.balanceSection}>
          <div className={styles.balanceCard}>
            <div className={styles.balanceHeader}>
              <h2>Текущий баланс</h2>
              <span className={styles.balanceStatus}>Активен</span>
            </div>
            <div className={styles.balanceAmount}>
              {balance.toLocaleString('ru-RU', { 
                style: 'currency', 
                currency: 'RUB',
                maximumFractionDigits: 0 
              })}
            </div>
          </div>
        </section>

        {/* Пополнение */}
        <section className={styles.topUpSection}>
          <h2 className={styles.sectionTitle}>Пополнение счета</h2>
          <form className={styles.topUpForm} onSubmit={handleTopUp}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Сумма пополнения</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={styles.input}
                  placeholder="0"
                  min="1"
                  step="1"
                  required
                />
                <span className={styles.currency}>₽</span>
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Способ оплаты</label>
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className={styles.select}
                >
                  <option value="card">Банковская карта</option>
                  <option value="sbp">Система быстрых платежей</option>
                  <option value="wallet">Электронный кошелек</option>
                </select>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
              disabled={loading || !amount || parseFloat(amount) <= 0}
            >
              {loading ? 'Обработка платежа...' : 'Пополнить счет'}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
};
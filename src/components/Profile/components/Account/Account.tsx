import React, { useState } from 'react';
import { useAccount } from './useAccount';
import styles from './Account.module.css';

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

  if (loading && !balance) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>← Назад</button>
        <h1>Личный кабинет</h1>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}

      {/* Баланс */}
      <div className={styles.balanceCard}>
        <h2>Баланс</h2>
        <div className={styles.balance}>
          {balance.toLocaleString('ru-RU')} ₽
        </div>
      </div>

      {/* Пополнение */}
      <form className={styles.topUpForm} onSubmit={handleTopUp}>
        <h3>Пополнить счет</h3>
        <div className={styles.formGroup}>
          <input
            type="number"
            placeholder="Сумма"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={styles.input}
            min="1"
            required
          />
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            className={styles.select}
          >
            <option value="card">Банковская карта</option>
            <option value="sbp">СБП</option>
            <option value="wallet">Электронный кошелек</option>
          </select>
        </div>
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Обработка...' : 'Пополнить'}
        </button>
      </form>

      {/* История транзакций */}
      <div className={styles.transactionList}>
        <h3>История операций</h3>
        {transactions.length === 0 ? (
          <p>Операций пока нет</p>
        ) : (
          transactions.map(transaction => (
            <div key={transaction.id} className={styles.transaction}>
              <div className={styles.transactionInfo}>
                <span className={styles.description}>{transaction.description}</span>
                <span className={styles.date}>{new Date(transaction.date).toLocaleDateString('ru-RU')}</span>
              </div>
              <span className={`${styles.amount} ${
                transaction.type === 'topup' ? styles.positive : styles.negative
              }`}>
                {transaction.type === 'topup' ? '+' : '-'}{transaction.amount} ₽
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  amount: number;
  type: 'topup' | 'expense';
  date: string;
  description: string;
}

export const useAccount = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Загрузка баланса
  const getBalance = async () => {
    setLoading(true);
    try {
      // API запрос баланса
      const response = await fetch('/api/balance');
      const data = await response.json();
      setBalance(data.balance);
    } catch (err) {
      setError('Ошибка загрузки баланса');
    } finally {
      setLoading(false);
    }
  };

  // Пополнение счета
  const topUpAccount = async (amount: number, method: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method })
      });
      const data = await response.json();
      setBalance(prev => prev + amount);
      await getTransactions();
    } catch (err) {
      setError('Ошибка пополнения');
    } finally {
      setLoading(false);
    }
  };

  // История транзакций
  const getTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError('Ошибка загрузки истории');
    }
  };

  useEffect(() => {
    getBalance();
    getTransactions();
  }, []);

  return {
    balance,
    transactions,
    loading,
    error,
    topUpAccount
  };
};
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useToken } from '../../../Store/loginStore';
import { useSocket } from '../../../Store/useSocket';
import { useToast } from '../../Toast';
import { useAccountStore, type Transaction } from '../../../Store/accountStore';
import { useLoginStore } from '../../../Store/loginStore';

function mapTransactionType(raw: unknown): Transaction['type'] {
  if (raw === 'inv' || raw === 'invoice') return 'inv';
  if (raw === 'new') return 'new';
  if (raw === 'income' || raw === 'topup') return 'income';
  if (raw === 'expense') return 'expense';
  if (typeof raw === 'number') {
    if (raw === 1) return 'income';
    if (raw === 2) return 'expense';
    if (raw === 3 || raw === 4) return 'inv';
  }
  return 'expense';
}

function normalizeTransactions(raw: unknown): Transaction[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any) => ({
    id: String(item.id ?? item.guid ?? ''),
    date: item.date ?? '',
    type: mapTransactionType(item.type),
    amount: Number(item.amount ?? item.summ ?? 0),
    title: item.title ?? item.description ?? item.message ?? ''
  }));
}

export const useWallet = () => {
  const token = useToken();
  const { socket } = useSocket();
  const toast = useToast();
  const seller_id = useLoginStore((s) => s.seller);

  const accountData = useAccountStore((s) => s.accountData);
  const transactions = useAccountStore((s) => s.transactions);
  const isLoading = useAccountStore((s) => s.isLoading);

  const setLoading = useAccountStore((s) => s.setLoading);
  const setAccountData = useAccountStore((s) => s.setAccountData);
  const setTransactions = useAccountStore((s) => s.setTransactions);

  const pendingRequests = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());

  const socketRequest = useCallback(
    (event: string, data: any, responseEvent: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const requestId = `${event}_${Date.now()}`;

        if (!socket) {
          resolve({ success: false, message: 'Нет подключения к серверу' });
          return;
        }

        pendingRequests.current.set(requestId, { resolve, reject });

        const onSuccess = (response: any) => {
          const pending = pendingRequests.current.get(requestId);
          if (pending) pendingRequests.current.delete(requestId);

          if (response?.success) {
            pending?.resolve({ success: true, data: response.data });
          } else {
            pending?.resolve({ success: false, error: response?.message || 'Ошибка сервера' });
          }

          socket.off(responseEvent, onSuccess);
        };

        socket.on(responseEvent, onSuccess);

        setTimeout(() => {
          const pending = pendingRequests.current.get(requestId);
          if (pending) pendingRequests.current.delete(requestId);
          socket.off(responseEvent, onSuccess);
          pending?.resolve({ success: false, error: 'Время ожидания истекло' });
        }, 10000);

        socket.emit(event, { ...data, requestId });
      });
    },
    [socket]
  );

  const get_transactions = useCallback(
    async (opts?: { silent?: boolean }): Promise<any> => {
      const silent = opts?.silent ?? false;
      if (!silent) setLoading(true);
      try {
        const result = await socketRequest('get_transactions', { token }, 'get_transactions');
        if (result?.success) setTransactions(normalizeTransactions(result.data));
        else if (!silent) toast.error('Ошибка получения транзакций');
        return result;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [setLoading, setTransactions, socketRequest, token, toast]
  );

  const get_balanse = useCallback(
    async (opts?: { silent?: boolean }): Promise<any> => {
      const silent = opts?.silent ?? false;
      if (!silent) setLoading(true);
      try {
        if (socket) socket.emit('get_balance', { token });
        return { success: true };
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [setLoading, socket, token]
  );

  const set_payment = useCallback(
    async (data: { type: number; amount: number; description: string }) => {
      setLoading(true);
      try {
        const result = await socketRequest('create_payment_sbp', { token, ...data }, 'create_payment_sbp');
        return result;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, socketRequest, token]
  );

  const set_invoice = useCallback(
    async (invoiceData: any): Promise<any> => {
      setLoading(true);
      try {
        const result = await socketRequest('create_invoice', { token, ...invoiceData }, 'create_invoice');
        return result;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, socketRequest, token]
  );

  const get_invoice = useCallback(
    async (invoice_id: string, opts?: { silent?: boolean }): Promise<any> => {
      const silent = opts?.silent ?? false;
      if (!silent) setLoading(true);
      try {
        return await socketRequest('get_invoice', { token, invoice_id }, 'get_invoice');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [setLoading, socketRequest, token]
  );

  // Подписка на события баланса/транзакций держится в socket handlers аккаунта,
  // но здесь просто запускаем загрузку.
  useEffect(() => {
    // не автозапускаем, вызываем руками в экране
  }, []);

  const formattedBalance = useMemo(() => {
    if (!accountData) return '—';
    try {
      return accountData.balance.toLocaleString('ru-RU', {
        style: 'currency',
        currency: accountData.currency || 'RUB',
        maximumFractionDigits: 0
      });
    } catch {
      return `${accountData.balance} ${accountData.currency || 'RUB'}`;
    }
  }, [accountData]);

  const refreshWallet = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      await get_balanse({ silent });
      await get_transactions({ silent });
    },
    [get_balanse, get_transactions]
  );

  const load = useCallback(async () => {
    await refreshWallet({ silent: false });
  }, [refreshWallet]);

  return {
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
  };
};


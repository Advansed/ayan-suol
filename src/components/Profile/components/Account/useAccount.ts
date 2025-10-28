// src/Store/useAccount.ts
import React, { useCallback, useEffect, useRef } from 'react'
import { useLoginStore, useToken } from '../../../../Store/loginStore'
import { useSocket } from '../../../../Store/useSocket'
import { useAccountStore } from '../../../../Store/accountStore'
import { useToast } from '../../../Toast'

export const useAccount = () => {
  const token = useToken()
  
  const accountData       = useAccountStore(state => state.accountData )
  const transactions      = useAccountStore(state => state.transactions )
  const setTransactions   = useAccountStore(state => state.setTransactions )
  const isLoading         = useAccountStore(state => state.isLoading )
  const setLoading        = useAccountStore(state => state.setLoading )
  const seller_id         = useLoginStore(state => state.seller )
  
  const { socket } = useSocket()
  const pendingRequests = useRef<Map<string, { resolve: Function, reject: Function }>>(new Map());
  const toast = useToast()

  useEffect(() => {
    console.log("useeEffect", accountData)
  }, [accountData])
  
  const socketRequest = useCallback((event: string, data: any, responseEvent: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const requestId = `${event}_${Date.now()}`;
      if(!socket) return
      
      pendingRequests.current.set(requestId, { resolve, reject });
      
      const onSuccess = (response: any) => {
        console.log(event + " on:", response)
        if(response.success) {
          const pending = pendingRequests.current.get(requestId);
          if (pending) {
            pendingRequests.current.delete(requestId);
            pending.resolve({ success: true, data: response.data });
          }
        } else {
          const pending = pendingRequests.current.get(requestId);
          if (pending) {
            pendingRequests.current.delete(requestId);
            pending.resolve({ success: false, error: response.message || 'Ошибка сервера' });
          }
        }
        socket.off(responseEvent, onSuccess);
      };
      
      socket.on(responseEvent, onSuccess);
      
      setTimeout(() => {
        const pending = pendingRequests.current.get(requestId);
        if (pending) {
          pendingRequests.current.delete(requestId);
          socket.off(responseEvent, onSuccess);
          pending.resolve({ success: false, error: 'Время ожидания истекло' });
        }
      }, 10000);
      
      console.log(event + " emit...")
      socket.emit(event, { ...data, requestId });
    });
  }, []);

  // Получение данных продавца
  const get_seller = async (): Promise<any> => {
    setLoading(true)
    try {
      const result = await socketRequest(
        'get_seller', 
        { token, seller_id },
        'get_seller'
      );
            
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      return { success: false, data: null, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Создание счета
  const set_invoice = async (invoiceData: any): Promise<any> => {
    setLoading(true)
    try {
      const result = await socketRequest(
        'create_invoice', 
        { token, ...invoiceData },
        'create_invoice'
      );
            
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      return { success: false, data: null, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Оплата по счету
  const get_invoice = async (invoice_id: string): Promise<any> => {
    setLoading(true)
    try {
      const result = await socketRequest(
        'get_invoice', 
        { token, invoice_id },
        'get_invoice'
      );
            
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      return { success: false, data: null, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const set_payment = async (data: any): Promise<any> => {
    setLoading(true)
    try {
      const result = await socketRequest(
        'create_payment_sbp', 
        { token, ...data },
        'create_payment_sbp'
      );
            
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      return { success: false, data: null, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const get_transactions = async (): Promise<any> => {
    setLoading(true)
    try {
      const result = await socketRequest(
        'get_transactions', 
        { token },
        'get_transactions'
      );
            
      if(result.success) setTransactions(result.data)
      else toast.error("Ошибка получения транзакций")

      return result;
    } catch (err) {
      toast.error("Ошибка вызова обработчика ")
    } finally {
      setLoading(false);
    }
  };
  
  const get_balanse = async (): Promise<any> => {
    setLoading(true)
    try {
      if(socket){
        console.log("get_balance emit...")
        socket.emit("get_balance", { token })
      }
    } catch (err) {
      toast.error("Ошибка вызова обработчика ")
    } finally {
      setLoading(false);
    }
  };

  return {
    accountData,
    isLoading,
    transactions,
    set_payment,
    get_balanse,
    get_transactions,
    get_seller,
    set_invoice,
    get_invoice
  }
}
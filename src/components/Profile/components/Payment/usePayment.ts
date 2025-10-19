import { useState, useCallback, useRef } from 'react';
import { useSocket } from '../../../../Store/useSocket';
import { useToken } from '../../../../Store/loginStore';

interface PaymentResult {
  success: boolean;
  message: string;
}

interface UsePaymentReturn {
  set_payment:    ( data: any ) => Promise<any>;
  loading:        boolean;
}

export const usePayment = (): UsePaymentReturn => {
  const [loading, setLoading]   = useState(false);
  const pendingRequests         = useRef<Map<string, { resolve: Function, reject: Function }>>(new Map());
  const { socket }              = useSocket()
  const token                   = useToken()

  // Универсальная функция для socket запросов с ответом
  const socketRequest = useCallback((event: string, data: any, responseEvent: string): Promise<PaymentResult> => {
    return new Promise((resolve, reject) => {
      const requestId = `${event}_${Date.now()}`;
      if(!socket) return
      
      // Сохраняем промис для данного запроса
      pendingRequests.current.set(requestId, { resolve, reject });
      
      // Обработчик успешного ответа
      const onSuccess = (response: any) => {
        if( response.success ){

          const pending = pendingRequests.current.get( requestId );
          if (pending) {
            pendingRequests.current.delete(requestId);
            pending.resolve({ success: true, data: response.data });
          }

        } else {
          const pending = pendingRequests.current.get( requestId );
          if (pending) {
            pendingRequests.current.delete(requestId);
            pending.resolve({ success: false, error: response.message || 'Ошибка сервера' });
          }
        }

        socket.off(responseEvent, onSuccess);
      
      };
      
      // Подписываемся на события
      socket.on(responseEvent, onSuccess);
      
      // Таймаут
      setTimeout(() => {
        const pending = pendingRequests.current.get(requestId);
        if (pending) {
          pendingRequests.current.delete(requestId);
          socket.off(responseEvent, onSuccess);
          pending.resolve({ success: false, error: 'Время ожидания истекло' });
        }
      }, 10000); // 10 сек таймаут
      
      // Отправляем запрос
      socket.emit(event, { ...data, requestId });
    });
  }, []);

  const set_payment = async (data: any): Promise<PaymentResult> => {
    setLoading(true);

    try {
      
      const result = await socketRequest(
        'create_payment_sbp', 
        { token, ...data },
        'create_payment_sbp'
      );
            
      return result;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const get_sbp = async (): Promise<PaymentResult> => {
    setLoading(true);

    try {
      
      const result = await socketRequest(
        'get_sbp_banks', 
        { token },
        'get_sbp_banks'
      );
            
      return result;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };


  return { set_payment,  loading };
};
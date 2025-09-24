import { useState, useCallback, useRef } from 'react';
import { useSocket } from '../../../Store/useSocket';
import { loginGetters } from '../../../Store/loginStore';

interface PaymentResult {
  success: boolean;
  error?: string;
}

interface UsePaymentReturn {
  saveAdvance: (cargoId: string, amount: number) => Promise<PaymentResult>;
  saveInsurance: (cargoId: string, amount: number) => Promise<PaymentResult>;
  loading: boolean;
  error: string | null;
}

export const usePayment = (): UsePaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRequests = useRef<Map<string, { resolve: Function, reject: Function }>>(new Map());
  const { socket } = useSocket()
  const token = loginGetters.getToken()

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

          const pending = pendingRequests.current.get(requestId);
          if (pending) {
            pendingRequests.current.delete(requestId);
            pending.resolve({ success: true });
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

  const saveAdvance = async (cargoId: string, amount: number): Promise<PaymentResult> => {
    setLoading(true);
    setError(null);

    try {
      
      const result = await socketRequest(
        'set_advance', 
        { token, cargo_id: cargoId, advance: amount },
        'set_advance'
      );
      
      if (!result.success) {
        setError(result.error || 'Ошибка сохранения аванса');
      }
      
      return result;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const saveInsurance = async (cargoId: string, amount: number): Promise<PaymentResult> => {
    setLoading(true);
    setError(null);

    try {
      
      const result = await socketRequest(
        'set_insurance',
        { token, cargo_id: cargoId, insurance: amount },
        'set_insurance'
      );
      
      if (!result.success) {
        setError(result.error || 'Ошибка сохранения страховки');
      }
      
      return result;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { saveAdvance, saveInsurance, loading, error };
};
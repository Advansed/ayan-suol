import { useState } from 'react';
import socketService from '../../Sockets';
import { Store } from '../../Store';

// Типы для хука
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

  const saveAdvance = async (cargoId: string, amount: number): Promise<PaymentResult> => {
    setLoading(true);
    setError(null);

    try {
        // TODO: Получить token из контекста/стора
        const token = Store.getState().login.token
      
        socketService.emit('set_advance', {
            token,
            cargo_id: cargoId,
            advance: amount
        });


        return { success: true };
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
        // TODO: Получить token из контекста/стора
        const token = Store.getState().login.token
      
        socketService.emit('set_insurance', {
            token,
            cargo_id: cargoId,
            insurance: amount
        });


        return { success: true };

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
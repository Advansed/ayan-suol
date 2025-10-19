// src/Store/useAccount.ts
import React, { useCallback, useEffect, useRef }                                  from 'react'
import { useToken }                           from '../../../../Store/loginStore'
import { useSocket }                          from '../../../../Store/useSocket'
import { useAccountStore }                    from '../../../../Store/accountStore'
import { useToast }                           from '../../../Toast'


// ============================================
// HOOK
// ============================================

export const useAccount = () => {
  const token                                 = useToken()
  
  // Используем хуки из accountStore
  const accountData                           = useAccountStore( state => state.accountData )
  const transactions                          = useAccountStore( state => state.transactions )
  const setTransactions                       = useAccountStore( state => state.setTransactions )
  const setAccountData                        = useAccountStore( state => state.setAccountData )
  const isLoading                             = useAccountStore( state => state.isLoading )

  const setLoading                            = useAccountStore( state => state.setLoading )

  const { socket }                            = useSocket()

  const pendingRequests                       = useRef<Map<string, { resolve: Function, reject: Function }>>(new Map());
  
  const toast = useToast()

  useEffect(()=>{
    console.log("useeEffect", accountData)
  },[accountData])
  
    // Универсальная функция для socket запросов с ответом
    const socketRequest = useCallback((event: string, data: any, responseEvent: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const requestId = `${event}_${Date.now()}`;
        if(!socket) return
        
        // Сохраняем промис для данного запроса
        pendingRequests.current.set(requestId, { resolve, reject });
        
        // Обработчик успешного ответа
        const onSuccess = (response: any) => {
          console.log(event + " on:",  response)
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
        console.log(event + " emit...")
        socket.emit(event, { ...data, requestId });
      });
    }, []);
  
    const set_payment = async (data: any): Promise<any> => {
      setLoading( true )
  
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
        setLoading( false );
      }
    };

    const get_transactions = async (): Promise<any> => {

      setLoading( true )
      try {

        const result = await socketRequest(
          'get_transactions', 
          { token },
          'get_transactions'
        );
              
        if(result.success) setTransactions( result.data )
        else toast.error("Ошибка получения транзакций")

        return result;
      } catch (err) {
        toast.error("Ошибка вызова обработчика ")

      } finally {
        setLoading( false );
      }

    };
    
    const get_balanse = async (): Promise<any> => {
      
      setLoading( true )
      try {
        socket?.emit( "get_balance", { token } )
      } catch (err) {
        toast.error("Ошибка вызова обработчика ")
      } finally {
        setLoading( false );
      }

    };

    
  

  return {
    accountData,
    isLoading,
    transactions,
    set_payment,
    get_balanse,
    get_transactions
  }
}
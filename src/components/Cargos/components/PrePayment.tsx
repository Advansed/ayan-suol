// components/PrepaymentPage.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CargoInfo, useCargoStore } from '../../../Store/cargoStore';
import './PrePayment.css'
import { formatters } from '../utils';
import { useAccountStore } from '../../../Store/accountStore';
import { IonButton } from '@ionic/react';
import { useLoginStore, useToken } from '../../../Store/loginStore';
import { useSocket } from '../../../Store/useSocket';

interface PrepaymentPageProps {
  cargo: CargoInfo;
  onBack: () => void;
}

export const PrepaymentPage: React.FC<PrepaymentPageProps> = ({ cargo, onBack }) => {
  const [amount, setAmount]                 = useState<string>(cargo.advance === 0 ? '' : cargo.advance.toString());  
  const { accountData, set_payment, id,
    isLoading, set_prepayment }             = useData( cargo, onBack )

  const handleSubmit                        = async () => {
    if (parseFloat(amount) <= 0) {
      alert('Введите сумму предоплаты');
      return;
    }

    if (parseFloat(amount) > cargo.cost) {
      alert('Сумма предоплаты не может превышать стоимость груза');
      return;
    }

    set_prepayment({ 
        cargo_id:       cargo.guid, 
        prepayment:     parseFloat(amount) || 0, 
        description:    "Предоплата за груз " + cargo.name,
        currency:       accountData?.currency,
        type:           1
    })

    
  };

  const handlePayment                       = async () => {

    const res = await set_payment({
        type:         1,
        amount:       -((accountData?.balance || 0) - (parseFloat(amount) || 0)),
        description:  "Пополнение лицевого счета " + id
    })

    if(res.success) window.open( res.data.payment_url )

  }

  console.log( cargo )
  return (
    <div className="prepayment-page">
      <div className="page-header">
        <button onClick={onBack} className="back-button">← Назад</button>
        {/* <h2>Создание предоплаты</h2> */}
      </div>

      <div className="prepayment-form">
        <div className="cargo-info">
          <h3>Информация о грузе:</h3>
          <p><strong>Груз:</strong> {cargo.name}</p>
          <p><strong>Стоимость:</strong> {formatters.currency(cargo.price)} </p>
          <div className='mt-1'>
            <p><strong>Баланс:</strong> { formatters.currency(accountData?.balance || 0) } </p>
            <p><strong>Аванс:</strong> {formatters.currency( (parseFloat(amount) || 0)) + ' - (' + ((parseFloat(amount) || 0) * 100 / cargo.price ).toFixed(2) + '%)' }</p>
            <p><strong>Остаток:</strong> {formatters.currency((accountData?.balance || 0) - (parseFloat(amount) || 0))  }</p>
            { ((accountData?.balance || 0) - (parseFloat(amount) || 0)) < 0 && (
                <IonButton
                    expand='block'
                    onClick={()=>{

                       handlePayment()

                    }}
                >
                    { "К оплате " + formatters.currency(-((accountData?.balance || 0) - (parseFloat(amount) || 0))) }
                </IonButton>
            )}
          </div>
        </div>

        <div className="amount-input">
          <label htmlFor="amount">Сумма предоплаты:</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => {
              let value = parseFloat(e.target.value)
              if( value > cargo.price ) value = cargo.price
              setAmount( value.toString() ) }
            }
            min="0"
            max={cargo.price - (cargo.advance || 0)}
            placeholder="Введите сумму"
          />
          <small>Доступно для оплаты: { cargo.price } ₽</small>
        </div>

        <div className="actions">
          <button 
            onClick={handleSubmit} 
            disabled={isLoading || (parseFloat(amount) || 0 ) <= 0 || (accountData?.balance || 0) < parseFloat(amount) }
            className="submit-button"
          >
            {isLoading ? 'Создание...' : 'Создать предоплату'}
          </button>
          <button onClick={onBack} className="cancel-button">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};


export const useData = ( cargo: CargoInfo, onBack ) => {
  const token                               = useToken()
  const id                                  = useLoginStore( state => state.id )
  // Используем ху  zки из accountStore
  const accountData                         = useAccountStore( state => state.accountData )
  const isLoading                           = useAccountStore( state => state.isLoading )
  const setLoading                          = useAccountStore( state => state.setLoading )
  const { socket }                          = useSocket()
  const pendingRequests                     = useRef<Map<string, { resolve: Function, reject: Function }>>(new Map());

  const updateCargo                         = useCargoStore( state => state.updateCargo )

  useEffect(()=>{
    console.log("useeEffect", accountData)
  },[accountData])
  
    // Универсальная функция для socket запросов с ответом
    const socketRequest                     = useCallback((event: string, data: any, responseEvent: string): Promise<any> => {
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
  
    const set_payment                       = async (data: any): Promise<any> => {
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

    const set_prepayment                    = async (data: any): Promise<any> => {
      setLoading( true )
  
      try {
        
        const result = await socketRequest(
          'set_document', 
          { token, ...data },
          'set_document'
        );
              
        if(result.success) {
            cargo.advance = data.prepayment; 
            updateCargo( cargo.guid, cargo)
        }
        
        onBack()
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
        return { success: false, data: null, message: errorMsg };
      } finally {
        setLoading( false );
      }
    };

  return {
    id,
    accountData,
    isLoading,
    set_payment,
    set_prepayment
  }
}
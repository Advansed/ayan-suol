import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IonIcon, IonAlert, IonLoading, useIonRouter } from '@ionic/react';
import { arrowBackOutline, shieldCheckmarkOutline, documentTextOutline, businessOutline } from 'ionicons/icons';
import { formatters } from '../utils';
import { CargoInfo, useCargoStore } from '../../../Store/cargoStore';
import { useLoginStore, useToken } from '../../../Store/loginStore';
import { useAccountStore } from '../../../Store/accountStore';
import { useSocket } from '../../../Store/useSocket';
import { useToast } from '../../Toast';

interface InsurancePageProps {
    cargo: CargoInfo;
    onBack: () => void;
}

// Типы страхового покрытия
const INSURANCE_TYPES = [
    {
        id: 'basic',
        name: 'Базовое покрытие',
        icon: shieldCheckmarkOutline,
        description: 'Покрытие от утраты и повреждения',
        rate: 1.0, // 0.5% от стоимости груза
        coverage: ['Полная утрата груза', 'Повреждение при перевозке', 'Кража груза']
    },
    {
        id: 'extended',
        name: 'Расширенное покрытие', 
        icon: documentTextOutline,
        description: 'Полное покрытие всех рисков',
        rate: 2.0, // 1.2% от стоимости груза
        coverage: ['Все риски базового покрытия', 'Стихийные бедствия', 'Задержка в доставке', 'Порча груза']
    },
    {
        id: 'premium',
        name: 'Премиум покрытие',
        icon: businessOutline, 
        description: 'Максимальная защита + сервис',
        rate: 3.0, // 2.0% от стоимости груза
        coverage: ['Все риски расширенного покрытия', '24/7 поддержка', 'Экспресс выплаты', 'Юридическое сопровождение']
    }
];

export const InsurancePage: React.FC<InsurancePageProps> = ({
    cargo,
    onBack,
}) => {
    const [selectedType,        setSelectedType]        = useState<string>('basic');
    const [showConfirmAlert,    setShowConfirmAlert]    = useState(false);
    const [showCancelAlert,     setShowCancelAlert]     = useState(false);
    const [insuranceCost,       setInsuranceCost]       = useState(0);

    const { accountData, id, isLoading, set_insurance, del_insurance } = useData( cargo, onBack )

    // Получаем выбранный тип страхования
    const selectedInsurance = INSURANCE_TYPES.find(type => type.id === selectedType);

    const hist = useIonRouter() 

    // Рассчитываем стоимость страхования
    useEffect(() => {
        if (selectedInsurance && cargo.cost) {
            const cost = Math.round(cargo.cost * selectedInsurance.rate / 100);
            setInsuranceCost(cost);
        }
    }, [selectedType, selectedInsurance, cargo.cost]);

    // Обработчик оформления страховки
    const handleInsurance = async () => {
        try {

            set_insurance({ 
                cargo_id:           cargo.guid, 
                prepayment:         insuranceCost, 
                description:        "Страхование " + (selectedInsurance?.name || 'basic') + ' груза ' + cargo.name,
                currency:           accountData?.currency,
                type:               2
            })


        } catch (error) {
            console.error('Payment error:', error);
        } 
    };

    const handleConfirmInsurance = () => {
        setShowConfirmAlert(false);
        handleInsurance();
    };

    const handleCancel = async() => {
        setShowCancelAlert(false);

        await del_insurance({ cargo_id: cargo.guid, type: 2 })

        if( onBack ) onBack();
    };

    return (
        <>
            <IonLoading isOpen={isLoading} message="Оформление страховки..." />
            
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon 
                    icon={arrowBackOutline} 
                    className="w-15 h-15"
                    onClick={onBack}
                    style={{ cursor: 'pointer' }}
                />
                <div className="a-center w-90 fs-09">
                    <b>Страхование груза</b>
                </div>
            </div>

            {/* Информация о грузе */}
            <div className="cr-card mt-1">
                <div className="fs-09 mb-05"><b>Информация о грузе</b></div>
                <div className="fs-08 cl-gray mb-05">{cargo.name}</div>
                <div className="flex">
                    <div className="flex-1">
                        <div className="fs-07 cl-gray">Маршрут</div>
                        <div className="fs-08">
                            {cargo.address?.city.city} → {cargo.destiny?.city.city}
                        </div>
                    </div>
                    <div className='mt-05'>
                        <div className="fs-07 cl-gray">Вес/Объем</div>
                        <div className="fs-08">
                            {cargo.weight}т / {cargo.volume}м³
                        </div>
                    </div>
                </div>
                <div className="flex fl-space">
                    <div>
                        <div className="fs-09 cl-black"><b>Стоимость груза</b></div>
                        <div className="fs-07 cl-gray">Сумма для страхования</div>
                    </div>
                    <div className="text-right">
                        <div className="fs-12 cl-prim" style={{ fontWeight: 'bold' }}>
                            {formatters.currency(cargo.cost || 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Типы страхования */}
            <div className="cr-card mt-1">
                <div className="fs-09 mb-1"><b>Выберите тип покрытия</b></div>
                
                {INSURANCE_TYPES.map(insurance => (
                    <div 
                        key={insurance.id}
                        className={`insurance-type ${selectedType === insurance.id ? 'selected' : ''}`}
                        onClick={() => setSelectedType(insurance.id)}
                    >
                        <div className="flex a-center">
                            <IonIcon 
                                icon={insurance.icon} 
                                className="w-15 h-15 mr-05" 
                                style={{ 
                                    color: selectedType === insurance.id ? 'var(--ion-color-primary)' : 'gray' 
                                }}
                            />
                            <div className="flex-1">
                                <div className="flex fl-space a-center">
                                    <div>
                                        <div className="fs-08">{insurance.name}</div>
                                        <div className="fs-07 cl-gray">{insurance.description}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="fs-08" style={{ fontWeight: 'bold' }}>
                                            {insurance.rate}%
                                        </div>
                                        <div className="fs-07 cl-gray">
                                            {formatters.currency(Math.round((cargo.cost || 0) * insurance.rate / 100))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Покрытие для выбранного типа */}
                                {selectedType === insurance.id && (
                                    <div className="mt-05" style={{ paddingLeft: '0.5em', borderLeft: '2px solid var(--ion-color-primary)' }}>
                                        <div className="fs-07 cl-gray mb-05"><b>Что покрывает:</b></div>
                                        {insurance.coverage.map((item, index) => (
                                            <div key={index} className="fs-07 cl-gray mb-02">
                                                • {item}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div 
                                className="insurance-radio"
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid',
                                    borderColor: selectedType === insurance.id ? 'var(--ion-color-primary)' : 'silver',
                                    borderRadius: '50%',
                                    backgroundColor: selectedType === insurance.id ? 'var(--ion-color-primary)' : 'transparent',
                                    marginLeft: '0.5em'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Итого к оплате */}
            <div className="cr-card mt-1">
                <div className="flex fl-space">
                    <div>
                        <div className="fs-09 cl-black"><b>Стоимость страхования</b></div>
                        <div className="fs-07 cl-gray">
                            {selectedInsurance?.rate}% от стоимости груза
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="fs-12 cl-prim" style={{ fontWeight: 'bold' }}>
                            {formatters.currency(insuranceCost)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Информация о страховании */}
            <div className="cr-card mt-1">
                <div className="fs-07 cl-gray">
                    <div className="mb-05">
                        🛡️ Страхование вступает в силу с момента оплаты.
                    </div>
                    <div className="mb-05">
                        📋 В случае страхового случая обращайтесь в службу поддержки.
                    </div>
                    <div className="mb-05">
                        ⏰ Выплаты по страховым случаям производятся в течение 10 рабочих дней.
                    </div>
                    <div>
                        💳 Оплата страховки производится вместе с публикацией груза.
                    </div>
                </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex ml-1 mr-1 mt-1" style={{ gap: '0.5em' }}>
                <button 
                    className="cr-button-2 flex-1 pt-1 pb-1"
                    onClick={() => setShowCancelAlert(true)}
                >
                    Отказаться
                </button>
                {
                    (accountData?.balance || 0) > insuranceCost
                        ? <>
                            <button 
                                className="cr-button-1 flex-1  pt-1 pb-1"
                                style={{ 
                                    background: 'var(--ion-color-primary)',
                                    color: 'white'
                                }}
                                onClick={() => setShowConfirmAlert(true)}
                                disabled={!selectedType || !insuranceCost}
                            >
                                Оформить за {formatters.currency(insuranceCost)}
                            </button>
                        </>
                        : <>
                            <button 
                                className="cr-button-1 flex-1  pt-1 pb-1"
                                style={{ 
                                    background: 'var(--ion-color-primary)',
                                    color: 'white'
                                }}
                                onClick={async () => {
                                    hist.push("/tab3/account" )
                                }}
                                disabled={!selectedType || !insuranceCost}
                            >
                                Доплатите {formatters.currency(insuranceCost - (accountData?.balance || 0 ))}
                            </button>
                        </>
                }
            </div>

            {/* Alert для подтверждения страхования */}
            <IonAlert
                isOpen={showConfirmAlert}
                onDidDismiss={() => setShowConfirmAlert(false)}
                header="Оформление страхования"
                message={`Оформить ${selectedInsurance?.name.toLowerCase()} на сумму ${formatters.currency(insuranceCost)}?`}
                buttons={[
                    {
                        text: 'Отмена',
                        role: 'cancel',
                        handler: () => setShowConfirmAlert(false)
                    },
                    {
                        text: 'Оформить',
                        role: 'confirm',
                        handler: handleConfirmInsurance
                    }
                ]}
            />

            {/* Alert для отказа */}
            <IonAlert
                isOpen={showCancelAlert}
                onDidDismiss={() => setShowCancelAlert(false)}
                header="Отказ от страхования"
                message="Груз будет опубликован без страхового покрытия"
                buttons={[
                    {
                        text: 'Оформить страховку',
                        role: 'cancel',
                        handler: () => setShowCancelAlert(false)
                    },
                    {
                        text: 'Продолжить без страховки',
                        role: 'confirm',
                        handler: handleCancel
                    }
                ]}
            />

            <style>{`
                .insurance-type {
                    padding: 0.8em;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    margin-bottom: 0.8em;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .insurance-type:hover {
                    background-color: #f5f5f5;
                }

                .insurance-type.selected {
                    border-color: var(--ion-color-primary);
                    background-color: rgba(var(--ion-color-primary-rgb), 0.05);
                }

                .insurance-type:last-child {
                    margin-bottom: 0;
                }

                .mb-02 {
                    margin-bottom: 0.2em;
                }
            `}</style>
        </>
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

  const toast                               = useToast()

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
  

    const set_insurance                     = async (data: any): Promise<any> => {
      setLoading( true )
  
      try {
        
        const result = await socketRequest(
          'set_document', 
          { token, ...data },
          'set_document'
        );
              
        if(result.success) {
            console.log('insurance', data )
            cargo.insurance = data.prepayment; 
            updateCargo( cargo.guid, cargo)
            onBack()
        } else toast.error("Ошибка сохранения страховки")
        
        
      } catch (err: any) {
        toast.error('Неизвестная ошибка:' + err.message )
      } finally {
        setLoading( false );
      }
    };

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

    const del_insurance                     = async (data: any): Promise<any> => {
      setLoading( true )
  
      try {
        
        const result = await socketRequest(
          'del_document', 
          { token, ...data },
          'del_document'
        );
              
        if(result.success) {
            console.log('insurance', data )
            cargo.insurance = 0; 
            updateCargo( cargo.guid, cargo)
            onBack()
        } else toast.error("Ошибка сохранения страховки")
        
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
    set_insurance,
    del_insurance,
    set_payment
  }
}
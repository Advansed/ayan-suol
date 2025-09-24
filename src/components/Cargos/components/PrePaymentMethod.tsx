import React, { useState } from 'react';
import { IonIcon, IonAlert, IonLoading, IonInput } from '@ionic/react';
import { arrowBackOutline, cardOutline, phonePortraitOutline, walletOutline } from 'ionicons/icons';
import { formatters } from '../utils';
import { usePayment } from './usePayment';
import { CargoInfo } from '../../../Store/cargoStore';

interface PrepaymentPageProps {
    cargo: CargoInfo;
    onBack: () => void;
    onPaymentComplete?: () => void;
    onCancel?: () => void;
}

// Способы оплаты
const PAYMENT_METHODS = [
    { 
        id: 'card', 
        name: 'Банковская карта', 
        icon: cardOutline,
        description: 'Visa, MasterCard, МИР' 
    },
    { 
        id: 'sbp', 
        name: 'СБП', 
        icon: phonePortraitOutline,
        description: 'Система быстрых платежей' 
    },
    { 
        id: 'wallet', 
        name: 'Электронный кошелек', 
        icon: walletOutline,
        description: 'ЮMoney, WebMoney' 
    }
];

export const PrepaymentPage: React.FC<PrepaymentPageProps> = ({
    cargo,
    onBack,
    onPaymentComplete,
    onCancel
}) => {
    const [ selectedMethod,      setSelectedMethod ]      = useState<string>( 'card' );
    const [ isLoading,           setIsLoading ]           = useState( false );
    const [ showConfirmAlert,    setShowConfirmAlert ]    = useState( false );
    const [ showCancelAlert,     setShowCancelAlert ]     = useState( false );
    const [ paymentAmount,       setPaymentAmount ]       = useState<number>( cargo.advance || 0 );
    
    const { saveAdvance, loading: paymentLoading, error: paymentError } = usePayment();

    // Обработчик оплаты
    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const result = await saveAdvance(cargo.guid, paymentAmount);
            if (result.success) {
                if(onPaymentComplete)
                    await onPaymentComplete();
            } else {
                // TODO: Показать ошибку
                console.error('Payment failed:', result.error);
            }


        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPayment = async() => {
        setShowConfirmAlert(false);
        await handlePayment();
        onBack()
    };

    const handleCancel = () => {
        setShowCancelAlert(false);
        if(onCancel)
            onCancel();
    };

    return (
        <>
            <IonLoading isOpen={isLoading || paymentLoading} message="Обработка платежа..." />
            
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon 
                    icon={arrowBackOutline} 
                    className="w-15 h-15"
                    onClick={onBack}
                    style={{ cursor: 'pointer' }}
                />
                <div className="a-center w-90 fs-09">
                    <b>Оплата предоплаты</b>
                </div>
            </div>

            {/* Информация о грузе */}
            <div className="cr-card mt-1">
                <div className="fs-09 mb-05"><b>Груз</b></div>
                <div className="fs-08 cl-gray mb-05">{cargo.name}</div>
                <div className="flex">
                    <div className="flex-1">
                        <div className="fs-07 cl-gray">Маршрут</div>
                        <div className="fs-08">
                            {cargo.address?.city.city} → {cargo.destiny?.city.city}
                        </div>
                    </div>
                    <div>
                        <div className="fs-07 cl-gray">Стоимость</div>
                        <div className="fs-08">
                            {formatters.currency(cargo.price)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Сумма оплаты */}
            <div className="cr-card mt-1">
                <div className="fs-09 mb-1"><b>Сумма оплаты</b></div>
                <div className='borders-wp pl-1'>
                    <IonInput
                        type="number"
                        min="0"
                        max={cargo.price}
                        value={paymentAmount}
                        placeholder="Введите сумму предоплаты"
                        onIonInput={(e) => setPaymentAmount(Number(e.detail.value) || 0)}
                    />

                </div>
                <div className="fs-07 cl-gray mt-05">
                    К доплате: {formatters.currency(cargo.price - paymentAmount)}
                </div>
            </div>

            {/* Способы оплаты */}
            <div className="cr-card mt-1">
                <div className="fs-09 mb-1"><b>Способ оплаты</b></div>
                
                {PAYMENT_METHODS.map(method => (
                    <div 
                        key={method.id}
                        className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
                        onClick={() => setSelectedMethod(method.id)}
                    >
                        <div className="flex a-center">
                            <IonIcon 
                                icon={method.icon} 
                                className="w-15 h-15 mr-05" 
                                style={{ 
                                    color: selectedMethod === method.id ? 'var(--ion-color-primary)' : 'gray' 
                                }}
                            />
                            <div className="flex-1">
                                <div className="fs-08">{method.name}</div>
                                <div className="fs-07 cl-gray">{method.description}</div>
                            </div>
                            <div 
                                className="payment-radio"
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid',
                                    borderColor: selectedMethod === method.id ? 'var(--ion-color-primary)' : 'silver',
                                    borderRadius: '50%',
                                    backgroundColor: selectedMethod === method.id ? 'var(--ion-color-primary)' : 'transparent'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Кнопки действий */}
            <div className="flex ml-1 mr-1 mt-1" style={{ gap: '0.5em' }}>
                <button 
                    className="cr-button-2 flex-1 pt-1 pb-1"
                    onClick={() => setShowCancelAlert(true)}
                >
                    Отмена
                </button>
                <button 
                    className="cr-button-1 flex-1 pt-1 pb-1"
                    style={{ 
                        background: 'var(--ion-color-primary)',
                        color: 'white'
                    }}
                    onClick={() => setShowConfirmAlert(true)}
                    disabled={!selectedMethod || paymentAmount <= 0}
                >
                    Оплатить {formatters.currency(paymentAmount)}
                </button>
            </div>

            {/* Alert для подтверждения оплаты */}
            <IonAlert
                isOpen={showConfirmAlert}
                onDidDismiss={() => setShowConfirmAlert(false)}
                header="Подтверждение оплаты"
                message={`Оплатить предоплату в размере ${formatters.currency(paymentAmount)}?`}
                buttons={[
                    {
                        text: 'Отмена',
                        role: 'cancel',
                        handler: () => {
                            setShowConfirmAlert(false)
                        }
                    },
                    {
                        text: 'Оплатить',
                        role: 'confirm',
                        handler: handleConfirmPayment
                    }
                ]}
            />

            {/* Alert для отмены */}
            <IonAlert
                isOpen={showCancelAlert}
                onDidDismiss={() => setShowCancelAlert(false)}
                header="Отменить оплату"
                message="Груз не будет опубликован без оплаты предоплаты"
                buttons={[
                    {
                        text: 'Продолжить оплату',
                        role: 'cancel',
                        handler: () => setShowCancelAlert(false)
                    },
                    {
                        text: 'Отменить',
                        role: 'confirm',
                        handler: handleCancel
                    }
                ]}
            />

            <style>{`
                .payment-method {
                    padding: 0.8em;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    margin-bottom: 0.5em;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .payment-method:hover {
                    background-color: #f5f5f5;
                }

                .payment-method.selected {
                    border-color: var(--ion-color-primary);
                    background-color: rgba(var(--ion-color-primary-rgb), 0.05);
                }

                .payment-method:last-child {
                    margin-bottom: 0;
                }
            `}</style>
        </>
    );
};
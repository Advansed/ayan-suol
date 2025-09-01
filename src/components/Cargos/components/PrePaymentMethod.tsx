/**
 * Страница оплаты предоплаты
 */

import React, { useState } from 'react';
import { IonIcon, IonAlert, IonLoading } from '@ionic/react';
import { arrowBackOutline, cardOutline, phonePortraitOutline, walletOutline } from 'ionicons/icons';
import { CargoInfo } from '../types';
import { formatters } from '../utils';

interface PrepaymentPageProps {
    cargo: CargoInfo;
    onBack: () => void;
    onPaymentComplete: () => void;
    onCancel: () => void;
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
    const [selectedMethod, setSelectedMethod] = useState<string>('card');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmAlert, setShowConfirmAlert] = useState(false);
    const [showCancelAlert, setShowCancelAlert] = useState(false);

    // Обработчик оплаты
    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // Здесь будет интеграция с платежной системой
            await new Promise(resolve => setTimeout(resolve, 2000)); // Имитация запроса
            
            console.log('Payment processed:', {
                cargoId: cargo.guid,
                amount: cargo.advance,
                method: selectedMethod
            });
            
            onPaymentComplete();
        } catch (error) {
            console.error('Payment error:', error);
            // TODO: Показать ошибку оплаты
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPayment = () => {
        setShowConfirmAlert(false);
        handlePayment();
    };

    const handleCancel = () => {
        setShowCancelAlert(false);
        onCancel();
    };

    return (
        <>
            <IonLoading isOpen={isLoading} message="Обработка платежа..." />
            
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

            {/* Сумма к оплате */}
            <div className="cr-card mt-1">
                <div className="flex fl-space">
                    <div>
                        <div className="fs-09 cl-black"><b>Предоплата</b></div>
                        <div className="fs-07 cl-gray">К доплате: {formatters.currency(cargo.price - (cargo.advance || 0))}</div>
                    </div>
                    <div className="text-right">
                        <div className="fs-12 cl-prim" style={{ fontWeight: 'bold' }}>
                            {formatters.currency(cargo.advance || 0)}
                        </div>
                    </div>
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

            {/* Информация об оплате */}
            <div className="cr-card mt-1">
                <div className="fs-07 cl-gray">
                    <div className="mb-05">
                        ℹ️ После оплаты предоплаты груз будет опубликован для поиска водителей.
                    </div>
                    <div className="mb-05">
                        💳 Оплата производится через защищенное соединение.
                    </div>
                    <div>
                        🔒 Средства будут заморожены до завершения перевозки.
                    </div>
                </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex ml-1 mr-1 mt-1" style={{ gap: '0.5em' }}>
                <button 
                    className="cr-button-2 flex-1"
                    onClick={() => setShowCancelAlert(true)}
                >
                    Отмена
                </button>
                <button 
                    className="cr-button-1 flex-1"
                    style={{ 
                        background: 'var(--ion-color-primary)',
                        color: 'white'
                    }}
                    onClick={() => setShowConfirmAlert(true)}
                    disabled={!selectedMethod}
                >
                    Оплатить {formatters.currency(cargo.advance || 0)}
                </button>
            </div>

            {/* Alert для подтверждения оплаты */}
            <IonAlert
                isOpen={showConfirmAlert}
                onDidDismiss={() => setShowConfirmAlert(false)}
                header="Подтверждение оплаты"
                message={`Оплатить предоплату в размере ${formatters.currency(cargo.advance || 0)}?`}
                buttons={[
                    {
                        text: 'Отмена',
                        role: 'cancel',
                        handler: () => setShowConfirmAlert(false)
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
import React from 'react';
import { IonIcon } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import { DriverInfo as DriverInfoType, DriverCardMode } from '../types';

interface DriverInfoProps {
    info: DriverInfoType;
    mode: DriverCardMode;
    formattedCurrency: string;
}

export const DriverInfo: React.FC<DriverInfoProps> = ({ 
    info, 
    mode, 
    formattedCurrency 
}) => {
    const getWeightLabel = () => {
        switch (mode) {
            case 'assigned':
            case 'completed':
                return 'Взято груза';
            case 'delivered':
                return 'Доставлено';
            default:
                return 'Грузоподъёмность';
        }
    };

    const getWeightValue = () => {
        return mode === 'offered' ? info.capacity : `${info.weight} тонн`;
    };

    return (
        <>
            {/* Основная информация о водителе */}
            <div className="flex fl-space">
                <div className="flex">
                    <IonIcon icon={personCircleOutline} color="primary" className="w-2 h-2"/>
                    <div className="fs-09 ml-05">
                        <div><b>{info.client}</b></div>
                        <div>⭐ {info.rating}</div>
                    </div>
                </div>
                <div className="fs-09 cl-prim">
                    <div><b>{formattedCurrency}</b></div>
                    {mode !== 'offered' && (
                        <div className="cl-black fs-08">
                            <b>{info.weight} тонн</b>
                        </div>
                    )}
                </div>
            </div>

            {/* Детали транспорта */}
            <div className="fs-08 mt-05">
                🚚 <b>Транспорт:</b> {info.transport}
            </div>
            <div className="fs-08 mt-05">
                ⚖️ <b>{getWeightLabel()}:</b> {getWeightValue()}
            </div>
            
            {mode === 'offered' && (
                <div className="fs-08 mt-05">
                    📦 <b>Выполнено заказов:</b> {info.ratingCount}
                </div>
            )}

            {/* Комментарий */}
            {info.comment && mode === 'offered' && (
                <div className="mt-1 p-1" style={{backgroundColor: '#e6f2ff', borderRadius: '0.5em'}}>
                    <b className="fs-08">Комментарий водителя:</b><br />
                    <div className="fs-08 mt-05">{info.comment}</div>
                </div>
            )}
        </>
    );
};
import React, { useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import { CargoInfo, DriverInfo, DriverStatus } from '../../../Store/cargoStore';


interface DriverInfoProps {

    info:           DriverInfo;
    cargo:          CargoInfo;
    mode:           DriverStatus;

}

export const DriverCard: React.FC<DriverInfoProps> = ({ 
    info, cargo, mode
}) => {
    const getWeightLabel = () => {
        switch (mode) {
            case 'Заказано'         : return "Заказано"
            case 'Принято'          : return ""
            case 'Завершен'         : return 'Взято груза';
            case 'Доставлено'       : return 'Доставлено';
            default                 : return 'Грузоподъёмность';
        }
    };


    const formattedCurrency = useMemo(() => 
            new Intl.NumberFormat('ru-RU', { 
                style: 'currency', 
                currency: 'RUB' 
            }).format(info.price).replace('₽', '₽ '), [info.price]);


    return (
        <>
            {/* Основная информация о водителе */}
            <div className='flex fl-space'>
                <div className='cr-status-2 fs-1'>{ info.status }</div>
                <div className="fs-09 cl-prim">
                    <div className='cr-status-5 fs-11'><b>{ formattedCurrency }</b></div>
                </div>
            </div>
            <div className="flex fl-space mt-1">
                <div className="flex">
                    <IonIcon icon={personCircleOutline} color="primary" className="w-2 h-2"/>
                    <div className="fs-09 ml-05">
                        <div><b>{info.client}</b></div>
                        <div>⭐ {info.rating}</div>
                    </div>
                </div>
            </div>

            {/* Детали транспорта */}
            <div className="fs-09 mt-05 flex fl-space">
                <div>🚚 <b>Транспорт:</b></div>
                <div className='fs-1 cl-black'><b>{info.transport}</b></div>
            </div>
            <div className="fs-09 mt-05 flex fl-space">
                <div>⚖️ <b>{getWeightLabel()}:</b></div>
                <div className='fs-1 cl-black'><b>{ info.weight > 0 ? '(' + info.weight + " из " + cargo.weight + ' тонн)' : " м3" }</b></div>
                 
            </div>

            {/* Комментарий */}
            {/* {info.comment && mode === 'offered' && (
                <div className="mt-1 p-1" style={{backgroundColor: '#e6f2ff', borderRadius: '0.5em'}}>
                    <b className="fs-08">Комментарий водителя:</b><br />
                    <div className="fs-08 mt-05">{info.comment}</div>
                </div>
            )} */}
        </>
    );
};


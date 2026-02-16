import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { personCircleOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import { DriverInfo } from '../../../Store/cargoStore';
import { formatters } from '../../../utils/utils';

interface DriverInfoProps {
    info: DriverInfo;
    onAccept?: (info: DriverInfo) => void;
    onReject?: (info: DriverInfo) => void;
    onChat?: (info: DriverInfo) => void;
    isLoading?: boolean;
}

const offer = (
    info: DriverInfo,
    onAccept?: (info: DriverInfo) => void,
    onReject?: (info: DriverInfo) => void,
    onChat?: (info: DriverInfo) => void,
    isLoading?: boolean
) => {
    return (
        <div className="borders mt-1">
            <div className="fs-1">
                <b>Предложение от водителя</b>
            </div>
            <div className="fs-1 mt-05 flex fl-space">
                <div>⚖️ <b>Вес:</b></div>
                <div className="fs-12 cl-black">
                    <b>{info.weight.toFixed(1)} тонн</b>
                </div>
            </div>
            <div className="fs-1 mt-05 flex fl-space">
                <div>📦 <b>Объем:</b></div>
                <div className="fs-12 cl-black">
                    <b>{info.volume.toFixed(1)} м³</b>
                </div>
            </div>
            <div className="fs-1 mt-05 flex fl-space">
                <div>💰 <b>Цена:</b></div>
                <div className="fs-12 cl-black">
                    <b>{formatters.currency(info.price)}</b>
                </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex mt-1" style={{ gap: '0.5em' }}>
                {onReject && (
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="clear"
                        color="warning"
                        onClick={() => onReject(info)}
                        disabled={isLoading}
                    >
                        <span className="fs-1">Отказать</span>
                    </IonButton>
                )}
                {onAccept && (
                    <IonButton
                        className="w-50 cr-button-1"
                        mode="ios"
                        fill= "outline"
                        color="primary"
                        onClick={() => { if(onChat) onChat(info)}}
                        disabled={isLoading}
                    >
                        <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06" /> 
                        <span className="fs-1 ml-05">Чат</span>
                    </IonButton>
                )}
            </div>

            {/* Кнопка чата */}
            {onChat && (
                <div className="">
                    <IonButton
                        className="w-100 cr-button-2"
                        mode="ios"
                        color="primary"
                        onClick={() => { if(onAccept) onAccept(info)}}
                        disabled={isLoading}
                    >
                        {/* <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06" /> */}
                        <span className="ml-1 fs-1">Принять</span>
                    </IonButton>
                </div>
            )}
        </div>
    );
};

export const DriverCard: React.FC<DriverInfoProps> = ({ 
    info, 
    onAccept, 
    onReject, 
    onChat,
    isLoading = false 
}) => {
    return (
        <div>
            <div className="borders">
                {/* Основная информация о водителе */}
                <div className="flex fl-space mt-1">
                    <div className="flex">
                        <IonIcon 
                            icon={personCircleOutline} 
                            color="primary" 
                            className="w-3 h-3"
                        />
                        <div className="fs-1 ml-05">
                            <div className="fs-12">
                                <b>{info.client}</b>
                            </div>
                            <div className="fs-12">⭐ {info.rating}</div>
                        </div>
                    </div>
                </div>

                {/* Детали транспорта */}
                <div className="fs-1 mt-05 flex fl-space">
                    <div>
                        🚚 <b>Транспорт:</b>
                    </div>
                    <div className="fs-12 cl-black">
                        <b>{info.transport}</b>
                    </div>
                </div>
            </div>

            {
                info.status === "Заказано"
                    ? offer(info, onAccept, onReject, onChat, isLoading)
                    : <></>
            }
            
        </div>
    );
};


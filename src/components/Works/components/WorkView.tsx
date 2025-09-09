import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { arrowBackOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import { OfferInfo, WorkInfo } from '../types';
import { WorkCard } from './WorkCard';
import { useSocket } from '../../../Store/useSocket';

interface WorkViewProps {
    work:       WorkInfo;
    onBack:     () => void;
    onStatus:   (status: string, offer: Partial<OfferInfo>) => Promise<void>
}

export const WorkView: React.FC<WorkViewProps> = ({ work, onBack, onStatus }) => {
    const [workInfo, setWorkInfo] = useState(work);
    const { isConnected, on, emit } = useSocket()



    const handleDelivered = async() => {

        await onStatus("delivered", {
            guid:       workInfo.guid,
            recipient:  workInfo.recipient
        })
        
        onBack()
    };

    return (
        <>
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon 
                    icon={arrowBackOutline} 
                    className="w-15 h-15"
                    onClick={onBack}
                />
                <div className="a-center w-90 fs-09">
                    <b>{"Заказ ID " + workInfo.guid.substr(0, 8)}</b>
                </div>
            </div>

            <div className='cr-card mt-1'>
                <WorkCard work={workInfo} mode="view" />
                
                {/* Информация о грузе */}
                <div className="borders-wp mt-1">
                    <div className="pl-1 pr-1 pt-1 pb-05">
                        <div className="fs-09 cl-gray pb-05 cl-black">
                            <b>Информация о грузе</b>
                        </div>
                        
                        <div className="flex fl-space">
                            <div className="w-50">
                                <div className="fs-08">Вес (т)</div>
                                <div className="fs-09 pt-05 borders-wp pl-1 pb-05">
                                    {workInfo.weight || '-'}
                                </div>
                            </div>
                            <div className="w-50 pl-1">
                                <div className="fs-08">Объем (м³)</div>
                                <div className="fs-09 pt-05 borders-wp pl-1 pb-05">
                                    {workInfo.volume || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Адреса и контакты */}
                <div className="borders-wp mt-1">
                    <div className="pl-1 pr-1 pt-1 pb-05">
                        <div className="fs-09 cl-gray pb-1 cl-black">
                            <b>Адреса и контакты</b>
                        </div>
                        
                        <div className="pb-1">
                            <div className="fs-08">Адрес погрузки</div>
                            <div className="fs-09 pt-05 a-right borders-wp pr-1 pb-05">
                                {workInfo.address.city.city + ', ' + workInfo.address.address || '-'}
                            </div>
                        </div>

                        <div className="pb-1">
                            <div className="fs-08">Адрес разгрузки</div>
                            <div className="fs-09 pt-05 a-right borders-wp pr-1 pb-05">
                                {workInfo.destiny.city.city + ', ' + workInfo.destiny.address || '-'}
                            </div>
                        </div>

                        <div className="pb-1">
                            <div className="fs-08">Контактное лицо</div>
                            <div className="fs-09 pt-05 a-right borders-wp pr-1 pb-05">
                                {workInfo.face || '-'}
                            </div>
                        </div>

                        <div className="pb-1">
                            <div className="fs-08">Телефон</div>
                            <div className="fs-09 pt-05 a-right borders-wp pr-1 pb-05">
                                {workInfo.phone || '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex fl-space mt-05 pb-05">
                    <IonButton
                        className="w-50"
                        mode="ios"
                        color="danger"
                    >
                        <span className="fs-08">Обратиться в тех. поддержку</span>
                    </IonButton>

                    <IonButton
                        className="w-50"
                        mode="ios"
                        color="primary"
                        onClick={handleDelivered}
                    >
                        <span className="fs-08 cl-white">Заказ выполнен</span>
                    </IonButton>
                </div>
                
                <IonButton
                    className="w-100 cr-button-2"
                    mode="ios"
                    fill="clear"
                    color="primary"
                >
                    <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                    <span className="ml-1 fs-08">Чат</span>
                </IonButton>
            </div>
        </>
    );
};
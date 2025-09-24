import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { arrowBackOutline, callOutline, locationOutline } from 'ionicons/icons';
import { WorkInfo, WorkStatus } from '../types';
import { workFormatters, workStatusUtils } from '../utils';
import { useHistory } from 'react-router-dom';
import { useWorkStore } from '../../../Store/workStore';

interface WorkViewProps {
    work:           WorkInfo;
    onBack:         () => void;
    onOfferClick:   (work: WorkInfo ) => void;
    onStatusClick:  (work: WorkInfo ) => void;
    onMapClick:     (work: WorkInfo ) => void;
}

export const WorkView: React.FC<WorkViewProps> = ({ 
    work, onBack, 
    onOfferClick,
    onStatusClick,
    onMapClick,

}) => {
    const [workInfo, setWorkInfo] = useState(work);
    
    const works             = useWorkStore(state => state.works)

    useEffect(()=>{
        const w = works.find( w => w.guid === workInfo.guid )
        setWorkInfo( w as WorkInfo )
    },[ works ])

    const hist = useHistory()

    const handleChat        = (work: WorkInfo, e: React.MouseEvent) => {
        e.stopPropagation();
        hist.push(`/tab2/${work.recipient}:${work.cargo}:${work.client}`);
    };

    const StatusClick = (work: WorkInfo) => {

        onStatusClick( work )

    }

    const renderButtons     = ( work: WorkInfo) => {
        return <>
            <div>
                <div className="flex">
                    <IonButton
                        className   = "w-50 cr-button-2"
                        mode        = "ios"
                        fill        = "clear"
                        color       = "primary"
                        onClick     = { (e) => handleChat( work, e) }
                    >
                        <IonLabel className="fs-08">
                            {work.status === WorkStatus.NEW ? 'Чат' : 'Чат'}
                        </IonLabel>
                    </IonButton>
                    
                    <IonButton
                        className   = "w-50 cr-button-2"
                        mode        = "ios"
                        color       = "tertiary"
                        onClick     = {(e) => {
                            e.stopPropagation();
                            onMapClick(work);
                        }}
                    >
                        <IonLabel className="fs-08">Карта</IonLabel>
                    </IonButton>

                </div>
                <div className="flex">
                    
                    {( 
                        work.status === WorkStatus.NEW 
                    
                        ||  work.status === WorkStatus.TO_LOAD
                        ||  work.status === WorkStatus.LOADING
                        ||  work.status === WorkStatus.IN_WORK
                        ||  work.status === WorkStatus.UNLOADING
                        ||  work.status === WorkStatus.REJECTED

                    ) &&  (<>
                            <IonButton
                                className   = "w-100 "
                                mode        = "ios"
                                color       = "primary"
                                onClick     = {(e) => {
                                    e.stopPropagation();
                                    switch(work.status) {
                                        case WorkStatus.NEW:        onOfferClick( work );   break;
                                        case WorkStatus.TO_LOAD:     StatusClick( work );   break;
                                        case WorkStatus.LOADING:     StatusClick( work );   break;
                                        case WorkStatus.IN_WORK:     StatusClick( work );   break;
                                        case WorkStatus.UNLOADING:   StatusClick( work );   break;
                                        case WorkStatus.REJECTED:   onOfferClick( work );   break;
                                        default: break;
                                    }
                                    
                                }}
                            >
                                <IonLabel className="fs-1">{
                                    work.status ===  WorkStatus.NEW           ? "Я готов перевезти"  
                                    : work.status ===  WorkStatus.TO_LOAD       ? "Прибыл на погрузку"  
                                    : work.status ===  WorkStatus.LOADING       ? "Транспорт загружен"  
                                    : work.status ===  WorkStatus.IN_WORK       ? "Прибыл на точку"  
                                    : work.status ===  WorkStatus.UNLOADING     ? "Транспорт разгружен"  
                                    : work.status ===  WorkStatus.REJECTED      ? "Предложить"  
                                    : ""
                                }</IonLabel>
                            </IonButton>
                        </>)
                    }
                            
                </div>
            </div>
        </>                
    }

    const renderView        = ( work: WorkInfo) => {
        return <>
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

                <div className="flex fl-space">
                    <div className="flex">
                        <div className={workStatusUtils.getClassName(work.status)}>
                            {work.status}
                        </div>
                        <div className="ml-1 fs-07 cl-black">
                            {"ID: " + workFormatters.shortId(work.guid)}
                        </div>
                    </div>
                    <div>
                        <div className="fs-09 cl-prim">
                            <b>{workFormatters.currency(work.price)}</b>
                        </div>
                        <div className="fs-08 cl-black">
                            <b>{workFormatters.weight(work.weight)}</b>
                        </div>
                    </div>
                </div>

                {/* Название груза */}
                <div className="fs-08 mt-05 cl-black">
                    <b>{work.name}</b>
                </div>

                {/* Заказчик */}
                <div className="fs-08 mt-05 cl-gray">
                    Заказчик: <span className="cl-black"><b>{work.client}</b></span>
                </div>

                {/* Маршрут отправления */}
                <div className="flex fl-space mt-05 cl-black">
                    <div className="flex">
                        <IonIcon icon={locationOutline} color="danger"/>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray">Откуда:</div>
                            <div className="ml-1 fs-09">
                                <b>{work.address?.city.city || 'Не указано'}</b>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray mr-1">Дата загрузки:</div>
                            <div className="ml-1 fs-09">
                                <b>{workFormatters.date(work.pickup_date || '')}</b>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex fl-space mt-05">
                    <div className="flex">
                        <div className="fs-08 cl-prim ml-1">
                            <div className="ml-1 fs-09 cl-gray">Точный адрес груза:</div>
                            <div className="ml-1 fs-09">
                                <b>{work.address?.address || 'Не указано'}</b>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Маршрут назначения */}
                <div className="flex fl-space mt-05">
                    <div className="flex">
                        <IonIcon icon={locationOutline} color="success"/>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray">Куда:</div>
                            <div className="ml-1 fs-09">
                                <b>{work.destiny?.city.city || 'Не указано'}</b>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray mr-1">Дата выгрузки:</div>
                            <div className="ml-1 fs-09 mr-1">
                                <b>{workFormatters.date(work.delivery_date || '')}</b>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex fl-space mt-05">
                    <div className="flex">
                        <div className="fs-08 cl-prim ml-1">
                            <div className="ml-1 fs-09 cl-gray">Точный адрес груза:</div>
                            <div className="ml-1 fs-09">
                                <b>{work.destiny?.address || 'Не указано'}</b>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex fl-space mt-05">
                    <div className="flex">
                        <IonIcon icon={ callOutline } color="primary"/>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray">Контактное лицо:</div>
                            <div className="ml-1 fs-09">
                                <b>{work.face || 'Не указано'}</b>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray">Телефон:</div>
                            <div className="ml-1 fs-09 mr-1">
                                <b>{workFormatters.date(work.phone || '')}</b>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Описание работы */}
                {work.description && (
                    <div className="fs-08 mt-1 cr-detali">
                        <b>Детали груза:</b>
                        <div className="mt-05">{work.description}</div>
                    </div>
                )}

                
                {/* Кнопки действий */}
                <div className="flex fl-space mt-05 pb-05">
                    <IonButton
                        className="w-100"
                        mode="ios"
                        color="danger"
                    >
                        <span className="fs-08">Обратиться в тех. поддержку</span>
                    </IonButton>

                </div>

                { renderButtons( work ) }
                
            </div>
        </>
    }

    return (
        <>
            { renderView( workInfo ) }
        </>
    );
};
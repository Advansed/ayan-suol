/**
 * Компонент карточки работы (адаптированный CargoCard)
 */

import React from 'react';
import { IonIcon, IonButton, IonLabel } from '@ionic/react';
import { locationOutline, calendarOutline, chatboxEllipsesOutline, addCircleOutline } from 'ionicons/icons';
import { OfferInfo, WorkInfo, WorkStatus } from '../types';
import { workFormatters, workStatusUtils, workDataUtils } from '../utils';

interface WorkCardProps {
    work: WorkInfo;
    mode?: 'list' | 'view';
    onClick?: () => void;
    onCreateOffer?: () => void;
    onChat?: () => void;
    showOfferButton?: boolean;
    showChatButton?: boolean;
    driverId?: string; // ID текущего водителя для проверки предложений
}

export const WorkCard: React.FC<WorkCardProps> = ({ 
    work, 
    mode = 'list',
    onClick,
    onCreateOffer,
    onChat,
    showOfferButton = true,
    showChatButton = true,
    driverId = ''
}) => {
    
    // Проверяем наличие активного предложения
    const hasActiveOffer    = false;
    const currentOffer:any      = undefined;
    
    // Определяем возможность создания предложения
    const canOffer = workStatusUtils.canOffer(work.status) && !hasActiveOffer;

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const handleOfferClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onCreateOffer) {
            onCreateOffer();
        }
    };

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onChat) {
            onChat();
        }
    };

    if (mode === 'view') {
        return (
            <div className="work-card-view">
                {/* Статус и ID */}
                <div className="flex fl-space">
                    <div className="flex">
                        <div className={ getCircle( work )}></div>
                        <div className={'ml-05 ' + workStatusUtils.getClassName(work.status)}>
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
                            <div className="ml-1 fs-09 cl-gray">Дата загрузки:</div>
                            <div className="ml-1 fs-09">
                                <b>{workFormatters.date(work.pickup_date || '')}</b>
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
                            <div className="ml-1 fs-09 cl-gray">Дата выгрузки:</div>
                            <div className="ml-1 fs-09">
                                <b>{workFormatters.date(work.delivery_date || '')}</b>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex fl-space mt-05">
                    <div>
                    { work.advance > 0 && (
                        <div className="flex">
                            <div className={ getCSS( work ) }>
                                { "Спецсчет: " + ( work.advance * 100 / work.price ).toFixed(0) + '%' }
                            </div>
                        </div>)
                    }</div>
                    { work.insurance > 0 &&(
                        <div className="flex">
                            <div className={ "cr-status-6" }>
                                { "Застраховано " }
                            </div>
                        </div>
                    )
                    }
                </div> 

                {/* Описание работы */}
                {work.description && (
                    <div className="fs-08 mt-1 cr-detali">
                        <b>Детали груза:</b>
                        <div className="mt-05">{work.description}</div>
                    </div>
                )}

                {/* Информация о текущем предложении */}
                {currentOffer && (
                    <div className="fs-08 mt-1 p-1" style={{backgroundColor: '#e8f5e8', borderRadius: '0.5em'}}>
                        <b>Ваше предложение:</b>
                        <div className="flex fl-space mt-05">
                            <span>Цена: <b>{workFormatters.currency(currentOffer.price)}</b></span>
                            <span>Вес: <b>{currentOffer.weight} т</b></span>
                        </div>
                        <div className="mt-05">
                            Статус: <span className={workStatusUtils.getClassName(work.status)}>{currentOffer.status}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Режим для списка (компактный)
    return (
        <div 
            className="cr-card mt-1 work-card-list"
            onClick={handleClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {/* Верхняя строка: статус, ID, цена */}
            <div className="flex fl-space">
                <div className="flex">
                    <div className={workStatusUtils.getClassName(work.status)}>
                        {work.status}
                    </div>
                    <div className="ml-1 fs-07 cl-black">
                        {"ID: " + workFormatters.shortId(work.guid)}
                    </div>
                </div>
                <div className="text-right">
                    <div className="fs-09 cl-prim">
                        <b>{workFormatters.currency(work.price)}</b>
                    </div>
                    <div className="fs-08 cl-black">
                        <b>{workFormatters.weight(work.weight)}</b>
                    </div>
                </div>
            </div>

            {/* Название груза и заказчик */}
            <div className="fs-08 mt-05 cl-black">
                <b>{work.name}</b>
            </div>
            <div className="fs-07 mt-02 cl-gray">
                Заказчик: {work.client}
            </div>

            {/* Маршрут в одну строку */}
            <div className="flex mt-05 cl-black">
                <IonIcon icon={locationOutline} color="danger" className="mr-05"/>
                <div className="fs-08 cl-prim flex-1">
                    <b>{work.address?.city.city || 'Не указано'}</b>
                </div>
                <div className="fs-08 cl-gray mx-1">→</div>
                <div className="fs-08 cl-prim flex-1">
                    <b>{work.destiny?.city.city || 'Не указано'}</b>
                </div>
                <IonIcon icon={locationOutline} color="success" className="ml-05"/>
            </div>

            {/* Даты */}
            <div className="flex mt-05 cl-gray">
                <IonIcon icon={calendarOutline} className="mr-05"/>
                <div className="fs-08 flex-1">
                    {workFormatters.date(work.pickup_date || '')}
                </div>
                <div className="fs-08 mx-1">-</div>
                <div className="fs-08 flex-1">
                    {workFormatters.date(work.delivery_date || '')}
                </div>
            </div>

            {/* Дополнительная информация */}
            <div className="flex mt-05 cl-gray fs-08">
                <div className="flex-1">
                    Объем: {workFormatters.volume(work.volume)}
                </div>
                <div className="flex-1 text-right">
                    {workFormatters.pricePerTon(work.price, work.weight)}
                </div>
            </div>

            {/* Информация о предложении */}
            {hasActiveOffer && currentOffer && (
                <div className="fs-07 mt-05 p-05" style={{backgroundColor: '#e8f5e8', borderRadius: '0.3em'}}>
                    <b>Предложение:</b> {workFormatters.currency(currentOffer.price)} за {currentOffer.weight}т
                </div>
            )}

            {/* Кнопки действий */}
            <div className="flex mt-05">
                {showChatButton && (
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="clear"
                        color="primary"
                        onClick={handleChatClick}
                    >
                        <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                        <IonLabel className="fs-08">Чат</IonLabel>
                    </IonButton>
                )}
                
                {showOfferButton && canOffer && (
                    <IonButton
                        className="w-50 cr-button-1"
                        mode="ios"
                        color="primary"
                        onClick={handleOfferClick}
                    >
                        <IonIcon icon={addCircleOutline} className="w-06 h-06"/>
                        <IonLabel className="fs-08">Предложить</IonLabel>
                    </IonButton>
                )}
                
                {hasActiveOffer && (
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="outline"
                        color="medium"
                        disabled
                    >
                        <IonLabel className="fs-08">Предложено</IonLabel>
                    </IonButton>
                )}
            </div>
        </div>
    );
};



function getCircle( work: WorkInfo) {
   if(work.advance === work.price || work.advance > work.price) return 'circle-1'
   if(work.advance !== 0 ) return 'circle-2'
   return 'circle-3'
}

function getCSS( work: WorkInfo) {
   if(work.advance === work.price || work.advance > work.price) return 'cr-status-6'
   if(work.advance !== 0 ) return 'cr-status-2'
   return 'cr-status-5'
}
/**
 * Компонент детального просмотра груза
 */

import React, { useEffect, useState } from 'react';
import { 
        IonIcon, 
        IonButton,
        IonLabel,
        IonAlert,
        IonLoading
} from '@ionic/react';
import { 
        arrowBackOutline,
        createOutline,
        trashBinOutline,
        cloudUploadOutline
} from 'ionicons/icons';
import { CargoInfo, CargoInvoice }      from '../types';
import { CargoCard }                    from './CargoCard';
import { statusUtils, formatters }      from '../utils';
import { DriverCard }                   from '../../DriverCards';
import { Store }                        from '../../Store';

interface CargoViewProps {
    cargo:          CargoInfo;
    onBack:         () => void;
    onEdit:         () => void;
    onDelete:       () => Promise<void>;
    onPublish:      () => Promise<void>;
    isLoading?:     boolean;
}

export const CargoView: React.FC<CargoViewProps> = ({
    cargo,
    onBack,
    onEdit,
    onDelete,
    onPublish,
    isLoading = false
}) => {
    const [ showDeleteAlert,     setShowDeleteAlert]    = useState(false);
    const [ showPublishAlert,    setShowPublishAlert]   = useState(false);
    const [ currentCargo,        setCurrentCargo]       = useState(cargo);

    // Подписка на обновления cargo
    useEffect(() => {
        Store.subscribe({num: 201, type: "cargos", func: ()=>{
            const cargos = Store.getState().cargos
            const updated = cargos.find((c: CargoInfo) => c.guid === currentCargo.guid);
            if (updated) setCurrentCargo(updated);
        } })

        return () => {
            Store.unSubscribe( 201 )
        };
    }, []);

    const handleDelete = async () => {
        setShowDeleteAlert(false);
        await onDelete();
    };

    const handlePublish = async () => {
        setShowPublishAlert(false);
        await onPublish();
    };

    const mapInvoiceToDriver = (invoice: any): any => ({
        guid: invoice.id,
        cargo: invoice.cargo,
        recipient: invoice.driverId,
        client: invoice.driverName,
        weight: invoice.weight,
        status: invoice.status,
        transport: invoice.transport,
        capacity: `${invoice.weight} т`,
        rating: invoice.rating || 4.5,
        ratingCount: 12,
        rate: invoice.rating || 4.5,
        price: invoice.price,
        accepted: invoice.status === 'Принято'
    });

    const renderInvoiceSection = (title: string, invoices: CargoInvoice[], type: 'offered' | 'assigned' | 'delivered' | 'completed') => {
        if (!invoices || invoices.length === 0) {
            return null;
        }

        return (
            <>
            <div className="ml-1 mt-1">
                <div className="fs-09 mb-1">
                    <b>{title}</b>
                    <span className="ml-1 fs-08 cl-gray">({invoices.length})</span>
                </div>
            </div>
                
                {invoices.map((invoice, index) => (
                    <DriverCard
                        key={index}
                        info={ mapInvoiceToDriver( invoice ) }
                        mode= { type }
                    />
                ))}

            </>
        );
    };

    const renderActionButtons = () => {
        const canEdit = statusUtils.canEdit(currentCargo.status);
        const canDelete = statusUtils.canDelete(currentCargo.status);
        const canPublish = statusUtils.canPublish(currentCargo.status);

        return (
            <div className="flex mt-05">
                {canEdit && (
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="clear"
                        color="primary"
                        onClick={onEdit}
                    >
                        <IonIcon icon={createOutline} slot="start" />
                        <IonLabel className="fs-08">Изменить</IonLabel>
                    </IonButton>
                )}
                
                {/* {canPublish && (
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        color="primary"
                        onClick={() => setShowPublishAlert(true)}
                    >
                        <IonIcon icon={cloudUploadOutline} slot="start" />
                        <IonLabel className="fs-08">Опубликовать</IonLabel>
                    </IonButton>
                )} */}
                
                {canDelete && (
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="clear"
                        color="danger"
                        onClick={() => setShowDeleteAlert(true)}
                    >
                        <IonIcon icon={trashBinOutline} slot="start" />
                        <IonLabel className="fs-08">Удалить</IonLabel>
                    </IonButton>
                )}
            </div>
        );
    };

    // Проверяем есть ли дополнительные услуги
    const hasAdvance = currentCargo.advance && currentCargo.advance > 0;
    const hasInsurance = currentCargo.cost && currentCargo.cost > 0;
    const hasAdditionalServices = hasAdvance || hasInsurance;

    // Группировка предложений по статусу
    const groupedInvoices = {
        offered:    currentCargo.invoices?.filter(inv => inv.status === "Заказано") || [],
        accepted:   currentCargo.invoices?.filter(inv => inv.status === "Принято") || [],
        delivered:  currentCargo.invoices?.filter(inv => inv.status === "Доставлено") || [],
        completed:  currentCargo.invoices?.filter(inv => inv.status === "Завершен") || []
    };

    return (
        <>
            <IonLoading isOpen={isLoading} message="Подождите..." />
            
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon 
                    icon={arrowBackOutline} 
                    className="w-15 h-15"
                    onClick={onBack}
                    style={{ cursor: 'pointer' }}
                />
                <div className="a-center w-90 fs-09">
                    <b>{currentCargo.status} #{formatters.shortId(cargo.guid)}</b>
                </div>
            </div>

            {/* Карточка груза */}
            <div className="cr-card mt-1">
                <CargoCard cargo={ currentCargo } mode="view" />
                {renderActionButtons()}
            </div>

            {/* Статистика */}
            {/* <div className="cr-card mt-1">
                <div className="fs-09 mb-1"><b>Статистика</b></div>
                <div className="flex">
                    <div className="flex-1 text-center">
                        <div className="fs-08 cl-gray">Создан</div>
                        <div className="fs-08">
                            {formatters.relativeDate(currentCargo.createdAt || '')}
                        </div>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="fs-08 cl-gray">Цена за тонну</div>
                        <div className="fs-08">
                            {formatters.currency(currentCargo.price / currentCargo.weight)}
                        </div>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="fs-08 cl-gray">Предложений</div>
                        <div className="fs-08">
                            {currentCargo.invoices?.length || 0}
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Блок дополнительных услуг */}
            {hasAdditionalServices && (
                <div className="cr-card mt-1">
                    <div className="fs-09 mb-1"><b>Дополнительные услуги</b></div>
                    
                    {hasAdvance && (
                        <div className="flex fl-space mb-05">
                            <div className="fs-08">💰 Предоплата</div>
                            <div className="fs-08 cl-prim">
                                {formatters.currency(currentCargo.advance)}
                            </div>
                        </div>
                    )}
                    
                    {hasInsurance && (
                        <div className="flex fl-space">
                            <div className="fs-08">🛡️ Страхование груза</div>
                            <div className="fs-08 cl-prim">
                                на сумму {formatters.currency(currentCargo.cost)}
                            </div>
                        </div>
                    )}
                    
                    <div className="fs-07 cl-gray mt-05">
                        ℹ️ При публикации потребуется оплата дополнительных услуг
                    </div>
                </div>
            )}

            {/* Предложения от водителей */}
            {renderInvoiceSection(
                "Предложения от водителей",
                groupedInvoices.offered,
                "offered"
            )}

            {/* Назначенные водители */}
            {renderInvoiceSection(
                "Назначенные водители",
                groupedInvoices.accepted,
                "assigned"
            )}

            {/* Доставленные */}
            {renderInvoiceSection(
                "Доставленные",
                groupedInvoices.delivered,
                "delivered"
            )}

            {/* Завершенные */}
            {renderInvoiceSection(
                "Завершенные",
                groupedInvoices.completed,
                "completed"
            )}

            {/* Рекомендации */}
            <div className="cr-card mt-1">
                <div className="fs-09 mb-1"><b>Рекомендации</b></div>
                <div className="fs-08 cl-gray">
                    {statusUtils.getDescription(currentCargo.status)}
                </div>
            </div>

            {/* Alert для подтверждения удаления */}
            <IonAlert
                isOpen={showDeleteAlert}
                onDidDismiss={() => setShowDeleteAlert(false)}
                header="Подтверждение"
                message="Вы уверены, что хотите удалить этот груз?"
                buttons={[
                    {
                        text: 'Отмена',
                        role: 'cancel',
                        handler: () => setShowDeleteAlert(false)
                    },
                    {
                        text: 'Удалить',
                        role: 'destructive',
                        handler: handleDelete
                    }
                ]}
            />

            {/* Alert для подтверждения публикации */}
            <IonAlert
                isOpen={showPublishAlert}
                onDidDismiss={() => setShowPublishAlert(false)}
                header="Публикация груза"
                message={
                    hasAdditionalServices
                        ? "Для публикации потребуется оплата дополнительных услуг. Продолжить?"
                        : "Опубликовать груз для поиска водителей?"
                }
                buttons={[
                    {
                        text: 'Отмена',
                        role: 'cancel',
                        handler: () => setShowPublishAlert(false)
                    },
                    {
                        text: 'Опубликовать',
                        role: 'confirm',
                        handler: handlePublish
                    }
                ]}
            />
        </>
    );
};
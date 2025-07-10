/**
 * Компонент детального просмотра груза
 */

import React, { useState } from 'react';
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
    cloudUploadOutline,
    checkmarkCircleOutline
} from 'ionicons/icons';
import { CargoInfo, CargoInvoice } from '../types';
import { CargoCard } from './CargoCard';
import { statusUtils, formatters } from '../utils';

interface CargoViewProps {
    cargo: CargoInfo;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => Promise<void>;
    onPublish: () => Promise<void>;
    isLoading?: boolean;
}

export const CargoView: React.FC<CargoViewProps> = ({
    cargo,
    onBack,
    onEdit,
    onDelete,
    onPublish,
    isLoading = false
}) => {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showPublishAlert, setShowPublishAlert] = useState(false);

    const handleDelete = async () => {
        setShowDeleteAlert(false);
        await onDelete();
    };

    const handlePublish = async () => {
        setShowPublishAlert(false);
        await onPublish();
    };

    const renderInvoiceSection = (title: string, invoices: CargoInvoice[], type: string) => {
        if (!invoices || invoices.length === 0) {
            return null;
        }

        return (
            <div className="cr-card mt-1">
                <div className="fs-09 mb-1">
                    <b>{title}</b>
                    <span className="ml-1 fs-08 cl-gray">({invoices.length})</span>
                </div>
                
                {invoices.map((invoice) => (
                    <div key={invoice.id} className="cr-card mt-05" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="flex fl-space">
                            <div>
                                <div className="fs-08">
                                    <b>{invoice.driverName}</b>
                                </div>
                                <div className="fs-07 cl-gray">
                                    {formatters.phone(invoice.driverPhone)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="fs-08">
                                    <b>{formatters.currency(invoice.price)}</b>
                                </div>
                                <div className="fs-07 cl-gray">
                                    {formatters.relativeDate(invoice.createdAt)}
                                </div>
                            </div>
                        </div>
                        
                        {type === 'offered' && (
                            <div className="flex mt-05">
                                <IonButton
                                    size="small"
                                    fill="clear"
                                    color="success"
                                >
                                    <IonLabel>Принять</IonLabel>
                                </IonButton>
                                <IonButton
                                    size="small"
                                    fill="clear"
                                    color="danger"
                                >
                                    <IonLabel>Отклонить</IonLabel>
                                </IonButton>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderActionButtons = () => {
        const canEdit = statusUtils.canEdit(cargo.status);
        const canDelete = statusUtils.canDelete(cargo.status);
        const canPublish = statusUtils.canPublish(cargo.status);

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
                
                {canPublish && (
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        color="primary"
                        onClick={() => setShowPublishAlert(true)}
                    >
                        <IonIcon icon={cloudUploadOutline} slot="start" />
                        <IonLabel className="fs-08">Опубликовать</IonLabel>
                    </IonButton>
                )}
                
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

    // Группировка предложений по статусу
    const groupedInvoices = {
        offered: cargo.invoices?.filter(inv => inv.status === "Заказано") || [],
        accepted: cargo.invoices?.filter(inv => inv.status === "Принято") || [],
        delivered: cargo.invoices?.filter(inv => inv.status === "Доставлено") || [],
        completed: cargo.invoices?.filter(inv => inv.status === "Завершен") || []
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
                    <b>{cargo.status} #{formatters.shortId(cargo.guid)}</b>
                </div>
            </div>

            {/* Карточка груза */}
            <div className="cr-card mt-1">
                <CargoCard cargo={cargo} mode="view" />
                {renderActionButtons()}
            </div>

            {/* Статистика */}
            <div className="cr-card mt-1">
                <div className="fs-09 mb-1"><b>Статистика</b></div>
                <div className="flex">
                    <div className="flex-1 text-center">
                        <div className="fs-08 cl-gray">Создан</div>
                        <div className="fs-08">
                            {formatters.relativeDate(cargo.createdAt || '')}
                        </div>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="fs-08 cl-gray">Цена за тонну</div>
                        <div className="fs-08">
                            {formatters.currency(cargo.price / cargo.weight)}
                        </div>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="fs-08 cl-gray">Предложений</div>
                        <div className="fs-08">
                            {cargo.invoices?.length || 0}
                        </div>
                    </div>
                </div>
            </div>

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
                    {statusUtils.getDescription(cargo.status)}
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
                message="Опубликовать груз для поиска водителей?"
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
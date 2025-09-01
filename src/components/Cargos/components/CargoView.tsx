import React, { useEffect, useState } from 'react';
import { 
        IonIcon, 
        IonButton,
        IonLabel,
        IonAlert,
        IonCheckbox,
        IonLoading,
        IonItem
} from '@ionic/react';
import { 
        arrowBackOutline,
        createOutline,
        trashBinOutline,
        cloudUploadOutline,
        documentsOutline,
        cardOutline,
        shieldCheckmarkOutline
} from 'ionicons/icons';
import { CargoInfo } from '../types';
import { CargoCard } from './CargoCard';
import { statusUtils, formatters } from '../utils';
import { Store } from '../../Store';

interface CargoViewProps {
    cargo:          CargoInfo;
    onBack:         () => void;
    onEdit:         () => void;
    onDelete:       () => Promise<void>;
    onPublish:      () => Promise<void>;
    onViewInvoices: () => void;
    onPayment:      () => void;
    isLoading?:     boolean;
}

export const CargoView: React.FC<CargoViewProps> = ({
    cargo,
    onBack,
    onEdit,
    onDelete,
    onPublish,
    onViewInvoices,
    onPayment,
    isLoading = false
}) => {

    const [ showDeleteAlert,     setShowDeleteAlert ]     = useState(false);  
    const [ showPublishAlert,    setShowPublishAlert ]    = useState(false);
    const [ currentCargo,        setCurrentCargo ]        = useState(cargo);
    const [ advancePayment,      setAdvancePayment ]      = useState(false);
    const [ insurancePayment,    setInsurancePayment ]    = useState(false);
    
    // Подписка на обновления cargo
    useEffect(() => {
        console.log("useeffect")
        console.log(cargo)
        // Store.subscribe({num: 201, type: "cargos", func: ()=>{
        //     const cargos = Store.getState().cargos
        //     const updated = cargos.find((c: CargoInfo) => c.guid === currentCargo.guid);
        //     if (updated) setCurrentCargo(updated);
        // }})

        // return () => {
        //     Store.unSubscribe(201)
        // };
    }, []);

    const handleDelete = async () => {
        setShowDeleteAlert(false);
        await onDelete();
    };

    const handlePublish = async () => {
        setShowPublishAlert(false);
        await onPublish();
    };

    // Обработчики для новых кнопок
    const handlePayAdvance = () => {
        // TODO: реализовать оплату предоплаты
        console.log('Pay advance');
        onPayment
    };

    const handlePayInsurance = () => {
        // TODO: реализовать оформление страховки
        console.log('Pay insurance');
    };

    const renderActionButtons = () => {
        const canEdit = statusUtils.canEdit(currentCargo.status);
        const canDelete = statusUtils.canDelete(currentCargo.status);

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

    // Подсчет общего количества инвойсов
    const totalInvoices = currentCargo.invoices?.length || 0;
    const hasAdvance = currentCargo.advance && currentCargo.advance > 0;
    const hasInsurance = currentCargo.cost && currentCargo.cost > 0;
    const hasAdditionalServices = hasAdvance || hasInsurance;
    const canPublish = statusUtils.canPublish(currentCargo.status);

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
                <CargoCard cargo={currentCargo} mode="view" />
                {renderActionButtons()}
            </div>

            {/* Блок дополнительных услуг */}
                <div className="cr-card mt-1">
                    <div className="fs-09 mb-1"><b>Дополнительные услуги</b></div>
                    
                    <div className="flex fl-space mb-05">
                        <div className="fs-08 h-2">
                        </div>
                    </div>

                    <div className="flex fl-space mb-05">
                        <div className="fs-08">
                        </div>
                    </div>

                    <div className='flex'>
                        
                        <IonButton
                            className="cr-button-2 w-50"
                            mode="ios"
                            fill="clear"
                            color="primary"
                            onClick={ onPayment }
                        >
                            <IonIcon icon={cardOutline} slot="start" />
                            <IonLabel className="fs-08">Предоплата</IonLabel>
                        </IonButton>
                                
                        <IonButton
                            className="cr-button-2 w-50"
                            mode="ios"
                            fill="clear"
                            color="primary"
                            onClick={handlePayInsurance}
                        >
                            <IonIcon icon={shieldCheckmarkOutline} slot="start" />
                            <IonLabel className="fs-08">Страховка</IonLabel>
                        </IonButton>

                    </div>

                </div>

            {/* Блок инвойсов */}
            <div className="cr-card mt-1">
                <div className="flex fl-space">
                    <div className="fs-09"><b>Заявки от водителей</b></div>
                    <div className="fs-08 cl-gray">
                        {totalInvoices > 0 ? `${totalInvoices} заявок` : 'Нет заявок'}
                    </div>
                </div>
                
                {totalInvoices > 0 && (
                    <IonButton
                        className="w-100 cr-button-2 mt-05"
                        mode="ios"
                        fill="clear"
                        color="primary"
                        onClick={onViewInvoices}
                    >
                        <IonIcon icon={documentsOutline} slot="start" />
                        <IonLabel className="fs-08">Просмотреть заявки</IonLabel>
                    </IonButton>
                )}
            </div>

            {/* Кнопка публикации внизу */}
            {canPublish && (
                <div className="cr-card mt-1">
                    <IonButton
                        className="w-100 cr-button-2"
                        mode="ios"
                        color="success"
                        onClick={() => setShowPublishAlert(true)}
                    >
                        <IonIcon icon={cloudUploadOutline} slot="start" />
                        <IonLabel className="fs-08">Опубликовать груз</IonLabel>
                    </IonButton>
                </div>
            )}

            {/* Алерт удаления */}
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
                        handler: handleDelete
                    }
                ]}
            />

            {/* Алерт публикации */}
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
                        handler: handlePublish
                    }
                ]}
            />
        </>
    );
};
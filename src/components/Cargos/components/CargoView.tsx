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
        cloudUploadOutline,
        documentsOutline,
        cardOutline,
        shieldCheckmarkOutline
} from 'ionicons/icons';
import { CargoCard } from './CargoCard';
import { statusUtils, formatters } from '../utils';
import { cargoGetters, CargoInfo, CargoStatus } from '../../../Store/cargoStore';


interface CargoViewProps {
    cargo:          CargoInfo;
    onBack:         () => void;
    onEdit:         (cargo: CargoInfo ) => void;
    onDelete:       (guid: string) => Promise<boolean>;
    onPublish:      (guid: string) => Promise<boolean>;
    onInvoices:     (cargo: CargoInfo) => void;
    onPayment:      (cargo: CargoInfo) => void;
    onInsurance:    (cargo: CargoInfo) => void;
    isLoading?:     boolean;
}

export const CargoView: React.FC<CargoViewProps> = ({
    cargo,
    onBack,
    onEdit,
    onDelete,
    onPublish,
    onInvoices,
    onPayment,
    onInsurance,
    isLoading = false
}) => {

    const [ showDeleteAlert,     setShowDeleteAlert ]     = useState(false);  
    const [ showPublishAlert,    setShowPublishAlert ]    = useState(false);
    const [ currentCargo,        setCurrentCargo ]        = useState(cargo);
    
    useEffect(()=>{

        setCurrentCargo( cargo )

    },[cargo])

    const handleDelete = async () => {
        setShowDeleteAlert(false);
        await onDelete( cargo.guid );
    };

    const handlePublish = async () => {
        setShowPublishAlert(false);
        await onPublish( cargo.guid );

        setCurrentCargo( cargoGetters.getCargo( cargo.guid ) as CargoInfo )
        
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
                        onClick={() => onEdit(cargo)}
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
    const totalInvoices             = currentCargo.invoices?.length || 0;
    const hasAdvance                = currentCargo.advance > 0 ;
    const hasInsurance              = currentCargo.insurance > 0;
    const hasAdditionalServices     = hasAdvance || hasInsurance;
    const canPublish                = currentCargo.status === CargoStatus.NEW;

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
                { canPublish && renderActionButtons()}
            </div>

           {/* Блок дополнительных услуг */}
           { canPublish && (
                <div className="cr-card mt-1">
                    <div className="fs-09 mb-1"><b>Дополнительные услуги</b></div>
                    
                    {
                        hasAdvance && (
                            <div className="flex fl-space mb-05">
                                <div className="fs-08 h-2 ml-2">
                                    Предоплата:
                                </div>
                                <div className="fs-08 h-2 mr-2">
                                    <b>{ `${formatters.currency(currentCargo.advance)}` }</b>
                                </div> 
                            </div>
                        )
                    }
                    {
                        hasInsurance && (
                            <div className="flex fl-space mb-05">
                                <div className="fs-08 ml-2">
                                    { `Страховка: ` }
                                </div>
                                <div className="fs-08 mr-2">
                                    <b>{ `${formatters.currency(currentCargo.insurance)}` }</b>
                                </div>
                            </div>
                        )
                    }

                    <div className='flex'>
                        
                        <IonButton
                            className="cr-button-2 w-50"
                            mode="ios"
                            fill="clear"
                            color="primary"
                            onClick={ ()=>onPayment( cargo ) }
                        >
                            <IonIcon icon={cardOutline} slot="start" />
                            <IonLabel className="fs-08">{ hasAdvance ? 'Доплатить' : 'Предоплата'}</IonLabel>
                        </IonButton>
                                
                        <IonButton
                            className="cr-button-2 w-50"
                            mode="ios"
                            fill="clear"
                            color="primary"
                            onClick={ ()=> onInsurance( cargo ) }
                        >
                            <IonIcon icon={shieldCheckmarkOutline} slot="start" />
                            <IonLabel className="fs-08">Страховка</IonLabel>
                        </IonButton>

                    </div>

                </div>
           )}
            {/* Блок инвойсов */}
            { !canPublish && (
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
                            onClick={ ()=> onInvoices( cargo )}
                        >
                            <IonIcon icon={documentsOutline} slot="start" />
                            <IonLabel className="fs-08">Просмотреть заявки</IonLabel>
                        </IonButton>
                    )}
                </div>
            )}

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
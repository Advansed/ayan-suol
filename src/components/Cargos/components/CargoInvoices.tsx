import React, { useState }              from 'react';
import { CargoInfo, DriverInfo }        from '../../../Store/cargoStore';
import { WizardHeader }                 from '../../Header/WizardHeader';
import { IonButton, IonCard, IonIcon }  from '@ionic/react';
import { DriverCard }                   from './DriverCard';
import { useInvoices }                  from '../hooks/useInvoices';
import { chatboxEllipsesOutline }       from 'ionicons/icons';

interface CargoInvoiceSectionsProps {
    cargo:      CargoInfo;
    onBack:     ()=>void;
    onList:     ()=>void;
}

export const CargoInvoiceSections: React.FC<CargoInvoiceSectionsProps> = ({ cargo, onBack, onList }) => {
    const { invoices, isLoading,  handleAccept,  handleReject, handleChat } = useInvoices({ info: cargo })


    const CompleteClick = (invoice: DriverInfo) => {   

        handleAccept( invoice, 20 )

        onList()

    }

    // Рендер секции инвойсов
    const renderInvoiceSection = (
            invoices: DriverInfo[]
    ) => {

        if (!invoices || invoices.length === 0) {
            return <></>;
        }

        return (
            <>
                
                {invoices.map((invoice, index) => (

                    <IonCard className='ml-1 mr-1 mt-1 pt-1 pl-1 pr-1 pb-1'
                        key = { index }
                    >
                        <DriverCard
                            info                = { invoice }
                            cargo               = { cargo }    
                        />
                        
                        { renderButtons( invoice ) }

                    </IonCard>

                ))}
            </>
        );
    };

    const renderButtons = (invoice:DriverInfo) => {
        switch (invoice.status) {
            case 'Заказано':
                return (
                    <div className='flex mt-1'>
                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            fill        = "clear"
                            color       = "primary"
                            onClick     = { () => handleChat( invoice ) }
                            disabled    = { isLoading }
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className   = "w-50 cr-button-1"
                            mode        = "ios"
                            color       = "primary"
                            onClick     = { () => handleAccept( invoice, 12 ) }
                            disabled    = { isLoading }
                        >
                            <span className="ml-1 fs-08">Выбрать</span>
                        </IonButton>

                        <IonButton
                            className   = "w-50 cr-button-1"
                            mode        = "ios"
                            color       = "warning"
                            onClick     = { () => handleReject( invoice ) }
                            disabled    = { isLoading }
                        >
                            <span className="ml-1 fs-08">Отказать</span>
                        </IonButton>
                    </div>
                );

            case 'Принято':
                return (
                    <div className='flex mt-1'>
                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            fill        = "clear"
                            color       = "primary"
                            onClick     = { () => handleChat( invoice) }
                            disabled    = { isLoading }
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className   = "w-50 cr-button-1"
                            mode        = "ios"
                            color       = "warning"
                            onClick     = { () => handleReject( invoice ) }
                            disabled    = { isLoading }
                        >
                            <span className="ml-1 fs-08">Отказать</span>
                        </IonButton>
                    </div>
                );
            
            case 'На погрузке':
                return (
                    <div className='flex mt-1'>
                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            fill        = "clear"
                            color       = "primary"
                            onClick     = { () => handleChat( invoice) }
                            disabled    = { isLoading }
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            color       = "primary"
                            onClick     = { () => handleAccept( invoice, 14 ) }
                            disabled    = { isLoading }
                        >
                            <span className="ml-1 fs-08">Начать</span>
                        </IonButton>
                    </div>
                );

            case 'Загружено':
                return (
                    <div className='flex mt-1'>
                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            fill        = "clear"
                            color       = "primary"
                            onClick     = { () => handleChat( invoice) }
                            disabled    = { isLoading }
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            color       = "primary"
                            onClick     = { () => handleAccept( invoice, 16 ) }
                            disabled    = { isLoading }
                        >
                            <span className="ml-1 fs-08">Отправить</span>
                        </IonButton>
                    </div>
                );

            case 'Доставлено':
                return (
                    <div className='flex mt-1'>
                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            fill        = "clear"
                            color       = "primary"
                            onClick     = { () => handleChat( invoice) }
                            disabled    = { isLoading }
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            color       = "primary"
                            onClick     = { () => handleAccept( invoice, 18 ) }
                            disabled    = { isLoading }
                        >
                            <span className="ml-1 fs-08">Разгрузить</span>
                        </IonButton>
                    </div>
                );

            case 'Разгружено':
                return (
                    <div className='flex mt-1'>
                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            fill        = "clear"
                            color       = "primary"
                            onClick     = { () => handleChat( invoice) }
                            disabled    = { isLoading }
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            color       = "primary"
                            onClick     = { () => CompleteClick( invoice ) }
                            disabled    = { isLoading }
                        >
                            <span className="ml-1 fs-08">Завершить</span>
                        </IonButton>
                    </div>
                );

            default:
                return null;
        }
    };
    // Группировка инвойсов по статусам
    const groupedInvoices = {
        invoices:    invoices || [],
    };

    return (
        <>
            <div className='ml-1 mr-1 mt-1'>
                <WizardHeader 
                    title   = "Заявки "
                    pages   = { cargo.name  }
                    onBack  = { onBack }
                />

            </div>

            {/* Предложения от водителей */}
            {renderInvoiceSection(
                groupedInvoices.invoices
            )}
      </>
    );
};
import React, { useEffect, useState }              from 'react';
import { CargoInfo, DriverInfo }        from '../../../Store/cargoStore';
import { WizardHeader }                 from '../../Header/WizardHeader';
import { IonButton, IonCard, IonIcon }  from '@ionic/react';
import { DriverCard }                   from './DriverCard';
import { useInvoices }                  from '../hooks/useInvoices';
import { chatboxEllipsesOutline }       from 'ionicons/icons';
import { useSocket }                    from '../../../Store/useSocket';
import { useToken }                     from '../../../Store/loginStore';
import { useChats }                     from '../../../Store/useChats';

interface CargoInvoiceProps {
    cargo:           CargoInfo;
    onBack:          () => void;
    onOpenAgreement?: (invoice: DriverInfo, contract: any) => void;
    onSign?:         (invoice: DriverInfo, signature: string) => void | Promise<void>;
}

export const CargoInvoice: React.FC<CargoInvoiceProps> = ({ cargo, onBack, onOpenAgreement, onSign }) => {
    const { invoices, isLoading, contract, handleAccept,  handleReject, handleChat
        , get_contract, setContract, create_contract, handleComplete } = useInvoices({ info: cargo })
    const { emit } = useSocket()
    const token = useToken()
    const { sendImage } = useChats()

    useEffect(()=>{ console.log(contract)},[contract])

    const AcceptClick           = async(invoice: DriverInfo, data: any, status: number) => {   
        
        await handleAccept( invoice, status )
    
        if( status === 16 ) {
            for (const elem of data.sealPhotos) {
                await sendImage(invoice.recipient, invoice.cargo, elem);
            }

            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Груз осмотрен и опломбирован, документы на груз переданы",
            })                
            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Транспорт отправлен в точку разгрузки",
            })                
        } else 
        if( status === 18 ) {
            for (const elem of data.sealPhotos) {
                await sendImage(invoice.recipient, invoice.cargo, elem);
            }

            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Пломба цела, груз доставлен",
            })                
            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Разгрузка начата",
            })                
        } else 
        if( status === 20 ) {
            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Все работы выполнены",
            })                
        } 


        return true

    }

    const handleClick = async (invoice: DriverInfo) => {
        const contractData = await get_contract(invoice);
        if (onOpenAgreement && contractData) {
            onOpenAgreement(invoice, contractData);
        }
    };

    const handleClose           = async () => {
        setContract( undefined )
    }

    const handleRejectAndGoBack = async (invoice: DriverInfo) => {
        const success = await handleReject(invoice);
        if (success) {
            onBack();
        }
    }

    // Рендер секции инвойсов
    const renderInvoiceSection  = (
            invoices: DriverInfo[]
    ) => {

        if (!invoices || invoices.length === 0) {
            return <></>;
        }

        return (
            <>
                
                {invoices.map((invoice, index) => (

                    <IonCard className="cargo-driver-card mt-05 ml-05 mr-05"
                        key = { index }
                    >
                        <DriverCard
                            info                = { invoice }
                            onReject            = { handleRejectAndGoBack }
                            onAccept            = { handleClick }
                            onChat              = { handleChat  }
                            onStartLoading      = { (info) => handleAccept(info, 14) }
                            onSend              = { (info) => handleAccept(info, 16) }
                            onStartUnloading    = { (info) => AcceptClick(info, { sealPhotos: [] }, 18) }
                            onComplete          = { (info, rating, completed) => {
                                handleComplete(info, rating, { delivered: completed, documents: completed });
                                AcceptClick(info, {}, 20);
                            }}
                        />
                        
                        {/* { renderButtons( invoice ) } */}

                    </IonCard>

                ))}
            </>
        );
    };

    const renderButtons         = (invoice:DriverInfo) => {
        switch (invoice.status) {

            case 'Заказано':
                return (
                    <div>
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
                                color       = "warning"
                                onClick     = { () => handleReject( invoice ) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1 fs-08">Отказать</span>
                            </IonButton>
                        </div>
                        <div className='flex mt-1'>

                            <IonButton
                                className   = "w-100"
                                mode        = "ios"
                                color       = "primary"
                                onClick     = { () => handleClick( invoice ) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1 fs-1">Принять предложение

                                </span>
                            </IonButton>

                        </div>
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
                    <div>
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

                        </div>
                        <div className='flex mt-1'>

                            <IonButton
                                className   = "w-100"
                                mode        = "ios"
                                color       = "primary"
                                onClick     = { () => handleAccept( invoice, 14 ) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1 fs-1">Начать погрузку

                                </span>
                            </IonButton>

                        </div>
                    </div>

                );

            case 'Загружено':
                return (
                    <div>
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

                        </div>

                        {/* Кнопка "Отправить транспорт" больше не нужна — заменена на карточку DriverCard */}
                    </div>
                );

            case 'Доставлено':
                return (
                    <div>
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

                        </div>
                        {/* Кнопка "Начать разгрузку" больше не нужна — заменена на карточку DriverCard */}
                    </div>
                );

            case 'Разгружено':
                return (
                    <div>
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

           
                        </div>
                        {/* Кнопка "Завершить" больше не нужна — заменена на карточку DriverCard */}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <WizardHeader 
                title   = "Заявки "
                pages   = { cargo && cargo.name || '' }
                onBack  = { onBack }
            />

            { renderInvoiceSection( invoices) }
        </>
    );
};

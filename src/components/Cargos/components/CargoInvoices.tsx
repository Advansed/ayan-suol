import React              from 'react';
import { CargoInfo, DriverInfo }        from '../../../Store/cargoStore';
import { WizardHeader }                 from '../../Header/WizardHeader';
import { IonCard }                      from '@ionic/react';
import { DriverCard }                   from './DriverCard';
import type { UseInvoicesReturn }      from '../hooks/useInvoices';
import { useSocket }                    from '../../../Store/useSocket';
import { useToken }                     from '../../../Store/loginStore';
import { useChats }                     from '../../../Store/useChats';

interface CargoInvoiceProps {
    cargo:           CargoInfo;
    invoiceApi:      UseInvoicesReturn;
    onBack:          () => void;
    onOpenAgreement?: (invoice: DriverInfo, contract: unknown) => void;
}

export const CargoInvoice: React.FC<CargoInvoiceProps> = ({
    cargo,
    invoiceApi,
    onBack,
    onOpenAgreement,
}) => {
    const { invoices, isLoading, handleAccept, handleReject, handleChat, get_contract, handleComplete } =
        invoiceApi;
    const { emit } = useSocket()
    const token = useToken()
    const { sendImage } = useChats()

    const AcceptClick = async (
        invoice: DriverInfo,
        data: { sealPhotos?: string[] },
        status: number
    ) => {
        
        await handleAccept( invoice, status )
    
        if (status === 16) {
            for (const elem of data.sealPhotos ?? []) {
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
        } else if (status === 18) {
            for (const elem of data.sealPhotos ?? []) {
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
                
                {invoices.map(invoice => (

                    <IonCard className="cargo-driver-card mt-05 ml-05 mr-05"
                        key = { invoice.guid }
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
                            isLoading           = { isLoading }
                        />
                        
                    </IonCard>

                ))}
            </>
        );
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

import { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import { useSocket } from '../../../Store/useSocket';
import { useToken } from '../../../Store/loginStore';
import { DriverInfo } from '../../../Store/cargoStore';

export interface TaskCompletion {
    delivered: boolean;
    documents: boolean;
}

export const useInvoices = ({ info }) => {
    const [invoices, setInvoices] = useState(info.invoices);
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const { emit, once } = useSocket();
    const token = useToken();

    const handleAccept = useCallback(async (info: DriverInfo, status: number ) => {
        
        setIsLoading(true);
                
        once('set_inv', (data: { success: boolean; message?: string }) => {
            if (data.success) {
                
                setInvoices(prevInvoices => 
                    prevInvoices.map(invoice => 
                        invoice.guid === info.guid 
                            ? { ...invoice, status: setStatus( status ) } 
                            : invoice
                    )
                );

            } else {

                console.error("Ошибка при принятии заявки:", data.message);

            }
            setIsLoading(false);
        });

        emit('set_inv', {
            token:      token,
            recipient:  info.recipient,
            id:         info.guid,
            status:     status
        });
        
    }, [once, emit, token]);

    const handleReject = useCallback(async (info: DriverInfo) => {
        setIsLoading(true);
        try {
            emit('set_rejected', {
                token: token,
                id: info.guid
            });
            
            // Также можно обновить статус при отказе, если нужно
            setInvoices(prevInvoices => 
                prevInvoices.map(invoice => 
                    invoice.guid === info.guid 
                        ? { ...invoice, status: 3 } // или другой статус для отказа
                        : invoice
                )
            );
        } catch (error) {
            console.error("Ошибка при отказе:", error);
        } finally {
            setIsLoading(false);
        }
    }, [emit, token]);

    const handleComplete = useCallback(async (info: DriverInfo, rating: number, tasks: TaskCompletion) => {
        setIsLoading(true);
        try {
            emit('completed', {
                token: token,
                id: info.guid,
                recipient: info.recipient,
                rating,
                tasks
            });
            
            // Обновляем статус при завершении
            setInvoices(prevInvoices => 
                prevInvoices.map(invoice => 
                    invoice.guid === info.guid 
                        ? { ...invoice, status: 4 } // или другой статус для завершенных
                        : invoice
                )
            );
        } catch (error) {
            console.error("Ошибка при завершении:", error);
        } finally {
            setIsLoading(false);
        }
    }, [emit, token]);

    const handleChat = useCallback((info: DriverInfo) => {
        history.push(`/tab2/${info.recipient}:${info.cargo}:${info.client}`);
    }, [history]);

    return {
        invoices,
        isLoading,
        handleAccept,
        handleReject,
        handleComplete,
        handleChat
    };
};


function setStatus( status: number ) {

    switch(status) {

        case 1 :   return "Заказано";

        case 2 :   return "Принято";

        default:   return ""
        
    }
}
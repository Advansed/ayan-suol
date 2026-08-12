import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useSocket } from '../../../Store/useSocket';
import { useToken } from '../../../Store/loginStore';
import { CargoInfo, DriverInfo, cargoActions } from '../../../Store/cargoStore';
import { chatActions } from '../../../Store/chatStore';
import { useToast } from '../../Toast';

export interface TaskCompletion {
    delivered: boolean;
    documents: boolean;
}

export interface UseInvoicesOptions {
    /** Текущий груз из стора/навигации; без него список заявок пуст, мутации всё равно доступны */
    info?: CargoInfo | null;
}

export interface UseInvoicesReturn {
    invoices: DriverInfo[];
    isLoading: boolean;
    contract: unknown;
    setContract: (c: unknown) => void;
    get_contract: (info: DriverInfo) => Promise<unknown>;
    create_contract: (info: DriverInfo, sign: string) => Promise<void>;
    handleAccept: (info: DriverInfo, status: number) => Promise<void>;
    handleReject: (info: DriverInfo) => Promise<boolean>;
    handleComplete: (info: DriverInfo, rating: number, tasks: TaskCompletion) => Promise<void>;
    handleChat: (info: DriverInfo) => void;
}

export const useInvoices = ({ info }: UseInvoicesOptions): UseInvoicesReturn => {
    const [invoices, setInvoices] = useState<DriverInfo[]>(info?.invoices ?? []);
    const [contract, setContract] = useState<unknown>();
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const { emit, once, socket } = useSocket();
    const token = useToken();
    const toast = useToast();

    const invoicesKey = JSON.stringify(info?.invoices ?? null);

    useEffect(() => {
        if (!info) {
            setInvoices([]);
        } else {
            setInvoices(info.invoices ?? []);
        }
    }, [info, info?.guid, invoicesKey]);

    const handleAccept = useCallback(
        async (infoRow: DriverInfo, status: number): Promise<void> => {
            setIsLoading(true);
            return new Promise<void>(resolve => {
                once('set_inv', (data: { success: boolean; message?: string }) => {
                    if (data.success) {
                        setInvoices(prevInvoices => {
                            const next = prevInvoices.map(invoice =>
                                invoice.guid === infoRow.guid
                                    ? { ...invoice, status: setStatus(status) as DriverInfo['status'] }
                                    : invoice
                            );
                            cargoActions.updateCargo(infoRow.cargo, { invoices: next });
                            return next;
                        });
                    } else {
                        console.error('Ошибка при принятии заявки:', data.message);
                    }
                    setIsLoading(false);
                    resolve();
                });

                emit('set_inv', {
                    token,
                    recipient: infoRow.recipient,
                    id: infoRow.guid,
                    status,
                });
            });
        },
        [once, emit, token]
    );

    const get_contract = useCallback(
        async (infoRow: DriverInfo): Promise<unknown> => {
            setIsLoading(true);

            return new Promise(resolve => {
                once('get_contract', (data: { success: boolean; message?: string; data: unknown }) => {
                    if (data.success) {
                        setContract(data.data);
                        resolve(data.data);
                    } else {
                        console.error('Ошибка при получении договора:', data.message);
                        resolve(undefined);
                    }
                    setIsLoading(false);
                });

                emit('get_contract', {
                    token,
                    id: infoRow.guid,
                });
            });
        },
        [once, emit, token]
    );

    const create_contract = useCallback(
        async (infoRow: DriverInfo, sign: string): Promise<void> => {
            setIsLoading(true);
            return new Promise<void>(resolve => {
                once('create_contract', (data: { success: boolean; message?: string; data: unknown }) => {
                    if (data.success) {
                        toast.success(' Договор создан и подписан');
                    } else {
                        console.error('Ошибка при принятии заявки:', data.message);
                    }
                    setIsLoading(false);
                    resolve();
                });

                emit('create_contract', {
                    token,
                    id: infoRow.guid,
                    cargo_id: infoRow.cargo,
                    driver_id: infoRow.recipient,
                    sign,
                });
            });
        },
        [once, emit, token, toast]
    );

    const handleReject = useCallback(
        async (infoRow: DriverInfo) => {
            if (!socket) {
                toast.error('Нет соединения с сервером');
                return false;
            }

            setIsLoading(true);

            return new Promise<boolean>(resolve => {
                let settled = false;
                const timerRef: { id?: ReturnType<typeof setTimeout> } = {};

                const finish = (value: boolean) => {
                    if (settled) return;
                    settled = true;
                    if (timerRef.id !== undefined) clearTimeout(timerRef.id);
                    resolve(value);
                    setIsLoading(false);
                };

                timerRef.id = setTimeout(() => {
                    toast.error('Таймаут ожидания ответа от сервера');
                    finish(false);
                }, 10000);

                const offerData = {
                    guid: infoRow.guid,
                    status: 11,
                };

                const handleOfferResponse = (response: { success: boolean; error?: string }) => {
                    if (response.success) {
                        toast.success('Предложение успешно удалено');
                        setInvoices(prevInvoices => {
                            const next = prevInvoices.filter(invoice => invoice.guid !== infoRow.guid);
                            cargoActions.updateCargo(infoRow.cargo, { invoices: next });
                            return next;
                        });
                        finish(true);
                    } else {
                        toast.error(response.error || 'Ошибка удаления предложения');
                        finish(false);
                    }
                };

                try {
                    socket.once('del_offer', handleOfferResponse);
                    socket.emit('cancel_offer', { token, ...offerData });
                } catch (error) {
                    console.error('Error deleting offer:', error);
                    toast.error('Ошибка удаления предложения');
                    finish(false);
                }
            });
        },
        [socket, token, toast]
    );

    const handleComplete = useCallback(
        async (infoRow: DriverInfo, rating: number, tasks: TaskCompletion) => {
            setIsLoading(true);
            try {
                emit('completed', {
                    token,
                    id: infoRow.guid,
                    recipient: infoRow.recipient,
                    rating,
                    tasks,
                });

                setInvoices(prevInvoices => {
                    const next = prevInvoices.map(invoice =>
                        invoice.guid === infoRow.guid
                            ? { ...invoice, status: setStatus(20) as DriverInfo['status'] }
                            : invoice
                    );
                    cargoActions.updateCargo(infoRow.cargo, { invoices: next });
                    return next;
                });
            } catch (error) {
                console.error('Ошибка при завершении:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [emit, token]
    );

    const handleChat = useCallback(
        (infoRow: DriverInfo) => {
            const name = infoRow.client || 'Водитель';
            chatActions.ensureChat(infoRow.recipient, infoRow.cargo, { rec_name: name });
            chatActions.setCurrentChat(infoRow.recipient, infoRow.cargo);
            history.push(
                `/chats/${infoRow.recipient}:${infoRow.cargo}:${encodeURIComponent(name)}`
            );
        },
        [history]
    );

    return {
        invoices,
        isLoading,
        contract,
        setContract,
        get_contract,
        create_contract,
        handleAccept,
        handleReject,
        handleComplete,
        handleChat,
    };
};

export function setStatus(status: number): string {
    switch (status) {
        case 11:
            return 'Заказано';
        case 12:
            return 'Принято';
        case 13:
            return 'На погрузке';
        case 14:
            return 'Загружается';
        case 15:
            return 'Загружено';
        case 16:
            return 'В пути';
        case 17:
            return 'Прибыл';
        case 18:
            return 'Разгружается';
        case 19:
            return 'Разгружено';
        case 20:
            return 'Завершено';
        default:
            return '';
    }
}

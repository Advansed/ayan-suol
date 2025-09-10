import { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import { Store } from '../../Store';
import { UseDriverActionsProps, TaskCompletion } from '../types';
import { useSocket } from '../../../Store/useSocket';

export const useDriverActions = ({ info, mode, setPage }: UseDriverActionsProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const { socket, emit } = useSocket()

    const handleAccept = useCallback(async () => {
        setIsLoading(true);
        try {
            emit('set_inv', {
                token: Store.getState().login.token,
                recipient: info.recipient,
                id: info.guid,
                status: "Принято"
            });
        } catch (error) {
            console.error("Ошибка при принятии заказа:", error);
        } finally {
            setIsLoading(false);
        }
    }, [info]);

    const handleReject = useCallback(async () => {
        setIsLoading(true);
        try {
            emit('rejected', {
                token: Store.getState().login.token,
                id: info.guid
            });
        } catch (error) {
            console.error("Ошибка при отказе:", error);
        } finally {
            setIsLoading(false);
        }
    }, [info]);

    const handleComplete = useCallback(async (rating: number, tasks: TaskCompletion) => {
        setIsLoading(true);
        try {
            emit('completed', {
                token: Store.getState().login.token,
                id: info.guid,
                recipient: info.recipient,
                rating,
                tasks
            });
        } catch (error) {
            console.error("Ошибка при завершении:", error);
        } finally {
            setIsLoading(false);
        }
    }, [info]);

    const handleChat = useCallback(() => {
        if (setPage) {
            setPage({ ...info, type: "chat" });
        } else {
            history.push(`/tab2/${info.recipient}:${info.cargo}:${info.client}`);
        }
    }, [info, setPage, history]);

    return {
        isLoading,
        handleAccept,
        handleReject,
        handleComplete,
        handleChat
    };
};
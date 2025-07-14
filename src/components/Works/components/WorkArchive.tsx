import React, { useState, useEffect } from 'react';
import { WorkInfo } from '../types';
import { WorksList } from './WorksList';
import socketService from '../../Sockets';
import { Store } from '../../Store';

export const WorkArchive: React.FC = () => {
    const [works, setWorks] = useState<WorkInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        // Запрос архива работ
        socket.emit("hist_works", {
            token: Store.getState().login.token
        });

        // Обработчик ответа
        const handleHistWorks = (res: any) => {
            console.log("hist_works response:", res);
            setIsLoading(false);
            
            if (res.success && res.data) {
                setWorks(res.data);
            } else {
                setWorks([]);
            }
        };

        socket.on("hist_works", handleHistWorks);

        return () => {
            socket.off("hist_works", handleHistWorks);
        };
    }, []);

    const handleWorkClick = (work: WorkInfo) => {
        // Архивные работы только для просмотра
        console.log('Archive work clicked:', work);
    };

    const handleOfferClick = (work: WorkInfo) => {
        // Архивные работы не могут иметь предложений
        console.log('Cannot offer on archived work');
    };

    return (
        <WorksList
            works={works}
            isLoading={isLoading}
            onWorkClick={handleWorkClick}
            onOfferClick={handleOfferClick}
        />
    );
};
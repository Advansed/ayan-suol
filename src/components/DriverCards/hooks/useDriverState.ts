import { useState, useMemo } from 'react';
import { UseDriverStateProps, TaskCompletion } from '../types';

export const useDriverState = ({ info, mode }: UseDriverStateProps) => {
    const [tasks, setTasks] = useState<TaskCompletion>({
        delivered: false,
        documents: false
    });
    const [rating, setRating] = useState(0);

    const handleTaskChange = (key: keyof TaskCompletion, value: boolean) => {
        setTasks(prev => ({ ...prev, [key]: value }));
    };

    const canComplete = useMemo(() => {
        return mode === 'delivered' && 
               Object.values(tasks).every(value => value) && 
               rating > 0;
    }, [mode, tasks, rating]);

    const shouldShowAcceptButton = useMemo(() => 
        mode === 'offered' && !info.accepted, [mode, info.accepted]);

    const shouldShowCompleteButton = useMemo(() => 
        mode === 'completed' && !info.accepted, [mode, info.accepted]);

    const shouldShowRatingSection = useMemo(() => 
        mode === 'delivered', [mode]);

    const formattedCurrency = useMemo(() => 
        new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB' 
        }).format(info.price).replace('₽', '₽ '), [info.price]);

    return {
        tasks,
        rating,
        canComplete,
        shouldShowAcceptButton,
        shouldShowCompleteButton,
        shouldShowRatingSection,
        formattedCurrency,
        setRating,
        handleTaskChange
    };
};
/**
 * Основной хук для управления работами
 */

import { useState, useEffect, useCallback } from 'react';
import { WorkInfo, WorkStatus, WorkPageType, WorkFilters, UseWorksReturn, CreateOfferData } from '../types';
import { WORK_SOCKET_EVENTS } from '../constants';
import { workDataUtils, workStatusUtils } from '../utils';
import { Store, useSelector } from '../../Store';
import socketService from '../../Sockets';

export const useWorks = (): UseWorksReturn => {
    // Состояние
    const works = useSelector((state) => state.works, 21);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState<WorkPageType>({ type: 'list' });
    const [filters, setFilters] = useState<WorkFilters>({});
    const [searchQuery, setSearchQuery] = useState('');

    // История навигации для кнопки "Назад"
    const [navigationHistory, setNavigationHistory] = useState<WorkPageType[]>([{ type: 'list' }]);

    // ======================
    // НАВИГАЦИЯ
    // ======================

    const navigateTo = useCallback((page: WorkPageType) => {
        setNavigationHistory(prev => [...prev, currentPage]);
        setCurrentPage(page);
    }, [currentPage]);

    const goBack = useCallback(() => {
        setCurrentPage({ type: 'list' });
    }, []);

    // ======================
    // ОПЕРАЦИИ С ПРЕДЛОЖЕНИЯМИ
    // ======================

    const createOffer = useCallback(async (data: CreateOfferData): Promise<boolean> => {
        setIsLoading(true);
        try {
            console.log('Creating offer:', data);

            // Отправляем через socket
            const success = socketService.emit(WORK_SOCKET_EVENTS.SET_OFFER, {
                token: Store.getState().login.token,
                ...data
            });

            if (!success) {
                throw new Error('Нет подключения к серверу');
            }

            // Возвращаемся к списку после создания предложения
            setCurrentPage({ type: 'list' });

            return true;

        } catch (error) {
            console.error('Error creating offer:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateOffer = useCallback(async (offerId: string, data: Partial<any>): Promise<boolean> => {
        setIsLoading(true);
        try {
            // В реальном приложении здесь был бы API запрос на обновление
            console.log('Updating offer:', offerId, data);
            
            // Заглушка - в реальности нужен отдельный endpoint
            return true;

        } catch (error) {
            console.error('Error updating offer:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const cancelOffer = useCallback(async (offerId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            console.log('Canceling offer:', offerId);

            // Отправляем через socket
            const success = socketService.emit(WORK_SOCKET_EVENTS.CANCEL_OFFER, {
                token: Store.getState().login.token,
                offerId
            });

            if (!success) {
                throw new Error('Нет подключения к серверу');
            }

            return true;

        } catch (error) {
            console.error('Error canceling offer:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markCompleted = useCallback(async (workId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const work = getWork(workId);
            if (!work) {
                console.error('Work not found:', workId);
                return false;
            }

            console.log('Marking work as completed:', workId);

            // Отправляем через socket
            const success = socketService.emit(WORK_SOCKET_EVENTS.DELIVERED, {
                token: Store.getState().login.token,
                guid: workId,
                recipient: work.recipient
            });

            if (!success) {
                throw new Error('Нет подключения к серверу');
            }

            return true;

        } catch (error) {
            console.error('Error marking work as completed:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ======================
    // УТИЛИТЫ
    // ======================

    const getWork = useCallback((guid: string): WorkInfo | undefined => {
        const currentWorks = Store.getState().works || [];
        return currentWorks.find((work: WorkInfo) => work.guid === guid);
    }, []);

    const refreshWorks = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            const token = Store.getState().login.token;
            
            // Запрашиваем обновленные данные
            socketService.emit(WORK_SOCKET_EVENTS.GET_WORKS, { token });
            
            console.log('Refreshing works...');
            
        } catch (error) {
            console.error('Error refreshing works:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Фильтрованный и отсортированный список работ
    const filteredWorks = useCallback(() => {
        let filtered = [...(works || [])];

        // Поиск
        if (searchQuery) {
            filtered = workDataUtils.searchWorks(filtered, searchQuery);
        }

        // Фильтры
        if (filters.status && filters.status.length > 0) {
            filtered = workDataUtils.filterByStatus(filtered, filters.status);
        }

        if (filters.cityFrom) {
            filtered = filtered.filter(work => 
                work.address?.city.toLowerCase().includes(filters.cityFrom!.toLowerCase())
            );
        }

        if (filters.cityTo) {
            filtered = filtered.filter(work => 
                work.destiny?.city.toLowerCase().includes(filters.cityTo!.toLowerCase())
            );
        }

        if (filters.priceMin !== undefined) {
            filtered = filtered.filter(work => work.price >= filters.priceMin!);
        }

        if (filters.priceMax !== undefined) {
            filtered = filtered.filter(work => work.price <= filters.priceMax!);
        }

        if (filters.weightMin !== undefined) {
            filtered = filtered.filter(work => work.weight >= filters.weightMin!);
        }

        if (filters.weightMax !== undefined) {
            filtered = filtered.filter(work => work.weight <= filters.weightMax!);
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(work => {
                const workDate = new Date(work.address?.date || '');
                const filterDate = new Date(filters.dateFrom!);
                return workDate >= filterDate;
            });
        }

        if (filters.dateTo) {
            filtered = filtered.filter(work => {
                const workDate = new Date(work.destiny?.date || '');
                const filterDate = new Date(filters.dateTo!);
                return workDate <= filterDate;
            });
        }

        // Сортировка (по умолчанию по дате создания, новые первыми)
        return workDataUtils.sortWorks(filtered, 'createdAt', 'desc');
    }, [works, searchQuery, filters]);

    // ======================
    // SOCKET ОБРАБОТЧИКИ
    // ======================

    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        const handleOfferResponse = (response: any) => {
            console.log('Offer response received:', response);
            setIsLoading(false);
            
            if (response.success) {
                // Обновляем список работ
                refreshWorks();
            } else {
                console.error('Offer error:', response.message);
            }
        };

        const handleWorkUpdated = (updatedWork: WorkInfo) => {
            console.log('Work updated via socket:', updatedWork);
            
            const currentWorks = Store.getState().works || [];
            const updatedWorks = currentWorks.map((w: WorkInfo) => 
                w.guid === updatedWork.guid ? updatedWork : w
            );
            
            Store.dispatch({
                type: 'works',
                data: updatedWorks
            });
        };

        const handleDelivered = (response: any) => {
            console.log('Work delivered response:', response);
            setIsLoading(false);
            
            if (response.success) {
                // Возвращаемся к списку и обновляем данные
                setCurrentPage({ type: 'list' });
                refreshWorks();
            }
        };

        // Подписываемся на события
        socket.on(WORK_SOCKET_EVENTS.SET_OFFER, handleOfferResponse);
        socket.on(WORK_SOCKET_EVENTS.WORK_UPDATED, handleWorkUpdated);
        socket.on(WORK_SOCKET_EVENTS.DELIVERED, handleDelivered);

        return () => {
            socket.off(WORK_SOCKET_EVENTS.SET_OFFER, handleOfferResponse);
            socket.off(WORK_SOCKET_EVENTS.WORK_UPDATED, handleWorkUpdated);
            socket.off(WORK_SOCKET_EVENTS.DELIVERED, handleDelivered);
        };
    }, [refreshWorks]);

    // ======================
    // ВОЗВРАТ ИНТЕРФЕЙСА
    // ======================

    return {
        // Состояние
        works: filteredWorks(),
        isLoading,

        // Операции с предложениями
        createOffer,
        updateOffer,
        cancelOffer,
        markCompleted,

        // Навигация
        currentPage,
        navigateTo,
        goBack,

        // Фильтрация и поиск
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,

        // Утилиты
        getWork,
        refreshWorks
    };
};
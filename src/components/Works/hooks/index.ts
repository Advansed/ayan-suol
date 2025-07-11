/**
 * Экспорт всех хуков модуля Works
 */

export { useWorks } from './useWorks';
export { useOfferForm } from './useOfferForm';

// Реэкспорт типов для удобства
export type {
    UseWorksReturn,
    UseOfferFormReturn,
    WorkInfo,
    WorkPageType,
    WorkFilters,
    OfferFormState,
    CreateOfferData
} from '../types';

// Готовые комбинированные хуки для частых случаев использования

import { useWorks } from './useWorks';
import { useOfferForm } from './useOfferForm';
import { workDataUtils, workStatusUtils } from '../utils';

/**
 * Комбинированный хук для страницы списка работ
 */
export const useWorksList = () => {
    const works = useWorks();

    const handleViewWork = (work: any) => {
        works.navigateTo({ type: 'view', work });
    };

    const handleCreateOffer = (work: any) => {
        works.navigateTo({ type: 'offer', work });
    };

    // Группировка работ для отображения
    const groupedWorks = workDataUtils.groupByStatus(works.works);

    return {
        works: works.works,
        groupedWorks,
        isLoading: works.isLoading,
        filters: works.filters,
        setFilters: works.setFilters,
        searchQuery: works.searchQuery,
        setSearchQuery: works.setSearchQuery,
        refreshWorks: works.refreshWorks,
        handleViewWork,
        handleCreateOffer
    };
};

/**
 * Комбинированный хук для создания предложения
 */
export const useCreateOffer = (workInfo: any) => {
    const works = useWorks();
    const form = useOfferForm();

    // Инициализация формы при изменении работы
    if (workInfo && form.formState.data.workId !== workInfo.guid) {
        form.initializeForm(workInfo);
    }

    const handleSubmit = async (): Promise<boolean> => {
        const isFormValid = await form.actions.submitForm();
        if (!isFormValid) return false;

        const success = await works.createOffer(form.formState.data);
        if (success) {
            form.actions.resetForm();
        }
        return success;
    };

    const handleCancel = () => {
        form.actions.resetForm();
        works.navigateTo({ type: 'list' });
    };

    return {
        ...form,
        workInfo,
        isLoading: works.isLoading,
        handleSubmit,
        handleCancel,
        navigateToList: () => works.navigateTo({ type: 'list' })
    };
};

/**
 * Хук для просмотра детальной информации о работе
 */
export const useWorkView = (workGuid: string) => {
    const works = useWorks();
    const work = works.getWork(workGuid);

    const handleCreateOffer = () => {
        if (work) {
            works.navigateTo({ type: 'offer', work });
        }
    };

    const handleMarkCompleted = async (): Promise<boolean> => {
        if (!work) return false;
        return await works.markCompleted(work.guid);
    };

    const handleCancelOffer = async (): Promise<boolean> => {
        if (!work?.currentOffer) return false;
        return await works.cancelOffer(work.currentOffer.id);
    };

    // Проверка возможности различных действий
    const canOffer = work ? workStatusUtils.canOffer(work.status) : false;
    const canCancel = work ? workStatusUtils.canCancel(work.status) : false;
    const canComplete = work ? workStatusUtils.canComplete(work.status) : false;

    // Проверка наличия активного предложения текущего водителя
    const driverId = works.works.length > 0 ? 'current_driver_id' : ''; // В реальности из Store
    const hasActiveOffer = work ? workDataUtils.hasActiveOffer(work, driverId) : false;
    const currentOffer = work ? workDataUtils.getDriverOffer(work, driverId) : undefined;

    return {
        work,
        currentOffer,
        isLoading: works.isLoading,
        hasActiveOffer,
        canOffer,
        canCancel,
        canComplete,
        handleCreateOffer,
        handleMarkCompleted,
        handleCancelOffer,
        navigateToList: () => works.navigateTo({ type: 'list' }),
        navigateToOffer: handleCreateOffer,
        goBack: works.goBack
    };
};

/**
 * Хук для работы с фильтрами
 */
export const useWorkFilters = () => {
    const works = useWorks();

    const clearFilters = () => {
        works.setFilters({});
        works.setSearchQuery('');
    };

    const hasActiveFilters = () => {
        return works.searchQuery || 
               works.filters.status?.length || 
               works.filters.cityFrom || 
               works.filters.cityTo || 
               works.filters.priceMin || 
               works.filters.priceMax;
    };

    const setStatusFilter = (statuses: any[]) => {
        works.setFilters({
            ...works.filters,
            status: statuses.length > 0 ? statuses : undefined
        });
    };

    const setPriceRange = (min?: number, max?: number) => {
        works.setFilters({
            ...works.filters,
            priceMin: min,
            priceMax: max
        });
    };

    const setCityFilter = (from?: string, to?: string) => {
        works.setFilters({
            ...works.filters,
            cityFrom: from,
            cityTo: to
        });
    };

    return {
        filters: works.filters,
        searchQuery: works.searchQuery,
        setSearchQuery: works.setSearchQuery,
        clearFilters,
        hasActiveFilters,
        setStatusFilter,
        setPriceRange,
        setCityFilter
    };
};
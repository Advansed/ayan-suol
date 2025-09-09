/**
 * Экспорт всех хуков модуля Works
 */

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

import { useOfferForm } from './useOfferForm';
import { workDataUtils, workStatusUtils } from '../utils';
import { useWorks } from '../../../Store/useWorks';

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





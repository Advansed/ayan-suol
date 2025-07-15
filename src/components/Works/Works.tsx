/**
 * Главный компонент модуля Works
 */

import React from 'react';
import { WorkPageType, WorkInfo } from './types';
import { useWorks } from './hooks';
import { WorksList, WorkView, WorkOffer } from './components';

export const Works: React.FC = () => {
    const {
        works,
        archiveWorks,
        isLoading,
        currentPage,
        navigateTo,
        goBack,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        createOffer,
        markCompleted,
        refreshWorks
    } = useWorks();

    // Обработчики для списка
    const handleWorkClick = (work: WorkInfo) => {
        if (work.status === 'В работе') {
            navigateTo({ type: 'view', work });
        }
    };

    const handleOfferClick = (work: WorkInfo) => {
        navigateTo({ type: 'offer', work });
    };

    // Рендер страниц
    const renderPage = () => {
        switch (currentPage.type) {
            case 'list':
                return (
                    <WorksList
                        works={works}
                        isLoading={isLoading}
                        onWorkClick={handleWorkClick}
                        onOfferClick={handleOfferClick}
                    />
                );

            case 'view':
                return (
                    <WorkView
                        work={currentPage.work}
                        onBack={goBack}
                    />
                );

            case 'offer':
                return (
                    <WorkOffer
                        work={currentPage.work}
                        onBack={goBack}
                    />
                );

            case 'archive':
                return (
                    <WorksList
                        works={archiveWorks}
                        isLoading={isLoading}
                        onWorkClick={handleWorkClick}
                        onOfferClick={handleOfferClick}
                    />
                );

            default:
                return (
                    <WorksList
                        works={works}
                        isLoading={isLoading}
                        onWorkClick={handleWorkClick}
                        onOfferClick={handleOfferClick}
                    />
                );
        }
    };

    return (
        <div className="a-container">
            {renderPage()}
        </div>
    );
};
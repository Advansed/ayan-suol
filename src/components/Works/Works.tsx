/**
 * Главный компонент модуля Works
 */

import React from 'react';
import { WorkInfo, OfferInfo } from './types';
import { WorksList, WorkView, WorkOffer } from './components';
import { WorkMap } from './components/WorkMap';
import { useWorks } from '../../Store/useWorks';
import { useWorkNavigation } from './hooks/useNavigation';

export const Works: React.FC = () => {
    const { works, isLoading, setOffer, setStatus, refreshWorks } = useWorks();

    const { currentPage, navigateTo,goBack } = useWorkNavigation()

    // Обработчики для списка
    const handleWorkClick = (work: WorkInfo) => {

        navigateTo({ type: 'view', work });

    };

    const handleOfferClick = (work: WorkInfo ) => {

        navigateTo({ type: 'offer', work });
      
    };

    const handleStatusClick = (work: WorkInfo ) => {

        setStatus( work )

    };

    // Добавить обработчик после handleOfferClick
    const handleMapClick = (work: WorkInfo) => {

        navigateTo({ type: 'map', work });

    };

    const handleOfferSubmit = async (offer: OfferInfo ) => {

       return await setOffer( offer ) 

    };


    // Рендер страниц
    const renderPage = () => {
        switch (currentPage.type) {
            case 'list':
                return (
                    <WorksList
                        works           = { works }
                        isLoading       = { isLoading } 
                        onWorkClick     = { handleWorkClick }
                        onRefresh       = { refreshWorks }
                    />
                );

            case 'view':
                return (
                    <WorkView
                        work            = { currentPage.work }
                        onBack          = { goBack }
                        onOfferClick    = { handleOfferClick }
                        onStatusClick   = { handleStatusClick }
                        onMapClick      = { handleMapClick }
                    />
                );

            case 'offer':
                return (
                    <WorkOffer
                        work            = { currentPage.work }
                        onBack          = { goBack }
                        onOffer         = { handleOfferSubmit }
                    />
                );

            // В renderPage() добавить новый случай:
            case 'map':
                return (
                    <WorkMap
                        work            = { currentPage.work }
                        onBack          = { goBack }
                    />
                );
            default:
                return (
                    <WorksList
                        works           = { works }
                        isLoading       = { isLoading }
                        onWorkClick     = { handleWorkClick }
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
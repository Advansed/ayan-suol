/**
 * Главный компонент модуля Works
 */

import React from 'react';
import { WorkPageType, WorkInfo, OfferInfo } from './types';
import { WorksList, WorkView, WorkOffer } from './components';
import { WorkMap } from './components/WorkMap';
import { useWorks } from '../../Store/useWorks';

export const Works: React.FC = () => {
    const {
        works,
        isLoading,
        currentPage,
        navigateTo,
        goBack,
        setOffer,
        setDeliver,
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

    // Добавить обработчик после handleOfferClick
    const handleMapClick = (work: WorkInfo) => {

        navigateTo({ type: 'map', work });

    };

    const handleOfferSubmit = async (offer: OfferInfo) => {

       return await setOffer( offer ) 

    };

    const handleStatus = async (status: string, offer: Partial<OfferInfo>) => {
       
        if( status === "delivered")
            await setDeliver( offer )

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
                        onOfferClick    = { handleOfferClick }
                        onRefresh       = { refreshWorks }
                        onMapClick      = { handleMapClick }
                    />
                );

            case 'view':
                return (
                    <WorkView
                        work            = { currentPage.work }
                        onBack          = { goBack }
                        onStatus        = { handleStatus }
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
                        onOfferClick    = { handleOfferClick }
                        onMapClick      = { handleMapClick }
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
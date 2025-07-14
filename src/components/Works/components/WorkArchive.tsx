import React, { useEffect } from 'react';
import { WorksList } from './WorksList';
import { useWorks } from '../hooks';

export const WorkArchive: React.FC = () => {
    const { archiveWorks, isArchiveLoading, loadArchiveWorks } = useWorks();

    useEffect(() => {
        loadArchiveWorks();
        console.log( archiveWorks )
    }, [loadArchiveWorks]);

    const handleWorkClick = (work) => {
        console.log('Archive work clicked:', work);
        // Можно добавить navigateTo({ type: 'view', work, isArchive: true })
    };

    const handleOfferClick = (work) => {
        console.log('Cannot offer on archived work');
    };

    return (
        <WorksList
            works           = { archiveWorks }
            isLoading       = { isArchiveLoading }
            onWorkClick     = { handleWorkClick }
            onOfferClick    = { handleOfferClick }
        />
    );
};
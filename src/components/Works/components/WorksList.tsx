import React from 'react';
import { WorkInfo } from '../types';
import { WorkCard } from './WorkCard';
import Lottie from 'lottie-react';
import animationData from '../../../pages/gvr_logo.json';
import './WorkList.css';
import { WizardHeader } from '../../Header/WizardHeader';

interface WorksListProps {
    works: WorkInfo[];
    isLoading?: boolean;
    onWorkClick: (work: WorkInfo) => void;
    onRefresh?: () => Promise<void>;
    emptyTitle?: string;
    emptyHint?: string;
}

const WorksListInner: React.FC<WorksListProps> = ({
    works,
    isLoading = false,
    onWorkClick,
    onRefresh,
    emptyTitle = 'Нет доступных заказов',
    emptyHint = 'Доступные заказы появятся здесь, когда их опубликуют заказчики',
}) => {
    const EmptyState = () => (
        <div>
            <h3 className="fs-12 cl-gray a-center">
                {emptyTitle}
            </h3>
            <p className="fs-09 cl-gray a-center mt-05">
                {emptyHint}
            </p>
            <Lottie 
                animationData={animationData} 
                loop={true}
                autoplay={true}
                style={{ 
                    width: '100%',
                    height: '100%',
                    minWidth: '30vw'
                }}
            />
        </div>
    );

    return (
        <div className='works-list-container'>
            <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <WizardHeader
                    title='Заказы'
                    onRefresh={onRefresh}
                />
            </div>
            <div className="scroll">
                {works.length > 0 ? (
                    <div className="works-cards-grid">
                        {works.map((work) => (
                            <div key={work.guid} className="works-card-cell">
                                <WorkCard work={work} mode="list" onClick={() => onWorkClick(work)} />
                            </div>
                        ))}
                    </div>
                ) : (
                    !isLoading && <EmptyState />
                )}
            </div>
        </div>
    );
};

export const WorksList = React.memo(WorksListInner);
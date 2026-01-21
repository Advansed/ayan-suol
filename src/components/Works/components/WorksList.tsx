import React from 'react';
import { WorkInfo } from '../types';
import { WorkCard } from './WorkCard';
import Lottie from 'lottie-react';
import animationData from '../../../pages/gvr_logo.json';
import './WorkList.css'
import { WizardHeader } from '../../Header/WizardHeader';

interface WorksListProps {
    works:          WorkInfo[];
    title?:         string;
    isLoading?:     boolean;
    onWorkClick:    (work: WorkInfo ) => void;
    onRefresh?:     () => Promise<void>;
}

export const WorksList: React.FC<WorksListProps> = ({
    works,
    isLoading = false,
    onWorkClick,
    onRefresh
}) => {

    const EmptyState        = () => (
        <div className="">
            <div className="">
                <div className="">
                    <h3 className="fs-12 cl-gray a-center">
                        Нет доступных заказов
                    </h3>
                    <p className="fs-09 cl-gray a-center mt-05">
                        Доступные заказы появятся здесь, когда их опубликуют заказчики
                    </p>
                </div>
            </div>
            <div className="">
                <div className="">
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
            </div>
        </div>
    );

    const renderWorks       = (worksToRender: WorkInfo[]) => {
        return worksToRender.map((work) => (
            <div 
                key={work.guid} 
                style={{ width: '100%', boxSizing: 'border-box', padding: '0 0.6em', marginBottom: '0.5em' }}
                onClick={() => { onWorkClick(work); }}
            >
                <WorkCard work={work} mode="list" onClick={() => onWorkClick(work)} />
            </div>
        ));
    };


    return (
        <div className='works-list-container'>
            {/* Refresher */}
            
            <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <WizardHeader
                    title       = 'Заказы'
                    onMenu      = { () => {
                        // TODO: Добавить функциональность меню (например, открытие бокового меню)
                        console.log('Menu clicked');
                    } }
                    onRefresh   = { onRefresh }
                />
            </div>
            <div className="scroll">
                {works.length > 0 ? (
                    <>
                        {renderWorks(works)}
                    </>
                ) : (
                    !isLoading && <EmptyState />
                )}
            </div>

        </div>
    );
};
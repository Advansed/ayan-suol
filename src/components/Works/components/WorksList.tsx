import React, { useState } from 'react';
import { IonButton, IonLabel, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton } from '@ionic/react';
import { WorkInfo, WorkStatus } from '../types';
import { WorkCard } from './WorkCard';
import { useHistory } from 'react-router';
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
    const history = useHistory();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    
    // Разделяем работы по статусам
    const activeWorks = works.filter(w => w.status === WorkStatus.NEW);
    const completedWorks = works.filter(w => w.status !== WorkStatus.NEW);


    const handleRefresh     = async (event: any) => {
        if (onRefresh) {
            await onRefresh();
        }
        event.detail.complete();
    };

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
                className='cr-card mt-1'
                onClick={() => { onWorkClick(work); }}
            >
                <WorkCard work={work} mode="view" />

            </div>
        ));
    };


    return (
        <div className='works-list-container'>
            {/* Refresher */}
            
            <div className='ml-1 mr-1'>
                <WizardHeader
                    title       = 'Заказы'
                    onRefresh   = { onRefresh }
                />
            </div>
            <div className="scroll">
                {/* Переключатель вкладок */}
                {/* Активные работы */}
                

                <IonSegment 
                    value={activeTab} 
                    onIonChange={e => setActiveTab(e.detail.value as 'active' | 'completed')}
                    className="custom-segment sticky-top"
                >
                    <IonSegmentButton value="active" className="segment-button">
                        <IonLabel className="segment-label"><b>Новые ({activeWorks.length})</b></IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="completed" className="segment-button">
                        <IonLabel className="segment-label"><b>Активные ({completedWorks.length})</b></IonLabel>
                    </IonSegmentButton>
                </IonSegment>


                {/* Активные работы */}
                {activeTab === 'active' && (
                    <>
                        {activeWorks.length > 0 ? (
                            <>
                                {renderWorks(activeWorks)}
                            </>
                        ) : (
                            !isLoading && <EmptyState />
                        )}
                    </>
                )}

                {/* Выполненные работы */}
                {activeTab === 'completed' && completedWorks.length > 0 && (
                    <>
                        {renderWorks(completedWorks)}
                    </>
                )}

                {/* Пустое состояние для выполненных */}
                {activeTab === 'completed' && completedWorks.length === 0 && !isLoading && (
                    <div className="empty-state-container">
                        <div className="empty-state-content">
                            <div className="empty-state-text">
                                <h3 className="fs-12 cl-gray a-center">
                                    Нет принятых заказов
                                </h3>
                                <p className="fs-09 cl-gray a-center mt-05">
                                    Здесь будут отображаться принятые заказы
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
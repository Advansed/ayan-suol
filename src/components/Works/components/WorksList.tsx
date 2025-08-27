import React from 'react';
import { IonButton, IonLabel, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/react';
import { chatboxEllipsesOutline } from 'ionicons/icons';
import { WorkInfo, WorkStatus } from '../types';
import { WorkCard } from './WorkCard';
import { useHistory } from 'react-router';
import Lottie from 'lottie-react';
import animationData from './data.json';

interface WorksListProps {
    works: WorkInfo[];
    title?: string;
    isLoading?: boolean;
    onWorkClick: (work: WorkInfo) => void;
    onOfferClick: (work: WorkInfo) => void;
    onRefresh?: () => Promise<void>;
}

export const WorksList: React.FC<WorksListProps> = ({
    works,
    title,
    isLoading = false,
    onWorkClick,
    onOfferClick,
    onRefresh
}) => {
    const history = useHistory();
    
    // Разделяем работы по статусам
    const activeWorks = works.filter(w => w.status !== WorkStatus.COMPLETED);
    const completedWorks = works.filter(w => w.status === WorkStatus.COMPLETED);

    const handleChat = (work: WorkInfo, e: React.MouseEvent) => {
        e.stopPropagation();
        history.push(`/tab2/${work.recipient}:${work.cargo}:${work.client}`);
    };

    const handleRefresh = async (event: any) => {
        if (onRefresh) {
            await onRefresh();
        }
        event.detail.complete();
    };
    const EmptyState = () => (
        <div className="empty-state-container">
            <div className="empty-state-content">
                <div className="empty-state-text">
                    <h3 className="fs-12 cl-gray a-center">
                        Нет доступных заказов
                    </h3>
                    <p className="fs-09 cl-gray a-center mt-05">
                        Доступные заказы появятся здесь, когда их опубликуют заказчики
                    </p>
                </div>
            </div>
            <div className="lottie-container-bottom">
                <div className="lottie-wrapper">
                    <Lottie 
                        animationData={animationData} 
                        loop={true}
                        autoplay={true}
                        style={{ 
                            width: '100%',
                            height: '100%',
                            minWidth: '100vw'
                        }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Refresher */}
            {onRefresh && (
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
            )}
            <div className="bg-2 scroll">
                {/* Активные работы */}
                {activeWorks.length > 0 && (
                    <>
                        <div className="a-center w-90 fs-09 mt-1">
                            <b>{ title ? title : "Доступные заказы"}</b>
                        </div>
                        {activeWorks.map((work) => (
                            <div 
                                key={work.guid} 
                                className='cr-card mt-1'
                                onClick={() => work.status === WorkStatus.IN_WORK && onWorkClick(work)}
                            >
                                <WorkCard work = { work } mode="view" />
                                
                                <div className="flex">
                                    <IonButton
                                        className="w-50 cr-button-2"
                                        mode="ios"
                                        fill="clear"
                                        color="primary"
                                        onClick={(e) => handleChat(work, e)}
                                    >
                                        <IonLabel className="fs-08">Чат с заказчиком</IonLabel>
                                    </IonButton>
                                    
                                    {work.status === WorkStatus.NEW && (
                                        <IonButton
                                            className="w-50 cr-button-2"
                                            mode="ios"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOfferClick(work);
                                            }}
                                        >
                                            <IonLabel className="fs-08">Предложить</IonLabel>
                                        </IonButton>
                                    )}
                                </div>
                                <div>
                                        <IonButton
                                            className="w-50 cr-button-2"
                                            mode="ios"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOfferClick(work);
                                            }}
                                        >
                                            <IonLabel className="fs-08">Карта</IonLabel>
                                        </IonButton>

                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Выполненные работы */}
                {completedWorks.length > 0 && (
                    <>
                        <div className="a-center w-90 fs-09 mt-1">
                            <b>Выполненные</b>
                        </div>
                        {completedWorks.map((work) => (
                            <div key={work.guid} className='cr-card mt-1'>
                                <WorkCard work = {work} mode="view" />
                                <div className="flex">
                                    <IonButton
                                        className="w-50 cr-button-2"
                                        mode="ios"
                                        fill="clear"
                                        color="primary"
                                        onClick={(e) => handleChat(work, e)}
                                    >
                                        <IonLabel className="fs-08">Чат с заказчиком</IonLabel>
                                    </IonButton>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Пустое состояние */}
                {activeWorks.length === 0 && completedWorks.length === 0 && !isLoading && (
                    <EmptyState />
                )}
            </div>
        </>
    );
};
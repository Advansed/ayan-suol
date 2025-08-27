import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { WorkInfo } from '../types';
import { WorkCard } from './WorkCard';
import Maps from '../../Maps/Maps';

interface WorkMapProps {
    work: WorkInfo;
    onBack: () => void;
}

export const WorkMap: React.FC<WorkMapProps> = ({ work, onBack }) => {
    return (
        <div className="a-container">
            {/* Заголовок с кнопкой назад */}
            <div className="cr-header">
                <IonButton
                    fill="clear"
                    color="primary"
                    onClick={onBack}
                >
                    <IonIcon icon={arrowBackOutline} />
                </IonButton>
                <div className="cr-header-title">Карта маршрута</div>
            </div>

            {/* Информация о работе */}
            {/* <WorkCard work={work} mode="view" /> */}

            <Maps
                startCoords={{lat: work.address.lat, long: work.address.long}}
                endCoords={{lat: work.destiny.lat, long: work.destiny.long}} 
                workInfo={work}
            />

            {/* Карта */}
            {/* <div className="map-container mt-1" style={{ height: 'calc(100vh - 200px)', background: '#f5f5f5', borderRadius: '8px' }}>
                <div className="a-center p-2" style={{ paddingTop: '50px' }}>
                    <p className="fs-11 cl-gray">Карта будет отображена здесь</p>
                    <p className="fs-09 cl-gray">От: {work.address?.city?.city}</p>
                    <p className="fs-09 cl-gray">До: {work.destiny?.city?.city}</p>
                </div>
            </div> */}
        </div>
    );
};
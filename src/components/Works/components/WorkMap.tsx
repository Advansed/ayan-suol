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

            <Maps
                startCoords={{lat: work.address.lat, long: work.address.long}}
                endCoords={{lat: work.destiny.lat, long: work.destiny.long}} 
                workInfo={work}
            />

        </div>
    );
};
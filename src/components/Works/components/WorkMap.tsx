import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { WorkInfo } from '../types';
import Maps from '../../Maps/Maps';

interface WorkMapProps {
    work: WorkInfo;
    onBack: () => void;
}

export const WorkMap: React.FC<WorkMapProps> = ({ work, onBack }) => {
    return (
        <>
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon 
                    icon={arrowBackOutline} 
                    className="w-15 h-15"
                    onClick={onBack}
                />
                <div className="a-center w-90 fs-09">
                    <b>Карта маршрута</b>
                </div>
            </div>

            <Maps
                startCoords={{lat: work.address.lat, long: work.address.long}}
                endCoords={{lat: work.destiny.lat, long: work.destiny.long}} 
                workInfo={work}
            />
        </>
    );
};
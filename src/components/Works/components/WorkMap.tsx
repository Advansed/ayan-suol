import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { waypointCoordinates } from '../../../Store/cargoStore';
import { WorkInfo } from '../types';
import Maps from '../../Maps/Maps';
import mapStyles from '../../Maps/Maps.module.css';

interface WorkMapProps {
    work: WorkInfo;
    onBack: () => void;
}

export const WorkMap: React.FC<WorkMapProps> = ({ work, onBack }) => {
    return (
        <div className={mapStyles.mapPage} data-route-map>
            <div className={mapStyles.mapBar}>
                <button
                    type="button"
                    className={mapStyles.mapBack}
                    onClick={onBack}
                    aria-label="Назад к заказу"
                >
                    <ArrowLeft size={22} strokeWidth={2} />
                </button>
                <h1 className={mapStyles.mapHeading}>Карта маршрута</h1>
            </div>
            <div className={mapStyles.mapWrap}>
                <Maps
                    startCoords={{
                        lat: Number(work.address?.lat) || 0,
                        long: Number(work.address?.lon) || 0,
                    }}
                    endCoords={{
                        lat: Number(work.destiny?.lat) || 0,
                        long: Number(work.destiny?.lon) || 0,
                    }}
                    waypoints={waypointCoordinates(work.route).map((point) => ({
                        lat: point.lat,
                        long: point.lon,
                    }))}
                    workInfo={work}
                />
            </div>
        </div>
    );
};

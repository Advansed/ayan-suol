import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CargoInfo, waypointCoordinates } from '../../../Store/cargoStore';
import Maps from '../../Maps/Maps';
import mapStyles from '../../Maps/Maps.module.css';

interface CargoMapProps {
  cargo: CargoInfo;
  onBack: () => void;
}

export const CargoMap: React.FC<CargoMapProps> = ({ cargo, onBack }) => {
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
            lat: Number(cargo.address?.lat) || 0,
            long: Number(cargo.address?.lon) || 0,
          }}
          endCoords={{
            lat: Number(cargo.destiny?.lat) || 0,
            long: Number(cargo.destiny?.lon) || 0,
          }}
          waypoints={waypointCoordinates(cargo.route).map((point) => ({
            lat: point.lat,
            long: point.lon,
          }))}
          cargoInfo={cargo}
        />
      </div>
    </div>
  );
};

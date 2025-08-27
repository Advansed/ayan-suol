import React, { useEffect, useRef } from 'react';
import styles from './Maps.module.css';
import { MapProps, YandexMapInstance } from './MapTypes';
import { initializeMap, createRoute } from './services/YandexMapServices';

const Maps: React.FC<MapProps> = ({ startCoords, endCoords, cargoInfo, workInfo, height = '400px' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<YandexMapInstance | null>(null);

  useEffect(() => {
    if (!mapRef.current || !startCoords || !endCoords) return;

    const initMap = async () => {
      try {
        mapInstance.current = await initializeMap(mapRef.current!);
        await createRoute(mapInstance.current, startCoords, endCoords, cargoInfo || workInfo);
      } catch (error) {
        console.error('Ошибка инициализации карты:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, [startCoords, endCoords]);

  return (
    <div className={styles.mapContainer}>
      <div 
        ref={mapRef} 
        className={styles.map}
        style={{ height }}
      />
    </div>
  );
};

export default Maps;
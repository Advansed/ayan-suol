import React, { useEffect, useRef, useState } from 'react';
import styles from './Maps.module.css';
import { MapProps, YandexMapInstance } from './MapTypes';
import { initializeMap, createRoute } from './services/YandexMapServices';

const Maps: React.FC<MapProps> = ({ startCoords, endCoords, cargoInfo, workInfo, height = '400px' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<YandexMapInstance | null>(null);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Получение и отслеживание размера экрана
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Вычисление высоты карты на основе размера экрана
  const calculateMapHeight = (): string => {
    if (height !== '400px') return height; // Если передана кастомная высота
    
    // Для WorkMap - на весь экран минус заголовок (примерно 60px)
    const headerHeight = 90;
    const calculatedHeight = screenSize.height - headerHeight;
    
    return `${calculatedHeight}px`;
  };

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
        ref         = { mapRef } 
        className   = { styles.map }
        style       = { { height: calculateMapHeight() } }
      />
    </div>
  );
};

export default Maps;
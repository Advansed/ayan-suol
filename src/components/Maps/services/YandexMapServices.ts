import { Coordinates, CargoInfo, WorkInfo, YandexMapInstance } from '../MapTypes';

declare global {
  interface Window {
    ymaps: any;
  }
}

export const initializeMap = async (container: HTMLElement): Promise<YandexMapInstance> => {
  return new Promise((resolve, reject) => {
    if (!window.ymaps) {
      reject(new Error('Yandex Maps API не загружен'));
      return;
    }

    window.ymaps.ready(() => {
      try {
        const map = new window.ymaps.Map(container, {
          center: [55.76, 37.64],
          zoom: 10,
          controls: ['zoomControl', 'fullscreenControl']
        });
        
        resolve(map);
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const createRoute = async (
  map: YandexMapInstance, 
  start: Coordinates, 
  end: Coordinates, 
  info?: CargoInfo | WorkInfo
) => {
  if (!window.ymaps) return;

  // Очищаем предыдущие объекты
  map.geoObjects.removeAll();

  // Создаем точки
  const startPoint = new window.ymaps.Placemark(
    [start.lat, start.long],
    {
      balloonContent: `<b>Отправление</b><br/>${info?.name || ''}<br/>Клиент: ${info?.client || ''}`
    },
    {
      preset: 'islands#redDotIcon'
    }
  );

  const endPoint = new window.ymaps.Placemark(
    [end.lat, end.long],
    {
      balloonContent: `<b>Назначение</b><br/>${info?.name || ''}`
    },
    {
      preset: 'islands#greenDotIcon'
    }
  );

  // Создаем маршрут
  const route = new window.ymaps.multiRouter.MultiRoute({
    referencePoints: [
      [start.lat, start.long],
      [end.lat, end.long]
    ],
    params: {
      routingMode: 'auto'
    }
  }, {
    boundsAutoApply: true,
    routeActiveStrokeWidth: 6,
    routeActiveStrokeColor: '#3b82f6'
  });

  // Добавляем объекты на карту
  map.geoObjects.add(startPoint);
  map.geoObjects.add(endPoint);
  map.geoObjects.add(route);

  // Масштабируем карту под маршрут
  const bounds = [
    [Math.min(start.lat, end.lat), Math.min(start.long, end.long)],
    [Math.max(start.lat, end.lat), Math.max(start.long, end.long)]
  ];
  map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
};
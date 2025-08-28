import { Coordinates, CargoInfo, WorkInfo, YandexMapInstance } from '../MapTypes';

declare global {
  interface Window {
    ymaps: any;
  }
}

// Проверка и загрузка API
const loadYandexMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.ymaps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    const apiKey = "1a39cc54-1ef2-4686-a300-8c0e84631beb";
    
    if (!apiKey) {
      reject(new Error('API ключ не найден в переменных окружения'));
      return;
    }

    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Не удалось загрузить Yandex Maps API'));
    
    document.head.appendChild(script);
  });
};

export const initializeMap = async (container: HTMLElement): Promise<YandexMapInstance> => {
  // Сначала загружаем API если его нет
  await loadYandexMapsAPI();
  
  return new Promise((resolve, reject) => {
    window.ymaps.ready(() => {
      try {
        const map = new window.ymaps.Map(container, {
          center: [55.76, 37.64],
          zoom: 10,
          controls: ['zoomControl'] // Убрали 'fullscreenControl'
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
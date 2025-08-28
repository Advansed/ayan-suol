// Конфигурация для Yandex Maps
export const MAPS_CONFIG = {
  // API ключ из переменных окружения
  apiKey: "f2f0a250-d1db-4754-a195-c4a7c1ba6602",
    //"1a39cc54-1ef2-4686-a300-8c0e84631beb",
  
  // URL для подключения API
  apiUrl: 'https://api-maps.yandex.ru/2.1/',
  
  // Язык интерфейса
  language: 'ru_RU',
  
  // Настройки по умолчанию для карты
  defaultMapOptions: {
    center: [55.76, 37.64], // Москва
    zoom: 10,
    controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
  },
  
  // Настройки маршрута
  routeOptions: {
    strokeWidth: 5,
    strokeColor: '#3b82f6',
    strokeOpacity: 0.8
  },
  
  // Настройки меток
  placemarkOptions: {
    start: {
      preset: 'islands#redDotIcon',
      iconColor: '#dc2626'
    },
    end: {
      preset: 'islands#greenDotIcon', 
      iconColor: '#16a34a'
    }
  },
  
  // Отступы для автомасштабирования
  boundsMargin: [50, 50, 50, 50]
};

// Проверка наличия API ключа
export const validateApiKey = (): boolean => {
  if (!MAPS_CONFIG.apiKey) {
    console.error('REACT_APP_YANDEX_MAPS_API_KEY не найден в переменных окружения');
    return false;
  }
  return true;
};

// Генерация URL для подключения API
export const generateApiUrl = (): string => {
  return `${MAPS_CONFIG.apiUrl}?apikey=${MAPS_CONFIG.apiKey}&lang=${MAPS_CONFIG.language}`;
};
/**
 * Главный экспорт модуля Works
 */

// Стили (нужно импортировать в приложении)
import './styles.css';

// Основной компонент
export { Works } from './Works';

// Основные типы для внешнего использования
export type { 
    WorkInfo, 
    WorkStatus, 
    WorkPriority,
    OfferInfo,
    OfferStatus,
    CreateOfferData,
    WorkFilters,
    WorkPageType,
    DriverTransport
} from './types';

// Хуки для внешнего использования
export { 
    useOfferForm
} from './hooks';

// Компоненты для внешнего использования
export { 
    WorkCard, 
    WorksList, 
    WorkView,
    WorkOffer,
    WorkArchive
} from './components';


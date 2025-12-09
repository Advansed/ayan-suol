/**
 * Главный экспорт модуля Cargos
 */

// Стили (нужно импортировать в приложении)
import './styles.css';

// Основной компонент
export { Cargos } from './Cargos';

export { default as CargoArchive } from './components/CargoArchive';

// Основные типы для внешнего использования
export type { 
    CargoInfo, 
    CargoStatus, 
    CargoPriority,
    CargoAddress,
    PageType,
    CargoFilters
} from '../../Store/cargoStore';


// Компоненты для внешнего использования
export { 
    CargoCard, 
    CargoForm, 
    CargosList
} from './components';

// Утилиты для внешнего использования
export { 
    formatters, 
    statusUtils, 
    dataUtils,
    validateField
} from './utils';

// Константы для внешнего использования
export { 
    STATUS_CLASSES,
    STATUS_COLORS,
    VALIDATION_MESSAGES
} from './constants';
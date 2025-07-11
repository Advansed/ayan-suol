/**
 * Типы для модуля Works (работы для водителей)
 */

// Переиспользуем типы из Cargos
import { CargoAddress, ValidationErrors, ValidationResult } from '../Cargos/types';

// Статусы работ с точки зрения водителя
export enum WorkStatus {
    NEW = "Новый",           // Доступна для предложения
    OFFERED = "Предложен",   // Водитель сделал предложение
    IN_WORK = "В работе",    // Предложение принято, выполняется
    COMPLETED = "Выполнен"   // Работа завершена
}

// Приоритет работы
export enum WorkPriority {
    LOW = "Низкий",
    NORMAL = "Обычный", 
    HIGH = "Высокий",
    URGENT = "Срочный"
}

// Информация о предложении водителя
export interface OfferInfo {
    id: string;
    workId: string;
    driverId: string;
    transportId: string;
    transportName: string;
    price: number;
    weight: number;
    comment: string;
    status: OfferStatus;
    createdAt: string;
    updatedAt?: string;
}

// Статусы предложения
export enum OfferStatus {
    PENDING = "Ожидает",
    ACCEPTED = "Принят",
    REJECTED = "Отклонен"
}

// Основная информация о работе (адаптированная CargoInfo)
export interface WorkInfo {
    guid: string;
    cargo: string;           // ID исходного груза
    recipient: string;       // ID заказчика
    client: string;          // Имя заказчика
    name: string;
    description: string;
    
    // Адреса (переиспользуем из Cargos)
    address: CargoAddress;
    destiny: CargoAddress;
    
    // Характеристики груза
    weight: number;
    volume: number;
    price: number;
    
    // Контакты
    phone: string;
    face: string;
    
    // Статус работы
    status: WorkStatus;
    priority?: WorkPriority;
    
    // Предложения
    offers?: OfferInfo[];
    currentOffer?: OfferInfo;  // Текущее предложение водителя
    
    // Метаданные
    createdAt?: string;
    updatedAt?: string;
}

// Данные для создания предложения
export interface CreateOfferData {
    workId: string;
    transportId: string;
    price: number;
    weight: number;
    comment?: string;
}

// Фильтры для списка работ
export interface WorkFilters {
    status?: WorkStatus[];
    cityFrom?: string;
    cityTo?: string;
    priceMin?: number;
    priceMax?: number;
    weightMin?: number;
    weightMax?: number;
    dateFrom?: string;
    dateTo?: string;
}

// Типы страниц для навигации
export type WorkPageType = 
    | { type: 'list' }
    | { type: 'view'; work: WorkInfo }
    | { type: 'offer'; work: WorkInfo };

// Состояние формы предложения
export interface OfferFormState {
    data: CreateOfferData;
    errors: ValidationErrors;
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
}

// Действия с формой предложения
export interface OfferFormActions {
    setFieldValue: (fieldPath: string, value: any) => void;
    resetForm: () => void;
    validateForm: () => ValidationResult;
    submitForm: () => Promise<boolean>;
}

// Хук управления работами
export interface UseWorksReturn {
    // Состояние
    works: WorkInfo[];
    isLoading: boolean;
    
    // Операции с предложениями
    createOffer: (data: CreateOfferData) => Promise<boolean>;
    updateOffer: (offerId: string, data: Partial<OfferInfo>) => Promise<boolean>;
    cancelOffer: (offerId: string) => Promise<boolean>;
    markCompleted: (workId: string) => Promise<boolean>;
    
    // Навигация
    currentPage: WorkPageType;
    navigateTo: (page: WorkPageType) => void;
    goBack: () => void;
    
    // Фильтрация и поиск
    filters: WorkFilters;
    setFilters: (filters: WorkFilters) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    
    // Утилиты
    getWork: (guid: string) => WorkInfo | undefined;
    refreshWorks: () => Promise<void>;
}

// Хук формы предложения
export interface UseOfferFormReturn {
    // Состояние формы
    formState: OfferFormState;
    
    // Действия
    actions: OfferFormActions;
    
    // Валидация
    validateField: (fieldPath: string) => string | null;
    hasErrors: () => boolean;
    getFieldError: (fieldPath: string) => string | undefined;
    
    // Инициализация
    initializeForm: (workInfo: WorkInfo) => void;

    getMaxWeight: () => number;
    getRecommendedPrice: () => number;
    getPricePerTon: () => number;
    canSubmit: () => boolean;

    workInfo?: WorkInfo;
}

// Транспорт водителя (для селекта)
export interface DriverTransport {
    guid: string;
    name: string;
    type: string;
    capacity: number;
    year?: number;
    number?: string;
}

// Параметры сортировки работ
export interface WorkSortOptions {
    field: 'createdAt' | 'price' | 'weight' | 'distance';
    direction: 'asc' | 'desc';
}

// Группировка работ для отображения
export interface WorkGroup {
    title: string;
    works: WorkInfo[];
    count: number;
}
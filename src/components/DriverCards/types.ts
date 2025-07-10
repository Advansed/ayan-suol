/**
 * Типы для компонента DriverCard
 */

export interface DriverInfo {
    guid: string;
    cargo: string;
    recipient: string;
    client: string;
    weight: number;
    status: DriverStatus;
    transport: string;
    capacity: string;
    rating: number;
    ratingCount: number;
    rate: number;
    comment?: string;
    price: number;
    accepted?: boolean;
}

export type DriverStatus = 'Заказано' | 'Принято' | 'Доставлено' | 'Отказано';

export type DriverCardMode = 'offered' | 'assigned' | 'delivered' | 'completed';

export interface TaskCompletion {
    delivered: boolean;
    documents: boolean;
}

export interface DriverCardProps {
    info: DriverInfo;
    mode: DriverCardMode;
    setPage?: (page: any) => void;
    onAccept?: (driver: DriverInfo) => Promise<void>;
    onReject?: (driver: DriverInfo) => Promise<void>;
    onComplete?: (driver: DriverInfo, rating: number, tasks: TaskCompletion) => Promise<void>;
    onChat?: (driver: DriverInfo) => void;
}

export interface UseDriverActionsProps {
    info: DriverInfo;
    mode: DriverCardMode;
    setPage?: (page: any) => void;
}

export interface UseDriverStateProps {
    info: DriverInfo;
    mode: DriverCardMode;
}

export interface ActionButtonsProps {
    mode: DriverCardMode;
    isLoading: boolean;
    canComplete: boolean;
    onAccept: () => void;
    onReject: () => void;
    onComplete: () => void;
    onChat: () => void;
}

export interface RatingSectionProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    tasks: TaskCompletion;
    onTaskChange: (key: keyof TaskCompletion, value: boolean) => void;
    isVisible: boolean;
}
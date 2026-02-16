/**
 * Утилиты для модуля Cargos
 */

import { CargoStatus } from '../Store/cargoStore';
import { 
    STATUS_CLASSES,
    STATUS_COLORS,
    STATUS_DESCRIPTIONS,
    EDITABLE_STATUSES,
    DELETABLE_STATUSES,
    PUBLISHABLE_STATUSES
} from './constants';

// ======================
// УТИЛИТЫ ФОРМАТИРОВАНИЯ
// ======================

export const formatters = {
    // Форматирование валюты
    currency: (amount: number): string => {
        try {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } catch {
            return `${amount} ₽`;
        }
    },

    // Форматирование веса
    weight: (weight: number, weight1 = 0): string => {
        const totalWeight = Math.max(0, weight - weight1);
        return `${totalWeight.toFixed(1)} тонн`;
    },

    // Форматирование объема
    volume: (volume: number): string => {
        return `${volume.toFixed(1)} м³`;
    },

    // Форматирование даты
    date: (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    },

    // Форматирование для input[type="date"]
    dateInput: (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return '';
        }
    },

    // Форматирование телефона
    phone: (phone: string): string => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        
        if (digits.length === 11 && digits.startsWith('7')) {
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
        }
        
        if (digits.length === 10) {
            return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
        }
        
        return phone;
    },

    // Короткий ID
    shortId: (guid: string): string => {
        return guid ? guid.substring(0, 6).toUpperCase() : '';
    },

    // Маршрут
    route: (fromCity: string, toCity: string): string => {
        if (!fromCity || !toCity) return '';
        return `${fromCity} → ${toCity}`;
    },

    // Адрес
    address: (city: string, address?: string): string => {
        if (!city) return '';
        if (!address || address.trim() === '') return city;
        return `${city}, ${address}`;
    },

    // Относительная дата
    relativeDate: (dateString: string): string => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            const diffTime = inputDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === -1) return 'вчера';
            if (diffDays === 0) return 'сегодня';
            if (diffDays === 1) return 'завтра';
            
            return formatters.date(dateString);
        } catch {
            return dateString;
        }
    }
};

// ======================
// УТИЛИТЫ СТАТУСОВ
// ======================

export const statusUtils = {
    // Получение CSS класса статуса
    getClassName: (status: CargoStatus): string => {
        return STATUS_CLASSES[status] || 'cr-status-1';
    },

    // Получение цвета статуса
    getColor: (status: CargoStatus): string => {
        return STATUS_COLORS[status] || '#1976d2';
    },

    // Получение описания статуса
    getDescription: (status: CargoStatus): string => {
        return STATUS_DESCRIPTIONS[status] || '';
    },

    // Проверка возможности редактирования
    canEdit: (status: CargoStatus): boolean => {
        return EDITABLE_STATUSES.includes(status);
    },

    // Проверка возможности удаления
    canDelete: (status: CargoStatus): boolean => {
        return DELETABLE_STATUSES.includes(status);
    },

    // Проверка возможности публикации
    canPublish: (status: CargoStatus): boolean => {
        return PUBLISHABLE_STATUSES.includes(status);
    },

    // Получение следующего статуса
    getNextStatus: (currentStatus: CargoStatus): CargoStatus | null => {
        switch (currentStatus) {
            case CargoStatus.NEW:               return CargoStatus.WAITING;
            case CargoStatus.WAITING:           return CargoStatus.HAS_ORDERS;
            case CargoStatus.HAS_ORDERS:        return CargoStatus.IN_WORK;
            case CargoStatus.NEGOTIATION:       return CargoStatus.IN_WORK;
            case CargoStatus.IN_WORK:           return CargoStatus.DELIVERED;
            case CargoStatus.DELIVERED:         return CargoStatus.COMPLETED;
            default:                            return null;
        }
    },

    // Получение прогресса в процентах
    getProgress: (status: CargoStatus): number => {
        const progressMap = {
            [ CargoStatus.NEW ]:            0,
            [ CargoStatus.WAITING ]:        20,
            [ CargoStatus.HAS_ORDERS ]:     40,
            [ CargoStatus.NEGOTIATION ]:    50,
            [ CargoStatus.IN_WORK ]:        70,
            [ CargoStatus.DELIVERED ]:      90,
            [ CargoStatus.COMPLETED ]:      100
        };
        return progressMap[status] || 0;
    }
};

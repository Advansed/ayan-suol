/**
 * Хук для работы с формой предложения
 */

import { useState, useCallback } from 'react';
import { WorkInfo, CreateOfferData, OfferFormState, UseOfferFormReturn } from '../types';
import { EMPTY_OFFER } from '../constants';

export const useOfferForm = (): UseOfferFormReturn => {
    // Состояние формы
    const [formState, setFormState] = useState<OfferFormState>({
        data: { ...EMPTY_OFFER },
        errors: {},
        isValid: false,
        isSubmitting: false,
        isDirty: false
    });

    // Информация о работе
    const [workInfo, setWorkInfo] = useState<WorkInfo | undefined>();

    // ======================
    // ДЕЙСТВИЯ С ФОРМОЙ
    // ======================

    const setFieldValue = useCallback((fieldPath: string, value: any) => {
        setFormState(prev => ({
            ...prev,
            data: { ...prev.data, [fieldPath]: value },
            isDirty: true
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormState({
            data: { ...EMPTY_OFFER },
            errors: {},
            isValid: false,
            isSubmitting: false,
            isDirty: false
        });
        setWorkInfo(undefined);
    }, []);

    const initializeForm = useCallback((work: WorkInfo) => {
        const initialData: CreateOfferData = {
            workId: work.guid,
            transportId: "",
            price: work.price, // Предустановленная цена из работы
            weight: work.weight, // Предустановленный вес
            comment: ""
        };
        
        setFormState({
            data: initialData,
            errors: {},
            isValid: false,
            isSubmitting: false,
            isDirty: false
        });
        
        setWorkInfo(work);
    }, []);

    const submitForm = useCallback(async (): Promise<boolean> => {
        setFormState(prev => ({
            ...prev,
            isSubmitting: true
        }));

        try {
            // Форма готова к отправке - результат будет обработан в useWorks
            console.log('Submitting offer form:', formState.data);
            
            // Имитация отправки
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setFormState(prev => ({
                ...prev,
                isSubmitting: false,
                isDirty: false
            }));

            return true;

        } catch (error) {
            console.error('Error submitting offer form:', error);
            setFormState(prev => ({ ...prev, isSubmitting: false }));
            return false;
        }
    }, [formState.data]);

    // ======================
    // УТИЛИТЫ
    // ======================

    const hasErrors = useCallback((): boolean => {
        return Object.keys(formState.errors).length > 0;
    }, [formState.errors]);

    const getFieldError = useCallback((fieldPath: string): string | undefined => {
        return formState.errors[fieldPath];
    }, [formState.errors]);

    // Дополнительные утилиты для формы предложения
    const getMaxWeight = useCallback((): number => {
        return workInfo?.weight || 50; // Максимальный вес по умолчанию
    }, [workInfo]);

    const getRecommendedPrice = useCallback((): number => {
        return workInfo?.price || 0;
    }, [workInfo]);

    const getPricePerTon = useCallback((): number => {
        if (!formState.data.weight || formState.data.weight <= 0) return 0;
        return formState.data.price / formState.data.weight;
    }, [formState.data.price, formState.data.weight]);

    // Проверка, можно ли отправить форму
    const canSubmit = useCallback((): boolean => {
        return formState.isDirty && 
               !formState.isSubmitting &&
               formState.data.transportId !== "" &&
               formState.data.price > 0 &&
               formState.data.weight > 0;
    }, [formState]);

    // ======================
    // ВОЗВРАТ ИНТЕРФЕЙСА
    // ======================

    return {
        // Состояние формы
        formState,

        // Действия
        actions: {
            setFieldValue,
            resetForm,
            submitForm
        },

        // Валидация (оставлены пустые функции для совместимости)
        validateField: () => null,
        hasErrors,
        getFieldError,

        // Инициализация
        initializeForm,

        // Дополнительные утилиты
        getMaxWeight,
        getRecommendedPrice,
        getPricePerTon,
        canSubmit,
        workInfo
    };
};
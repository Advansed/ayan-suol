/**
 * Хук для работы с формой предложения
 */

import { useState, useCallback } from 'react';
import { WorkInfo, CreateOfferData, OfferFormState, UseOfferFormReturn } from '../types';
import { EMPTY_OFFER } from '../constants';
import { validateOfferField, validateOfferForm, workDataUtils } from '../utils';
import { ValidationResult } from '../../Cargos/types';

export const useOfferForm = (): UseOfferFormReturn => {
    // Состояние формы
    const [formState, setFormState] = useState<OfferFormState>({
        data: { ...EMPTY_OFFER },
        errors: {},
        isValid: false,
        isSubmitting: false,
        isDirty: false
    });

    // Информация о работе (для валидации)
    const [workInfo, setWorkInfo] = useState<WorkInfo | undefined>();

    // ======================
    // ВАЛИДАЦИЯ
    // ======================

    const validateFieldInternal = useCallback((fieldPath: string): string | null => {
        const value = formState.data[fieldPath];
        return validateOfferField(fieldPath, value, workInfo);
    }, [formState.data, workInfo]);

    const validateFormInternal = useCallback((): ValidationResult => {
        return validateOfferForm(formState.data, workInfo);
    }, [formState.data, workInfo]);

    const updateFormValidation = useCallback((newData: CreateOfferData) => {
        const validationResult = validateOfferForm(newData, workInfo);
        return {
            errors: validationResult.errors,
            isValid: validationResult.isValid
        };
    }, [workInfo]);

    // ======================
    // ДЕЙСТВИЯ С ФОРМОЙ
    // ======================

    const setFieldValue = useCallback((fieldPath: string, value: any) => {
        setFormState(prev => {
            const newData = { ...prev.data, [fieldPath]: value };
            const validation = updateFormValidation(newData);
            
            return {
                ...prev,
                data: newData,
                errors: validation.errors,
                isValid: validation.isValid,
                isDirty: true
            };
        });
    }, [updateFormValidation]);

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
        
        const validation = updateFormValidation(initialData);
        
        setFormState({
            data: initialData,
            errors: validation.errors,
            isValid: validation.isValid,
            isSubmitting: false,
            isDirty: false
        });
        
        setWorkInfo(work);
    }, [updateFormValidation]);

    const submitForm = useCallback(async (): Promise<boolean> => {
        // Валидируем форму перед отправкой
        const validationResult = validateFormInternal();
        const { errors, isValid } = validationResult;

        setFormState(prev => ({
            ...prev,
            errors,
            isValid,
            isSubmitting: true
        }));

        if (!isValid) {
            setFormState(prev => ({ ...prev, isSubmitting: false }));
            return false;
        }

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
    }, [formState.data, validateFormInternal]);

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
        return formState.isValid && 
               formState.isDirty && 
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
            validateForm: validateFormInternal,
            submitForm
        },

        // Валидация
        validateField: validateFieldInternal,
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
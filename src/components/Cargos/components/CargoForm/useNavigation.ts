// src/Store/useNavigation.ts

import { useState, useCallback } from 'react'

// ============================================
// ТИПЫ
// ============================================

interface ValidationErrors {
    [fieldPath: string]: string
}

interface UseNavigationReturn {
    currentStep: number
    gotoStep: (step: number) => void
    
    // Валидация
    errors: ValidationErrors
    validateStep: (step: number, formData: any) => boolean
    getFieldError: (field: string) => string | undefined
}

// ============================================
// КОНСТАНТЫ
// ============================================

const STEP_FIELDS = {
    1: ['name', 'description'],
    2: ['address.address'],
    3: ['destiny.address'], 
    4: ['pickup_date', 'delivery_date'],
    5: ['weight', 'price', 'cost'],
    6: ['phone', 'face'],
    7: []
}

const TOTAL_STEPS = 7

// ============================================
// ВАЛИДАЦИЯ
// ============================================

const getValueByPath = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

const validateField = (field: string, value: any): string | null => {
    if (!value && typeof value !== 'number') {
        switch (field) {
            case 'name': return 'Название обязательно'
            case 'description': return 'Описание обязательно'
            case 'address.address': return 'Адрес отправления обязателен'
            case 'destiny.address': return 'Адрес назначения обязателен'
            case 'pickup_date': return 'Дата загрузки обязательна'
            case 'delivery_date': return 'Дата доставки обязательна'
            case 'weight': return 'Вес обязателен'
            case 'price': return 'Цена обязательна'
            case 'phone': return 'Телефон обязателен'
            default: return 'Поле обязательно'
        }
    }
    
    // Дополнительные проверки
    if (field === 'weight' && value <= 0) return 'Вес должен быть больше 0'
    if (field === 'price' && value <= 0) return 'Цена должна быть больше 0'
    if (field === 'phone' && value.length < 10) return 'Некорректный номер телефона'
    
    return null
}

// ============================================
// HOOK
// ============================================

export const useNavigation = (initialStep: number = 1): UseNavigationReturn => {
    const [currentStep, setCurrentStep] = useState<number>(initialStep)
    const [errors, setErrors] = useState<ValidationErrors>({})

    const gotoStep = useCallback((step: number) => {
        if (step >= 1 && step <= TOTAL_STEPS) {
            setCurrentStep(step)
        }
    }, [])

    const validateStep = useCallback((step: number, formData: any): boolean => {
        const fields = STEP_FIELDS[step as keyof typeof STEP_FIELDS] || []
        const stepErrors: ValidationErrors = {}
        
        fields.forEach(field => {
            const value = getValueByPath(formData, field)
            const error = validateField(field, value)
            if (error) {
                stepErrors[field] = error
            }
        })
        
        setErrors(stepErrors)
        
        return Object.keys(stepErrors).length === 0
    }, [])

    const getFieldError = useCallback((field: string): string | undefined => {
        return errors[field]
    }, [errors])

    return {
        currentStep,
        gotoStep,
        errors,
        validateStep,
        getFieldError
    }
}
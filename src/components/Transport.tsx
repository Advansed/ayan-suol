import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IonButton, IonInput, IonIcon, IonSpinner, IonAlert, IonText } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { isEqual } from 'lodash';
import { Store } from './Store';
import socketService from './Sockets';

// Типизация для информации о транспорте
interface TransportInfo {
    guid?: string;
    type?: string;
    capacity?: number;
    year?: number;
    number?: string;
    exp?: number;
    name?: string;
}

// Типы для валидации
interface ValidationError {
    field: string;
    message: string;
}

interface FormErrors {
    [key: string]: string;
}

// Пропсы компонента
interface TransportProps {
    setPage: (page: number) => void;
}

// Custom hook для управления формой транспорта
const useTransportForm = (initialData: TransportInfo | null) => {
    const [transportInfo, setTransportInfo] = useState<TransportInfo>(initialData || {});
    const [originalInfo, setOriginalInfo] = useState<TransportInfo>(initialData || {});
    const [errors, setErrors] = useState<FormErrors>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Валидация полей
    const validateField = useCallback((field: string, value: string): string | null => {
        switch (field) {
            case 'ГодВыпуска':
                if (value.trim() === '') return null;
                const year = parseInt(value);
                if (isNaN(year)) return 'Год должен быть числом';
                if (year < 1900 || year > new Date().getFullYear() + 1) {
                    return `Год должен быть между 1900 и ${new Date().getFullYear() + 1}`;
                }
                break;
                
            case 'ГрузоПодъемность':
                if (value.trim() === '') return null;
                const capacity = parseFloat(value);
                if (isNaN(capacity)) return 'Грузоподъемность должна быть числом';
                if (capacity <= 0) return 'Грузоподъемность должна быть положительной';
                if (capacity > 100) return 'Грузоподъемность не может превышать 100 тонн';
                break;
                
            // case 'ГосНомер':
            //     if (value.trim() === '') return null;
            //     // Простая проверка российского номера
            //     if (!/^[АВЕКМНОРСТУХABEKMHOPCTYX]\d{3}[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\d{2,3}$/i.test(value.replace(/\s/g, ''))) {
            //         return 'Некорректный формат гос. номера';
            //     }
            //     break;
                
            case 'Опыт':
                if (value.trim() === '') return null;
                const experience = parseInt(value);
                if (isNaN(experience)) return 'Опыт должен быть числом';
                if (experience < 0) return 'Опыт не может быть отрицательным';
                if (experience > 70) return 'Опыт не может превышать 70 лет';
                break;
                
            case 'ТипТранспорта':
                if (value.trim() === '') return null;
                if (value.length < 2) return 'Тип транспорта должен содержать минимум 2 символа';
                if (value.length > 50) return 'Тип транспорта не может превышать 50 символов';
                break;
        }
        return null;
    }, []);

    // Обновление поля с валидацией
    const updateField = useCallback((field: string, value: string) => {
        const error = validateField(field, value);
        
        setErrors(prev => ({
            ...prev,
            [field]: error || ''
        }));
        
        setTransportInfo(prev => {
            const updated = { ...prev, [field]: value };
            const changed = !isEqual(updated, originalInfo);
            setHasChanges(changed);
            return updated;
        });
    }, [originalInfo, validateField]);

    // Сброс формы
    const resetForm = useCallback(() => {
        setTransportInfo({ ...originalInfo });
        setErrors({});
        setHasChanges(false);
    }, [originalInfo]);

    // Валидация всей формы
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        Object.keys(transportInfo).forEach(field => {
            if (field !== 'guid') {
                const value = String(transportInfo[field] || '');
                const error = validateField(field, value);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [transportInfo, validateField]);

    // Обновление исходных данных после успешного сохранения
    const updateOriginalData = useCallback((newData: TransportInfo) => {
        setOriginalInfo(newData);
        setTransportInfo(newData);
        setHasChanges(false);
        setErrors({});
    }, []);

    return {
        transportInfo,
        errors,
        hasChanges,
        updateField,
        resetForm,
        validateForm,
        updateOriginalData,
        hasErrors: Object.values(errors).some(error => error !== '')
    };
};

// Основной компонент Transport
const Transport: React.FC<TransportProps> = ({ setPage }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [showResetAlert, setShowResetAlert] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const mountedRef = useRef(true);

    // Получаем начальные данные из Store
    console.log("transport")
    const initialData = Store.getState().transport[0] || null;
    console.log(initialData)
    
    // Используем custom hook для управления формой
    const {
        transportInfo,
        errors,
        hasChanges,
        updateField,
        resetForm,
        validateForm,
        updateOriginalData,
        hasErrors
    } = useTransportForm(initialData);

    // Функция сохранения
    const handleSave = useCallback(async () => {
        if (!mountedRef.current || isSaving || !hasChanges) return;
        console.log( 'save ')
        // Валидируем форму перед отправкой
        if (!validateForm()) {
            Store.dispatch({
                type: "message",
                data: { type: "error", message: "Исправьте ошибки в форме" }
            });
            console.log( "Исправьте ошибки в форме" )
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const saveData = {
                ...transportInfo,
                token: Store.getState().login?.token
            };

            if (!saveData.token) {
                throw new Error('Нет токена авторизации');
            }

            console.log(saveData)
            const success = socketService.emit('transport', saveData);
            
            if (!success) {
                throw new Error('Нет подключения к серверу');
            }
        } catch (error) {
            console.error('Error saving transport:', error);
            if (mountedRef.current) {
                setIsSaving(false);
                Store.dispatch({
                    type: "message",
                    data: { 
                        type: "error", 
                        message: error instanceof Error ? error.message : "Ошибка при сохранении" 
                    }
                });
            }
        }
    }, [transportInfo, hasChanges, isSaving, validateForm]);

    // Обработчик сброса с подтверждением
    const handleReset = useCallback(() => {
        if (hasChanges) {
            setShowResetAlert(true);
        }
    }, [hasChanges]);

    // Подтверждение сброса
    const confirmReset = useCallback(() => {
        resetForm();
        setShowResetAlert(false);
    }, [resetForm]);

    // Рендеринг поля ввода с валидацией
    const renderInputField = useCallback((
        label: string, 
        fieldKey: keyof TransportInfo, 
        containerClass: string = "mt-05",
        inputType: 'text' | 'number' = 'text'
    ) => {
        console.log(fieldKey)
        console.log(transportInfo[fieldKey])
        const value = transportInfo[fieldKey] || '';
        const error = errors[fieldKey];
        
        return (
            <div className={containerClass}>
                <div className="mb-05">{label}</div>
                <div className="c-input">
                    <IonInput
                        placeholder={label}
                        value={String(value)}
                        type={inputType}
                        className={error ? 'ion-invalid' : ''}
                        onIonInput={(e) => {
                            updateField(fieldKey, e.detail.value || '');
                        }}
                        onIonBlur={() => {
                            // Принудительная валидация при потере фокуса
                            const currentValue = String(transportInfo[fieldKey] || '');
                            const validationError = errors[fieldKey];
                            if (!validationError && currentValue) {
                                updateField(fieldKey, currentValue);
                            }
                        }}
                    />
                </div>
                {error && (
                    <IonText color="danger" className="fs-08 mt-02">
                        <div>{error}</div>
                    </IonText>
                )}
            </div>
        );
    }, [transportInfo, errors, updateField]);

    // Настройка Socket.IO обработчиков
    useEffect(() => {
        mountedRef.current = true;

        const socket = socketService.getSocket();
        if (!socket) {
            console.error('Socket not available');
            return;
        }

        // Обработчик ответа от сервера
        const handleTransportResponse = (response: any) => {
            if (!mountedRef.current) return;

            setIsSaving(false);

            if (response?.success) {
                console.log('Transport saved successfully:', response.data);
                setSaveSuccess(true);
                
                // Обновляем данные в Store и форме
                if (response.data) {
                    Store.dispatch({ type: "transport", data: [response.data] });
                    updateOriginalData(response.data);
                }
                
                Store.dispatch({
                    type: "message",
                    data: { type: "success", message: "Информация о транспорте сохранена" }
                });

                // Скрываем индикатор успеха через 3 секунды
                setTimeout(() => {
                    if (mountedRef.current) {
                        setSaveSuccess(false);
                    }
                }, 3000);
            } else {
                console.error('Error saving transport:', response?.message);
                Store.dispatch({
                    type: "message",
                    data: { 
                        type: "error", 
                        message: response?.message || "Ошибка при сохранении данных" 
                    }
                });
            }
        };

        socket.on('save_transport', handleTransportResponse);

        // Cleanup
        return () => {
            mountedRef.current = false;
            socket.off('save_transport', handleTransportResponse);
        };
    }, [updateOriginalData]);

    return (
        <div>
            {/* Кнопка назад */}
            <div className="clickable" onClick={() => setPage(0)}>
                <IonIcon icon={arrowBackOutline} className="ml-1 mt-1 w-15 h-15" />
            </div>

            <div className="mt-1 ml-1 mr-1 fs-09">
                {/* Заголовок */}
                <div className="fs-12 mb-1">
                    <b>Информация о транспорте</b>
                    {saveSuccess && (
                        <IonText color="success" className="ml-1 fs-08">
                            ✓ Сохранено
                        </IonText>
                    )}
                </div>

                {/* Поля ввода */}
                {renderInputField(
                    "Тип транспорта", 
                    "type", 
                    "mt-1")}
                {renderInputField(
                    "Грузоподъемность (тонн)", 
                    "capacity", 
                    "mt-05", 
                    "number")}
                {renderInputField(
                    "Год выпуска", 
                    "year", 
                    "mt-05", 
                    "number")}
                {renderInputField(
                    "Гос. номер", 
                    "number")}
                {renderInputField(
                    "Опыт вождения (лет)", 
                    "exp", 
                    "mt-05", 
                    "number")}

                {/* Раздел документов (заглушка) */}
                <div className="mt-1">
                    <div className="mb-05">Документы</div>
                    <IonText color="medium" className="fs-08">
                        <div>Функционал загрузки документов будет добавлен позднее</div>
                    </IonText>
                </div>

                {/* Кнопки управления */}
                <div className="mt-2 flex fl-space">
                    <IonButton
                        fill="clear"
                        color="medium"
                        onClick={handleReset}
                        disabled={!hasChanges || isSaving}
                    >
                        Отменить
                    </IonButton>

                    <IonButton
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving || hasErrors}
                        className="ml-1 bg-2"
                        mode="ios"
                    >
                        {isSaving ? (
                            <>
                                <IonSpinner name="crescent" className="mr-05" />
                                Сохранение...
                            </>
                        ) : (
                            'Сохранить'
                        )}
                    </IonButton>
                </div>

                {/* Индикатор наличия изменений */}
                {hasChanges && !isSaving && (
                    <IonText color="warning" className="fs-08 mt-1">
                        <div>У вас есть несохраненные изменения</div>
                    </IonText>
                )}
            </div>

            {/* Диалог подтверждения сброса */}
            <IonAlert
                isOpen={showResetAlert}
                onDidDismiss={() => setShowResetAlert(false)}
                header="Подтверждение"
                message="Отменить все несохраненные изменения?"
                buttons={[
                    {
                        text: 'Отмена',
                        role: 'cancel',
                        cssClass: 'secondary'
                    },
                    {
                        text: 'Подтвердить',
                        handler: confirmReset
                    }
                ]}
            />
        </div>
    );
};

export default Transport;
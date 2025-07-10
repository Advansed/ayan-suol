/**
 * Компонент формы груза
 */

import React from 'react';
import { 
    IonIcon, 
    IonInput, 
    IonTextarea, 
    IonButton,
    IonLabel,
    IonLoading
} from '@ionic/react';
import { 
    locationOutline, 
    calendarOutline,
    arrowBackOutline,
    cloudUploadOutline,
    trashBinOutline
} from 'ionicons/icons';
import { CargoInfo } from '../types';
import { UseCargoFormReturn } from '../hooks';
import { formatters, statusUtils } from '../utils';

interface CargoFormProps {
    formHook: UseCargoFormReturn;
    onSave: () => Promise<void>;
    onCancel: () => void;
    onDelete?: () => Promise<void>;
    title?: string;
    isLoading?: boolean;
}

export const CargoForm: React.FC<CargoFormProps> = ({
    formHook,
    onSave,
    onCancel,
    onDelete,
    title,
    isLoading = false
}) => {
    const { formState, actions, validateField, hasErrors, getFieldError, mode } = formHook;
    const { data, errors, isValid, isSubmitting } = formState;

    const handleSave = async () => {
        try {
            await onSave();
        } catch (error) {
            console.error('Error saving cargo:', error);
        }
    };

    const handleDelete = async () => {
        if (onDelete) {
            try {
                await onDelete();
            } catch (error) {
                console.error('Error deleting cargo:', error);
            }
        }
    };

    const renderFieldError = (fieldPath: string) => {
        const error = getFieldError(fieldPath);
        if (error) {
            return (
                <div className="fs-07 cl-danger mt-02">
                    {error}
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <IonLoading isOpen={isLoading || isSubmitting} message="Подождите..." />
            
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon 
                    icon={arrowBackOutline} 
                    className="w-15 h-15" 
                    onClick={onCancel}
                    style={{ cursor: 'pointer' }}
                />
                <div className="a-center w-90 fs-09">
                    <b>{title || (mode === 'create' ? 'Создать новый заказ' : 'Редактировать заказ')}</b>
                </div>
            </div>

            {/* Ошибки валидации */}
            {hasErrors() && (
                <div className="cr-card mt-05" style={{backgroundColor: '#ffe6e6'}}>
                    <div className="fs-09" style={{color: '#d32f2f'}}>
                        <b>Ошибки валидации:</b>
                        <ul>
                            {Object.entries(errors).map(([field, error]) => (
                                <li key={field}>{error}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Основная информация */}
            <div className="cr-card mt-05">
                <div className="fs-09"><b>Основная информация</b></div>
                
                <div>
                    <div className="fs-08 mt-05">Название груза</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={data.name}
                            placeholder="Введите название груза..."
                            onIonInput={(e) => actions.setFieldValue('name', e.detail.value as string)}
                        />
                        {renderFieldError('name')}
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Описание груза</div>
                    <div className="c-input">
                        <IonTextarea 
                            value={data.description}
                            placeholder="Описание груза, особенности перевозки..."
                            rows={3}
                            onIonInput={(e) => actions.setFieldValue('description', e.detail.value as string)}
                        />
                        {renderFieldError('description')}
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Клиент</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={data.client}
                            placeholder="Название компании клиента..."
                            onIonInput={(e) => actions.setFieldValue('client', e.detail.value as string)}
                        />
                        {renderFieldError('client')}
                    </div>
                </div>
            </div>

            {/* Маршрут */}
            <div className="cr-card mt-05">
                <div className="fs-09"><b>Маршрут</b></div>
                
                <div>
                    <div className="fs-08 mt-05">Город отправления</div>
                    <div className="flex">
                        <IonIcon icon={locationOutline} className="w-10 h-15" color="danger"/>
                        <div className="c-input flex w-90">
                            <IonInput 
                                className="custom-input"
                                value={data.address?.city || ''}
                                placeholder="Город отправления..."
                                onIonInput={(e) => 
                                    actions.setNestedValue('address', 'city', e.detail.value as string)
                                }
                            />
                        </div>
                    </div>
                    {renderFieldError('address.city')}
                </div>

                <div>
                    <div className="fs-08 mt-05">Город назначения</div>
                    <div className="flex">
                        <IonIcon icon={locationOutline} className="w-10 h-15" color="success"/>
                        <div className="c-input flex w-90">
                            <IonInput 
                                className="custom-input"
                                value={data.destiny?.city || ''}
                                placeholder="Город назначения..."
                                onIonInput={(e) => 
                                    actions.setNestedValue('destiny', 'city', e.detail.value as string)
                                }
                            />
                        </div>
                    </div>
                    {renderFieldError('destiny.city')}
                </div>

                <div className="flex mt-05">
                    <div className="w-50">
                        <div className="fs-08">Дата загрузки</div>
                        <div className="flex">
                            <IonIcon icon={calendarOutline} className="w-2 h-2" color="danger"/>
                            <div className="c-input ml-05 w-90">
                                <IonInput 
                                    className="custom-input fs-08"
                                    value={formatters.dateInput(data.address?.date || '')}
                                    type="date"
                                    onIonInput={(e) => 
                                        actions.setNestedValue('address', 'date', e.detail.value as string)
                                    }
                                />
                            </div>
                        </div>
                        {renderFieldError('address.date')}
                    </div>

                    <div className="w-50 ml-05">
                        <div className="fs-08">Дата выгрузки</div>
                        <div className="flex">
                            <IonIcon icon={calendarOutline} className="w-2 h-2" color="success"/>
                            <div className="c-input ml-05 mr-1 w-90">
                                <IonInput 
                                    className="custom-input"
                                    value={formatters.dateInput(data.destiny?.date || '')}
                                    type="date"
                                    onIonInput={(e) => 
                                        actions.setNestedValue('destiny', 'date', e.detail.value as string)
                                    }
                                />
                            </div>
                        </div>
                        {renderFieldError('destiny.date')}
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Адрес погрузки</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={data.address?.address || ''}
                            placeholder="Точный адрес погрузки..."
                            onIonInput={(e) => 
                                actions.setNestedValue('address', 'address', e.detail.value as string)
                            }
                        />
                        {renderFieldError('address.address')}
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Адрес разгрузки</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={data.destiny?.address || ''}
                            placeholder="Точный адрес разгрузки..."
                            onIonInput={(e) => 
                                actions.setNestedValue('destiny', 'address', e.detail.value as string)
                            }
                        />
                        {renderFieldError('destiny.address')}
                    </div>
                </div>
            </div>

            {/* Характеристики груза */}
            <div className="cr-card mt-05">
                <div className="fs-09"><b>Характеристики груза</b></div>
                
                <div className="flex">
                    <div className="w-50">
                        <div className="fs-08 mt-05">Вес (тонн)</div>
                        <div className="c-input">
                            <IonInput 
                                className="custom-input"
                                value={data.weight}
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="0.0"
                                onIonInput={(e) => 
                                    actions.setFieldValue('weight', parseFloat(e.detail.value as string) || 0)
                                }
                            />
                        </div>
                        {renderFieldError('weight')}
                    </div>

                    <div className="w-50 ml-1">
                        <div className="fs-08 mt-05">Объем (м³)</div>
                        <div className="c-input">
                            <IonInput 
                                className="custom-input"
                                value={data.volume}
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="0.0"
                                onIonInput={(e) => 
                                    actions.setFieldValue('volume', parseFloat(e.detail.value as string) || 0)
                                }
                            />
                        </div>
                        {renderFieldError('volume')}
                    </div>
                </div>

                <div>
                    <div className="fs-08 mt-05">Цена (₽)</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={data.price}
                            type="number"
                            min="0"
                            step="100"
                            placeholder="0"
                            onIonInput={(e) => 
                                actions.setFieldValue('price', parseInt(e.detail.value as string) || 0)
                            }
                        />
                    </div>
                    {renderFieldError('price')}
                </div>
            </div>

            {/* Контакты */}
            <div className="cr-card mt-05">
                <div className="fs-09"><b>Контактная информация</b></div>
                
                <div>
                    <div className="fs-08 mt-05">Контактное лицо</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={data.face}
                            placeholder="ФИО контактного лица..."
                            onIonInput={(e) => 
                                actions.setFieldValue('face', e.detail.value as string)
                            }
                        />
                    </div>
                    {renderFieldError('face')}
                </div>

                <div>
                    <div className="fs-08 mt-05">Телефон</div>
                    <div className="c-input">
                        <IonInput 
                            className="custom-input"
                            value={data.phone}
                            type="tel"
                            placeholder="+7 (XXX) XXX-XX-XX"
                            onIonInput={(e) => 
                                actions.setFieldValue('phone', e.detail.value as string)
                            }
                        />
                    </div>
                    {renderFieldError('phone')}
                </div>
            </div>

            {/* Статус (только в режиме редактирования) */}
            {mode === 'edit' && data.guid && (
                <div className="cr-card mt-05">
                    <div className="fs-09"><b>Статус заказа</b></div>
                    <div className="flex">
                        <div className={statusUtils.getClassName(data.status)}>
                            {data.status}
                        </div>
                        <div className="ml-1 fs-07 cl-black">
                            ID: {formatters.shortId(data.guid)}
                        </div>
                    </div>
                    <div className="fs-08 mt-05 cl-gray">
                        {statusUtils.getDescription(data.status)}
                    </div>
                </div>
            )}

            {/* Кнопки действий */}
            <div className="flex mt-05">
                <div 
                    className={`cr-card flex w-50 ${!isValid ? 'opacity-50' : ''}`}
                    onClick={isValid ? handleSave : undefined}
                    style={{ cursor: isValid ? 'pointer' : 'not-allowed' }}
                >
                    <IonIcon icon={cloudUploadOutline} className="w-15 h-15" color="success" />
                    <b className="fs-09 ml-1">Сохранить</b>
                </div>
                
                {mode === 'edit' && onDelete && data.status && statusUtils.canDelete(data.status) && (
                    <div 
                        className="cr-card flex w-50"
                        onClick={handleDelete}
                        style={{ cursor: 'pointer' }}
                    >
                        <IonIcon icon={trashBinOutline} className="w-15 h-15" color="danger" />
                        <b className="fs-09 ml-1">Удалить</b>
                    </div>
                )}
            </div>
        </>
    );
};
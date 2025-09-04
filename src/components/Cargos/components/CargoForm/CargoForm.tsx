import React, { useEffect, useRef, useState } from 'react';
import { IonInput, IonTextarea, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons';
import { useToast } from '../../../Toast';
import styles from './CargoForm.module.css';
import { AddressSuggestions } from 'react-dadata';
import '../../../../../node_modules/react-dadata/dist/react-dadata.css';
import { Step5 } from './Step5';
import { useHistory } from 'react-router';
import { useStoreField } from '../../../Store';
import { calculateCompanyCompletion } from '../../../utils';
import { useCargos } from '../../../../Store/useCargos';
import { CargoInfo, EMPTY_CARGO } from '../../../../Store/cargoStore';
import { useNavigation } from './useNavigation';

interface CargoFormProps {
  cargo?: CargoInfo;
  onBack: () => void;
  onSave?: (data: CargoInfo) => Promise<void>;
}

export const CargoForm: React.FC<CargoFormProps> = ({ cargo, onBack, onSave }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const hist = useHistory();
  
  const companyData = useStoreField('company', 21);
  const companyCompletion = calculateCompanyCompletion(companyData);
  const isCompanyIncomplete = companyCompletion < 70;

  // Хуки
  const { currentStep, gotoStep, validateStep, getFieldError } = useNavigation();
  const { createCargo, updateCargo } = useCargos();
  
  // Состояние формы
  const [formData, setFormData] = useState<CargoInfo>(EMPTY_CARGO);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Инициализация формы
  useEffect(() => {
    setFormData(cargo ? { ...cargo } : { ...EMPTY_CARGO });
  }, [cargo]);

  // ======================
  // ХЕЛПЕРЫ РАБОТЫ С ФОРМОЙ  
  // ======================
  
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getValueByPath = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const setValueByPath = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const result = { ...obj };
    
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return result;
  };

  const setFieldValue = (fieldPath: string, value: any) => {
    setFormData(prev => setValueByPath(prev, fieldPath, value));
  };

  const setNestedValue = (parent: keyof CargoInfo, field: string, value: any) => {
    const fieldPath = `${parent}.${field}`;
    setFieldValue(fieldPath, value);
  };

  // ======================
  // НАВИГАЦИЯ
  // ======================
  
  const handleBackNavigation = () => {
    if (currentStep > 1) {
      gotoStep(currentStep - 1);
      scrollToTop();
    } else {
      onBack();
    }
  };

  const handleForwardNavigation = () => {
    // Проверка незавершенности компании
    if (isCompanyIncomplete) {
      gotoStep(0); // Особый шаг для завершения компании
      return;
    }
    
    if (currentStep < 7) {
      // Валидируем текущий шаг
      const isValid = validateStep(currentStep, formData);
      
      if (isValid) {
        gotoStep(currentStep + 1);
        scrollToTop();
      } else {
        // Показываем ошибки валидации
        toast.info('Заполните все обязательные поля');
      }
    }
  };

  // ======================
  // СОХРАНЕНИЕ
  // ======================
  
  const handleSave = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (cargo) {
        // Редактирование
        await updateCargo(formData.guid, formData);
      } else {
        // Создание
        await createCargo(formData);
      }
      
      toast.success('Груз сохранен!');
      onBack();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================
  // РЕНДЕР ШАГОВ
  // ======================
  
  const renderStepContent = () => {
    if (currentStep === 0) {
      // Особый шаг для завершения компании
      return (
        <div className={styles.companyWarning}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningText}>
            <div className={styles.warningTitle}>
              Заполните профиль компании
            </div>
            <div className={styles.warningSubtitle}>
              Для создания груза необходимо заполнить профиль компании минимум на 70%
            </div>
          </div>
          <button 
            className={styles.profileButton}
            onClick={() => hist.push('/tab3')}
          >
            Перейти
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.field}>
              <label className={styles.label}>Название груза</label>
              <div className={styles.inputWrapper}>
                <IonInput
                  className={styles.customInput}
                  placeholder="Например: Мебель, стройматериалы..."
                  value={formData.name || ''}
                  onIonInput={(e) => setFieldValue('name', e.detail.value!)}
                />
              </div>
              {getFieldError('name') && (
                <div className={styles.errorMsg}>{getFieldError('name')}</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Описание груза</label>
              <div className={styles.inputWrapper}>
                <IonTextarea
                  className={styles.customTextarea}
                  placeholder="Подробное описание, особенности упаковки..."
                  value={formData.description || ''}
                  onIonInput={(e) => setFieldValue('description', e.detail.value!)}
                />
              </div>
              {getFieldError('description') && (
                <div className={styles.errorMsg}>{getFieldError('description')}</div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionTitle}>Откуда забрать груз</div>
            
            <div className={styles.field}>
              <label className={styles.label}>Город загрузки</label>
              <AddressSuggestions
                token="50bfb3453a528d091723900fdae5ca5a30369832"
                filterToBound='city'
                filterFromBound='city'
                value={{ value: formData.address?.city.city} as any }
                onChange={(suggestion) => {
                  if (suggestion) {
                    setFieldValue('address.city.city', suggestion.data.city );
                    setFieldValue('address.city.fias', suggestion.data.city_fias_id );
                  }
                }}
              />
            </div>
            {
              formData.address?.city.fias && (
                <div className={styles.field}>
                  <label className={styles.label}>Адрес загрузки</label>
                  <AddressSuggestions
                    token="50bfb3453a528d091723900fdae5ca5a30369832"
                    filterLocations={[{ city_fias_id: formData.address.city.fias }]}
                    filterRestrictValue
                    value={{ value: formData.address?.address} as any }
                    onChange={(suggestion) => {
                      if (suggestion) {
                        setFieldValue('address.address', suggestion.value );
                        setFieldValue('address.fias', suggestion.data.fias_id );
                        setFieldValue('address.lat', suggestion.data.geo_lat );
                        setFieldValue('address.lon', suggestion.data.geo_lon );
                      }
                    }}
                  />
                  {getFieldError('address.address') && (
                    <div className={styles.errorMsg}>{getFieldError('address.address')}</div>
                  )}
                </div>
              )
            }
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionTitle}>Куда доставить груз</div>
            
            <div className={styles.field}>
              <label className={styles.label}>Город загрузки</label>
              <AddressSuggestions
                token="50bfb3453a528d091723900fdae5ca5a30369832"
                filterToBound='city'
                filterFromBound='city'
                value={{ value: formData.destiny?.city.city} as any }
                onChange={(suggestion) => {
                  if (suggestion) {
                    setFieldValue('destiny.city.city', suggestion.data.city );
                    setFieldValue('destiny.city.fias', suggestion.data.city_fias_id );
                  }
                }}
              />
            </div>
            {
              formData.destiny?.city.fias && (
                <div className={styles.field}>
                  <label className={styles.label}>Адрес загрузки</label>
                  <AddressSuggestions
                    token="50bfb3453a528d091723900fdae5ca5a30369832"
                    filterLocations={[{ city_fias_id: formData.destiny.city.fias }]}
                    filterRestrictValue
                    value={{ value: formData.destiny?.address} as any }
                    onChange={(suggestion) => {
                      if (suggestion) {
                        setFieldValue('destiny.address', suggestion.value );
                        setFieldValue('destiny.fias', suggestion.data.fias_id );
                        setFieldValue('destiny.lat', suggestion.data.geo_lat );
                        setFieldValue('destiny.lon', suggestion.data.geo_lon );
                      }
                    }}
                  />
                  {getFieldError('destiny.address') && (
                    <div className={styles.errorMsg}>{getFieldError('destiny.address')}</div>
                  )}
                </div>
              )
            }
          </div>
        );

      case 4:
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionTitle}>Даты перевозки</div>
            
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Дата загрузки</label>
                <div className={styles.inputWrapper}>
                  <IonInput
                    className={styles.customInput}
                    type="date"
                    value={formData.pickup_date || ''}
                    onIonInput={(e) => setFieldValue('pickup_date', e.detail.value!)}
                  />
                </div>
                {getFieldError('pickup_date') && (
                  <div className={styles.errorMsg}>{getFieldError('pickup_date')}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Дата доставки</label>
                <div className={styles.inputWrapper}>
                  <IonInput
                    className={styles.customInput}
                    type="date"
                    value={formData.delivery_date || ''}
                    onIonInput={(e) => setFieldValue('delivery_date', e.detail.value!)}
                  />
                </div>
                {getFieldError('delivery_date') && (
                  <div className={styles.errorMsg}>{getFieldError('delivery_date')}</div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <Step5
            data={formData}
            setFieldValue={setFieldValue}
            getFieldError={getFieldError}
          />
        );

      case 6:
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionTitle}>Контактная информация</div>
            
            <div className={styles.field}>
              <label className={styles.label}>Телефон</label>
              <div className={styles.inputWrapper}>
                <IonInput
                  className={styles.customInput}
                  type="tel"
                  placeholder="+7 (XXX) XXX-XX-XX"
                  value={formData.phone || ''}
                  onIonInput={(e) => setFieldValue('phone', e.detail.value!)}
                />
              </div>
              {getFieldError('phone') && (
                <div className={styles.errorMsg}>{getFieldError('phone')}</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Контактное лицо</label>
              <div className={styles.inputWrapper}>
                <IonInput
                  className={styles.customInput}
                  placeholder="Имя контактного лица"
                  value={formData.face || ''}
                  onIonInput={(e) => setFieldValue('face', e.detail.value!)}
                />
              </div>
              {getFieldError('face') && (
                <div className={styles.errorMsg}>{getFieldError('face')}</div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionTitle}>Проверьте данные</div>
            
            <div className={styles.summarySection}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                  <span>Название:</span>
                  <span>{formData.name}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Вес:</span>
                  <span>{formData.weight} т</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Цена:</span>
                  <span>{formData.price} руб</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Маршрут:</span>
                  <span>
                    {formData.address?.city.city} → {formData.destiny?.city.city}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Период:</span>
                  <span>
                    {formData.pickup_date} - {formData.delivery_date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Неизвестный шаг</div>;
    }
  };

  // ======================
  // РЕНДЕР
  // ======================

  return (
    <div className={styles.cargoFormWizard} ref={scrollRef}>
      <div className={styles.wizardContent}>
        {/* Заголовок шага */}
        <div className={styles.stepHeader} data-step={currentStep}>
          <button 
            className={styles.navButton}
            onClick={handleBackNavigation}
            disabled={isSubmitting}
          >
            <IonIcon icon={chevronBackOutline} />
          </button>
          
          <h2 className={styles.stepTitle}>
            {cargo ? 'Редактировать груз' : 'Создать груз'}
          </h2>
          
          {currentStep === 7 ? (
            <button 
              className={`${styles.navButton} ${styles.navButtonRight}`}
              onClick={handleSave}
              disabled={isSubmitting}
            >
              <IonIcon icon={saveOutline} />
            </button>
          ) : (
            <button 
              className={`${styles.navButton} ${styles.navButtonRight}`}
              onClick={handleForwardNavigation}
              disabled={isSubmitting || currentStep === 0}
            >
              <IonIcon icon={chevronForwardOutline} />
            </button>
          )}
        </div>

        {/* Контент шага */}
        <div className={styles.stepContainer}>
          <div 
            className={styles.formContent}
            style={{ opacity: isCompanyIncomplete && currentStep !== 0 ? 0.5 : 1 }}
          >
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
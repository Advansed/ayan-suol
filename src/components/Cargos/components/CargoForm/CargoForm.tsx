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
import { CargoInfo, EMPTY_CARGO, useCargos } from '../../../../Store/useCargos';
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
      
      if (!isValid) {
        // Находим первую ошибку и показываем toast
        const stepFields = getStepFields(currentStep);
        for (const field of stepFields) {
          const error = getFieldError(field);
          if (error) {
            toast.error(error);
            break;
          }
        }
        return;
      }
      
      // Переходим на следующий шаг
      gotoStep(currentStep + 1);
      scrollToTop();
    } else {
      // Последний шаг - сохраняем
      handleSave();
    }
  };

  const getStepFields = (step: number): string[] => {
    const STEP_FIELDS = {
      1: ['name', 'description'],
      2: ['address.address'],
      3: ['destiny.address'], 
      4: ['pickup_date', 'delivery_date'],
      5: ['weight', 'price', 'cost'],
      6: ['phone', 'face'],
      7: []
    };
    return STEP_FIELDS[step as keyof typeof STEP_FIELDS] || [];
  };

  // ======================
  // СОХРАНЕНИЕ
  // ======================
  
  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      if (cargo?.guid) {
        // Редактируем существующий груз
        const success = await updateCargo(cargo.guid, formData);
        if (success) {
          toast.success('Груз обновлен');
          onBack();
        }
      } else {
        // Создаем новый груз
        const success = await createCargo(formData);
        if (success) {
          toast.success('Груз создан');
          onBack();
        }
      }
      
      // Если передан onSave колбэк
      if (onSave) {
        await onSave(formData as CargoInfo);
      }
      
    } catch (error) {
      console.error('Error saving cargo:', error);
      toast.error('Ошибка при сохранении');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================
  // РЕНДЕР ШАГОВ
  // ======================

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.companyIncomplete}>
            <h3>Завершите заполнение профиля компании</h3>
            <p>Для создания заявки необходимо заполнить профиль компании минимум на 70%</p>
            <button onClick={() => hist.push('/profile/company')}>
              Перейти к профилю
            </button>
          </div>
        );

      case 1:
        return (
          <div className={styles.step}>
            <IonInput
              placeholder="Название груза"
              value={formData.name || ''}
              onIonInput={(e) => setFieldValue('name', e.detail.value!)}
            />
            <IonTextarea
              placeholder="Описание груза"
              value={formData.description || ''}
              onIonInput={(e) => setFieldValue('description', e.detail.value!)}
            />
          </div>
        );

      case 2:
        return (
          <div className={styles.step}>
            <AddressSuggestions
              token="50bfb3453a528d091723900fdae5ca5a30369832"
              value={getValueByPath(formData, 'address.address') || ''}
              onChange={(suggestion) => {
                setNestedValue( 'address', 'address', suggestion?.value || '');
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className={styles.step}>
            <AddressSuggestions
              token="50bfb3453a528d091723900fdae5ca5a30369832"
              value={getValueByPath(formData, 'destiny.address') || ''}
              onChange={(suggestion) => {
                setNestedValue( 'destiny', 'address', suggestion?.value || '');
              }}
            />
          </div>
        );

      case 4:
        return (
          <div className={styles.step}>
            <IonInput
              type="date"
              placeholder="Дата загрузки"
              value={formData.pickup_date || ''}
              onIonInput={(e) => setFieldValue('pickup_date', e.detail.value!)}
            />
            <IonInput
              type="date"
              placeholder="Дата доставки"
              value={formData.delivery_date || ''}
              onIonInput={(e) => setFieldValue('delivery_date', e.detail.value!)}
            />
          </div>
        );

      case 5:
        return (
          <Step5
            data = { formData }
            setFieldValue={ setFieldValue }
            getFieldError={ getFieldError }
          />
        );

      case 6:
        return (
          <div className={styles.step}>
            <IonInput
              placeholder="Телефон"
              value={formData.phone || ''}
              onIonInput={(e) => setFieldValue('phone', e.detail.value!)}
            />
            <IonInput
              placeholder="Контактное лицо"
              value={formData.face || ''}
              onIonInput={(e) => setFieldValue('face', e.detail.value!)}
            />
          </div>
        );

      case 7:
        return (
          <div className={styles.step}>
            <h3>Проверьте данные и сохраните</h3>
            <div className={styles.summary}>
              <p><strong>Название:</strong> {formData.name}</p>
              <p><strong>Вес:</strong> {formData.weight} "т"</p>
              <p><strong>Цена:</strong> {formData.price} { " руб"}</p>
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
    <div className={styles.cargoForm} ref={scrollRef}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBackNavigation} disabled={isSubmitting}>
          <IonIcon icon={chevronBackOutline} />
        </button>
        <h2>
          {cargo ? 'Редактировать груз' : 'Создать груз'} 
          {currentStep > 0 && ` - Шаг ${currentStep}/7`}
        </h2>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {renderStepContent()}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        {currentStep === 7 ? (
          <button 
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSubmitting}
          >
            <IonIcon icon={saveOutline} />
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        ) : (
          <button 
            className={styles.nextButton}
            onClick={handleForwardNavigation}
            disabled={isSubmitting}
          >
            Далее
            <IonIcon icon={chevronForwardOutline} />
          </button>
        )}
      </div>
    </div>
  );
};
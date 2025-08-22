import React, { useEffect, useRef } from 'react';
import { IonInput, IonTextarea, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons';
import { CargoInfo } from '../../types';
import { useCargoFormWizard } from './useCargoForm';
import styles from './CargoForm.module.css';

interface CargoFormProps {
  cargo?: CargoInfo;
  onBack: () => void;
  onSave?: (data: CargoInfo) => Promise<void>;
}

export const CargoForm: React.FC<CargoFormProps> = ({ cargo, onBack, onSave }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    formState,
    currentStep,
    setCurrentStep,
    validateCurrentStep,
    canGoToStep,
    setFieldValue,
    setNestedValue,
    getFieldError,
    initializeForm,
    saveToServer,
    mode
  } = useCargoFormWizard();

  const { data, isSubmitting } = formState;

  // Инициализация формы при монтировании
  useEffect(() => {
    initializeForm(cargo);
  }, [cargo, initializeForm]);

  // ======================
  // НАВИГАЦИЯ
  // ======================
  
  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    } else {
      onBack();
    }
  };

  const handleForwardNavigation = () => {
    if (currentStep < 6) {
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1);
        scrollToTop();
      }
    } else {
      // Последний шаг - сохранение
      handleSave();
    }
  };

  const scrollToTop = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, 100);
  };

  // ======================
  // СОХРАНЕНИЕ
  // ======================
  
  const handleSave = async () => {
      console.log("save")
    if (validateCurrentStep()) {
      console.log("save")
      const success = onSave ? await onSave( data ) : await saveToServer( data );
      if (success) {
        onBack(); // Возврат к списку после успешного сохранения
      }
    }
  };

  // ======================
  // ЗАГОЛОВКИ ШАГОВ
  // ======================
  
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Название и описание';
      case 2: return 'Информация о клиенте';
      case 3: return 'Место погрузки';
      case 4: return 'Место разгрузки';
      case 5: return 'Сроки перевозки';
      case 6: return 'Характеристики груза';
      case 7: return 'Контактная информация';
      default: return 'Создание заказа';
    }
  };

  const renderStepHeader = () => (
    <div className={styles.stepHeader} data-step={currentStep}>
      <button 
        className={`${styles.navButton} ${styles.navButtonLeft}`} 
        onClick={handleBackNavigation}
      >
        <IonIcon icon={chevronBackOutline} />
      </button>
      
      <h3 className={styles.stepTitle}>{getStepTitle()}</h3>
      
      <button 
        className={`${styles.navButton} ${styles.navButtonRight}`} 
        onClick={handleForwardNavigation}
        disabled={isSubmitting}
      >
        {currentStep === 6 ? (
          <IonIcon icon={saveOutline} />
        ) : (
          <IonIcon icon={chevronForwardOutline} />
        )}
      </button>
    </div>
  );

  // ======================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ======================
  
  const renderFieldError = (fieldPath: string) => {
    const error = getFieldError(fieldPath);
    if (error) {
      return <div className={styles.errorMsg}>{error}</div>;
    }
    return null;
  };

  // ======================
  // ШАГИ ФОРМЫ
  // ======================
  
  // Шаг 1: Название и описание
  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Название груза</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            value={data.name}
            placeholder="Введите название груза..."
            onIonInput={(e) => setFieldValue('name', e.detail.value as string)}
          />
        </div>
        {renderFieldError('name')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Описание груза</div>
        <div className={styles.inputWrapper}>
          <IonTextarea 
            className={styles.customTextarea}
            value={data.description}
            placeholder="Описание груза, особенности перевозки..."
            rows={4}
            onIonInput={(e) => setFieldValue('description', e.detail.value as string)}
          />
        </div>
        {renderFieldError('description')}
      </div>
    </div>
  );

  // Шаг 3: Место погрузки
  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Город погрузки</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            value={data.address?.city || ''}
            placeholder="Город погрузки..."
            onIonInput={(e) => setNestedValue('address', 'city', e.detail.value as string)}
          />
        </div>
        {renderFieldError('address.city')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Адрес погрузки</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            value={data.address?.address || ''}
            placeholder="Точный адрес погрузки..."
            onIonInput={(e) => setNestedValue('address', 'address', e.detail.value as string)}
          />
        </div>
        {renderFieldError('address.address')}
      </div>
    </div>
  );

  // Шаг 4: Место разгрузки
  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Город разгрузки</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            value={data.destiny?.city || ''}
            placeholder="Город разгрузки..."
            onIonInput={(e) => setNestedValue('destiny', 'city', e.detail.value as string)}
          />
        </div>
        {renderFieldError('destiny.city')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Адрес разгрузки</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            value={data.destiny?.address || ''}
            placeholder="Точный адрес разгрузки..."
            onIonInput={(e) => setNestedValue('destiny', 'address', e.detail.value as string)}
          />
        </div>
        {renderFieldError('destiny.address')}
      </div>
    </div>
  );

  // Шаг 5: Сроки перевозки
  const renderStep4 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Дата погрузки</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            type="date"
            value={data.address?.date || ''}
            onIonInput={(e) => setNestedValue('address', 'date', e.detail.value as string)}
          />
        </div>
        {renderFieldError('address.date')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Дата разгрузки</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            type="date"
            value={data.destiny?.date || ''}
            onIonInput={(e) => setNestedValue('destiny', 'date', e.detail.value as string)}
          />
        </div>
        {renderFieldError('destiny.date')}
      </div>
    </div>
  );

  // Шаг 6: Характеристики груза
  const renderStep5 = () => (
    <div className={styles.stepContent}>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.label}>Вес (тонн)</div>
          <div className={styles.inputWrapper}>
            <IonInput 
              className={styles.customInput}
              type="number"
              min="0"
              step="0.1"
              value={data.weight}
              placeholder="0.0"
              onIonInput={(e) => setFieldValue('weight', parseFloat(e.detail.value as string) || 0)}
            />
          </div>
          {renderFieldError('weight')}
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Объем (м³)</div>
          <div className={styles.inputWrapper}>
            <IonInput 
              className={styles.customInput}
              type="number"
              min="0"
              step="0.1"
              value={data.volume}
              placeholder="0.0"
              onIonInput={(e) => setFieldValue('volume', parseFloat(e.detail.value as string) || 0)}
            />
          </div>
          {renderFieldError('volume')}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Цена (руб)</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            type="number"
            min="0"
            value={data.price}
            placeholder="0"
            onIonInput={(e) => setFieldValue('price', parseFloat(e.detail.value as string) || 0)}
          />
        </div>
        {renderFieldError('price')}
      </div>
    </div>
  );

  // Шаг 7: Контакты и итоговая информация
  const renderStep6 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Телефон</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            type="tel"
            value={data.phone}
            placeholder="+7 (xxx) xxx-xx-xx"
            onIonInput={(e) => setFieldValue('phone', e.detail.value as string)}
          />
        </div>
        {renderFieldError('phone')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Контактное лицо</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            value={data.face}
            placeholder="ФИО контактного лица..."
            onIonInput={(e) => setFieldValue('face', e.detail.value as string)}
          />
        </div>
        {renderFieldError('face')}
      </div>

      {/* Итоговая информация */}
      <div className={styles.summarySection}>
        <div className={styles.sectionTitle}>Проверьте данные перед сохранением</div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span>Груз:</span>
            <span>{data.name || 'Не указано'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Клиент:</span>
            <span>{data.client || 'Не указан'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Маршрут:</span>
            <span>{data.address?.city || 'Не указан'} → {data.destiny?.city || 'Не указан'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Характеристики:</span>
            <span>{data.weight}т, {data.volume}м³</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Цена:</span>
            <span>{data.price} руб</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Контакт:</span>
            <span>{data.face || 'Не указан'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ======================
  // РЕНДЕР
  // ======================
  
  return (
    <div className={styles.cargoFormWizard}>
      <div className={styles.wizardContent} ref={scrollRef}>
        <div className={styles.stepContainer}>
          {renderStepHeader()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}

        </div>
      </div>
    </div>
  );
};
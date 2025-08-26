import React, { useState } from 'react';
import { IonInput, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import { CargoInfo } from '../../types';
import styles from './CargoForm.module.css';

interface Step5Props {
  data: CargoInfo;
  setFieldValue: (fieldPath: string, value: any) => void;
  getFieldError: (fieldPath: string) => string | undefined;
}

export const Step5: React.FC<Step5Props> = ({ data, setFieldValue, getFieldError }) => {
  const [measureType, setMeasureType] = useState<'weight' | 'volume'>('weight');

  const handleMeasureTypeChange = (type: 'weight' | 'volume') => {
    setMeasureType(type);
    // Сбрасываем неактивное поле
    if (type === 'weight') {
      setFieldValue('volume', 0);
    } else {
      setFieldValue('weight', 0);
    }
  };

  return (
    <div className={styles.stepContent}>
      {/* Переключатель типа измерения */}
      <div className={styles.field}>
        <div className={styles.label}>Тип измерения груза</div>
        <IonSegment 
          value={measureType} 
          onIonChange={(e) => handleMeasureTypeChange(e.detail.value as 'weight' | 'volume')}
        >
          <IonSegmentButton value="weight">
            <IonLabel>По весу</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="volume">
            <IonLabel>По объему</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </div>

      {/* Условное отображение поля */}
      <div className={styles.field}>
        <div className={styles.label}>
          {measureType === 'weight' ? 'Вес (тонн)' : 'Объем (м³)'}
        </div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            type="number"
            min="0"
            step="0.1"
            value={measureType === 'weight' ? data.weight : data.volume}
            placeholder="0.0"
            onIonInput={(e) => setFieldValue(measureType, parseFloat(e.detail.value as string) || 0)}
          />
        </div>
        {getFieldError(measureType)}
      </div>

      {/* Поле цены */}
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
        {getFieldError('price')}
      </div>
    </div>
  );
};
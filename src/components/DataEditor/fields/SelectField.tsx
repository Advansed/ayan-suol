// src/components/DataEditor/fields/SelectField.tsx
import React from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import styles from './SelectField.module.css';

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  value, 
  options, 
  onChange,
  placeholder = "Выберите...",
  disabled = false,
  error
}) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.selectWrapper}>
        <select 
          className={`${styles.select} ${error ? styles.selectError : ''} ${!value ? styles.placeholder : ''}`}
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map(option => (
            <option key={option} value={option} className={styles.option}>
              {option}
            </option>
          ))}
        </select>
        <div className={styles.iconWrapper}>
          <IonIcon icon={chevronDownOutline} className={styles.icon} />
        </div>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

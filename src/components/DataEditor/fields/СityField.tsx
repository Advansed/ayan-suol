import React from 'react';
import { AddressSuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import styles from './CityField.module.css';

interface CityFieldProps {
  label:            string;
  value:            { city: string; fias: string };
  onChange:         (value: { city: string; fias: string }) => void;
  onFIAS:           (fias: string) => void;
  disabled?:        boolean;
  error?:           string;
  validate?: boolean;

}

export const CityField: React.FC<CityFieldProps> = ({ 
  label, 
  value, 
  onChange,
  onFIAS,
  disabled = false,
  error
}) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <AddressSuggestions
        token               = "50bfb3453a528d091723900fdae5ca5a30369832"
        filterToBound       = "city"
        filterFromBound     = "city"
        value               = {{ value: value?.city || '' } as any}
        onChange            = {(suggestion) => {
          if (suggestion) {

            onChange({
              city: suggestion.data.city || '',
              fias: suggestion.data.city_fias_id || ''
            });

            onFIAS( suggestion.data.city_fias_id || '' );

          }
        }}
        inputProps={{
          disabled,
          className: `${styles.input} ${error ? styles.inputError : ''}`,
          placeholder: "Начните вводить город"
        }}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

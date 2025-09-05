import React from 'react';
import { AddressSuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import styles from './AddressField.module.css';

interface AddressFieldProps {
  label: string;
  value: { address: string; fias: string; lat: string; lon: string };
  onChange: (value: { address: string; fias: string; lat: string; lon: string }) => void;
  cityFias?: string; // фиас код города для фильтрации
  disabled?: boolean;
  error?: string;
  validate?: string;
}


export const AddressField: React.FC<AddressFieldProps> = ({ 
  label, 
  value, 
  onChange,
  cityFias,
  disabled = false,
  error
}) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <AddressSuggestions
        token="50bfb3453a528d091723900fdae5ca5a30369832"
        filterLocations={cityFias ? [{ city_fias_id: cityFias }] : undefined}
        filterRestrictValue={!!cityFias}
        value={{ value: value?.address || '' } as any}
        onChange={(suggestion) => {
          if (suggestion) {
            onChange({
              address: suggestion.value || '',
              fias: suggestion.data.fias_id || '',
              lat: suggestion.data.geo_lat || '',
              lon: suggestion.data.geo_lon || ''
            });
          }
        }}
        inputProps={{
          disabled,
          className: `${styles.input} ${error ? styles.inputError : ''}`,
          placeholder: cityFias ? "Введите адрес в выбранном городе" : "Введите адрес"
        }}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
      
    </div>
  );
};

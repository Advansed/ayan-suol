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
        token               = {import.meta.env.VITE_DADATA_TOKEN || "50bfb3453a528d091723900fdae5ca5a30369832"}
        filterToBound       = "city"
        filterFromBound     = "city"
        value               = {{ value: value?.city || '' } as any}
        onChange            = {(suggestion) => {
          if (suggestion) {
            const d = suggestion.data as Record<string, string | undefined>;
            const cityName =
              d.city_with_type ||
              d.city ||
              d.settlement_with_type ||
              d.settlement ||
              suggestion.value ||
              '';
            const cityFias =
              d.city_fias_id ||
              d.settlement_fias_id ||
              '';

            onChange({ city: cityName, fias: cityFias });
            onFIAS(cityFias);
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

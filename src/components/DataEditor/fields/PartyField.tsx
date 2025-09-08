import React from 'react';
import { AddressSuggestions, PartySuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import styles from './AddressField.module.css';

interface PartyFieldProps {
  label: string;
  value: { address: string; fias: string; lat: string; lon: string };
  onChange: (value: { address: string; fias: string; lat: string; lon: string }) => void;
  cityFias?: string; // фиас код города для фильтрации
  disabled?: boolean;
  error?: string;
  validate?: string;
}


export const PartyField: React.FC<PartyFieldProps> = ({ 
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
      <PartySuggestions
        token="50bfb3453a528d091723900fdae5ca5a30369832"
        onChange={(suggestion) => {
          if (suggestion) {
            console.log(suggestion)
          }
        }}
        inputProps={{
          disabled,
          className: `${styles.input} ${error ? styles.inputError : ''}`,
          placeholder: "ИНН"
        }}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
      
    </div>
  );
};

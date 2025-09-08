import React from 'react';
import { AddressSuggestions, PartySuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import styles from './TextField.module.css';

interface PartyFieldProps {
  label: string;
  value: { name: string; short_name: string; address: string; inn: string; kpp: string; ogrn: string; };
  onChange: (value: { 
      name: string; short_name: string; address: string; inn: string; kpp: string; ogrn: string;
  }) => void;
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
        value={{value: value.name} as any}
        onChange={(suggestion) => {
          if (suggestion) {
            onChange({
              name:         suggestion.value,
              short_name:   suggestion.value,
              address:      suggestion.data.address.value,
              inn:          suggestion.data.inn,
              kpp:          suggestion.data.kpp,
              ogrn:         suggestion.data.ogrn,
            })
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

import React from 'react';

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange }) => {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Выберите...</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};
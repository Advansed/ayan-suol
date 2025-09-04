import React from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export const NumberField: React.FC<NumberFieldProps> = ({ label, value, onChange }) => {
  return (
    <div className="field">
      <label>{label}</label>
      <input 
        type="number" 
        value={value || ''} 
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};
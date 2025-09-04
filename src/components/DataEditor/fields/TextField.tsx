import React from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const TextField: React.FC<TextFieldProps> = ({ label, value, onChange }) => {
  return (
    <div className="field">
      <label>{label}</label>
      <input 
        type="text" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
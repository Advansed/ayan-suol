import React from 'react';
import { DataEditorProps, FieldData } from './types';
import { useNavigation } from './hooks/useNavigation';
import { useFormState } from './hooks/useFormState';
import { TextField } from './fields/TextField';
import { NumberField } from './fields/NumberField';
import { SelectField } from './fields/SelectField';
import { Navigation } from './components/Navigation';
import './styles.css';

const DataEditor: React.FC<DataEditorProps> = ({ data, onChange, onSave }) => {
  const navigation = useNavigation(data.length);
  const formState = useFormState(data, onChange);

  const renderField = (fieldName: string, fieldData: FieldData) => {
    const updateValue = (value: any) => {
      formState.updateField(navigation.currentPage, fieldName, value);
    };

    switch (fieldData.type) {
      case 'string':
        return (
          <TextField
            key={fieldName}
            label={fieldName}
            value={fieldData.data}
            onChange={updateValue}
          />
        );
      case 'number':
        return (
          <NumberField
            key={fieldName}
            label={fieldName}
            value={fieldData.data}
            onChange={updateValue}
          />
        );
      case 'select':
        return (
          <SelectField
            key={fieldName}
            label={fieldName}
            value={fieldData.data}
            options={fieldData.values || []}
            onChange={updateValue}
          />
        );
      default:
        return null;
    }
  };

  const currentPageData = formState.data[navigation.currentPage];
  
  if (!currentPageData) return null;

  return (
    <div className="data-editor">
      <div className="page-content">
        {Object.entries(currentPageData).map(([fieldName, fieldData]) => 
          renderField(fieldName, fieldData)
        )}
      </div>
      
      <Navigation
        currentPage={navigation.currentPage}
        totalPages={navigation.totalPages}
        onPrev={navigation.prevPage}
        onNext={navigation.nextPage}
        canGoPrev={navigation.canGoPrev}
        canGoNext={navigation.canGoNext}
        onSave={onSave ? () => onSave(formState.data) : undefined}
      />
    </div>
  );
};

export default DataEditor;
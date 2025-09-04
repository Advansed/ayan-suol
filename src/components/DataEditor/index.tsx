// src/components/DataEditor/index.tsx
import React, { useRef }                from 'react';
import { DataEditorProps, FieldData }   from './types';
import { useNavigation }                from './hooks/useNavigation';
import { useFormState }                 from './hooks/useFormState';
import { TextField }                    from './fields/TextField';
import { NumberField }                  from './fields/NumberField';
import { SelectField }                  from './fields/SelectField';
import { WizardHeader }                 from './components/WizardHeader';
import './styles.css';
import { DateField } from './fields/DateField';

const DataEditor: React.FC<DataEditorProps> = ({ 
    data, 
    onSave, 
    onBack,
    title = 'Редактор данных'
}) => {
  const scrollRef   = useRef<HTMLDivElement>(null);
  const navigation  = useNavigation(data.length);
  const formState   = useFormState(data);

  // Получение заголовка для текущей страницы
  const getStepTitle = () => {
    return `Страница ${navigation.currentPage + 1} из ${navigation.totalPages}`;
  };

  // Навигация назад
  const handleBackNavigation = () => {
    if (navigation.currentPage > 0) {
      navigation.prevPage();
      scrollToTop();
    } else {
      onBack();
    }
  };

  // Навигация вперед
  const handleForwardNavigation = () => {
    if (navigation.canGoNext) {
      navigation.nextPage();
      scrollToTop();
    }
  };

  // Сохранение данных
  const handleSave = () => {
    if (onSave) {
      onSave(formState.data);
    }
  };

  // Скролл наверх
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Рендер полей
  const renderField = (fieldName: string, fieldData: FieldData) => {
    const updateValue = (value: any) => {
      formState.updateField(navigation.currentPage, fieldName, value);
    };

    switch (fieldData.type) {
      case 'string':
        return (
          <TextField
            key       = { fieldName }
            label     = { fieldName }
            value     = { fieldData.data }
            onChange  = { updateValue }
          />
        );
      case 'number':
        return (
          <NumberField
            key       = { fieldName }
            label     = { fieldName }
            value     = { fieldData.data }
            onChange  = { updateValue }
          />
        );
      case 'select':
        return (
          <SelectField
            key       = { fieldName }
            label     = { fieldName }
            value     = { fieldData.data }
            options   = { fieldData.values || [] }
            onChange  = { updateValue }
          />
        );
      case 'date':
        return (
          <DateField
            key       = { fieldName }
            label     = { fieldName }
            value     = { fieldData.data }
            onChange  = { updateValue }
          />
        );
      default:
        return null;
    }
  };

  const currentPageData = formState.data[navigation.currentPage];
  
  if (!currentPageData) return null;

  const isLastStep = navigation.currentPage === navigation.totalPages - 1;

  return (

    <div className="data-editor-wizard">
      <div className="wizard-content" ref={scrollRef}>
        <WizardHeader
          title         = { title }
          pages         = { getStepTitle() }
          onBack        = { handleBackNavigation }
          onForward     = { handleForwardNavigation }
          onSave        = { handleSave }
          isLastStep    = { isLastStep }
          canGoBack     = { true }
          canGoForward  = { navigation.canGoNext }
        />
        
        <div className="step-container">
          <div className="page-content">
            {Object.entries(currentPageData).map(([fieldName, fieldData]) => 
              renderField(fieldName, fieldData)
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default DataEditor;
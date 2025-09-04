import React, { useRef, useState }              from 'react';
import { DataEditorProps, FieldData } from './types';
import { useNavigation }              from './hooks/useNavigation';
import { useFormState }               from './hooks/useFormState';
import { TextField }                  from './fields/TextField';
import { NumberField }                from './fields/NumberField';
import { SelectField }                from './fields/SelectField';
import { DateField }                  from './fields/DateField';
import { WizardHeader }               from './components/WizardHeader';
import './styles.css';
import { CityField } from './fields/СityField';
import { useSelector } from '../Store';
import { AddressField } from './fields/AddressField';

const DataEditor: React.FC<DataEditorProps> = ({ 
  data, 
  onSave, 
  onBack
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigation = useNavigation(data.length);
  const formState = useFormState(data);

  const [fias, setFias ] = useState('')

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const handleBackNavigation = () => {
    if (navigation.currentPage > 0) {
      navigation.prevPage();
      scrollToTop();
    } else {
      onBack();
    }
  };

  const handleForwardNavigation = () => {
    if (navigation.canGoNext) {
      navigation.nextPage();
      scrollToTop();
    }
  };

  const getPageTitle = () => {
    return (navigation.currentPage + 1) + ' страница из ' +  data.length
  }

  const renderField = (field: FieldData, sectionIdx: number, fieldIdx: number) => {
    const update = (value: any) => formState.updateField(sectionIdx, fieldIdx, value);
    
    const props = {
      key:            `${sectionIdx}-${fieldIdx}`,
      label:          field.label,
      value:          field.data,
      onChange:       update
    };

    switch (field.type) {
      case 'string':    return <TextField       {...props} />;
      case 'number':    return <NumberField     {...props} />;
      case 'select':    return <SelectField     {...props} options={field.values || []} />;
      case 'date':      return <DateField       {...props} />;
      case 'city':      return <CityField       {...props} onFIAS={ setFias}/>;
      case 'address':   return <AddressField    {...props} cityFias = { fias } />;
      default:          return null;
    }
  };

  const currentSection = formState.data[navigation.currentPage];
  if (!currentSection) return null;

  return (
    <div className="data-editor-wizard">
      <div className="wizard-content" ref={scrollRef}>
        <WizardHeader
          title         = { currentSection.title }
          pages         = { getPageTitle() }
          onBack        = { handleBackNavigation }
          onForward     = { handleForwardNavigation }
          onSave        = { () => onSave?.(formState.data) }
          isLastStep    = { navigation.currentPage === navigation.totalPages - 1 }
          canGoBack     = { true }
          canGoForward  = { navigation.canGoNext }
        />
        
        <div className="step-container">
          <div className="page-content">
            {currentSection.data.map((field, idx) => 
              renderField(field, navigation.currentPage, idx)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEditor;

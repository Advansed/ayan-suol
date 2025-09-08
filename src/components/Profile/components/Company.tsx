import React, { useState, useEffect } from 'react';
import { useLogin } from '../../../Store/useLogin';
import { CompanyData } from '../../../Store/companyStore';
import { useCompany } from '../../../Store/useCompany';
import { PageData } from '../../DataEditor/types';
import DataEditor from '../../DataEditor';

interface CompanyProps {
  onBack:     () => void;
}

export const Company: React.FC<CompanyProps> = ({onBack}) => {
  const { user } = useLogin();
  const { companyData, isLoading, loadData, saveData } = useCompany();
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const jur = (id : number) => {
    switch( id ) {
        case 1:     return 'Самозанятый'
        case 2:     return 'ИП'
        case 3:     return 'Компания'
        default:    return ''
    }
  }

  const getFormData = (company?: CompanyData | null): PageData => [
    {
      title: 'Основные данные',
      data: [
        { label: 'Тип компании', type: 'select', values: ['Самозанятый', 'ИП', 'Компания'], data: jur(company?.company_type || 3), validate: true },
        { label: 'ИНН', type: 'party', data: company?.inn || '', validate: true },
        { label: 'Название', type: 'string', data: company?.name || '', validate: true },
        { label: 'Краткое название', type: 'string', data: company?.short_name || '', validate: true },
      ]
    }
  ];

  const handleSave = (data: PageData) => {
    const formData: CompanyData = {
      name:                 data[0].data[0].data,
      short_name:           data[0].data[1].data,
      company_type:         data[0].data[2].data,
      inn:                  data[0].data[3].data,
      kpp:                  data[0].data[4].data,
      ogrn:                 data[0].data[5].data,
      phone:                data[1].data[0].data,
      email:                data[1].data[1].data,
      description:          data[1].data[2].data,
      address:              data[2].data[1].data,
      postal_address:       data[2].data[2].data,
      bank_name:            data[3].data[0].data,
      bank_bik:             data[3].data[1].data,
      bank_account:         data[3].data[2].data,
      bank_corr_account:    data[3].data[3].data
    };
    saveData(formData);
  };

  if (isLoading) return <div>Загрузка...</div>;


  // Форма создания/редактирования
  return (
    <DataEditor
      data      = { getFormData( companyData ) }
      onSave    = { handleSave }
      onBack    = { onBack }
    />
  );
};
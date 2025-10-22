import React, { useState, useEffect } from 'react';
import { useLogin } from '../../../Store/useLogin';
import { CompanyData } from '../../../Store/companyStore';
import { useCompany } from '../../../Store/useCompany';
import { PageData } from '../../DataEditor/types';
import DataEditor from '../../DataEditor';
import { useLoginStore } from '../../../Store/loginStore';
import { useToast } from '../../Toast';

interface CompanyProps {
  onBack:     () => void;
}

export const Company: React.FC<CompanyProps> = ({onBack}) => {
  const { companyData, isLoading, loadData, saveData } = useCompany();

  const agreements  = useLoginStore(state => state.agreements)
  
  const toast       = useToast()

  useEffect(() => {
    if(!agreements.userAgreement){
      onBack()
      toast.info("Сперва надо принять пользовательское соглашение")
    } else loadData();
  }, []);

  const jur = (id : number) => {
    switch( id ) {
        case 1:     return 'Самозанятый'
        case 2:     return 'ИП'
        case 3:     return 'Компания'
        default:    return ''
    }
  }
  const fromJur = (state : String ) => {
    switch( state ) {
        case "Самозанятый":     return 1
        case 'ИП':              return 2
        case 'Компания':        return 3
        default:                return 0
    }
  }

  const getFormData = (company?: CompanyData | null): PageData => [
    {
      title: 'Основные данные',
      data: [
        { label: 'Тип компании',      type: 'select', values: ['Самозанятый', 'ИП', 'Компания'], data: jur(company?.company_type || 3), validate: true },
        { label: 'Введите ИНН или наименование',               type: 'party'
          ,  data: { name: company?.name, short_name: company?.short_name, address: company?.address, inn: company?.inn, kpp: company?.kpp, ogrn: company?.ogrn }, validate: true },
      ]
    },
    {
      title: 'Контактная информация',
      data: [
        { label: 'Телефон',             type: 'string',     data: companyData?.phone  || '', validate: true },
        { label: 'email',               type: 'string',     data: companyData?.email  || '', validate: true },
      ]
    },
    {
      title: 'Банковские реквизиты',
      data: [
        { label: 'БИК',                type: 'string',     data: companyData?.bank_bik  || '', validate: true },
        { label: 'Банк',               type: 'string',     data: companyData?.bank_name  || '', validate: true },
        { label: 'Корсчет',            type: 'string',     data: companyData?.bank_corr_account  || '', validate: true },
        { label: 'Счет',               type: 'string',     data: companyData?.bank_account  || '', validate: true },
      ]
    }
  ];

  const handleSave = (data: PageData) => {
    const formData: CompanyData = {
      guid:                 companyData?.guid,
      name:                 data[0].data[1].data.name,
      short_name:           data[0].data[1].data.short_name,
      company_type:         fromJur( data[0].data[0].data ),
      inn:                  data[0].data[1].data.inn,
      kpp:                  data[0].data[1].data.kpp,
      ogrn:                 data[0].data[1].data.ogrn,
      address:              data[0].data[1].data.address,

      phone:                data[1].data[0].data,
      email:                data[1].data[1].data,

      bank_bik:             data[2].data[0].data,
      bank_name:            data[2].data[1].data,
      bank_corr_account:    data[2].data[2].data,
      bank_account:         data[2].data[3].data
    };
    console.log( formData )
    saveData(formData);
    onBack()
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
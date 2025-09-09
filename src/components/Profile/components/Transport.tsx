import React, { useState, useEffect } from 'react';
import { useTransport } from '../../../Store/useTransport';
import { PageData } from '../../DataEditor/types';
import DataEditor from '../../DataEditor';
import { TransportData } from '../../../Store/transportStore';

interface TransportProps {
  onBack: () => void;
}

export const Transport: React.FC<TransportProps> = ({ onBack }) => {
  const { transportData, isLoading, loadData, saveData } = useTransport();

  useEffect(() => {
    loadData();
  }, []);

  const getFormData = (transport?: TransportData | null): PageData => [
    {
      title: 'Основные данные',
      data: [
        { label: 'Тип транспорта',    type: 'string',   data: transport?.transport_type || '',    validate: true },
        { label: 'Гос. номер',        type: 'string',   data: transport?.license_plate || '',     validate: true },
        { label: 'VIN номер',         type: 'string',   data: transport?.vin || '',               validate: false },
        { label: 'Год выпуска',       type: 'number',   data: transport?.manufacture_year || 0,   validate: true },
      ]
    },
    {
      title: 'Характеристики',
      data: [
        { label: 'Грузоподъемность',  type: 'number',   data: transport?.load_capacity || 0,     validate: true },
        { label: 'Опыт (лет)',        type: 'number',   data: transport?.experience || 0,        validate: false },
      ]
    },
    {
      title: 'Документы',
      data: [
        { label: 'Фото транспорта',   type: 'image',    data: transport?.image || '',            validate: false },
      ]
    }
  ];

  const handleSave = (data: PageData) => {
    const formData: TransportData = {
      guid:               transportData?.guid,
      
      transport_type:     data[0].data[0].data,
      license_plate:      data[0].data[1].data,
      vin:                data[0].data[2].data,
      manufacture_year:   data[0].data[3].data,

      load_capacity:      data[1].data[0].data,
      experience:         data[1].data[1].data,

      image:              data[2].data[0].data

    };
    saveData(formData);
    onBack();
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <DataEditor
      data={getFormData(transportData)}
      onSave={handleSave}
      onBack={onBack}
    />
  );
};
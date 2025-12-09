import React from 'react';
import { PageData } from '../../DataEditor/types';
import DataEditor from '../../DataEditor';
import { useToast } from '../../Toast';
import { WorkInfo } from '../types';

interface VehicleInspectionProps {
    work:           WorkInfo;
    onSave:         (data: SaveData2) => Promise<boolean>;
    onBack:         () => void;
    initialData?:   SaveData2;
}

export interface SaveData2 {
    sign:           string
}

const EMPTY_INSPECTION: SaveData2 = {
    sign:           ''
};

export const WorkPage2: React.FC<VehicleInspectionProps> = ({ 
    work,
    onSave, 
    onBack, 
    initialData = EMPTY_INSPECTION 
}) => {
  const toast = useToast();

  // Преобразование данных в формат для DataEditor
  const inspectionToPages = (data: SaveData2): PageData => [
    {
      title: "Подписать догоовор",
      data: [
        {
          label:    "Подпись",
          type:     "sign",
          data:     data.sign,
          validate: true
        }
      ]
    }
  ];

  // Преобразование данных из DataEditor обратно в VehicleInspectionData
  const pagesToInspection = ( data: PageData ): SaveData2 => {
    
    return {
        sign:             data[0].data[0].data 
    } 

  };

  const handleSave = async (data: PageData) => {

    try {
      const inspectionData = pagesToInspection(data);
      
      console.log( 'handleSave', inspectionData)

     // const success = await onSave(inspectionData);
      
        toast.success('Договор подписан');
        onBack();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка при сохранении данных осмотра');
    }
  };

  return (
    <DataEditor
        data      = { inspectionToPages(initialData) }
        onSave    = { handleSave }
        onBack    = { onBack }
        title     = "Осмотр транспортного средства"
    />
  );
};
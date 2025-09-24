import React            from 'react';
import { PageData }     from '../../DataEditor/types';
import DataEditor       from '../../DataEditor';
import { useToast }     from '../../Toast';
import { DriverInfo }   from '../../../Store/cargoStore';

interface CargoInspectionProps {
    info:           DriverInfo;
    onSave:         (data: SaveData3) => Promise<boolean>;
    onBack:         () => void;
    initialData?:   SaveData3;
}

export interface SaveData3 {
    completed:          boolean;
    rate:               number;
}

const EMPTY_INSPECTION: SaveData3 = {
    completed:          false,
    rate:               0
};

export const CargoPage3: React.FC<CargoInspectionProps> = ({ 
    info,
    onSave, 
    onBack, 
    initialData = EMPTY_INSPECTION 
}) => {
  const toast = useToast();

  // Преобразование данных в формат для DataEditor
  const inspectionToPages = (data: SaveData3): PageData => [
    {
      title: "Завершение работ",
      data: [
        {
          label:    "Все работы выполнены",
          type:     "check",
          data:     data.completed,
          validate: true
        },
        {
          label: "Оценка работы",
          type: "rate",
          data: data.rate || 0,
          validate: true,
        }
      ]
    }

  ];

  // Преобразование данных из DataEditor обратно в SaveData
  const pagesToInspection = (data: PageData): SaveData3 => {
    return {
      completed:    data[0].data[0].data,
      rate:         data[0].data[1].data,
    };
  };

  const handleSave = async (data: PageData) => {
    try {
      const inspectionData = pagesToInspection(data);
      
      console.log('handleSave', inspectionData);

      const success = await onSave(inspectionData);
      
      if (success) {
        toast.success('Данные осмотра груза сохранены');
        onBack();
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка при сохранении данных осмотра груза');
    }
  };

  return (
    <DataEditor
        data      = { inspectionToPages(initialData) }
        onSave    = { handleSave }
        onBack    = { onBack }
        title     = "Осмотр груза"
    />
  );
};
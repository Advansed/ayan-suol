import React            from 'react';
import { PageData }     from '../../DataEditor/types';
import DataEditor       from '../../DataEditor';
import { useToast }     from '../../Toast';
import { DriverInfo }   from '../../../Store/cargoStore';

interface CargoInspectionProps {
    info:           DriverInfo;
    onSave:         (data: SaveData2) => Promise<boolean>;
    onBack:         () => void;
    initialData?:   SaveData2;
}

export interface SaveData2 {
    cargoInspected:     boolean;
    documentsReceived:  boolean;
    sealPhotos:         string[]; // Массив URL или base64 изображений
    notes?:             string;
}

const EMPTY_INSPECTION: SaveData2 = {
    cargoInspected:    false,
    documentsReceived: false,
    sealPhotos:        [],
    notes:             ''
};

export const CargoPage2: React.FC<CargoInspectionProps> = ({ 
    info,
    onSave, 
    onBack, 
    initialData = EMPTY_INSPECTION 
}) => {
  const toast = useToast();

  // Преобразование данных в формат для DataEditor
  const inspectionToPages = (data: SaveData2): PageData => [
    {
      title: "Осмотр груза",
      data: [
        {
          label:    "Пломба цела, груз доставлен",
          type:     "check",
          data:     data.cargoInspected,
          validate: true
        },
        {
          label: "Фото пломбы",
          type: "images",
          data: data.sealPhotos || [],
          validate: true,
        }
      ]
    },
    {
      title: "Проверка документов",
      data: [
        {
          label: "Документы на груз получены",
          type: "check",
          data: data.documentsReceived,
          validate: true
        },
        {
          label: "Заметки по осмотру",
          type: "string",
          data: data.notes || "",
          validate: true,
        }
      ]
    }
  ];

  // Преобразование данных из DataEditor обратно в SaveData
  const pagesToInspection = (data: PageData): SaveData2 => {
    return {
      cargoInspected:    data[0].data[0].data,
      sealPhotos:        data[0].data[1].data,
      documentsReceived: data[1].data[0].data,
      notes:             data[1].data[1].data,
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
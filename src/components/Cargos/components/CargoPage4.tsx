import React            from 'react';
import { PageData }     from '../../DataEditor/types';
import DataEditor       from '../../DataEditor';
import { useToast }     from '../../Toast';
import { DriverInfo }   from '../../../Store/cargoStore';

interface CargoInspectionProps {
    info:           DriverInfo;
    pdf:            string;
    onSave:         (data: SaveData4) => Promise<boolean>;
    onBack:         () => void;
    initialData?:   SaveData4;
}

export interface SaveData4 {
    sign:          string;
    pdf:           string;
}

const EMPTY_INSPECTION: SaveData4 = {
    sign:               '',
    pdf:                '',
};

export const CargoPage4: React.FC<CargoInspectionProps> = ({ 
    info, pdf,
    onSave, 
    onBack, 
    initialData = EMPTY_INSPECTION 
}) => {
  const toast = useToast();

  // Преобразование данных в формат для DataEditor
  const inspectionToPages = (data: SaveData4): PageData => [
    {
      title: "Договор",
      data: [
        {
          label:    "Договор",
          type:     "pdf",
          data:     pdf,
          validate: true
        }
      ]
    },
    {
      title: "Подписание договора ",
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

  // Преобразование данных из DataEditor обратно в SaveData
  const pagesToInspection = (data: PageData): SaveData4 => {
    return {
      pdf:      data[0].data[0].data,
      sign:     data[1].data[0].data
    };
  };

  const handleSave = async (data: PageData) => {
    try {
      const inspectionData = pagesToInspection(data);
      
      console.log('handleSave', inspectionData);

      const success = await onSave(inspectionData);
      
      if (success) {
        toast.success('Договор подписан');
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
        title     = "Договор"
    />
  );
};
import React            from 'react';
import { useToast }     from '../../Toast';
import { DriverInfo, CargoInfo, cargoGetters }   from '../../../Store/cargoStore';
import { Agreement, AgreementData } from '../../Offers/Agreement';
import { mockAgreementData } from '../../Offers/Agreement.mock';

interface CargoInspectionProps {
    info:           DriverInfo;
    pdf:            string;
    cargo?:         CargoInfo;
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
    info, pdf, cargo,
    onSave, 
    onBack, 
    initialData = EMPTY_INSPECTION 
}) => {
  const toast = useToast();

  // Преобразование данных в формат AgreementData (пока используем mock данные)
  const getAgreementData = (): AgreementData => {
    // Используем mock данные для отладки
    return {
      ...mockAgreementData,
      // Можно переопределить некоторые поля из реальных данных, если нужно
      orderId: info.guid || info.cargo || mockAgreementData.orderId,
      contractId: info.guid || info.cargo || mockAgreementData.contractId,
      performerSignature: {
        name: mockAgreementData.performerSignature?.name || '',
        sign: initialData?.sign || mockAgreementData.performerSignature?.sign || ''
      }
    };
  };

  const handleSign = async () => {
    try {
      // Здесь можно добавить логику для получения подписи
      // Пока используем данные из initialData
      const saveData: SaveData4 = {
        sign: initialData?.sign || '',
        pdf: pdf
      };

      const success = await onSave(saveData);
      
      if (success) {
        toast.success('Договор подписан');
        onBack();
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка при сохранении договора');
    }
  };

  const handleDownload = () => {
    // Логика скачивания PDF
    if (pdf) {
      // Можно открыть PDF в новом окне или скачать
      window.open(pdf, '_blank');
    } else {
      toast.error('PDF договора не доступен');
    }
  };

  return (
    <Agreement
      data        = { getAgreementData() }
      onMenu      = { onBack }
      onCancel    = { onBack }
      onDownload  = { handleDownload }
      onSign      = { handleSign }
    />
  );
};
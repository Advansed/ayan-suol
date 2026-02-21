import React, { useState } from 'react';
import { useToast }     from '../../Toast';
import { DriverInfo, CargoInfo, cargoGetters }   from '../../../Store/cargoStore';
import { Agreement, ContractData } from '../../Offers/Agreement';
import { mockAgreementData } from '../../Offers/Agreement.mock';
import { useInvoices } from '../hooks/useInvoices';

interface CargoInspectionProps {
    info:           DriverInfo;
    contract:       any;
    cargo?:         CargoInfo;
    onSave:         (data: SaveData4) => Promise<boolean>;
    onBack:         () => void;
    initialData?:   SaveData4;
}

export interface SaveData4 {
    sign:          string;
}

const EMPTY_INSPECTION: SaveData4 = {
    sign:               '',
};

export const CargoPage4: React.FC<CargoInspectionProps> = ({ 
    info, contract, cargo,
    onSave, 
    onBack, 
    initialData = EMPTY_INSPECTION 
}) => {
  const toast = useToast();
  const [signature, setSignature] = useState<string>(initialData?.sign || '');

  console.log( contract )

  const handleSign = async(signature: string) => {
    try {
      const saveData: SaveData4 = {
        sign:   signature
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

  return (
    <Agreement
      data        = { contract }
      onMenu      = { onBack }
      onCancel    = { onBack }
      onSign      = { handleSign }
      // onDownload  = { handleDownload }
    />
  );
};
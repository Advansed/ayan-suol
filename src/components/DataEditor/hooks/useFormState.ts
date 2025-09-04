import { useState, useEffect } from 'react';
import { PageData } from '../types';

export const useFormState = (initialData: PageData[], onChange: (data: PageData[]) => void) => {
  const [data, setData] = useState<PageData[]>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const updateField = (pageIndex: number, fieldName: string, value: any) => {
    const newData = [...data];
    if (newData[pageIndex] && newData[pageIndex][fieldName]) {
      newData[pageIndex][fieldName].data = value;
      setData(newData);
      onChange(newData);
    }
  };

  return {
    data,
    updateField
  };
};
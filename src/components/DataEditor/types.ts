export interface CityData {
  city: string;
  fias: string;
}

export interface AddressData {
  address: string;
  fias: string;
  lat: string;
  lon: string;
}

export interface FieldData {
  label: string;
  type: 'string' | 'number' | 'select' | 'date' | 'boolean' | 'city' | 'address'; // добавлен 'address'
  values?: string[] | null;
  data: any; // для address будет AddressData
}

export interface PageData {
  [fieldName:   string]: FieldData;
}

export interface DataEditorProps {
  data:         PageData[];
  onSave?:      (data: PageData[]) => void;
  onBack:       () => void;
  title?:       string; // Опциональный заголовок
}

export interface NavigationState {
  currentPage:  number;
  totalPages:   number;
}

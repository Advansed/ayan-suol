export interface FieldData {
  type: 'string' | 'number' | 'select' | 'date' | 'boolean';
  data: any;
  values?: string[]; // для type: "select"
}

export interface PageData {
  [fieldName: string]: FieldData;
}

export interface DataEditorProps {
  data: PageData[];
  onSave?: (data: PageData[]) => void;
  onBack: () => void;
  title?: string; // Опциональный заголовок
}

export interface NavigationState {
  currentPage: number;
  totalPages: number;
}

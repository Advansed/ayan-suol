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
  onChange: (data: PageData[]) => void;
  onSave?: (data: PageData[]) => void;
}

export interface NavigationState {
  currentPage: number;
  totalPages: number;
}
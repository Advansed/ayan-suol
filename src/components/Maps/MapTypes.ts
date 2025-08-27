export interface Coordinates {
  lat: number;
  long: number;
}

export interface CargoInfo {
  name?: string;
  client?: string;
  weight?: number;
  volume?: number;
  price?: number;
  address?: {
    lat: number;
    long: number;
    city?: { city: string };
  };
  destiny?: {
    lat: number;
    long: number;
    city?: { city: string };
  };
}

export interface WorkInfo {
  guid?: string;
  name?: string;
  client?: string;
  weight?: number;
  price?: number;
  status?: string;
  pickup_date?: string;
  address?: {
    lat: number;
    long: number;
    city?: { city: string };
  };
  destiny?: {
    lat: number;
    long: number;
    city?: { city: string };
  };
}

export interface MapProps {
  startCoords: Coordinates;
  endCoords: Coordinates;
  cargoInfo?: CargoInfo;
  workInfo?: WorkInfo;
  height?: string;
}

export interface RouteInfoProps {
  distance?: string;
  duration?: string;
  cargoInfo?: CargoInfo;
  workInfo?: WorkInfo;
}

export interface YandexMapInstance {
  destroy: () => void;
  geoObjects: {
    add: (object: any) => void;
    removeAll: () => void;
  };
  setBounds: (bounds: number[][], options?: any) => void;
}
import { CargoInfo } from "../../Store/cargoStore";
import { WorkInfo } from "../Works";

export interface Coordinates {
  lat: number;
  long: number;
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
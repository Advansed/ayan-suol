// src/Store/cargoStore.ts
import socketService from '../components/Sockets' // Добавили импорт

import { UniversalStore, TState } from './Store'

// ============================================
// ТИПЫ
// ============================================
export interface CargoCity {
    city: string,
    fias: string
}

export interface CargoAddress {
    city: CargoCity;
    address: string;
    fias: string;
    lat: number;
    lon: number;
}

export interface CargoInvoice {
    id: string;
    cargo: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    transport: string;
    price: number;
    weight: number;
    volume: number;
    status: string;
    createdAt: string;
    rating: number;
}

export interface CargoInfo {
    guid: string;
    name: string;
    description: string;
    client: string;
    address: CargoAddress;
    destiny: CargoAddress;
    pickup_date: string;
    delivery_date: string;
    weight: number;
    weight1?: number;
    volume: number;
    price: number;
    cost: number;
    advance: number;
    insurance: number;
    phone: string;
    face: string;
    status: CargoStatus;
    invoices?: CargoInvoice[];
    priority?: CargoPriority;
    createdAt?: string;
    updatedAt?: string;
}

export enum CargoStatus {
    NEW = "Новый",
    WAITING = "В ожидании",
    HAS_ORDERS = "Есть заказы",
    NEGOTIATION = "Торг",
    IN_WORK = "В работе",
    DELIVERED = "Доставлено",
    COMPLETED = "Выполнено"
}

export enum CargoPriority {
    LOW = 'low',
    NORMAL = 'normal', 
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface PageType {
    type: 'list' | 'create' | 'edit' | 'view' | 'invoices' | 'prepayment' | 'insurance'
    cargo?: CargoInfo
    subPage?: string
}

export interface CargoFilters {
    status?: CargoStatus[]
    priority?: CargoPriority[]
    dateFrom?: string
    dateTo?: string
    cityFrom?: string
    cityTo?: string
    minPrice?: number
    maxPrice?: number
}

export interface CargoState extends TState {
    cargos: CargoInfo[]
    isLoading: boolean
    currentPage: PageType
    filters: CargoFilters
    searchQuery: string
    navigationHistory: PageType[]
}

// ============================================
// КОНСТАНТЫ
// ============================================
export const EMPTY_CARGO: CargoInfo = {
  guid: '',
  name: '',
  description: '',
  client: '',
  address: {
    city: { city: '', fias: '' },
    address: '',
    fias: '',
    lat: 0,
    lon: 0
  },
  destiny: {
    city: { city: '', fias: '' },
    address: '',
    fias: '',
    lat: 0,
    lon: 0
  },
  pickup_date: '',
  delivery_date: '',
  weight: 0,
  weight1: 0,
  volume: 0,
  price: 0,
  cost: 0,
  advance: 0,
  insurance: 0,
  phone: '',
  face: '',
  status: CargoStatus.NEW
}

// ============================================
// STORE
// ============================================
export const cargoStore = new UniversalStore<CargoState>({
    initialState: {
        cargos: [],
        isLoading: false,
        currentPage: { type: 'list' },
        filters: {},
        searchQuery: '',
        navigationHistory: [{ type: 'list' }]
    },
    enableLogging: true
})

export const cargoGetters = {

  getCargo: (guid: string): CargoInfo | undefined => {
    return cargoStore.getState().cargos.find(c => c.guid === guid)
  }

}

export const cargoActions = {

  updateCargo: (guid: string, data: Partial<CargoInfo>) => {
    const cargos = cargoStore.getState().cargos
    const updated = cargos.map(c => 
      c.guid === guid ? { ...c, ...data } : c
    )
    cargoStore.dispatch({ type: 'cargos', data: updated })
  }
  
}


// ============================================
// SOCKET ОБРАБОТЧИКИ
// ============================================
export const cargoSocketHandlers = {
    
    onGetCargos:    (response: any) => {
        console.log('onGetCargos response:', response)
        cargoStore.dispatch({ type: 'isLoading', data: false })
        
        if (response.success && Array.isArray(response.data)) {
            cargoStore.dispatch({ type: 'cargos', data: response.data })
        } else {
            console.error('Invalid cargos response:', response)
        }
    },

    onSaveCargo:    (response: any) => {
        console.log('onSaveCargo response:', response)
        
        if (response.success && response.data) {
            const currentCargos = cargoStore.getState().cargos
            const existingIndex = currentCargos.findIndex(c => c.guid === response.data.guid)
            
            let updatedCargos: CargoInfo[]
            if (existingIndex >= 0) {
                // Обновляем существующий
                updatedCargos = currentCargos.map((c, i) => 
                    i === existingIndex ? response.data : c
                )
            } else {
                // Добавляем новый
                updatedCargos = [...currentCargos, response.data]
            }
            
            cargoStore.dispatch({ type: 'cargos', data: updatedCargos })
        }
    },

    onDeleteCargo:  (response: any) => {
        console.log('onDeleteCargo response:', response)
        
        if (response.success && response.guid) {
            const currentCargos = cargoStore.getState().cargos
            const updatedCargos = currentCargos.filter(c => c.guid !== response.guid)
            cargoStore.dispatch({ type: 'cargos', data: updatedCargos })
        }
    },

    onPublishCargo: (response: any) => {
        console.log('onPublishCargo response:', response)
        
        if (response.success && response.data) {
            const currentCargos = cargoStore.getState().cargos
            const updatedCargos = currentCargos.map(c => 
                c.guid === response.data.guid ? response.data : c
            )
            cargoStore.dispatch({ type: 'cargos', data: updatedCargos })
        }
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ SOCKET ОБРАБОТЧИКОВ
// ============================================
export const initCargoSocketHandlers = (socket: any) => {
    if (!socket) return
    
    // Подписываемся на события
    socket.on('get_cargos', cargoSocketHandlers.onGetCargos)
    socket.on('save_cargo', cargoSocketHandlers.onSaveCargo)  
    socket.on('delete_cargo', cargoSocketHandlers.onDeleteCargo)
    socket.on('publish_cargo', cargoSocketHandlers.onPublishCargo)
    
    console.log('Cargo socket handlers initialized')
}

export const destroyCargoSocketHandlers = (socket: any) => {
    if (!socket) return
    
    // Отписываемся от событий
    socket.off('get_cargos', cargoSocketHandlers.onGetCargos)
    socket.off('save_cargo', cargoSocketHandlers.onSaveCargo)
    socket.off('delete_cargo', cargoSocketHandlers.onDeleteCargo)
    socket.off('publish_cargo', cargoSocketHandlers.onPublishCargo)
    
    console.log('Cargo socket handlers destroyed')
}


// src/Store/cargoStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================
// ТИПЫ (сохраняем существующие)
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
// ZUSTAND STORE
// ============================================
export interface CargoState {
    cargos:             CargoInfo[]
    archives:           CargoInfo[]
    isLoading:          boolean
    currentPage:        PageType
    filters:            CargoFilters
    searchQuery:        string
    navigationHistory:  PageType[]
}

interface CargoActions {
    setCargos:      (cargos: CargoInfo[]) => void
    setLoading:     (loading: boolean) => void
    setCurrentPage: (page: PageType) => void
    setFilters:     (filters: CargoFilters) => void
    setSearchQuery: (query: string) => void
    navigateTo:     (page: PageType) => void
    goBack:         () => void
    updateCargo:    (guid: string, data: Partial<CargoInfo>) => void
    publishCargo:   (guid: string) => void
    addCargo:       (cargo: CargoInfo) => void
    deleteCargo:    (guid: string) => void
}

type CargoStore = CargoState & CargoActions

export const useCargoStore = create<CargoStore>()(
  devtools(
    (set, get) => ({
      // STATE
      cargos:             [],
      archives:           [],
      isLoading:          false,
      currentPage:        { type: 'list' },
      filters:            {},
      searchQuery:        '',
      navigationHistory:  [{ type: 'list' }],

      // ACTIONS
      setCargos:          (cargos)        => set({ cargos }),
      setCargoArhcives:   (archives)      => set({ archives }),
      setLoading:         (isLoading)     => set({ isLoading }),
      setCurrentPage:     (currentPage)   => set({ currentPage }),
      setFilters:         (filters)       => set({ filters }),
      setSearchQuery:     (searchQuery)   => set({ searchQuery }),

      navigateTo: (page) => {
        const { navigationHistory } = get()
        set({ 
          currentPage: page,
          navigationHistory: [...navigationHistory, page]
        })
      },

      goBack: () => set({ currentPage: { type: 'list' } }),

      updateCargo: (guid, data) => {
        const { cargos } = get()
        const updated = cargos.map(c => 
          c.guid === guid ? { ...c, ...data } : c
        )
        set({ cargos: updated })
      },

      publishCargo: (guid) => {
        const { cargos } = get()
        const updated = cargos.map(c => 
          c.guid === guid ? { ...c, status: CargoStatus.WAITING } : c
        )
        set({ cargos: updated })
      },

      addCargo: (cargo) => {
        const { cargos } = get()
        set({ cargos: [...cargos, cargo] })
      },

      deleteCargo: (guid) => {
        const { cargos } = get()
        set({ cargos: cargos.filter(c => c.guid !== guid) })
      }
    }),
    { name: 'cargo-store' }
  )
)

// ============================================
// GETTERS (совместимость)
// ============================================
export const cargoGetters = {
  getCargo: (guid: string): CargoInfo | undefined => 
    useCargoStore.getState().cargos.find(c => c.guid === guid)
}

// ============================================
// ACTIONS (совместимость)
// ============================================
export const cargoActions = {
  updateCargo: (guid: string, data: Partial<CargoInfo>) => 
    useCargoStore.getState().updateCargo(guid, data),

  publishCargo: (guid: string) => 
    useCargoStore.getState().publishCargo(guid),

  deleteCargo: (guid: string) =>
    useCargoStore.getState().deleteCargo(guid)
}

// ============================================
// SOCKET ОБРАБОТЧИКИ
// ============================================
export const cargoSocketHandlers = {

    onGetCargos: (response: any) => {
        console.log('onGetCargos response:', response)
        useCargoStore.getState().setLoading(false)
        
        if (response.success && Array.isArray(response.data)) {
            useCargoStore.getState().setCargos(response.data)
        } else {
            console.error('Invalid cargos response:', response)
        }
    },

    onGetCargoArchives: (response: any) => {
        console.log('onGetCargoArchives response:', response)
        useCargoStore.getState().setLoading(false)
        
        if (response.success && Array.isArray(response.data)) {
            useCargoStore.getState().setCargos(response.data)
        } else {
            console.error('Invalid cargos response:', response)
        }
    },

    onSaveCargo: (response: any) => {
        console.log('onSaveCargo response:', response)
        
        if (response.success && response.data) {
            const { cargos } = useCargoStore.getState()
            const existingIndex = cargos.findIndex(c => c.guid === response.data.guid)
            
            if (existingIndex >= 0) {
                useCargoStore.getState().updateCargo(response.data.guid, response.data)
            } else {
                useCargoStore.getState().addCargo(response.data)
            }
        }
    },

    onDeleteCargo: (response: any) => {
        console.log('onDeleteCargo response:', response)
        
        if (response.success && response.guid) {
            useCargoStore.getState().deleteCargo(response.guid)
        }
    },

    onPublishCargo: (response: any) => {
        console.log('onPublishCargo response:', response)
        
        if (response.success && response.data) {
            useCargoStore.getState().updateCargo(response.data.guid, response.data)
        }
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ SOCKET ОБРАБОТЧИКОВ
// ============================================
export const initCargoSocketHandlers = (socket: any) => {
    if (!socket) return
    
    socket.on('get_cargos',           cargoSocketHandlers.onGetCargos)
    socket.on('get_cargo_archives',   cargoSocketHandlers.onGetCargoArchives)
    socket.on('save_cargo',           cargoSocketHandlers.onSaveCargo)  
    socket.on('delete_cargo',         cargoSocketHandlers.onDeleteCargo)
    socket.on('publish_cargo',        cargoSocketHandlers.onPublishCargo)
    
    console.log('Cargo socket handlers initialized')
}

export const destroyCargoSocketHandlers = (socket: any) => {
    if (!socket) return
    
    socket.off('get_cargos',          cargoSocketHandlers.onGetCargos)
    socket.off('get_cargo_archives',  cargoSocketHandlers.onGetCargoArchives)
    socket.off('save_cargo',          cargoSocketHandlers.onSaveCargo)
    socket.off('delete_cargo',        cargoSocketHandlers.onDeleteCargo)
    socket.off('publish_cargo',       cargoSocketHandlers.onPublishCargo)
    
    console.log('Cargo socket handlers destroyed')
}
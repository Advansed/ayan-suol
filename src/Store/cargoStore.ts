// src/Store/cargoStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================
// ТИПЫ (сохраняем существующие)
// ============================================
export interface  CargoCity {
    city: string,
    fias: string
}

export interface  CargoAddress {
    city: CargoCity;
    address: string;
    fias: string;
    lat: number;
    lon: number;
}

export type       DriverStatus    = 'Заказано'  | 'Принято'   | 'На погрузке'   | 'Загружается'   | 'Загружено'   | 'В пути'  | 'Прибыл'  | 'Доставлено'  | 'Разгружается'  |  'Разгружено'  | 'Завершено';


export type       DriverCardMode  = 'offered'   | 'assigned'  | 'to_load'       | 'on_load'       | 'loaded'      | 'on_way'  | 'delivered'   | 'on_unload'     | 'unloaded'    | 'completed';


export interface  DriverInfo {
    guid:           string;
    cargo:          string;
    recipient:      string;
    client:         string;
    weight:         number;
    volume:         number;
    status:         DriverStatus;
    transport:      string;
    capacity:       string;
    rating:         number;
    price:          number;

}

export interface CargoCompany {
    id: string;
    name: string;
}

export interface  CargoInfo {
    guid:           string;
    name:           string;
    description:    string;
    client:         string;
    company?:       CargoCompany;
    address:        CargoAddress;
    destiny:        CargoAddress;
    pickup_date:    string;
    delivery_date: string;
    weight: number;
    weight1?:       number;
    volume:         number;
    price:          number;
    cost:           number;
    advance:        number;
    insurance:      number;
    phone:          string;
    face:           string;
    status:         CargoStatus;
    invoices?:      DriverInfo[];
    priority?:      CargoPriority;
    publish_date?:  string;
    updatedAt?:     string;
    body_type?:     string;
    transport_type?: string | number | { id?: string | number; name?: string };
    vehicles_total?: number;
    vehicles_busy?: number;
}

export enum       CargoStatus {
    NEW             = "Новый",
    WAITING         = "В ожидании",
    HAS_ORDERS      = "Есть заказы",
    ACCEPTED        = "Принято",
    WAIT_LOAD       = "Ждет загрузку",
    LOADING         = "Загружается",
    HAS_LOADED      = "Есть загруженные",
    IN_TRANSIT      = "В Пути",
    HAS_DELIVERED   = "Есть доставленные",
    UNLOADING       = "Разгружается",
    WAIT_COMPLETE   = "Ждут завершения",
    COMPLETED       = "Завершено",
    PROBLEMS        = "Проблемы",
}

export enum       CargoPriority {
    LOW = 'low',
    NORMAL = 'normal', 
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface  PageType {
    type:       'list' | 'create' | 'edit' | 'view' | 'invoices' | 'prepayment' | 'insurance' | 'page1' | 'payment' | 'agreement'
    cargo?:     any
    subPage?:   string
    invoice?:   DriverInfo
    contract?:  any
}

export interface  CargoFilters {
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
    filters:            CargoFilters
    searchQuery:        string
}

interface CargoActions {
    setCargos:            ( cargos: CargoInfo[] ) => void
    setCargoArchives:     ( archives: CargoInfo[] ) => void
    setLoading:           ( loading: boolean ) => void
    setFilters:           ( filters: CargoFilters ) => void
    setSearchQuery:       ( query: string ) => void
    updateCargo:          ( guid: string, data: Partial<CargoInfo >) => void
    publishCargo:         ( guid: string ) => void
    addCargo:             ( cargo: CargoInfo ) => void
    deleteCargo:          ( guid: string ) => void
}

type CargoStore = CargoState & CargoActions

export const useCargoStore = create<CargoStore>()(
  devtools(
    (set, get) => ({
      // STATE
      cargos:             [],
      archives:           [],
      isLoading:          false,
      filters:            {},
      searchQuery:        '',

      // ACTIONS
      setCargos:          (cargos)        => set({ cargos }),
      setCargoArchives:   (archives)      => set({ archives }),
      setLoading:         (isLoading)     => set({ isLoading }),
      setFilters:         (filters)       => set({ filters }),
      setSearchQuery:     (searchQuery)   => set({ searchQuery }),

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

  getCargos: (): CargoInfo[] => useCargoStore.getState().cargos,

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

/** Последний payload set_cargo — чтобы не потерять insurance/advance, если сервер их не вернул */
let pendingCargoSave: Partial<CargoInfo> | null = null

export const setPendingCargoSave = (cargo: Partial<CargoInfo> | null) => {
  pendingCargoSave = cargo
}

const pickFinance = (
  key: 'advance' | 'insurance',
  incoming: Partial<CargoInfo>,
  fallback?: Partial<CargoInfo> | null
): number => {
  const fromIncoming = incoming[key]
  if (fromIncoming !== undefined && fromIncoming !== null) {
    return Number(fromIncoming) || 0
  }
  const fromFallback = fallback?.[key]
  if (fromFallback !== undefined && fromFallback !== null) {
    return Number(fromFallback) || 0
  }
  return 0
}

const mergeSavedCargo = (
  incoming: CargoInfo,
  existing?: CargoInfo
): CargoInfo => {
  const pending =
    pendingCargoSave &&
    (!incoming.guid ||
      !pendingCargoSave.guid ||
      pendingCargoSave.guid === incoming.guid)
      ? pendingCargoSave
      : null

  const base = { ...EMPTY_CARGO, ...existing, ...pending, ...incoming }
  return {
    ...base,
    advance: pickFinance('advance', incoming, pending ?? existing),
    insurance: pickFinance('insurance', incoming, pending ?? existing),
  }
}

// ============================================
// SOCKET ОБРАБОТЧИКИ
// ============================================
export const cargoSocketHandlers = {

    onGetCargos: (response: any) => {
        console.log('onGetCargos response:', response)
        useCargoStore.getState().setLoading(false)

        // Нормализация push/response: массив, { success, data }, или один cargo
        const raw = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : response?.data && typeof response.data === 'object' && response.data.guid
                ? [response.data]
                : null

        const ok = response?.success !== false

        if (ok && raw) {
            useCargoStore.getState().setCargos(raw)
        } else {
            console.error('Invalid cargos response:', response)
        }
    },

    onGetCargoArchives: (response: any) => {
        console.log('onGetCargoArchives response:', response)
        useCargoStore.getState().setLoading(false)
        
        if (response.success && Array.isArray( response.data )) {

            useCargoStore.getState().setCargoArchives( response.data as CargoInfo[] )

        } else {

            console.error('Invalid cargos response:', response)

        }
    },

    onSaveCargo: (response: any) => {
        console.log('onSaveCargo response:', response)
        
        if (response.success && response.data) {
            const { cargos } = useCargoStore.getState()
            const existing = cargos.find(c => c.guid === response.data.guid)
            const merged = mergeSavedCargo(response.data as CargoInfo, existing)
            pendingCargoSave = null

            if (existing) {
                useCargoStore.getState().updateCargo(merged.guid, merged)
            } else {
                useCargoStore.getState().addCargo(merged)
            }
        } else {
            pendingCargoSave = null
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
    },
    
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ SOCKET ОБРАБОТЧИКОВ
// ============================================
export const initCargoSocketHandlers = (socket: any) => {
    if (!socket) return

    console.log( "init cargo socket handlers" )
    
    socket.on('get_cargos',           cargoSocketHandlers.onGetCargos)
    socket.on('get_cargo_archives',   cargoSocketHandlers.onGetCargoArchives)
    socket.on('set_cargo',            cargoSocketHandlers.onSaveCargo)
    socket.on('delete_cargo',         cargoSocketHandlers.onDeleteCargo)
    socket.on('publish_cargo',        cargoSocketHandlers.onPublishCargo)
    
    console.log('Cargo socket handlers initialized')
}

export const destroyCargoSocketHandlers = (socket: any) => {
    if (!socket) return
    
    socket.off('get_cargos',          cargoSocketHandlers.onGetCargos)
    socket.off('get_cargo_archives',  cargoSocketHandlers.onGetCargoArchives)
    socket.off('set_cargo',           cargoSocketHandlers.onSaveCargo)
    socket.off('delete_cargo',        cargoSocketHandlers.onDeleteCargo)
    socket.off('publish_cargo',       cargoSocketHandlers.onPublishCargo)
    
    console.log('Cargo socket handlers destroyed')
}
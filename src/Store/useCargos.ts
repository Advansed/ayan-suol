// src/Store/useCargos.ts

import { useCallback, useEffect } from 'react'
import { UniversalStore, useStore, TState } from './Store'
import { useSocket } from './useSocket' // Заменили socketService на useSocket
import { useToast } from '../components/Toast'
import { useLogin } from './useLogin'

// ============================================
// ТИПЫ
// ============================================
export interface CargoCity {
    city:               string,
    fias:               string
}

// Адрес (отправления или назначения)
export interface CargoAddress {
    city:               CargoCity;
    address:            string;
    fias:               string;
    lat:                number;
    lon:                number;
}

// Предложение от водителя
export interface CargoInvoice {
    id:                 string;
    cargo:              string;
    driverId:           string;
    driverName:         string;
    driverPhone:        string;
    transport:          string;
    price:              number;
    weight:             number;
    volume:             number;
    status:             string;
    createdAt:          string;
    rating:             number;
}

export interface CargoInfo {
    guid:               string;
    name:               string;
    description:        string;
    client:             string;
    
    // Адреса
    address:            CargoAddress;
    destiny:            CargoAddress;

    //Даты
    pickup_date:        string;
    delivery_date:      string;

    // Характеристики груза
    weight:             number;
    weight1?:           number; // Для совместимости
    volume:             number;
    price:              number;
    cost:               number;
    advance:            number;
    insurance:          number;
    
    // Контакты
    phone:              string;
    face:               string;
    
    // Статус и предложения
    status:             CargoStatus;
    invoices?:          CargoInvoice[];
    priority?:          CargoPriority;
    
    // Метаданные
    createdAt?:         string;
    updatedAt?:         string;
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
    LOW                 = 'low',
    NORMAL              = 'normal', 
    HIGH                = 'high',
    URGENT              = 'urgent'
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

export interface UseCargosReturn {
    // State
    cargos:             CargoInfo[]
    isLoading:          boolean
    currentPage:        PageType
    filters:            CargoFilters
    searchQuery:        string
    
    // Navigation
    navigateTo:         (page: PageType) => void
    goBack:             () => void
    
    // Filters
    setFilters:         (filters: CargoFilters) => void  
    setSearchQuery:     (query: string) => void
    
    // CRUD
    createCargo:        (data: Partial<CargoInfo>) => Promise<boolean>
    updateCargo:        (guid: string, data: Partial<CargoInfo>) => Promise<boolean>
    deleteCargo:        (guid: string) => Promise<boolean>
    publishCargo:       (guid: string) => Promise<boolean>
    getCargo:           (guid: string) => CargoInfo | undefined
    refreshCargos:      () => Promise<void>
}

export interface CargoState extends TState {
    cargos:             CargoInfo[]
    isLoading:          boolean
    currentPage:        PageType
    filters:            CargoFilters
    searchQuery:        string
    navigationHistory:  PageType[]
}

// ============================================
// КОНСТАНТЫ
// ============================================
const SOCKET_EVENTS = {
    SAVE_CARGO: 'save_cargo',
    UPDATE_CARGO: 'update_cargo', 
    DELETE_CARGO: 'delete_cargo',
    PUBLISH_CARGO: 'publish_cargo',
    GET_CARGOS: 'get_cargos',
    GET_ORGS: 'get_orgs'
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
// HOOK
// ============================================
export const useCargos = (): UseCargosReturn => {
    const { token } = useLogin()
    const { emit, isConnected } = useSocket() // Интегрировали useSocket
    const toast = useToast()

    // State subscriptions
    const cargos                = useStore((state: CargoState) => state.cargos, 7001, cargoStore)
    const isLoading             = useStore((state: CargoState) => state.isLoading, 7002, cargoStore)
    const currentPage           = useStore((state: CargoState) => state.currentPage, 7003, cargoStore)
    const filters               = useStore((state: CargoState) => state.filters, 7004, cargoStore)
    const searchQuery           = useStore((state: CargoState) => state.searchQuery, 7005, cargoStore)
    const navigationHistory     = useStore((state: CargoState) => state.navigationHistory, 7006, cargoStore)

    // ============================================
    // НАВИГАЦИЯ
    // ============================================
    const navigateTo = useCallback((page: PageType) => {
        cargoStore.batchUpdate({
            navigationHistory: [...navigationHistory, currentPage],
            currentPage: page
        })
    }, [currentPage, navigationHistory])

    const goBack = useCallback(() => {
        cargoStore.dispatch({ 
            type: 'currentPage', 
            data: { type: 'list' } 
        })
    }, [])

    // ============================================
    // ФИЛЬТРЫ И ПОИСК
    // ============================================
    const setFilters = useCallback((newFilters: CargoFilters) => {
        cargoStore.dispatch({ type: 'filters', data: newFilters })
    }, [])

    const setSearchQuery = useCallback((query: string) => {
        cargoStore.dispatch({ type: 'searchQuery', data: query })
    }, [])

    // ============================================
    // CRUD ОПЕРАЦИИ
    // ============================================
    const createCargo = useCallback(async (data: Partial<CargoInfo>): Promise<boolean> => {
        // Проверка подключения
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
        try {
            const newCargo: CargoInfo = {
                ...EMPTY_CARGO,
                ...data,
                guid: generateGuid(), // TODO: Добавить утилиту generateGuid
                status: CargoStatus.NEW,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            console.log('Creating cargo:', newCargo)

            // Отправляем через useSocket
            emit(SOCKET_EVENTS.SAVE_CARGO, { token, ...newCargo })

            // Оптимистичное обновление
            cargoStore.dispatch({ 
                type: 'cargos', 
                data: [...cargos, newCargo] 
            })

            // Переходим к списку
            cargoStore.dispatch({ 
                type: 'currentPage', 
                data: { type: 'list' } 
            })

            return true
        } catch (error) {
            console.error('Error creating cargo:', error)
            toast.error('Ошибка создания груза')
            return false
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast, cargos])

    const updateCargo = useCallback(async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
        try {
            console.log("formData", data)
            console.log("cargos", cargos)
            const existingCargo = cargos.find(c => c.guid === guid)
            if (!existingCargo) {
                console.error('Cargo not found:', guid)
                toast.error('Груз не найден')
                return false
            }

            const updatedCargo: CargoInfo = {
                ...existingCargo,
                ...data,
                updatedAt: new Date().toISOString()
            }

            console.log('Updating cargo:', updatedCargo)

            // Отправляем через useSocket
            emit(SOCKET_EVENTS.SAVE_CARGO, { token, ...updatedCargo })

            // Обновляем локально
            const updatedCargos = cargos.map(c => 
                c.guid === guid ? updatedCargo : c
            )
            cargoStore.dispatch({ type: 'cargos', data: updatedCargos })

            return true
        } catch (error) {
            console.error('Error updating cargo:', error)
            toast.error('Ошибка обновления груза')
            return false
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast, cargos])

    const deleteCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
        try {
            console.log('Deleting cargo:', { guid, token })

            // Отправляем через useSocket
            emit(SOCKET_EVENTS.DELETE_CARGO, { guid, token })

            // Удаляем локально
            const updatedCargos = cargos.filter(c => c.guid !== guid)
            cargoStore.dispatch({ type: 'cargos', data: updatedCargos })

            // Возвращаемся к списку
            cargoStore.dispatch({ 
                type: 'currentPage', 
                data: { type: 'list' } 
            })

            return true
        } catch (error) {
            console.error('Error deleting cargo:', error)
            toast.error('Ошибка удаления груза')
            return false
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast, cargos])

    const publishCargo = useCallback(async (guid: string): Promise<boolean> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
        try {
            const cargo = cargos.find(c => c.guid === guid)
            if (!cargo) {
                console.error('Cargo not found for publishing:', guid)
                toast.error('Груз не найден')
                return false
            }

            console.log('Publishing cargo:', { guid, token })

            // Отправляем через useSocket
            emit(SOCKET_EVENTS.PUBLISH_CARGO, { guid, token })

            return true
        } catch (error) {
            console.error('Error publishing cargo:', error)
            toast.error('Ошибка публикации груза')
            return false
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit, toast, cargos])

    const getCargo = useCallback((guid: string): CargoInfo | undefined => {
        return cargos.find(cargo => cargo.guid === guid)
    }, [cargos])

    const refreshCargos = useCallback(async (): Promise<void> => {
        if (!isConnected) {
            toast.error('Нет соединения с сервером')
            return
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })
        try {
            console.log('Refreshing cargos...')
            
            // Отправляем через useSocket
            emit(SOCKET_EVENTS.GET_CARGOS, { token })
            emit(SOCKET_EVENTS.GET_ORGS, { token })
            
        } catch (error) {
            console.error('Error refreshing cargos:', error)
            toast.error('Ошибка обновления данных')
        } finally {
            cargoStore.dispatch({ type: 'isLoading', data: false })
        }
    }, [token, isConnected, emit ])

    // ============================================
    // SOCKET ОБРАБОТЧИКИ
    // ============================================
    useEffect(() => {
        console.log("useCargos effect")

    }, [])

    return {
        // State
        cargos,
        isLoading,
        currentPage,
        filters,
        searchQuery,
        
        // Navigation
        navigateTo,
        goBack,
        
        // Filters
        setFilters,
        setSearchQuery,
        
        // CRUD
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,
        getCargo,
        refreshCargos
    }
}

// ============================================
// УТИЛИТЫ
// ============================================
// TODO: Перенести из dataUtils или создать здесь
const generateGuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
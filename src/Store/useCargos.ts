// src/Store/useCargos.ts

import { useCallback } from 'react'
import { UniversalStore, useStore, TState } from './Store'
import socketService from '../components/Sockets'
import { useToast } from '../components/Toast'
import { useLogin } from './useLogin'

// ============================================
// ТИПЫ
// ============================================

export interface CargoInfo {
    guid: string
    status: CargoStatus
    priority?: CargoPriority
    createdAt: string
    updatedAt: string
    
    // Основная информация
    name?: string
    description?: string
    weight?: number
    volume?: number
    
    // Адреса
    fromAddress?: CargoAddress
    toAddress?: CargoAddress
    
    // Финансы
    price?: number
    currency?: string
    invoices?: CargoInvoice[]
    
    // Даты
    loadingDate?: string
    deliveryDate?: string
}

export enum CargoStatus {
    NEW = 'new',
    DRAFT = 'draft', 
    PUBLISHED = 'published',
    IN_PROGRESS = 'in_progress',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum CargoPriority {
    LOW = 'low',
    NORMAL = 'normal', 
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface CargoAddress {
    city?: string
    address?: string
    coordinates?: [number, number]
    contactPerson?: string
    contactPhone?: string
}

export interface CargoInvoice {
    id: string
    type: string
    amount: number
    status: string
    date?: string
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
    city?: string
    minPrice?: number
    maxPrice?: number
}

export interface UseCargosReturn {
    // State
    cargos: CargoInfo[]
    isLoading: boolean
    currentPage: PageType
    filters: CargoFilters
    searchQuery: string
    
    // Navigation
    navigateTo: (page: PageType) => void
    goBack: () => void
    
    // Filters
    setFilters: (filters: CargoFilters) => void  
    setSearchQuery: (query: string) => void
    
    // CRUD
    createCargo: (data: Partial<CargoInfo>) => Promise<boolean>
    updateCargo: (guid: string, data: Partial<CargoInfo>) => Promise<boolean>
    deleteCargo: (guid: string) => Promise<boolean>
    publishCargo: (guid: string) => Promise<boolean>
    getCargo: (guid: string) => CargoInfo | undefined
    refreshCargos: () => Promise<void>
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

const SOCKET_EVENTS = {
    SAVE_CARGO: 'save_cargo',
    UPDATE_CARGO: 'update_cargo', 
    DELETE_CARGO: 'delete_cargo',
    PUBLISH_CARGO: 'publish_cargo',
    GET_CARGOS: 'get_cargos'
}

const EMPTY_CARGO: Partial<CargoInfo> = {
    name: '',
    description: '',
    weight: 0,
    volume: 0,
    price: 0,
    currency: 'RUB'
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

// ============================================
// HOOK
// ============================================

export const useCargos = (): UseCargosReturn => {
    const { token } = useLogin()
    const toast = useToast()

    // State subscriptions
    const cargos = useStore((state: CargoState) => state.cargos, 7001, cargoStore)
    const isLoading = useStore((state: CargoState) => state.isLoading, 7002, cargoStore)
    const currentPage = useStore((state: CargoState) => state.currentPage, 7003, cargoStore)
    const filters = useStore((state: CargoState) => state.filters, 7004, cargoStore)
    const searchQuery = useStore((state: CargoState) => state.searchQuery, 7005, cargoStore)
    const navigationHistory = useStore((state: CargoState) => state.navigationHistory, 7006, cargoStore)

    // ============================================
    // NAVIGATION
    // ============================================

    const navigateTo = useCallback((page: PageType) => {
        const currentState = cargoStore.getState()
        cargoStore.batchUpdate({
            navigationHistory: [...currentState.navigationHistory, currentState.currentPage],
            currentPage: page
        })
    }, [])

    const goBack = useCallback(() => {
        cargoStore.dispatch({ type: 'currentPage', data: { type: 'list' } })
    }, [])

    // ============================================
    // FILTERS & SEARCH
    // ============================================

    const setFilters = useCallback((newFilters: CargoFilters) => {
        cargoStore.dispatch({ type: 'filters', data: newFilters })
    }, [])

    const setSearchQuery = useCallback((query: string) => {
        cargoStore.dispatch({ type: 'searchQuery', data: query })
    }, [])

    // ============================================
    // CRUD OPERATIONS
    // ============================================

    const createCargo = useCallback(async (data: Partial<CargoInfo>): Promise<boolean> => {
        const socket = socketService.getSocket()
        if (!socket || !token) {
            toast.error('Нет подключения')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })

        try {
            const newCargo: CargoInfo = {
                ...EMPTY_CARGO,
                ...data,
                guid: generateGuid(),
                status: CargoStatus.NEW,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as CargoInfo

            // Optimistic update
            const currentCargos = cargoStore.getState().cargos
            cargoStore.dispatch({ 
                type: 'cargos', 
                data: [...currentCargos, newCargo] 
            })

            // Socket emit
            socket.emit(SOCKET_EVENTS.SAVE_CARGO, { token, ...newCargo })

            cargoStore.dispatch({ type: 'isLoading', data: false })
            toast.success('Груз создан')
            return true

        } catch (error) {
            cargoStore.dispatch({ type: 'isLoading', data: false })
            toast.error('Ошибка создания груза')
            return false
        }
    }, [token])

    const updateCargo = useCallback(async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {
        const socket = socketService.getSocket()
        if (!socket || !token) {
            toast.error('Нет подключения')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })

        try {
            // Optimistic update
            const currentCargos = cargoStore.getState().cargos
            const updatedCargos = currentCargos.map(cargo => 
                cargo.guid === guid ? { ...cargo, ...data, updatedAt: new Date().toISOString() } : cargo
            )
            cargoStore.dispatch({ type: 'cargos', data: updatedCargos })

            // Socket emit
            socket.emit(SOCKET_EVENTS.UPDATE_CARGO, { token, guid, ...data })

            cargoStore.dispatch({ type: 'isLoading', data: false })
            toast.success('Груз обновлен')
            return true

        } catch (error) {
            cargoStore.dispatch({ type: 'isLoading', data: false })
            toast.error('Ошибка обновления груза')
            return false
        }
    }, [token])

    const deleteCargo = useCallback(async (guid: string): Promise<boolean> => {
        const socket = socketService.getSocket()
        if (!socket || !token) {
            toast.error('Нет подключения')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })

        try {
            // Optimistic update
            const currentCargos = cargoStore.getState().cargos
            const filteredCargos = currentCargos.filter(cargo => cargo.guid !== guid)
            cargoStore.dispatch({ type: 'cargos', data: filteredCargos })

            // Socket emit
            socket.emit(SOCKET_EVENTS.DELETE_CARGO, { token, guid })

            cargoStore.dispatch({ type: 'isLoading', data: false })
            toast.success('Груз удален')
            return true

        } catch (error) {
            cargoStore.dispatch({ type: 'isLoading', data: false })
            toast.error('Ошибка удаления груза')
            return false
        }
    }, [token])

    const publishCargo = useCallback(async (guid: string): Promise<boolean> => {
        const socket = socketService.getSocket()
        if (!socket || !token) {
            toast.error('Нет подключения')
            return false
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })

        try {
            // Optimistic update
            const currentCargos = cargoStore.getState().cargos
            const updatedCargos = currentCargos.map(cargo => 
                cargo.guid === guid ? { ...cargo, status: CargoStatus.PUBLISHED } : cargo
            )
            cargoStore.dispatch({ type: 'cargos', data: updatedCargos })

            // Socket emit  
            socket.emit(SOCKET_EVENTS.PUBLISH_CARGO, { token, guid })

            cargoStore.dispatch({ type: 'isLoading', data: false })
            toast.success('Груз опубликован')
            return true

        } catch (error) {
            cargoStore.dispatch({ type: 'isLoading', data: false })
            toast.error('Ошибка публикации груза')
            return false
        }
    }, [token])

    // ============================================
    // HELPERS
    // ============================================

    const getCargo = useCallback((guid: string): CargoInfo | undefined => {
        return cargos.find(cargo => cargo.guid === guid)
    }, [cargos])

    const refreshCargos = useCallback(async () => {
        const socket = socketService.getSocket()
        if (!socket || !token) {
            toast.error('Нет подключения')
            return
        }

        cargoStore.dispatch({ type: 'isLoading', data: true })

        socket.once(SOCKET_EVENTS.GET_CARGOS, (response) => {
            cargoStore.dispatch({ type: 'isLoading', data: false })
            
            if (response.success && response.data) {
                cargoStore.dispatch({ type: 'cargos', data: response.data })
            } else {
                toast.error('Ошибка загрузки грузов')
            }
        })

        socket.emit(SOCKET_EVENTS.GET_CARGOS, { token })
    }, [token])

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
// UTILITIES
// ============================================

function generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
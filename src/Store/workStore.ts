// src/Store/workStore.ts
import { UniversalStore, TState } from './Store'
import { 
    WorkInfo, 
    WorkStatus, 
    WorkPageType, 
    WorkFilters, 
    OfferInfo
} from '../components/Works/types'

// ============================================
// ТИПЫ
// ============================================
export interface WorkState extends TState {
    works: WorkInfo[]
    archiveWorks: WorkInfo[]
    isLoading: boolean
    isArchiveLoading: boolean
    currentPage: WorkPageType
    filters: WorkFilters
    searchQuery: string
    navigationHistory: WorkPageType[]
}

// ============================================
// КОНСТАНТЫ
// ============================================
export const EMPTY_WORK: WorkInfo = {
    guid: '',
    cargo: '',
    recipient: '',
    client: '',
    name: '',
    description: '',
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
    volume: 0,
    price: 0,
    phone: '',
    face: '',
    status: WorkStatus.NEW
}

// ============================================
// STORE
// ============================================
export const workStore = new UniversalStore<WorkState>({
    initialState: {
        works: [],
        archiveWorks: [],
        isLoading: false,
        isArchiveLoading: false,
        currentPage: { type: 'list' },
        filters: {},
        searchQuery: '',
        navigationHistory: [{ type: 'list' }]
    },
    enableLogging: true
})

// ============================================
// GETTERS
// ============================================
export const workGetters = {

    getWork: (guid: string): WorkInfo | undefined => {
        return workStore.getState().works.find(w => w.guid === guid)
    },

    getArchiveWork: (guid: string): WorkInfo | undefined => {
        return workStore.getState().archiveWorks.find(w => w.guid === guid)
    },

    getCurrentWork: (): WorkInfo | undefined => {
        const currentPage = workStore.getState().currentPage
        return currentPage.type === 'view' || currentPage.type === 'offer' || currentPage.type === 'map' 
            ? currentPage.work 
            : undefined
    },

    getOffer: (workId: string): OfferInfo | undefined => {
        const work = workGetters.getWork(workId)
        return work?.currentOffer
    }

}

// ============================================
// ACTIONS
// ============================================
export const workActions = {

    updateWork: (guid: string, data: Partial<WorkInfo>) => {
        const works = workStore.getState().works
        const updated = works.map(w => 
            w.guid === guid ? { ...w, ...data } : w
        )
        workStore.dispatch({ type: 'works', data: updated })
    },

    updateOffer: (workId: string, offerData: Partial<OfferInfo>) => {
        const works = workStore.getState().works
        const updated = works.map(w => 
            w.guid === workId 
                ? { ...w, currentOffer: w.currentOffer ? { ...w.currentOffer, ...offerData } : undefined }
                : w
        )
        workStore.dispatch({ type: 'works', data: updated })
    },

    addToArchive: (guid: string) => {
        const works = workStore.getState().works
        const archiveWorks = workStore.getState().archiveWorks
        const work = works.find(w => w.guid === guid)
        
        if (work) {
            const updatedWorks = works.filter(w => w.guid !== guid)
            const updatedArchive = [...archiveWorks, { ...work, status: WorkStatus.COMPLETED }]
            
            workStore.dispatch({ type: 'works', data: updatedWorks })
            workStore.dispatch({ type: 'archiveWorks', data: updatedArchive })
        }
    },

    markCompleted: (guid: string) => {
        workActions.updateWork(guid, { status: WorkStatus.COMPLETED })
        workActions.addToArchive(guid)
    }

}

// ============================================
// SOCKET ОБРАБОТЧИКИ
// ============================================
export const workSocketHandlers = {

    onGetWorks: (response: any) => {
        console.log('onGetWorks response:', response)
        workStore.dispatch({ type: 'isLoading', data: false })
        
        if (response.success && Array.isArray(response.data)) {
            workStore.dispatch({ type: 'works', data: response.data })
        } else {
            console.error('Invalid works response:', response)
        }
    },

    onGetArchive: (response: any) => {
        console.log('onGetArchive response:', response)
        workStore.dispatch({ type: 'isArchiveLoading', data: false })
        
        if (response.success && Array.isArray(response.data)) {
            workStore.dispatch({ type: 'archiveWorks', data: response.data })
        } else {
            console.error('Invalid archive response:', response)
        }
    }

}

// ============================================
// ИНИЦИАЛИЗАЦИЯ SOCKET ОБРАБОТЧИКОВ
// ============================================
export const initWorkSocketHandlers = (socket: any) => {
    if (!socket) return
    
    socket.on('get_works',          workSocketHandlers.onGetWorks)
    socket.on('get_archive',        workSocketHandlers.onGetArchive)
    
    console.log('Work socket handlers initialized')
}

export const destroyWorkSocketHandlers = (socket: any) => {
    if (!socket) return
    
    socket.off('get_works',         workSocketHandlers.onGetWorks)
    socket.off('get_archive',       workSocketHandlers.onGetArchive)
    
    console.log('Work socket handlers destroyed')
}
// src/Store/workStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
    WorkInfo, 
    WorkStatus, 
    WorkPageType, 
    WorkFilters, 
    OfferInfo, 
    WorkPriority
} from '../components/Works/types'

// ============================================
// ТИПЫ
// ============================================
export interface WorkState {
  works:              WorkInfo[]
  archiveWorks:       WorkInfo[]
  isLoading:          boolean
  isArchiveLoading:   boolean
  currentPage:        WorkPageType
  filters:            WorkFilters
  searchQuery:        string
  navigationHistory:  WorkPageType[]
  error:              string | null
}

interface WorkActions {
  setWorks:               ( works: WorkInfo[] ) => void
  setArchiveWorks:        ( archiveWorks: WorkInfo[] ) => void
  setLoading:             ( loading: boolean ) => void
  setArchiveLoading:      ( loading: boolean ) => void
  setCurrentPage:         ( page: WorkPageType ) => void
  setFilters:             ( filters: WorkFilters ) => void
  setSearchQuery:         ( query: string ) => void
  setNavigationHistory:   ( history: WorkPageType[] ) => void
  setError:               ( error: string | null ) => void
  updateWork:             ( guid: string, data: Partial<WorkInfo> ) => void
  addToArchive:           ( guid: string ) => void
  markCompleted:          ( guid: string ) => void
  clearError:             ( ) => void
  reset:                  ( ) => void
}

type WorkStore = WorkState & WorkActions

// ============================================
// КОНСТАНТЫ
// ============================================

export const EMPTY_WORK: WorkInfo = {
  guid:           '',
  cargo:          '',
  recipient:      '',
  client:         '',
  name:           '',
  transport:      '',
  description:    '',

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
  weight:         0,
  volume:         0,
  price:          0,
  advance:        0,
  insurance:      0,

  pickup_date:    '',
  delivery_date:  '',

  phone:          '',
  face:           '',

  status:         WorkStatus.NEW

}

// ============================================
// ZUSTAND STORE
// ============================================
export const useWorkStore = create<WorkStore>()(
  devtools(
    (set, get) => ({
      // STATE
      works: [],
      archiveWorks: [],
      isLoading: false,
      isArchiveLoading: false,
      currentPage: { type: 'list' },
      filters: {},
      searchQuery: '',
      navigationHistory: [{ type: 'list' }],
      error: null,

      // ACTIONS
      setWorks: (works) => set({ works }),
      setArchiveWorks: (archiveWorks) => set({ archiveWorks }),
      setLoading: (isLoading) => set({ isLoading }),
      setArchiveLoading: (isArchiveLoading) => set({ isArchiveLoading }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setFilters: (filters) => set({ filters }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setNavigationHistory: (navigationHistory) => set({ navigationHistory }),
      setError: (error) => set({ error }),

      updateWork: (guid, data) => {
        const { works } = get()
        const updated = works.map(w => 
          w.guid === guid ? { ...w, ...data } : w
        )
        set({ works: updated })
      },

      addToArchive: (guid) => {
        const { works, archiveWorks } = get()
        const work = works.find(w => w.guid === guid)
        
        if (work) {
          const updatedWorks = works.filter(w => w.guid !== guid)
          const updatedArchive = [...archiveWorks, { ...work, status: WorkStatus.COMPLETED }]
          
          set({ 
            works: updatedWorks,
            archiveWorks: updatedArchive
          })
        }
      },

      markCompleted: (guid) => {
        const { updateWork, addToArchive } = get()
        updateWork(guid, { status: WorkStatus.COMPLETED })
        addToArchive(guid)
      },

      clearError: () => set({ error: null }),


      reset: () => set({
        works: [],
        archiveWorks: [],
        isLoading: false,
        isArchiveLoading: false,
        currentPage: { type: 'list' },
        filters: {},
        searchQuery: '',
        navigationHistory: [{ type: 'list' }],
        error: null
      })
      
    }),
    { name: 'work-store' }
  )
)

// ============================================
// GETTERS
// ============================================
export const workGetters = {
  getWorks: (): WorkInfo[] => useWorkStore.getState().works,
  getArchiveWorks: (): WorkInfo[] => useWorkStore.getState().archiveWorks,
  isLoading: (): boolean => useWorkStore.getState().isLoading,
  isArchiveLoading: (): boolean => useWorkStore.getState().isArchiveLoading,
  getError: (): string | null => useWorkStore.getState().error,

  getWork: (guid: string): WorkInfo | undefined => {
    return useWorkStore.getState().works.find(w => w.guid === guid)
  },

  getArchiveWork: (guid: string): WorkInfo | undefined => {
    return useWorkStore.getState().archiveWorks.find(w => w.guid === guid)
  },

  getCurrentWork: (): WorkInfo | undefined => {
    const currentPage = useWorkStore.getState().currentPage
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
  setWorks: (works: WorkInfo[]) => useWorkStore.getState().setWorks(works),
  setArchiveWorks: (archiveWorks: WorkInfo[]) => useWorkStore.getState().setArchiveWorks(archiveWorks),
  setLoading: (loading: boolean) => useWorkStore.getState().setLoading(loading),
  setArchiveLoading: (loading: boolean) => useWorkStore.getState().setArchiveLoading(loading),
  setCurrentPage: (page: WorkPageType) => useWorkStore.getState().setCurrentPage(page),
  setFilters: (filters: WorkFilters) => useWorkStore.getState().setFilters(filters),
  setSearchQuery: (query: string) => useWorkStore.getState().setSearchQuery(query),
  setNavigationHistory: (history: WorkPageType[]) => useWorkStore.getState().setNavigationHistory(history),
  setError: (error: string | null) => useWorkStore.getState().setError(error),
  updateWork: (guid: string, data: Partial<WorkInfo>) => useWorkStore.getState().updateWork(guid, data),
  addToArchive: (guid: string) => useWorkStore.getState().addToArchive(guid),
  markCompleted: (guid: string) => useWorkStore.getState().markCompleted(guid),
  clearError: () => useWorkStore.getState().clearError(),
  reset: () => useWorkStore.getState().reset()
}

// ============================================
// SOCKET ОБРАБОТЧИКИ
// ============================================
export const workSocketHandlers = {
  onGetWorks: (response: any) => {
    console.log('onGetWorks response:', response)
    
    workActions.setLoading(false)
    
    if (response.success && Array.isArray(response.data)) {
      workActions.setWorks(response.data)
    } else {
      console.error('Invalid works response:', response)
      workActions.setError(response.message || 'Failed to load works')
    }
  },

  onGetArchive: (response: any) => {
    console.log('onGetArchive response:', response)
    
    workActions.setArchiveLoading(false)
    
    if (response.success && Array.isArray(response.data)) {
      workActions.setArchiveWorks(response.data)
    } else {
      console.error('Invalid archive response:', response)
      workActions.setError(response.message || 'Failed to load archive')
    }
  }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ SOCKET ОБРАБОТЧИКОВ
// ============================================
export const initWorkSocketHandlers = (socket: any) => {
  if (!socket) return
  
  socket.on('get_works', workSocketHandlers.onGetWorks)
  socket.on('get_work_archives', workSocketHandlers.onGetArchive)
  
  console.log('Work socket handlers initialized')
}

export const destroyWorkSocketHandlers = (socket: any) => {
  if (!socket) return
  
  socket.off('get_works', workSocketHandlers.onGetWorks)
  socket.off('get_work_archives', workSocketHandlers.onGetArchive)
  
  console.log('Work socket handlers destroyed')
}
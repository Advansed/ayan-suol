import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { PageType } from './cargoStore'

export interface NavigateState {
    currentPage:        PageType
    navigationHistory:  PageType[]
}

interface NavigateActions {
    navigateTo:   (page: PageType) => void
    goBack:       () => void
}

type NavigateStore = NavigateState & NavigateActions

export const useNavigateStore = create<NavigateStore>()(
  devtools(
    (set, get) => ({
      currentPage:        { type: 'list' },
      navigationHistory:  [{ type: 'list' }],

      navigateTo: (page) => {
        const { navigationHistory } = get()
        set({
          currentPage: page,
          navigationHistory: [...navigationHistory, page],
        })
      },

      goBack: () => {
        const { navigationHistory } = get()
        if (navigationHistory.length <= 1) {
          set({ currentPage: { type: 'list' } })
          return
        }
        const nextHistory = navigationHistory.slice(0, -1)
        const currentPage = nextHistory[nextHistory.length - 1]
        set({ currentPage, navigationHistory: nextHistory })
      },
    }),
    { name: 'navigate-store' }
  )
)

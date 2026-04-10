import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { PageType } from './cargoStore'

const MAX_NAV_HISTORY = 50

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
        const appended = [...navigationHistory, page]
        const capped =
          appended.length > MAX_NAV_HISTORY
            ? appended.slice(-MAX_NAV_HISTORY)
            : appended
        set({
          currentPage: page,
          navigationHistory: capped,
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

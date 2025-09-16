// src/Store/useWorkNavigation.ts
import { useCallback } from 'react'
import { useWorkStore } from '../../../Store/workStore'
import { WorkPageType } from '../types'

export const useWorkNavigation = () => {
  const currentPage         = useWorkStore(state => state.currentPage)
  const navigationHistory   = useWorkStore(state => state.navigationHistory)

  const navigateTo = useCallback((page: WorkPageType) => {
    useWorkStore.getState().setNavigationHistory([...navigationHistory, page])
    useWorkStore.getState().setCurrentPage(page)
  }, [navigationHistory])

  const goBack = useCallback(() => {
    useWorkStore.getState().setCurrentPage({ type: 'list' })
  }, [])

  return {
    currentPage,
    navigationHistory,
    navigateTo,
    goBack
  }
}
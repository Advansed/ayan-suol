// src/Store/useCargoNavigation.ts
import { useCallback } from 'react'
import { useCargoStore, CargoInfo } from '../../../Store/cargoStore'

export const useCargoNavigation = () => {
    const currentPage   = useCargoStore(state => state.currentPage)
    const navigateTo    = useCargoStore(state => state.navigateTo)
    
    const goBack        = useCallback(() => {

        if (currentPage.type === 'view') { navigateTo({ type: 'list' })} 
        else if (currentPage.type === 'create') { navigateTo({ type: 'list' })} 
        else { navigateTo({ type: 'view', cargo: currentPage.cargo }) }

    }, [currentPage, navigateTo])

    const handleCreateNew = useCallback(() => {

        navigateTo({ type: 'create' })

    }, [navigateTo])

    const handleCargoClick = useCallback((cargo: CargoInfo) => {

        navigateTo({ type: 'view', cargo })
        
    }, [navigateTo])

    return {
        currentPage,
        navigateTo,
        goBack,
        handleCreateNew,
        handleCargoClick
    }
}
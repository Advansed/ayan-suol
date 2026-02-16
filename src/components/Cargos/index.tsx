import './styles.css';

import React, { useEffect, useCallback }       from 'react';
import { useCargos }                                    from './hooks/useCargos';
import { CargosList }                                   from './components/CargosList';
import { CargoView }                                    from './components/CargoView';
import { CargoInvoice }                                 from './components/CargoInvoices';
import { InsurancePage }                                from './components/InsurancePage';
import { cargoGetters, CargoInfo, EMPTY_CARGO }         from '../../Store/cargoStore';
import { CargoNew }                                               from './components';
import { IonLoading }                                   from '@ionic/react';
import { useCargoNavigation }                           from './hooks/useNavigation';
import { PrepaymentPage }                               from './components/PrePayment';

export const Cargos: React.FC = () => {
    
    const { cargos, isLoading, createCargo, updateCargo, deleteCargo, publishCargo, refreshCargos } = useCargos()
    const { currentPage, navigateTo, handleCreateNew, handleCargoClick } = useCargoNavigation()
    

    useEffect(()                    => {
        if (currentPage.cargo?.guid) {
            const cargo = cargoGetters.getCargo(currentPage.cargo.guid);
            // Проверяем, что cargo существует и отличается от текущего
            if (cargo && cargo !== currentPage.cargo) {
                navigateTo({ type: currentPage.type, cargo: cargo });
            }
        }
    }, [cargos, currentPage.cargo?.guid, currentPage.type, navigateTo]);

    const handleBack                = useCallback(() => {
        if (currentPage.type === 'view' || currentPage.type === 'create') {
            navigateTo({ type: 'list' });
        } else if (currentPage.cargo?.guid) {
            const cargo = cargoGetters.getCargo(currentPage.cargo.guid);
            navigateTo({ type: 'view', cargo: cargo });
            console.log("back", 'view', cargo )
        }
    }, [currentPage.type, currentPage.cargo?.guid, navigateTo]);


    // Функция рендеринга контента
    const renderContent = () => {
        console.log(currentPage);
        
        if (currentPage.cargo) {
            switch (currentPage.type) {
                case 'edit':
                    return (
                        <CargoNew
                            cargo       = { currentPage.cargo as CargoInfo }
                            onUpdate    = { updateCargo }
                            onCreate    = { createCargo }
                            onBack      = { handleBack }
                        />
                    );

                case 'view':
                    return (
                        <CargoView
                            cargo       = { currentPage.cargo! }
                            onEdit      = { (cargo) => navigateTo({ type: 'edit', cargo }) }
                            onDelete    = { deleteCargo }
                            onPublish   = { publishCargo }
                            onInvoices  = { (cargo) => navigateTo({ type: 'invoices', cargo }) }
                            onPayment   = { (cargo) => navigateTo({ type: 'prepayment', cargo }) }
                            onInsurance = { (cargo) => navigateTo({ type: 'insurance', cargo }) }
                            onBack      = { handleBack }
                        />
                    );

                case 'invoices':
                    return (
                        <CargoInvoice
                            cargo       = { currentPage.cargo! }
                            onBack      = { handleBack }
                        />
                    );

                case 'prepayment':
                    return (
                        <PrepaymentPage
                            cargo={currentPage.cargo}
                            onBack={handleBack}
                        />
                    );

                case 'insurance':
                    return (
                        <InsurancePage
                            cargo={currentPage.cargo!}
                            onBack={handleBack}
                        />
                    );

                case 'payment':
                    return (
                        <PrepaymentPage
                            cargo={currentPage.cargo}
                            onBack={handleBack}
                        />
                    );

                case 'list':
                    return <>
                        {
                            currentPage.cargo ? (
                                <CargosList
                                    cargos          = { cargos }
                                    onCargoClick    = { handleCargoClick }
                                    onCreateNew     = { handleCreateNew }
                                    onRefresh       = { refreshCargos }
                                />
                            ): (
                                <CargosList
                                    cargos={cargos}
                                    onCargoClick={handleCargoClick}
                                    onCreateNew={handleCreateNew}
                                    onRefresh={refreshCargos}
                                />    
                            )                               
                        }
                    </>

                case 'create':
                    return <>
                        <CargoNew
                            cargo       = { EMPTY_CARGO }
                            onUpdate    = { updateCargo }
                            onCreate    = { createCargo } 
                            onBack      = { handleBack }
                        />
                    </>
    
                default:
                    return (
                        <CargosList
                            cargos={cargos}
                            onCargoClick={handleCargoClick}
                            onCreateNew={handleCreateNew}
                            onRefresh={refreshCargos}
                        />
                    );
            }
        } else {
            switch (currentPage.type) {
                case 'create':
                    return (
                        <CargoNew
                            cargo={EMPTY_CARGO}
                            onUpdate={updateCargo}
                            onCreate={createCargo}
                            onBack={handleBack}
                        />
                    );

                default:
                    return (
                        <CargosList
                            cargos={cargos}
                            onCargoClick={handleCargoClick}
                            onCreateNew={handleCreateNew}
                            onRefresh={refreshCargos}
                        />
                    );
            }
        }
    };

    return (
        <div className="cargos-module">
            <IonLoading isOpen={isLoading} message="Подождите" />

            {renderContent()}

        </div>
    );
    
};

// Экспорты для внешнего использования
export { default as CargoArchive } from './components/CargoArchive';

// Основные типы для внешнего использования
export type { 
    CargoInfo, 
    CargoStatus, 
    CargoPriority,
    CargoAddress,
    PageType,
    CargoFilters
} from '../../Store/cargoStore';


// Компоненты для внешнего использования
export { 
    CargoCard, 
    CargoForm, 
    CargosList
} from './components';

// Утилиты для внешнего использования
export { 
    formatters, 
    statusUtils
} from '../../utils/utils';

// Константы для внешнего использования
export { 
    STATUS_CLASSES,
    STATUS_COLORS,
    VALIDATION_MESSAGES
} from '../../utils/constants';

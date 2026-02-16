import React, { useEffect, useMemo, useCallback }       from 'react';
import { useCargos }                                    from '../../Store/useCargos';
import { CargosList }                                   from './components/CargosList';
import { CargoView }                                    from './components/CargoView';
import { CargoInvoiceSections }                         from './components/CargoInvoices';
import { InsurancePage }                                from './components/InsurancePage';
import { cargoGetters, CargoInfo, EMPTY_CARGO }         from '../../Store/cargoStore';
import { CargoNew }                                               from './components';
import { IonLoading }                                   from '@ionic/react';
import { useCargoNavigation }                           from './hooks/useNavigation';
import { PrepaymentPage }                               from './components/PrePayment';

export const Cargos: React.FC = () => {
    
    const { cargos, isLoading, createCargo, updateCargo, deleteCargo, publishCargo, refreshCargos } = useCargos()
    const { currentPage, navigateTo, handleCreateNew, handleCargoClick } = useCargoNavigation()

    // Мемоизированные обработчики
    const memoizedHandleCreateNew   = useCallback(handleCreateNew, [handleCreateNew]);
    const memoizedHandleCargoClick  = useCallback(handleCargoClick, [handleCargoClick]);
    const memoizedRefreshCargos     = useCallback(refreshCargos, [refreshCargos]);

    // Мемоизированные функции CRUD
    const memoizedCreateCargo       = useCallback(createCargo, [createCargo]);
    const memoizedUpdateCargo       = useCallback(updateCargo, [updateCargo]);
    const memoizedDeleteCargo       = useCallback(deleteCargo, [deleteCargo]);
    const memoizedPublishCargo      = useCallback(publishCargo, [publishCargo]);
    

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


    const memoizedCargosList        = useMemo(() => (
        <CargosList
            cargos          = { cargos }
            onCargoClick    = { memoizedHandleCargoClick }
            onCreateNew     = { memoizedHandleCreateNew }
            onRefresh       = { memoizedRefreshCargos }
        />
    ), [cargos, memoizedHandleCargoClick, memoizedHandleCreateNew, memoizedRefreshCargos]);

    const memoizedCargoForm         = useMemo(() => (
        <CargoNew
            cargo           = { currentPage.cargo as CargoInfo }
            onUpdate        = { memoizedUpdateCargo }
            onCreate        = { memoizedCreateCargo }
            onBack          = { handleBack }
        />
    ), [currentPage.cargo, memoizedUpdateCargo, memoizedCreateCargo, handleBack]);

    const memoizedCargoView         = useMemo(() => (
        <CargoView
            cargo={currentPage.cargo!}
            onEdit={(cargo) => navigateTo({ type: 'edit', cargo })}
            onDelete={memoizedDeleteCargo}
            onPublish={memoizedPublishCargo}
            onInvoices={(cargo) => navigateTo({ type: 'invoices', cargo })}
            onPayment={(cargo) => navigateTo({ type: 'prepayment', cargo })}
            onInsurance={(cargo) => navigateTo({ type: 'insurance', cargo })}
            onBack={handleBack}
        />
    ), [currentPage.cargo, memoizedDeleteCargo, memoizedPublishCargo, navigateTo, handleBack]);

    const memoizedCargoInvoices     = useMemo(() => (
        <CargoInvoiceSections
            cargo={currentPage.cargo!}
            onBack={handleBack}
        />
    ), [currentPage.cargo, handleBack, navigateTo]);

    const memoizedPrepaymentPage    = useMemo(() => (
       <PrepaymentPage 
            cargo = { currentPage.cargo } 
            onBack = { handleBack }
        />
    ), [currentPage.cargo, handleBack]);

    const memoizedInsurancePage     = useMemo(() => (
        <InsurancePage
            cargo       = { currentPage.cargo! }
            onBack      = { handleBack }
        />
    ), [currentPage.cargo, handleBack]);

    const memoizedPaymentPage       = useMemo(() => (
       <PrepaymentPage 
            cargo = { currentPage.cargo } 
            onBack = { handleBack }
        />
    ), [currentPage.cargo, handleBack]);

    const memoizedCreateForm        = useMemo(() => (
        <CargoNew
            cargo       = { EMPTY_CARGO }
            onUpdate    = { memoizedUpdateCargo }
            onCreate    = { memoizedCreateCargo }
            onBack      = { handleBack }
        />
    ), [memoizedUpdateCargo, memoizedCreateCargo, handleBack]);

    // Мемоизированная функция рендеринга
    const renderContent             = useMemo(() => {
        console.log( currentPage )
        if (currentPage.cargo) {
            
            switch (currentPage.type) {

                case 'edit':        return memoizedCargoForm;

                case 'view':        return memoizedCargoView;

                case 'invoices':    return memoizedCargoInvoices;

                case 'prepayment':  return memoizedPrepaymentPage;

                case 'insurance':   return memoizedInsurancePage;

                case 'payment':     return memoizedPaymentPage;

                default:            return memoizedCargosList;

            }      

        } else {

            switch (currentPage.type) {

                case 'list':        return memoizedCargosList;

                case 'create':      return memoizedCreateForm;

                default:            return memoizedCargosList;
            }            

        }
    }, [
        currentPage.cargo,
        currentPage.type,
        memoizedCargoForm,
        memoizedCargoView,
        memoizedCargoInvoices,
        memoizedPrepaymentPage,
        memoizedInsurancePage,
        memoizedPaymentPage,
        memoizedCargosList,
        memoizedCreateForm
    ]);

    return (
        <div className="cargos-module">
            <IonLoading isOpen={isLoading} message="Подождите" />

            { renderContent }

        </div>
    );
    
};
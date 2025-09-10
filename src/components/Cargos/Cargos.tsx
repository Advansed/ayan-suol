import React                                    from 'react';
import { useCargos }                            from '../../Store/useCargos';
import { CargosList }                           from './components/CargosList';
import { CargoView }                            from './components/CargoView';
import { CargoInvoiceSections }                 from './components/CargoInvoices';
import { PrepaymentPage }                       from './components/PrePaymentMethod';
import { InsurancePage }                        from './components/InsurancePage';
import { cargoGetters, CargoInfo, EMPTY_CARGO } from '../../Store/cargoStore';
import { CargoForm }                            from './components';
import { IonLoading }                           from '@ionic/react';
import { useCargoNavigation } from './hooks/useNavigation';

export const Cargos: React.FC = () => {
    
    const {
        cargos,
        isLoading,
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,
        refreshCargos
    } = useCargos()

    // Навигация
    const {
        currentPage,
        navigateTo,
        handleCreateNew,
        handleCargoClick
    } = useCargoNavigation()

    console.log("Cargos", cargos)

    // Обработчики для списка
    

    const handleBack = () => {
        if (currentPage.type === 'view') {
            navigateTo({ type: 'list' });
        } else 
        if (currentPage.type === 'create') {
            navigateTo({ type: 'list' });
        } else {

            const cargo = cargoGetters.getCargo( currentPage.cargo?.guid as string )

            navigateTo({ type: 'view', cargo: cargo });

        }
            
    };


    const renderContent = () => {

        switch (currentPage.type) {
            case 'list':
                return (
                    <CargosList
                        cargos          = { cargos }
                        onCargoClick    = { handleCargoClick }
                        onCreateNew     = { handleCreateNew }
                        onRefresh       = { refreshCargos }
                    />
                );

            case 'create':
                return(
                    <CargoForm 
                         cargo           = { EMPTY_CARGO }
                         onUpdate        = { updateCargo }
                         onCreate        = { createCargo }
                         onBack          = { handleBack }
                    />   
                )

            case 'edit':
                return (
                    <CargoForm
                        cargo           = { currentPage.cargo as CargoInfo }
                        onUpdate        = { updateCargo }
                        onCreate        = { createCargo }
                        onBack          = { handleBack }
                    />
                );

            case 'view':
                return (
                    <CargoView
                        cargo           = { currentPage.cargo! }
                        onEdit          = { (cargo) => navigateTo({ type: 'edit', cargo }) }
                        onDelete        = { deleteCargo }
                        onPublish       = { publishCargo }
                        onInvoices      = { (cargo) => navigateTo({ type: 'invoices', cargo }) }
                        onPayment       = { (cargo) => navigateTo({ type: 'prepayment', cargo }) }
                        onInsurance     = { (cargo) => navigateTo({ type: 'insurance', cargo }) }
                        onBack          = { handleBack }
                    />
                );

            case 'invoices':
                return (
                    <CargoInvoiceSections
                        cargo           = { currentPage.cargo! }
                        onBack          = { handleBack }
                    />
                );

            case 'prepayment':
                return (
                    <PrepaymentPage
                        cargo           = { currentPage.cargo! }
                        onBack          = { handleBack }
                    />
                );

            case 'insurance':
                return (
                    <InsurancePage
                        cargo           = { currentPage.cargo! }
                        onBack          = { handleBack }
                    />
                );

            default:
                return <div>Неизвестная страница</div>;
        }
        
    };

    return (
        <div className="cargos-module">
            <IonLoading isOpen = { isLoading } message = { "Подождите" } />
            {renderContent()}
        </div>
    );
};
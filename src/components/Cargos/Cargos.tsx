import React                                    from 'react';
import { useCargos }                            from '../../Store/useCargos';
import { CargosList }                           from './components/CargosList';
import { CargoView }                            from './components/CargoView';
import { CargoInvoiceSections }                 from './components/CargoInvoices';
import { PrepaymentPage }                       from './components/PrePaymentMethod';
import { InsurancePage }                        from './components/InsurancePage';
import { cargoGetters, CargoInfo, EMPTY_CARGO } from '../../Store/cargoStore';
import { loginGetters }                         from '../../Store/loginStore';
import { CargoForm }                            from './components';
import { useSocket } from '../../Store/useSocket';

export const Cargos: React.FC = () => {
    const token = loginGetters.getToken()
    const {
        cargos,
        isLoading,
        currentPage,
        filters,
        searchQuery,
        navigateTo,
        setFilters,
        setSearchQuery,
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,
        refreshCargos
    } = useCargos();

    const { emit, once } = useSocket()
    // Проверка авторизации
    if (!token) {
        return <div>Необходима авторизация</div>;
    }

    // Обработчики для списка
    
    const handleCreateNew = () => {
        navigateTo({ type: 'create' });
    }

    
    const handleCargoClick = (cargo: CargoInfo) => navigateTo({ type: 'view', cargo });


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
                        filters         = { filters }
                        searchQuery     = { searchQuery }
                        onFiltersChange = { setFilters }
                        onSearchChange  = { setSearchQuery }
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
            {renderContent()}
        </div>
    );
};
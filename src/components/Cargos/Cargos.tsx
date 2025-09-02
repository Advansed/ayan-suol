/**
 * Главный компонент модуля Cargos
 */

import React from 'react';
import { CargoInfo } from './types';
import { useCargos, useCargoForm } from './hooks';
import { CargosList } from './components';
import { CargoForm } from './components/CargoForm';
import { CargoView } from './components/CargoView';
import { CargoInvoiceSections } from './components/CargoInvoices';
import { PrepaymentPage } from './components/PrePaymentMethod';
import { InsurancePage } from './components/InsurancePage';

export const Cargos: React.FC = () => {
    const cargosHook = useCargos();
    const formHook = useCargoForm();

    const {
        cargos,
        isLoading,
        currentPage,
        navigateTo,
        goBack,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,
        getCargo,
        refreshCargos
    } = cargosHook;

    // Обработчики для списка
    const handleCreateNew = () => {
        formHook.initializeForm();
        navigateTo({ type: 'create' });
    };

    const handleCargoClick = (cargo: CargoInfo) => {
        navigateTo({ type: 'view', cargo });
    };

    // Обработчики для создания
    const handleCreateSave = async ( data: CargoInfo ) => {
        await createCargo( data );
    };

    const handleCreateCancel = () => {
        formHook.actions.resetForm();
        navigateTo({ type: 'list' });
    };

    // Обработчики для редактирования
    const handleEditSave = async () => {
        if (currentPage.type === 'edit') {
            const isValid = await formHook.actions.submitForm();
            if (isValid) {
                await updateCargo(currentPage.cargo.guid, formHook.formState.data);
            }
        }
    };

    const handleEditCancel = () => {
        if (currentPage.type === 'edit') {
            navigateTo({ type: 'view', cargo: currentPage.cargo });
        }
    };

    const handleEditDelete = async () => {
        if (currentPage.type === 'edit') {
            await deleteCargo(currentPage.cargo.guid);
        }
    };

    // Обработчики для просмотра
    const handleViewEdit = () => {
        if (currentPage.type === 'view') {
            formHook.initializeForm(currentPage.cargo);
            navigateTo({ type: 'edit', cargo: currentPage.cargo });
        }
    };

    const handleViewDelete = async () => {
        if (currentPage.type === 'view') {
            await deleteCargo(currentPage.cargo.guid);
        }
    };

    const handleViewPublish = async () => {
        if (currentPage.type === 'view') {
            await publishCargo(currentPage.cargo.guid);
        }
    };

    // Обработчик для просмотра заявок
    const handleViewInvoices = () => {
        if (currentPage.type === 'view') {
            navigateTo({ type: 'invoices', cargo: currentPage.cargo });
        }
    };
    const handlePayment = () => {
        if (currentPage.type === 'view') {
            navigateTo({ type: 'payment', cargo: currentPage.cargo });
        }
    };

    const handleInsurance = () => {
        if (currentPage.type === 'view') {
            navigateTo({ type: 'insurance', cargo: currentPage.cargo });
        }
    };

    // Рендер страниц
    const renderPage = () => {
        switch (currentPage.type) {
            case 'list':
                return (
                    <CargosList
                        cargos          = { cargos }
                        isLoading       = { isLoading }
                        searchQuery     = { searchQuery }
                        onSearchChange  = { setSearchQuery }
                        filters         = { filters }
                        onFiltersChange = { setFilters }
                        onCreateNew     = { handleCreateNew }
                        onCargoClick    = { handleCargoClick }
                        onRefresh       = { refreshCargos }
                    />
                );

            case 'create':
                return (
                    <CargoForm
                        onBack          = { handleCreateCancel }
                        onSave          = { handleCreateSave }
                    />
                );

            case 'edit':
                return (
                    <CargoForm
                        cargo           = { currentPage.cargo }
                        onSave          = { handleEditSave}
                        onBack          = { handleCreateCancel }
                    />
                );

            case 'view':
                return (
                    <CargoView
                        cargo           = { currentPage.cargo }
                        onBack          = { goBack }
                        onEdit          = { handleViewEdit }
                        onDelete        = { handleViewDelete }
                        onPublish       = { handleViewPublish }
                        onViewInvoices  = { handleViewInvoices }
                        onPayment       = { handlePayment }
                        onInsurance     = { handleInsurance }
                        isLoading       = { isLoading }
                    />
                );

            case 'invoices':
                return (
                    <div>
                        {/* Header с кнопкой назад */}
                        <div className="flex ml-05 mt-05">
                            <div 
                                className="w-15 h-15"
                                onClick={()=> navigateTo({ type: 'view', cargo: currentPage.cargo }) }
                                style={{ cursor: 'pointer' }}
                            >
                                ← 
                            </div>
                            <div className="a-center w-90 fs-09">
                                <b>Заявки на груз</b>
                            </div>
                        </div>
                        
                        {/* Секции заявок */}
                        <CargoInvoiceSections cargo={currentPage.cargo} />
                    </div>
                );

            case 'payment':
                return (
                    <div>
                        {/* Секции заявок */}
                        <PrepaymentPage 
                            cargo={currentPage.cargo} 
                            onBack={ () => navigateTo({ type: 'view', cargo: currentPage.cargo }) }
                            onPaymentComplete={()=>{}}
                            onCancel={()=>{}}
                        />
                    </div>
                );

            case 'insurance':
                return (
                    <div>
                        {/* Секции заявок */}
                        <InsurancePage 
                            cargo       = { currentPage.cargo } 
                            onBack      = { () => navigateTo({ type: 'view', cargo: currentPage.cargo }) }
                            onCancel    = { ()=>{} }
                        />
                    </div>
                );

            default:
                return (
                    <CargosList
                        cargos          = { cargos }
                        isLoading       = { isLoading }
                        searchQuery     = { searchQuery }
                        onSearchChange  = { setSearchQuery }
                        filters         = { filters }
                        onFiltersChange = { setFilters }
                        onCreateNew     = { handleCreateNew }
                        onCargoClick    = { handleCargoClick }
                        onRefresh       = { refreshCargos }
                    />
                );
        }
    };

    return (
        <div className="a-container">
            {renderPage()}
        </div>
    );
};
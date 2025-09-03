/**
 * Главный компонент модуля Cargos - новая архитектура с useCargos из Store
 */

import React, { useEffect } from 'react';
import { useCargos, CargoInfo, PageType, EMPTY_CARGO } from '../../Store/useCargos';
import { useLogin } from '../../Store/useLogin';
import { CargosList } from './components/CargosList';
import { CargoForm } from './components/CargoForm';
import { CargoView } from './components/CargoView';
import { CargoInvoiceSections } from './components/CargoInvoices';
import { PrepaymentPage } from './components/PrePaymentMethod';
import { InsurancePage } from './components/InsurancePage';

export const Cargos: React.FC = () => {
    const { user } = useLogin();
    const {
        cargos,
        isLoading,
        currentPage,
        filters,
        searchQuery,
        navigateTo,
        goBack,
        setFilters,
        setSearchQuery,
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,
        refreshCargos
    } = useCargos();

    // Проверка авторизации
    if (!user) {
        return <div>Необходима авторизация</div>;
    }

    // Обработчики для списка
    const handleCreateNew = () => navigateTo({ type: 'create' });
    const handleCargoClick = (cargo: CargoInfo) => navigateTo({ type: 'view', cargo });

    // Обработчики для форм
    const handleSave = async (data: CargoInfo) => {
        if (currentPage.type === 'create') {
            await createCargo(data);
        } else if (currentPage.type === 'edit') {
            await updateCargo(data.guid, data);
        }
    };

    const handleCancel = () => {
        if (currentPage.type === 'create') {
            navigateTo({ type: 'list' });
        } else if (currentPage.type === 'edit' && currentPage.cargo) {
            navigateTo({ type: 'view', cargo: currentPage.cargo });
        }
    };

    // Рендер в зависимости от текущей страницы
    const renderContent = () => {
        switch (currentPage.type) {
            case 'list':
                return (
                    <CargosList
                        cargos={cargos}
                        filters={filters}
                        searchQuery={searchQuery}
                        onFiltersChange={setFilters}
                        onSearchChange={setSearchQuery}
                        onCargoClick={handleCargoClick}
                        onCreateNew={handleCreateNew}
                        onRefresh={refreshCargos}
                    />
                );

            case 'create':
                return (
                    <CargoForm
                        cargo={ EMPTY_CARGO }
                        onSave={handleSave}
                        onBack={handleCancel}
                    />
                );

            case 'edit':
                return (
                    <CargoForm
                        cargo={currentPage.cargo}
                        onSave={handleSave}
                        onBack={handleCancel}
                    />
                );

            case 'view':
                return (
                    <CargoView
                        cargo={currentPage.cargo!}
                        onEdit={(cargo) => navigateTo({ type: 'edit', cargo })}
                        onDelete={deleteCargo}
                        onPublish={publishCargo}
                        onInvoices={(cargo) => navigateTo({ type: 'invoices', cargo })}
                        onPayment={(cargo) => navigateTo({ type: 'prepayment', cargo })}
                        onInsurance={(cargo) => navigateTo({ type: 'insurance', cargo })}
                        onBack={goBack}
                    />
                );

            case 'invoices':
                return (
                    <CargoInvoiceSections
                        cargo={currentPage.cargo!}
                        onBack={goBack}
                    />
                );

            case 'prepayment':
                return (
                    <PrepaymentPage
                        cargo={currentPage.cargo!}
                        onBack={goBack}
                    />
                );

            case 'insurance':
                return (
                    <InsurancePage
                        cargo={currentPage.cargo!}
                        onBack={goBack}
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
/**
 * Главный компонент модуля Cargos
 */

import React from 'react';
import { PageType, CargoInfo } from './types';
import { useCargos, useCargoForm } from './hooks';
import { CargoCard, CargoForm, CargosList, CargoView } from './components';

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
    const handleCreateSave = async () => {
        const isValid = await formHook.actions.submitForm();
        if (isValid) {
            await createCargo(formHook.formState.data);
        }
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

    // Рендер страниц
    const renderPage = () => {
        switch (currentPage.type) {
            case 'list':
                return (
                    <CargosList
                        cargos={cargos}
                        isLoading={isLoading}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filters={filters}
                        onFiltersChange={setFilters}
                        onCreateNew={handleCreateNew}
                        onCargoClick={handleCargoClick}
                        onRefresh={refreshCargos}
                    />
                );

            case 'create':
                return (
                    <CargoForm
                        formHook={formHook}
                        onSave={handleCreateSave}
                        onCancel={handleCreateCancel}
                        title="Создать новый груз"
                        isLoading={isLoading}
                    />
                );

            case 'edit':
                return (
                    <CargoForm
                        formHook={formHook}
                        onSave={handleEditSave}
                        onCancel={handleEditCancel}
                        onDelete={handleEditDelete}
                        title="Редактировать груз"
                        isLoading={isLoading}
                    />
                );

            case 'view':
                return (
                    <CargoView
                        cargo={currentPage.cargo}
                        onBack={goBack}
                        onEdit={handleViewEdit}
                        onDelete={handleViewDelete}
                        onPublish={handleViewPublish}
                        isLoading={isLoading}
                    />
                );

            default:
                return (
                    <CargosList
                        cargos={cargos}
                        isLoading={isLoading}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filters={filters}
                        onFiltersChange={setFilters}
                        onCreateNew={handleCreateNew}
                        onCargoClick={handleCargoClick}
                        onRefresh={refreshCargos}
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
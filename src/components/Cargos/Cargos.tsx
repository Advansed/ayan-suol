/**
 * Главный компонент модуля Cargos - новая архитектура с useCargos из Store
 */

import React, { useEffect, useState } from 'react';
import { useCargos } from '../../Store/useCargos';
import { useLogin } from '../../Store/useLogin';
import { CargosList } from './components/CargosList';
import { CargoForm } from './components/CargoForm';
import { CargoView } from './components/CargoView';
import { CargoInvoiceSections } from './components/CargoInvoices';
import { PrepaymentPage } from './components/PrePaymentMethod';
import { InsurancePage } from './components/InsurancePage';
import { CargoInfo, EMPTY_CARGO } from '../../Store/cargoStore';
import DataEditor from '../DataEditor';
import { PageData, Section } from '../DataEditor/types';
import { CargoFormNew } from './components/CargoFormNew';

export const Cargos: React.FC = () => {
    const { user } = useLogin();
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

  const [formData, setFormData] = useState<PageData>([
    {
        title: 'Основные данные',
        data: [
            { label: 'Название', type: 'string', data: 'Груз №1' },
            { label: 'Описание', type: 'string', data: 'Описание груза' },
            { label: 'Вес', type: 'number', data: 100 }
        ]
    },
    {
        title: 'Адреса и транспорт',
        data: [
            { label: 'Откуда', type: 'string', data: 'Москва' },
            { label: 'Куда', type: 'string', data: 'Санкт-Петербург' },
            { label: 'Транспорт', type: 'select', values: ['truck', 'auto', 'train'], data: 'auto' },
            { label: 'Дата отправки', type: 'date', data: '2025-01-15' }
        ]
    }
]);

  const handleChangeEditor = (newData: PageData) => {
    setFormData( newData );
    console.log( newData )
  };

  const handleSaveEditor = (data: PageData) => {
    console.log('Сохранено:', data);
    // Отправить на сервер
  };  
    // Проверка авторизации
    if (!user) {
        return <div>Необходима авторизация</div>;
    }

    useEffect(()=>{
        console.log('currentPage', currentPage)
    },[currentPage])

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

    const handleBack = () => {
        console.log(currentPage)
        if (currentPage.type === 'view') {
            navigateTo({ type: 'list' });
        } else 
        if (currentPage.type === 'create') {
            navigateTo({ type: 'list' });
        } else 
            navigateTo({ type: 'view', cargo: currentPage.cargo });
    };



    // Рендер в зависимости от текущей страницы
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
                    <CargoFormNew 
                         cargo           = { EMPTY_CARGO }
                         onUpdate        = { updateCargo }
                         onCreate        = { createCargo }
                         onBack          = { handleBack }
                    />   
                )

            case 'edit':
                return (
                    <CargoFormNew
                        cargo           = { currentPage.cargo }
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
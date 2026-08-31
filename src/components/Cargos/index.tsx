import './styles.css';

import React, { useEffect, useCallback }       from 'react';
import { useCargos }                                    from './hooks/useCargos';
import { CargosList }                                   from './components/CargosList';
import { CargoView }                                    from './components/CargoView';
import { CargoInvoice }                                 from './components/CargoInvoices';
import { InsurancePage }                                from './components/InsurancePage';
import { cargoGetters, CargoInfo, EMPTY_CARGO, DriverInfo } from '../../Store/cargoStore';
import { CargoNew }                                               from './components';
import { IonLoading }                                   from '@ionic/react';
import { useCargoNavigation }                           from './hooks/useNavigation';
import { PrepaymentPage }                               from './components/PrePayment';
import { Agreement }                                    from '../Offers/Agreement';
import { useInvoices }                                  from './hooks/useInvoices';
import { useSocket }                                    from '../../Store/useSocket';
import { useToken }                                     from '../../Store/loginStore';

export const Cargos: React.FC = () => {
    
    const { cargos, isLoading, createCargo, updateCargo, deleteCargo, publishCargo, refreshCargos } = useCargos()
    const { currentPage, navigateTo, replaceCurrentPage, handleCreateNew, handleCargoClick } = useCargoNavigation()
    const invoiceApi = useInvoices({ info: currentPage.cargo })
    const { create_contract, handleAccept, get_contract, handleReject, handleChat, handleComplete } = invoiceApi
    const { emit } = useSocket()
    const token = useToken()

    useEffect(() => {
        if (!currentPage.cargo?.guid) return;
        const cargo = cargoGetters.getCargo(currentPage.cargo.guid);
        if (!cargo || cargo === currentPage.cargo) return;
        replaceCurrentPage({ type: currentPage.type, cargo });
    }, [cargos, currentPage.cargo, currentPage.type, replaceCurrentPage]);

    const handleBack                = useCallback(() => {
        if (currentPage.type === 'view' || currentPage.type === 'create') {
            navigateTo({ type: 'list' });
        } else if (currentPage.type === 'edit') {
            const cargo = currentPage.cargo?.guid
                ? cargoGetters.getCargo(currentPage.cargo.guid) ?? currentPage.cargo
                : currentPage.cargo;
            if (cargo) {
                navigateTo({ type: 'view', cargo });
            } else {
                navigateTo({ type: 'list' });
            }
        } else if (currentPage.type === 'agreement' && currentPage.cargo?.guid) {
            const cargo = cargoGetters.getCargo(currentPage.cargo.guid) ?? currentPage.cargo;
            navigateTo({ type: 'view', cargo });
        } else if (currentPage.cargo?.guid) {
            const cargo = cargoGetters.getCargo(currentPage.cargo.guid);
            navigateTo({ type: 'view', cargo: cargo });
        }
    }, [currentPage.type, currentPage.cargo?.guid, navigateTo]);

    const handleAgreementSign = useCallback(
        async (invoice: DriverInfo, signature: string) => {
            const signed = await create_contract(invoice, signature);
            if (signed) {
                void handleAccept(invoice, 12, true);
            }
            const guid = currentPage.cargo?.guid;
            const cargo = guid ? cargoGetters.getCargo(guid) ?? currentPage.cargo : currentPage.cargo;
            if (cargo) navigateTo({ type: 'view', cargo });
        },
        [create_contract, handleAccept, currentPage.cargo, navigateTo]
    );

    const handleOpenAgreement = useCallback(
        async (invoice: DriverInfo) => {
            const cargo = currentPage.cargo;
            if (!cargo) return;
            const contractData = await get_contract(invoice);
            if (contractData) {
                navigateTo({ type: 'agreement', cargo, invoice, contract: contractData });
            }
        },
        [currentPage.cargo, get_contract, navigateTo]
    );

    const handleAdvanceInvoice = useCallback(
        async (invoice: DriverInfo, status: number) => {
            await handleAccept(invoice, status);
            if (status === 16) {
                emit('send_message', {
                    token,
                    recipient: invoice.recipient,
                    cargo: invoice.cargo,
                    message: 'Груз осмотрен и опломбирован, документы на груз переданы',
                });
                emit('send_message', {
                    token,
                    recipient: invoice.recipient,
                    cargo: invoice.cargo,
                    message: 'Транспорт отправлен в точку разгрузки',
                });
            }
        },
        [handleAccept, emit, token]
    );

    const handleStartUnloading = useCallback(
        async (invoice: DriverInfo) => {
            await handleAccept(invoice, 18);
            emit('send_message', {
                token,
                recipient: invoice.recipient,
                cargo: invoice.cargo,
                message: 'Пломба цела, груз доставлен',
            });
            emit('send_message', {
                token,
                recipient: invoice.recipient,
                cargo: invoice.cargo,
                message: 'Разгрузка начата',
            });
        },
        [handleAccept, emit, token]
    );

    const handleCompleteTrip = useCallback(
        async (invoice: DriverInfo, rating: number, completed: boolean) => {
            await handleComplete(invoice, rating, {
                delivered: completed,
                documents: completed,
            });
            await handleAccept(invoice, 20);
            emit('send_message', {
                token,
                recipient: invoice.recipient,
                cargo: invoice.cargo,
                message: 'Все работы выполнены',
            });
        },
        [handleComplete, handleAccept, emit, token]
    );


    const renderList = () => (
        <CargosList
            cargos={cargos}
            isLoading={isLoading}
            onCargoClick={handleCargoClick}
            onCreateNew={handleCreateNew}
            onRefresh={refreshCargos}
        />
    );

    const renderContent = () => {
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
                            cargo           = { currentPage.cargo! }
                            onEdit          = { (cargo) => navigateTo({ type: 'edit', cargo }) }
                            onDelete        = { deleteCargo }
                            onPublish       = { publishCargo }
                            onAcceptInvoice = { handleOpenAgreement }
                            onRejectInvoice = { handleReject }
                            onChatInvoice   = { handleChat }
                            onAdvanceInvoice= { handleAdvanceInvoice }
                            onStartUnloading= { handleStartUnloading }
                            onComplete      = { handleCompleteTrip }
                            onBack          = { handleBack }
                            isLoading       = { isLoading || invoiceApi.isLoading }
                        />
                    );

                case 'invoices':
                    return (
                        <CargoInvoice
                            cargo           = { currentPage.cargo! }
                            invoiceApi      = { invoiceApi }
                            onBack          = { handleBack }
                            onOpenAgreement = { (invoice, contract) =>
                                navigateTo({ type: 'agreement', cargo: currentPage.cargo!, invoice, contract })
                            }
                        />
                    );

                case 'agreement':
                    if (!currentPage.invoice) return null;
                    return (
                        <Agreement
                            data     = { currentPage.contract }
                            onMenu   = { handleBack }
                            onCancel = { handleBack }
                            onSign   = { (signature: string) =>
                                handleAgreementSign(currentPage.invoice!, signature)
                            }
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
                    return renderList();

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
                    return renderList();
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
                    return renderList();
            }
        }
    };

    return (
        <div className="cargos-module">
            <IonLoading isOpen={isLoading || invoiceApi.isLoading} message="Подождите" />

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

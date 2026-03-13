/**
 * Главный компонент модуля Works
 */

import React, { useEffect, useCallback } from 'react';
import { WorkInfo, OfferInfo, WorkStatus } from './types';
import { WorksList, WorkView } from './components';
import { WorkMap } from './components/WorkMap';
import { Agreement } from './components/Offer/Agreement';
import { useWorks } from './useWorks';
import { useWorkNavigation } from './hooks/useNavigation';
import { workActions } from './workStore';
import { SaveData, WorkPage1 } from './components/WorkPage1';
import { useSocket } from '../../Store/useSocket';
import { useToken } from '../../Store/loginStore';
import { transportGetters } from '../../Store/transportStore';
import { IonLoading } from '@ionic/react';
import './styles.css';

export const Works: React.FC = () => {
    const { contract, works, isLoading, setOffer, delOffer, setStatus, refreshWorks
        , get_contract, get_contract_data, setContract, set_contract } = useWorks();
    const { emit } = useSocket();
    const token = useToken();

    const { currentPage, navigateTo, goBack } = useWorkNavigation();

    // Обновляем currentPage.work при обновлении списка works
    useEffect(() => {
        console.log("workView", currentPage)
        if (currentPage.type === 'view') {
            console.log("work_View", currentPage.work)
            const updatedWork = works.find(w => w.cargo === currentPage.work.cargo);
            console.log("work_View", updatedWork)
            if (updatedWork && updatedWork.status !== currentPage.work.status) {
                workActions.setCurrentPage({ type: 'view', work: updatedWork });
            }
        }
    }, [works, currentPage]);

    const handleWorkClick = (work: WorkInfo) => {
        navigateTo({ type: 'view', work });
    };

    const handleOfferClick = async (work: WorkInfo) => {
        // Формируем предложение из данных работы
        // Транспорт берется из work.transport, который был выбран в OfferCard
        const offerData: OfferInfo = {
            guid: work.cargo,
            recipient: work.recipient,
            price: work.price,
            weight: work.weight,
            volume: work.volume,
            transport: work.transport || transportGetters.getData()?.guid || '',
            comment: '',
            status: 11 // WorkStatus.OFFERED
        };

        // Отправляем предложение
        const res = await setOffer(offerData);

        if (res) {
            // Отправляем сообщение в чат
            emit("send_message", {
                token: token,
                recipient: offerData.recipient,
                cargo: offerData.guid,
                message: "Сделал предложение: Сумма - " + offerData.price.toFixed() + " рублей",
                image: "",
            });

            // Обновляем список работ для получения нового статуса
            await refreshWorks();
        }
    };

    const handleOfferCancelClick = async (work: WorkInfo) => {
        // Формируем данные предложения для удаления
        // Транспорт берется из work.transport, который был выбран в OfferCard
        const offerData: OfferInfo = {
            guid: work.cargo,
            recipient: work.recipient,
            price: work.price,
            weight: work.weight,
            volume: work.volume,
            transport: work.transport || transportGetters.getData()?.guid || '',
            comment: '',
            status: 11 // WorkStatus.OFFERED
        };

        // Удаляем предложение
        const res = await delOffer(offerData);

        if (res) {
            // Отправляем сообщение в чат
            emit("send_message", {
                token: token,
                recipient: offerData.recipient,
                cargo: offerData.guid,
                message: "Отозвал предложение",
                image: "",
            });

            // Обновляем список работ для получения нового статуса
            await refreshWorks();
        }
    };

    const handleStatusClick = (work: WorkInfo) => {

        if (work.status === WorkStatus.TO_LOAD) {
            setStatus(work);
            emit("send_message", {
                token: token,
                recipient: work.recipient,
                cargo: work.cargo,
                message: "Транспорт прибыл на точку погрузки"
            });
        } else if (work.status === WorkStatus.IN_WORK) {
            setStatus(work);
            emit("send_message", {
                token: token,
                recipient: work.recipient,
                cargo: work.cargo,
                message: "Транспорт прибыл на точку разгрузки"
            });
        } else if (work.status === WorkStatus.UNLOADING) {
            setStatus(work);
            emit("send_message", {
                token: token,
                recipient: work.recipient,
                cargo: work.cargo,
                message: "Транспорт разгружен"
            });
        } else {
            setStatus(work);
        }
    };

    const handleMapClick = (work: WorkInfo) => {
        navigateTo({ type: 'map', work });
    };

    const handleSignContract = useCallback(async (work: WorkInfo) => {
        const contractData = await get_contract_data(work);
        console.log('get_contract', contractData)
        if (contractData) {
            navigateTo({ type: 'agreement', work, contract: contractData });
        }
    }, [get_contract_data, navigateTo]);

    const handleAgreementSign = useCallback(async (signature: string, _offer: OfferInfo) => {
        if (currentPage.type !== 'agreement') return false;
        await set_contract(currentPage.work, signature);
        goBack();
        return true;
    }, [currentPage, set_contract, goBack]);

    const handleSavePage1 = async (data: SaveData) => {
        if (currentPage.type === "page1") {
            set_contract(currentPage.work, data.sign);
            setStatus(currentPage.work);
            data.bodyPhotos.forEach(elem => {
                emit("send_message", {
                    token: token,
                    recipient: currentPage.work.recipient,
                    cargo: currentPage.work.cargo,
                    message: "",
                    image: elem,
                });
            });
            emit("send_message", {
                token: token,
                recipient: currentPage.work.recipient,
                cargo: currentPage.work.cargo,
                message: "Транспорт осмотрен, документы проверены, фото кузова приложено, транспорт готов к погрузке",
                image: "",
            });
        }

        return true;
    };

    const renderPage = () => {
        switch (currentPage.type) {
            case 'list':
                return (
                    <WorksList
                        works={works}
                        isLoading={isLoading}
                        onWorkClick={handleWorkClick}
                        onRefresh={refreshWorks}
                    />
                );

            case 'view':
                return (
                    <WorkView
                        work={currentPage.work}
                        onBack={goBack}
                        onOfferClick={handleOfferClick}
                        onOfferCancelClick={handleOfferCancelClick}
                        onStatusClick={handleStatusClick}
                        onMapClick={handleMapClick}
                        onSignContract={handleSignContract}
                    />
                );

            case 'map':
                return (
                    <WorkMap
                        work={currentPage.work}
                        onBack={goBack}
                    />
                );

            case 'page1':
                return (
                    <WorkPage1
                        work={currentPage.work}
                        pdf={contract}
                        onBack={goBack}
                        onSave={handleSavePage1}
                    />
                );

            case 'agreement':
                if (currentPage.type !== 'agreement') return null;
                return (
                    <Agreement
                        work={currentPage.work}
                        contractData={currentPage.contract}
                        onBack={goBack}
                        onSign={handleAgreementSign}
                    />
                );

            default:
                return (
                    <WorksList
                        works={works}
                        isLoading={isLoading}
                        onWorkClick={handleWorkClick}
                    />
                );
        }
    };

    return (
        <div className="w-100 h-100">
            <IonLoading isOpen={isLoading} message={"Подождите..."} />
            {
                renderPage()

            }
        </div>
    );
};

// Экспорт типов для внешнего использования
export type {
    WorkInfo,
    WorkStatus,
    WorkPriority,
    OfferInfo,
    OfferStatus,
    CreateOfferData,
    WorkFilters,
    WorkPageType,
    DriverTransport
} from './types';

// Экспорт хуков для внешнего использования
export {
    useOfferForm
} from './hooks';

// Экспорт компонентов для внешнего использования
export {
    WorkCard,
    WorksList,
    WorkView,
    WorkOffer,
    WorkArchive
} from './components';

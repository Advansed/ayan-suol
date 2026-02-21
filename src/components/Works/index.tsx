/**
 * Главный компонент модуля Works
 */

import React from 'react';
import { WorkInfo, OfferInfo, WorkStatus } from './types';
import { WorksList, WorkView } from './components';
import { Agreement } from './components/Offer/Agreement';
import { WorkMap } from './components/WorkMap';
import { useWorks } from '../../Store/useWorks';
import { useWorkNavigation } from './hooks/useNavigation';
import { SaveData, WorkPage1 } from './components/WorkPage1';
import { useSocket } from '../../Store/useSocket';
import { useToken } from '../../Store/loginStore';
import { IonLoading } from '@ionic/react';
import './styles.css';

export const Works: React.FC = () => {
    const { contract, works, isLoading, setOffer, setStatus, refreshWorks, create_contract, get_contract, setContract, set_contract } = useWorks();
    const { emit } = useSocket();
    const token = useToken();

    const { currentPage, navigateTo, goBack } = useWorkNavigation();

    const handleWorkClick   = async (work: WorkInfo) => {
        // Сначала создаем контракт, потом получаем его
        navigateTo({ type: 'view', work });
    };

    const handleOfferClick  = async (work: WorkInfo) => {
        // Получаем договор перед открытием Agreement
        await create_contract(work);
        await get_contract(work);
        navigateTo({ type: 'offer', work });
    };

    const handleStatusClick = (work: WorkInfo) => {
        const load = async () => {
            await get_contract(work);
            navigateTo({ type: "page1", work });
        };

        if (work.status === WorkStatus.TO_LOAD) {
            load();
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

    const handleMapClick    = (work: WorkInfo) => {
        navigateTo({ type: 'map', work });
    };

    const handleAgreementSign = async (signature: string, offer: OfferInfo) => {
        // Сначала подписываем договор
        if (currentPage.type === 'offer') {
            await set_contract(currentPage.work, signature);
        }
        
        // Затем отправляем предложение
        const res = await setOffer(offer);

        if (res) {
            emit("send_message", {
                token: token,
                recipient: offer.recipient,
                cargo: offer.guid,
                message: "Сделал предложение: Сумма - " + offer.price.toFixed() + " рублей",
                image: "",
            });
        }

        return res;
    };

    const handleOfferSubmit = async (offer: OfferInfo) => {
        const res = await setOffer(offer);

        emit("send_message", {
            token: token,
            recipient: offer.recipient,
            cargo: offer.guid,
            message: "Сделал предложение: Сумма - " + offer.price.toFixed() + " рублей",
            image: "",
        });

        return res;
    };

    const handleSavePage1   = async (data: SaveData) => {
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

    const renderPage        = () => {
        switch (currentPage.type) {
            case 'list':
                return (
                    <WorksList
                        works       = { works }
                        isLoading   = { isLoading }
                        onWorkClick = { handleWorkClick }
                        onRefresh   = { refreshWorks }
                    />
                );

            case 'view':
                return (
                    <WorkView
                        work            = { currentPage.work }
                        onBack          = { goBack }
                        onOfferClick    = { handleOfferClick }
                        onStatusClick   = { handleStatusClick }
                        onMapClick      = { handleMapClick }
                        onCounterOffer  = { handleOfferSubmit }
                    />
                );

            case 'offer':
                return (
                    contract ? (
                        <Agreement
                            work         = { currentPage.work }
                            contractData = { contract }
                            onBack       = { goBack }
                            onSign       = { handleAgreementSign }
                        />
                    ) : ( <></> )
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

/**
 * Главный компонент модуля Works
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { WorkInfo, OfferInfo, WorkStatus } from './types';
import { WorksList, WorkView } from './components';
import { WorkMap } from './components/WorkMap';
import { Agreement } from './components/WorkView/index';
import { useWorks } from './useWorks';
import { useWorkNavigation } from './hooks/useNavigation';
import { workActions, workGetters, useWorkStore } from './workStore';
import { SaveData, WorkPage1 } from './components/WorkPage1';
import { useSocket } from '../../Store/useSocket';
import { useToken } from '../../Store/loginStore';
import { useChats } from '../../Store/useChats';
import { transportGetters } from '../../Store/transportStore';
import { IonLoading } from '@ionic/react';
import { filterWorksByMode, type WorksListMode } from './statusFlow';
import './styles.css';

export const Works: React.FC<{ mode?: WorksListMode }> = ({ mode = 'all' }) => {
    const { contract, works, isLoading, setOffer, delOffer, setStatus, refreshWorks
        , get_contract_data, set_contract } = useWorks();
    const { emit } = useSocket();
    const token = useToken();
    const { sendImage } = useChats();

    const { currentPage, navigateTo, goBack } = useWorkNavigation();

    const visibleWorks = useMemo(
        () => filterWorksByMode(works, mode),
        [works, mode]
    );

    // Смена раздела (Лента ↔ Мои заказы) — закрыть карточку и показать список
    useEffect(() => {
        useWorkStore.getState().setCurrentPage({ type: 'list' });
        useWorkStore.getState().setNavigationHistory([{ type: 'list' }]);
    }, [mode]);

    const emptyTitle =
        mode === 'feed'
            ? 'Нет новых заказов'
            : mode === 'mine'
              ? 'Нет ваших заказов'
              : 'Нет доступных заказов';

    const emptyHint =
        mode === 'feed'
            ? 'Новые заказы появятся здесь, когда их опубликуют заказчики'
            : mode === 'mine'
              ? 'Здесь будут заказы с вашим откликом и перевозки в работе'
              : 'Доступные заказы появятся здесь, когда их опубликуют заказчики';

    // Обновляем currentPage.work при обновлении списка works (статус, подпись и т.д.)
    useEffect(() => {
        if (currentPage.type === 'view') {
            const updatedWork = works.find(w => w.guid === currentPage.work.guid);
            if (
                updatedWork &&
                (updatedWork.status !== currentPage.work.status ||
                    Boolean(updatedWork.signed) !== Boolean(currentPage.work.signed))
            ) {
                workActions.setCurrentPage({ type: 'view', work: updatedWork });
            }
            return;
        }
        if (currentPage.type === 'map') {
            const updatedWork = works.find(w => w.guid === currentPage.work.guid);
            if (updatedWork && updatedWork !== currentPage.work) {
                workActions.setCurrentPage({ type: 'map', work: updatedWork });
            }
            return;
        }
        if (currentPage.type === 'agreement') {
            const updatedWork = works.find(w => w.guid === currentPage.work.guid);
            if (
                updatedWork &&
                (updatedWork.status !== currentPage.work.status ||
                    Boolean(updatedWork.signed) !== Boolean(currentPage.work.signed))
            ) {
                workActions.setCurrentPage({
                    type: 'agreement',
                    work: updatedWork,
                    contract: currentPage.contract,
                });
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

    const handleLoaded = async (work: WorkInfo, data: { verified: boolean; cargoPhotos: string[]; sealPhotos: string[] }) => {
        try {
            await Promise.all([
                ...data.cargoPhotos.map(image => sendImage(work.recipient, work.cargo, image, 16)),
                ...data.sealPhotos.map(image => sendImage(work.recipient, work.cargo, image, 16)),
            ]);
            emit("send_message", {
                token,
                recipient: work.recipient,
                cargo: work.cargo,
                message: "Груз загружен и опломбирован, фото приложено",
            });
            await setStatus(work);
            await refreshWorks();
        } catch (err) {
            console.error("handleLoaded error:", err);
            throw err;
        }
    };

    const handleArrivedAtLoad = async (work: WorkInfo, data: { bodyPhotos: string[] }) => {
        try {
            await Promise.all(
                data.bodyPhotos.map(image => sendImage(work.recipient, work.cargo, image, 14))
            );
            emit("send_message", {
                token,
                recipient: work.recipient,
                cargo: work.cargo,
                message: "Транспорт прибыл на точку погрузки, фото кузова приложено",
            });
            await setStatus(work);
            await refreshWorks();
        } catch (err) {
            console.error("handleArrivedAtLoad error:", err);
            throw err;
        }
    };

    const handleArrivedUnload = async (
        work: WorkInfo,
        data: { verified: boolean; cargoPhotos: string[]; sealPhotos: string[] }
    ) => {
        try {
            const uploadResults = await Promise.all([
                ...data.cargoPhotos.map(image => sendImage(work.recipient, work.cargo, image, 18)),
                ...data.sealPhotos.map(image => sendImage(work.recipient, work.cargo, image, 18)),
            ]);
            if (uploadResults.some(ok => !ok)) {
                throw new Error('Не удалось отправить одно или несколько фото');
            }
            emit("send_message", {
                token,
                recipient: work.recipient,
                cargo: work.cargo,
                message:
                    "Транспорт прибыл на точку разгрузки, груз и пломба в порядке, фото приложено",
            });
            // Сервер ожидает сначала «На месте выгрузки» (17), затем «Разгружается» (18)
            const okArrived = await setStatus(work);
            if (!okArrived) throw new Error('Не удалось подтвердить прибытие на выгрузку');
            const okUnloading = await setStatus({
                ...work,
                status: WorkStatus.TO_UNLOAD,
            });
            if (!okUnloading) throw new Error('Не удалось начать этап разгрузки');
            await refreshWorks();
        } catch (err) {
            console.error("handleArrivedUnload error:", err);
            throw err;
        }
    };

    const handleUnloadComplete = async (work: WorkInfo, data: { bodyPhotos: string[] }) => {
        try {
            const uploadResults = await Promise.all(
                data.bodyPhotos.map(image => sendImage(work.recipient, work.cargo, image, 20))
            );
            if (uploadResults.some(ok => !ok)) {
                throw new Error('Не удалось отправить фото кузова');
            }
            emit("send_message", {
                token,
                recipient: work.recipient,
                cargo: work.cargo,
                message: "Транспорт разгружен, фото кузова после разгрузки приложено",
            });
            const ok = await setStatus(work);
            if (!ok) throw new Error('Не удалось обновить статус');
            await refreshWorks();
        } catch (err) {
            console.error("handleUnloadComplete error:", err);
            throw err;
        }
    };

    const handleMapClick = (work: WorkInfo) => {
        navigateTo({ type: 'map', work });
    };

    const handleSignContract = useCallback(async (work: WorkInfo) => {
        const contractData = await get_contract_data(work);
        if (contractData) {
            navigateTo({ type: 'agreement', work, contract: contractData });
        }
    }, [get_contract_data, navigateTo]);

    const handleAgreementSign = useCallback(async (signature: string, _offer: OfferInfo) => {
        void _offer;
        if (currentPage.type !== 'agreement') return false;
        const ok = await set_contract(currentPage.work, signature);
        if (!ok) return false;
        const work =
            workGetters.getWork(currentPage.work.guid) ?? { ...currentPage.work, signed: true };
        const state = useWorkStore.getState();
        const hist = state.navigationHistory;
        const last = hist[hist.length - 1];
        if (last?.type === 'agreement') {
            workActions.setNavigationHistory(hist.slice(0, -1));
        }
        workActions.setCurrentPage({ type: 'view', work });
        void refreshWorks();
        return true;
    }, [currentPage, set_contract, refreshWorks]);

    const handleSavePage1 = async (data: SaveData) => {
        if (currentPage.type === "page1") {
            set_contract(currentPage.work, data.sign);
            setStatus(currentPage.work);
            for (const elem of data.bodyPhotos) {
                const { uploadFileToMinIO, dataUrlToFile } = await import('../../utils/fileUpload');
                const file = dataUrlToFile(elem);
                const { filePath } = await uploadFileToMinIO(file, {
                    cargo_id: currentPage.work.cargo,
                    recipient_id: currentPage.work.recipient,
                    token,
                });
                emit("send_message", {
                    token,
                    recipient: currentPage.work.recipient,
                    cargo: currentPage.work.cargo,
                    message: "",
                    image: filePath,
                });
            }
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
                        works={visibleWorks}
                        isLoading={isLoading}
                        onWorkClick={handleWorkClick}
                        onRefresh={refreshWorks}
                        emptyTitle={emptyTitle}
                        emptyHint={emptyHint}
                    />
                );

            case 'view':
                return (
                    <WorkView
                        work={currentPage.work}
                        onBack={goBack}
                        onOfferClick={handleOfferClick}
                        onOfferCancelClick={handleOfferCancelClick}
                        onLoaded={handleLoaded}
                        onArrivedAtLoad={handleArrivedAtLoad}
                        onArrivedUnload={handleArrivedUnload}
                        onUnloadComplete={handleUnloadComplete}
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
                        works={visibleWorks}
                        isLoading={isLoading}
                        onWorkClick={handleWorkClick}
                        emptyTitle={emptyTitle}
                        emptyHint={emptyHint}
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

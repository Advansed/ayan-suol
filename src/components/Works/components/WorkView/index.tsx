import React, { useEffect, useMemo, useState } from 'react';
import { IonModal, useIonRouter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { ArrowLeft, Handshake, MessageSquare, X } from 'lucide-react';
import { WorkInfo, WorkStatus } from '../../types';
import { useWorkStore } from '../../workStore';
import { passportGetters } from '../../../../Store/passportStore';
import { companyGetters } from '../../../../Store/companyStore';
import { transportGetters } from '../../../../Store/transportStore';
import { useToast } from '../../../Toast';
import { useChats } from '../../../../Store/useChats';
import { WORK_CURRENT_ACTION, findWorkByRef, normalizeWorkStatus } from '../../statusFlow';
import { getWorkCustomerName, workFormatters } from '../../utils';
import {
  feedStatusKind,
  feedStatusLabel,
  fleetSlots,
  timeAgo,
} from '../../feedFormat';
import { CounterOfferCard } from './OfferCard';
import { ContractCard } from './ContractCard';
import { ArrivedCard } from './ArrivedCard';
import { OnLoadWaitCard } from './OnLoadWaitCard';
import { LoadedCard } from './LoadedCard';
import { LoadedWaitDispatchCard } from './LoadedWaitDispatchCard';
import { InWorkCard } from './InWorkCard';
import { ToUnloadCard } from './ToUnloadCard';
import { UnloadingCard } from './UnloadingCard';
import { UnloadedWaitCard } from './UnloadedWaitCard';
import { WorkOrderInfo } from './WorkOrderInfo';
import { StatusTimeline } from './StatusTimeline';
import styles from './WorkView.module.css';

interface WorkViewProps {
    work: WorkInfo;
    onBack: () => void;
    onOfferClick: (work: WorkInfo) => void;
    onOfferCancelClick: (work: WorkInfo) => void;
    onLoaded?: (work: WorkInfo, data: { verified: boolean; cargoPhotos: string[]; sealPhotos: string[] }) => Promise<void>;
    onArrivedAtLoad?: (work: WorkInfo, data: { bodyPhotos: string[] }) => Promise<void>;
    onArrivedUnload?: (
        work: WorkInfo,
        data: { verified: boolean; cargoPhotos: string[]; sealPhotos: string[] }
    ) => Promise<void>;
    onUnloadComplete?: (work: WorkInfo, data: { bodyPhotos: string[] }) => Promise<void>;
    onMapClick: (work: WorkInfo) => void;
    onSignContract?: (work: WorkInfo) => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
    work,
    onBack,
    onOfferClick,
    onOfferCancelClick,
    onLoaded,
    onArrivedAtLoad,
    onArrivedUnload,
    onUnloadComplete,
    onSignContract
}) => {
    const works = useWorkStore(state => state.works);
    const archiveWorks = useWorkStore(state => state.archiveWorks);
    const hist = useIonRouter();
    const history = useHistory();
    const toast = useToast();
    const { setCurrentChat } = useChats();
    const [actionOpen, setActionOpen] = useState(false);

    // Живой объект из стора (guid/cargo), иначе снимок из навигации
    const storeWork = useMemo(() => {
        return findWorkByRef(works, work) ?? findWorkByRef(archiveWorks, work) ?? work;
    }, [works, archiveWorks, work]);

    // Явная подписка на статус/подпись — гарантирует ре-рендер таймлайна при push
    const liveStatus = useWorkStore((state) => {
        const found = findWorkByRef(state.works, work) ?? findWorkByRef(state.archiveWorks, work);
        return found ? normalizeWorkStatus(found.status) : normalizeWorkStatus(work.status);
    });
    const liveSigned = useWorkStore((state) => {
        const found = findWorkByRef(state.works, work) ?? findWorkByRef(state.archiveWorks, work);
        return found ? Boolean(found.signed) : Boolean(work.signed);
    });

    const workInfo = useMemo(
        () => ({
            ...storeWork,
            status: liveStatus,
            signed: liveSigned,
        }),
        [storeWork, liveStatus, liveSigned]
    );

    const passportCompletion = passportGetters.getCompletionPercentage();
    const companyCompletion = companyGetters.getCompletionPercentage();
    const transportCompletion = transportGetters.getCompletionPercentage();

    const actionHint = WORK_CURRENT_ACTION[workInfo.status] || 'Открыть действия по заказу';
    const hasInteractiveAction =
        workInfo.status !== WorkStatus.COMPLETED &&
        workInfo.status !== WorkStatus.REJECTED;
    const slots = fleetSlots(workInfo);
    const slotsOpen = !slots || slots.free > 0;
    const isBidding = workInfo.status === WorkStatus.OFFERED;
    const isNew = workInfo.status === WorkStatus.NEW;
    const ctaDisabled =
        workInfo.status === WorkStatus.REJECTED ||
        workInfo.status === WorkStatus.COMPLETED ||
        (isNew && !slotsOpen);
    const ctaLabel =
        workInfo.status === WorkStatus.REJECTED
            ? 'Вы отказались от заказа'
            : workInfo.status === WorkStatus.COMPLETED
              ? 'Заказ завершён'
              : isNew && !slotsOpen
                ? 'Все машины набраны'
                : isNew
                  ? 'Откликнуться'
                  : isBidding
                    ? 'Изменить предложение'
                    : workInfo.status === WorkStatus.TO_LOAD && !workInfo.signed
                      ? 'Подписать договор'
                      : hasInteractiveAction
                        ? 'Продолжить'
                        : '';
    const statusKind = feedStatusKind(workInfo.status);
    const badgeClass =
        statusKind === 'new'
            ? styles.badge_new
            : statusKind === 'bids'
              ? styles.badge_bids
              : statusKind === 'done'
                ? styles.badge_done
                : statusKind === 'alert'
                  ? styles.badge_alert
                  : styles.badge_work;
    const publishedAt = workInfo.publish_date || workInfo.updatedAt || '';
    const subtitleParts = [
        workInfo.category?.trim() || '',
        publishedAt ? timeAgo(publishedAt) : '',
    ].filter(Boolean);

    // Смена этапа с сервера — закрыть модалку, чтобы показать новое действие
    useEffect(() => {
        setActionOpen(false);
    }, [liveStatus, liveSigned]);

    useEffect(() => {
        if (passportCompletion < 80) {
            onBack();
            toast.info('Надо сперва заполнить паспортные данные');
            hist.push('/settings');
        } else if (companyCompletion < 80) {
            onBack();
            toast.info('Надо сперва заполнить данные организации');
            hist.push('/settings');
        } else if (transportCompletion < 80) {
            onBack();
            toast.info('Надо заполнить данные по транспорту');
            hist.push('/settings');
        }
    }, [passportCompletion, companyCompletion, transportCompletion, onBack, toast, hist]);

    const handleOffer = async (data: Partial<WorkInfo>, volume: number): Promise<void> => {
        const updatedWork: WorkInfo = {
            ...workInfo,
            ...data,
            volume
        };
        onOfferClick(updatedWork);
        setActionOpen(false);
    };

    const handleCancelOffer = async (data: Partial<WorkInfo>, volume: number): Promise<void> => {
        const updatedWork: WorkInfo = {
            ...workInfo,
            ...data,
            volume
        };
        onOfferCancelClick(updatedWork);
        setActionOpen(false);
    };

    const closeAfter = async (fn: () => Promise<void>) => {
        await fn();
        setActionOpen(false);
    };

    const handleOpenChat = () => {
        const recipient = workInfo.recipient;
        const cargo = workInfo.cargo || workInfo.guid;
        const name = getWorkCustomerName(workInfo) || 'Заказчик';
        if (!recipient || !cargo) {
            toast.error('Не удалось открыть чат по этому заказу');
            return;
        }
        setCurrentChat(recipient, cargo);
        history.push(`/chats/${recipient}:${cargo}:${encodeURIComponent(name)}`);
    };

    const actionContent = (
        <>
            {workInfo.status === WorkStatus.NEW && (
                <CounterOfferCard work={workInfo} onSubmit={handleOffer} />
            )}

            {workInfo.status === WorkStatus.OFFERED && (
                <CounterOfferCard work={workInfo} onSubmit={handleCancelOffer} />
            )}

            {workInfo.status === WorkStatus.TO_LOAD && !workInfo.signed && (
                <ContractCard
                    work={workInfo}
                    onSignContract={() => {
                        if (onSignContract) onSignContract(workInfo);
                        setActionOpen(false);
                    }}
                />
            )}

            {workInfo.status === WorkStatus.TO_LOAD && workInfo.signed && (
                <ArrivedCard
                    work={workInfo}
                    onArrived={(data) =>
                        closeAfter(() =>
                            onArrivedAtLoad ? onArrivedAtLoad(workInfo, data) : Promise.resolve()
                        )
                    }
                />
            )}

            {workInfo.status === WorkStatus.ON_LOAD && <OnLoadWaitCard work={workInfo} />}

            {workInfo.status === WorkStatus.LOADING && (
                <LoadedCard
                    work={workInfo}
                    onLoaded={(data) =>
                        closeAfter(() =>
                            onLoaded ? onLoaded(workInfo, data) : Promise.resolve()
                        )
                    }
                />
            )}

            {workInfo.status === WorkStatus.LOADED && (
                <LoadedWaitDispatchCard work={workInfo} />
            )}

            {workInfo.status === WorkStatus.IN_WORK && (
                <InWorkCard
                    work={workInfo}
                    onArrivedUnload={(data) =>
                        closeAfter(() =>
                            onArrivedUnload ? onArrivedUnload(workInfo, data) : Promise.resolve()
                        )
                    }
                />
            )}

            {workInfo.status === WorkStatus.TO_UNLOAD && <ToUnloadCard work={workInfo} />}

            {workInfo.status === WorkStatus.UNLOADING && (
                <UnloadingCard
                    work={workInfo}
                    onCompleted={(data) =>
                        closeAfter(() =>
                            onUnloadComplete ? onUnloadComplete(workInfo, data) : Promise.resolve()
                        )
                    }
                />
            )}

            {workInfo.status === WorkStatus.UNLOADED && (
                <UnloadedWaitCard work={workInfo} />
            )}

            {workInfo.status === WorkStatus.COMPLETED && (
                <div className={styles.doneNote}>
                    Заказ завершён. Дальнейших действий не требуется.
                </div>
            )}

            {workInfo.status === WorkStatus.REJECTED && (
                <div className={styles.doneNote}>
                    Предложение отклонено. Можно вернуться к ленте заказов.
                </div>
            )}
        </>
    );

    return (
        <div className={styles.view}>
            <button type="button" className={styles.backBtn} onClick={onBack}>
                <ArrowLeft size={16} strokeWidth={2} />
                Назад к ленте заказов
            </button>

            <header className={styles.head}>
                <div className={styles.headMeta}>
                    <span className={`${styles.badge} ${badgeClass}`}>
                        {feedStatusLabel(workInfo.status)}
                    </span>
                    <span className={styles.headId}>
                        ЗК-{workFormatters.shortId(workInfo.guid || workInfo.cargo)}
                    </span>
                </div>
                <h1 className={styles.title}>{workInfo.name || 'Без названия'}</h1>
                {subtitleParts.length > 0 && (
                    <p className={styles.subtitle}>{subtitleParts.join(' · ')}</p>
                )}
            </header>

            <StatusTimeline work={workInfo} />

            <div className={styles.body}>
                <WorkOrderInfo work={workInfo} />

                {isBidding && (
                    <section className={styles.bidsCard}>
                        <p className={styles.bidsTitle}>
                            <Handshake size={16} strokeWidth={2} />
                            Идут торги по заказу
                        </p>
                        <p className={styles.bidsText}>
                            Заказчик рассматривает предложения нескольких перевозчиков. Вы можете
                            скорректировать цену, уточнить детали в чате или отказаться от заказа.
                        </p>
                        <div className={styles.bidsActions}>
                            <button
                                type="button"
                                className={styles.bidsPrimary}
                                onClick={() => setActionOpen(true)}
                            >
                                <Handshake size={16} strokeWidth={2} />
                                Торговаться
                            </button>
                            <button
                                type="button"
                                className={styles.bidsGhost}
                                onClick={handleOpenChat}
                            >
                                <MessageSquare size={16} strokeWidth={2} />
                                Чат с заказчиком
                            </button>
                            <button
                                type="button"
                                className={styles.bidsDanger}
                                onClick={() => onOfferCancelClick(workInfo)}
                            >
                                Отказаться от заказа
                            </button>
                        </div>
                    </section>
                )}

                {workInfo.status === WorkStatus.REJECTED && (
                    <p className={styles.refusedNote}>
                        Вы отказались от этого заказа. Он больше не будет отображаться в ваших
                        активных откликах.
                    </p>
                )}
            </div>

            <div className={styles.footer}>
                {ctaLabel && (
                    <button
                        type="button"
                        className={`${styles.actionCta} ${ctaDisabled ? styles.actionCtaDisabled : ''}`}
                        onClick={() => {
                            if (!ctaDisabled) setActionOpen(true);
                        }}
                        disabled={ctaDisabled}
                    >
                        {ctaLabel}
                    </button>
                )}
                <button
                    type="button"
                    className={styles.chatCta}
                    onClick={handleOpenChat}
                    aria-label="Написать отправителю"
                >
                    <MessageSquare size={20} strokeWidth={1.75} />
                </button>
            </div>

            <IonModal
                isOpen={actionOpen}
                onDidDismiss={() => setActionOpen(false)}
                className={styles.actionModal}
            >
                <div className={styles.modalShell}>
                    <div className={styles.modalHead}>
                        <div>
                            <div className={styles.modalKicker}>Заказ</div>
                            <h2 className={styles.modalTitle}>Действие по заказу</h2>
                            {workInfo.status !== WorkStatus.NEW &&
                              workInfo.status !== WorkStatus.OFFERED &&
                              actionHint && (
                                <p className={styles.modalHint}>{actionHint}</p>
                              )}
                        </div>
                        <button
                            type="button"
                            className={styles.modalClose}
                            onClick={() => setActionOpen(false)}
                            aria-label="Закрыть"
                        >
                            <X size={20} strokeWidth={2} />
                        </button>
                    </div>
                    <div className={styles.modalBody}>{actionContent}</div>
                </div>
            </IonModal>
        </div>
    );
};

export { Agreement } from './Agreement';
export type { ContractData } from './Agreement';

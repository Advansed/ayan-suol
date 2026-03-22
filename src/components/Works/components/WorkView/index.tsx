import React, { useEffect, useState } from 'react';
import { useIonRouter } from '@ionic/react';
import { WorkInfo, WorkStatus } from '../../types';
import { useWorkStore } from '../../workStore';
import { passportGetters } from '../../../../Store/passportStore';
import { companyGetters } from '../../../../Store/companyStore';
import { transportGetters } from '../../../../Store/transportStore';
import { useToast } from '../../../Toast';
import { WizardHeader } from '../../../Header/WizardHeader';
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

interface WorkViewProps {
    work: WorkInfo;
    onBack: () => void;
    onOfferClick: (work: WorkInfo) => void;
    onOfferCancelClick: (work: WorkInfo) => void;
    onStatusClick: (work: WorkInfo) => void;
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
    onStatusClick,
    onLoaded,
    onArrivedAtLoad,
    onArrivedUnload,
    onUnloadComplete,
    onSignContract
}) => {
    const [workInfo, setWorkInfo] = useState(work);
    const works = useWorkStore(state => state.works);
    const hist = useIonRouter();
    const toast = useToast();

    const passportCompletion = passportGetters.getCompletionPercentage();
    const companyCompletion = companyGetters.getCompletionPercentage();
    const transportCompletion = transportGetters.getCompletionPercentage();

    useEffect(() => {
        if (passportCompletion < 80) {
            onBack();
            toast.info('Надо сперва заполнить паспортные данные');
            hist.push('/tab3');
        } else if (companyCompletion < 80) {
            onBack();
            toast.info('Надо сперва заполнить данные организации');
            hist.push('/tab3');
        } else if (transportCompletion < 80) {
            onBack();
            toast.info('Надо заполнить данные по транспорту');
            hist.push('/tab3');
        }
    }, [passportCompletion, companyCompletion, transportCompletion, onBack, toast, hist]);

    useEffect(() => {
        setWorkInfo(work);
    }, [work]);

    useEffect(() => {
        const w = works.find(item => item.guid === workInfo.guid);
        if (w) {
            setWorkInfo(w);
        }
    }, [works, workInfo.guid]);

    const handleStatusClick = (currentWork: WorkInfo) => {
        onStatusClick(currentWork);
    };

    const handleOffer = async (data: Partial<WorkInfo>, volume: number): Promise<void> => {
        const updatedWork: WorkInfo = {
            ...workInfo,
            ...data,
            volume
        };
        onOfferClick(updatedWork);
    };

    const handleCancelOffer = async (data: Partial<WorkInfo>, volume: number): Promise<void> => {
        const updatedWork: WorkInfo = {
            ...workInfo,
            ...data,
            volume
        };
        onOfferCancelClick(updatedWork);
    };

    if (!workInfo) {
        return null;
    }

    return (
        <>
            <WizardHeader
                title={`Заказ ID ${workInfo.guid.substr(0, 8)}`}
                onBack={onBack}
            />

            <div className="p-05">
                {workInfo.status === WorkStatus.NEW && (
                    <CounterOfferCard
                        work={workInfo}
                        onSubmit={handleOffer}
                    />
                )}

                {workInfo.status === WorkStatus.OFFERED && (
                    <CounterOfferCard
                        work={workInfo}
                        onSubmit={handleCancelOffer}
                    />
                )}

                {workInfo.status === WorkStatus.TO_LOAD && !workInfo.signed && (
                    <ContractCard
                        work={workInfo}
                        onSignContract={() => { if (onSignContract) onSignContract(workInfo); }}
                    />
                )}

                {workInfo.status === WorkStatus.TO_LOAD && workInfo.signed && (
                    <ArrivedCard
                        work={workInfo}
                        onArrived={(data) =>
                            onArrivedAtLoad ? onArrivedAtLoad(workInfo, data) : Promise.resolve()
                        }
                    />
                )}

                {workInfo.status === WorkStatus.ON_LOAD && (
                    <OnLoadWaitCard work={workInfo} />
                )}

                {workInfo.status === WorkStatus.LOADING && (
                    <LoadedCard
                        work={workInfo}
                        onLoaded={(data) => onLoaded ? onLoaded(workInfo, data) : Promise.resolve()}
                    />
                )}

                {workInfo.status === WorkStatus.LOADED && (
                    <LoadedWaitDispatchCard work={workInfo} />
                )}

                {workInfo.status === WorkStatus.IN_WORK && (
                    <InWorkCard
                        work={workInfo}
                        onArrivedUnload={(data) =>
                            onArrivedUnload ? onArrivedUnload(workInfo, data) : Promise.resolve()
                        }
                    />
                )}

                {workInfo.status === WorkStatus.TO_UNLOAD && <ToUnloadCard work={workInfo} />}

                {workInfo.status === WorkStatus.UNLOADING && (
                    <UnloadingCard
                        work={workInfo}
                        onCompleted={(data) =>
                            onUnloadComplete ? onUnloadComplete(workInfo, data) : Promise.resolve()
                        }
                    />
                )}

                {workInfo.status === WorkStatus.UNLOADED && (
                    <UnloadedWaitCard work={workInfo} />
                )}
            </div>
        </>
    );
};

export { Agreement } from './Agreement';
export type { ContractData } from './Agreement';


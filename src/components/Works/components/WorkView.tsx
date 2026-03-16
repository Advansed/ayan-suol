import React, { useEffect, useState } from 'react';
import { IonButton, useIonRouter } from '@ionic/react';
import { WorkInfo, WorkStatus } from '../types';
import { useWorkStore } from '../workStore';
import { passportGetters } from '../../../Store/passportStore';
import { companyGetters } from '../../../Store/companyStore';
import { transportGetters } from '../../../Store/transportStore';
import { useToast } from '../../Toast';
import { WizardHeader } from '../../Header/WizardHeader';
import { WorkCard } from './WorkCard';
import { CounterOfferCard, ContractCard, ArrivedCard, LoadedCard } from '.';

interface WorkViewProps {
    work: WorkInfo;
    onBack: () => void;
    onOfferClick: (work: WorkInfo) => void;
    onOfferCancelClick: (work: WorkInfo) => void;
    onStatusClick: (work: WorkInfo) => void;
    onLoaded?: (work: WorkInfo, data: { verified: boolean; cargoPhotos: string[]; sealPhotos: string[] }) => Promise<void>;
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
    onSignContract
}) => {
    const [workInfo, setWorkInfo]   = useState(work);
    const works                     = useWorkStore(state => state.works);
    const hist                      = useIonRouter();
    const toast                     = useToast();

    const passportCompletion        = passportGetters.getCompletionPercentage();
    const companyCompletion         = companyGetters.getCompletionPercentage();
    const transportCompletion       = transportGetters.getCompletionPercentage();

    useEffect(() => {
        if (passportCompletion < 80) {
            onBack();
            toast.info("Надо сперва заполнить паспортные данные");
            hist.push("/tab3");
        } else if (companyCompletion < 80) {
            onBack();
            toast.info("Надо сперва заполнить данные организации");
            hist.push("/tab3");
        } else if (transportCompletion < 80) {
            onBack();
            toast.info("Надо заполнить данные по транспорту");
            hist.push("/tab3");
        }
    }, [passportCompletion, companyCompletion, transportCompletion, onBack, toast, hist]);

    // Обновляем workInfo при изменении пропса work
    useEffect(() => {
        setWorkInfo(work);
    }, [work]);

    // Обновляем workInfo из списка works при его изменении
    useEffect(() => {
        const w = works.find(w => w.guid === workInfo.guid);
        if (w) {
            setWorkInfo(w);
        }
    }, [works, workInfo.guid]);

    const handleStatusClick = (work: WorkInfo) => {
        onStatusClick(work);
    };

    const handleOffer = async (data: Partial<WorkInfo>, volume: number): Promise<void> => {
        // Создаем полный объект WorkInfo, объединяя исходные данные работы с обновленными из формы
        const updatedWork: WorkInfo = {
            ...workInfo,
            ...data,
            volume: volume
        };

        onOfferClick(updatedWork);

        console.log("offerData", data, volume);
    };

    const handleCancelOffer = async (data: Partial<WorkInfo>, volume: number): Promise<void> => {
        // Создаем полный объект WorkInfo, объединяя исходные данные работы с обновленными из формы
        const updatedWork: WorkInfo = {
            ...workInfo,
            ...data,
            volume: volume
        };

        onOfferCancelClick(updatedWork);

        console.log("offerData", data, volume);
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

            <div className='ml-05 mr-05'>
                {/* <div className="mt-1">
                    <WorkCard work={workInfo} mode="view" />
                </div> */}

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
                        onSignContract={() => { if (onSignContract) onSignContract(workInfo) }}
                    />
                )}

                {workInfo.status === WorkStatus.TO_LOAD && workInfo.signed && (
                    <ArrivedCard
                        work={workInfo}
                        onArrivedClick={() => handleStatusClick(workInfo)}
                    />
                )}


                {workInfo.status === WorkStatus.LOADING && (
                    <LoadedCard
                        work={workInfo}
                        onLoaded={(data) => onLoaded ? onLoaded(workInfo, data) : Promise.resolve()}
                    />
                )}
            </div>
        </>
    );
};
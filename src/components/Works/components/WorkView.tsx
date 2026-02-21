import React, { useEffect, useState } from 'react';
import { IonButton, IonLabel, useIonRouter } from '@ionic/react';
import { WorkInfo, WorkStatus, OfferInfo } from '../types';
import { useWorkStore } from '../../../Store/workStore';
import { passportGetters } from '../../../Store/passportStore';
import { companyGetters } from '../../../Store/companyStore';
import { transportGetters } from '../../../Store/transportStore';
import { useToast } from '../../Toast';
import { WizardHeader } from '../../Header/WizardHeader';
import { CounterOfferCard } from '../../Offers/OfferCard';
import { WorkCard } from './WorkCard';

interface WorkViewProps {
    work:           WorkInfo;
    onBack:         () => void;
    onOfferClick:   (work: WorkInfo ) => void;
    onStatusClick:  (work: WorkInfo ) => void;
    onMapClick:     (work: WorkInfo ) => void;
    onCounterOffer?: (offer: OfferInfo) => Promise<boolean>;
}

export const WorkView: React.FC<WorkViewProps> = ({ 
    work, 
    onBack, 
    onOfferClick,
    onStatusClick,
    onMapClick,
    onCounterOffer
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

    useEffect(() => {
        const w = works.find(w => w.guid === workInfo.guid);
        if (w) {
            setWorkInfo(w);
        }
    }, [works, workInfo.guid]);

    const handleChat = (work: WorkInfo, e: React.MouseEvent) => {
        e.stopPropagation();
        hist.push(`/tab2/${work.recipient}:${work.cargo}:${work.client}`);
    };

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

    const getStatusButtonLabel = (status: WorkStatus): string => {
        switch (status) {
            case WorkStatus.NEW: return "Я готов перевезти";
            case WorkStatus.TO_LOAD: return "Прибыл на погрузку";
            case WorkStatus.LOADING: return "Транспорт загружен";
            case WorkStatus.IN_WORK: return "Прибыл на точку";
            case WorkStatus.UNLOADING: return "Транспорт разгружен";
            case WorkStatus.REJECTED: return "Предложить";
            default: return "";
        }
    };

    const handleMainButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        switch (workInfo.status) {
            case WorkStatus.NEW:
            case WorkStatus.REJECTED:
                onOfferClick(workInfo);
                break;
            case WorkStatus.TO_LOAD:
            case WorkStatus.LOADING:
            case WorkStatus.IN_WORK:
            case WorkStatus.UNLOADING:
                handleStatusClick(workInfo);
                break;
            default:
                break;
        }
    };

    const shouldShowMainButton = () => {
        return [
            WorkStatus.NEW,
            WorkStatus.TO_LOAD,
            WorkStatus.LOADING,
            WorkStatus.IN_WORK,
            WorkStatus.UNLOADING,
            WorkStatus.REJECTED
        ].includes(workInfo.status);
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
                <div className="mt-1">
                    <WorkCard work={workInfo} mode="view" />
                </div>

                {workInfo.status === WorkStatus.NEW && (
                    <CounterOfferCard
                        work        = { workInfo }
                        onSubmit    = { handleOffer }
                    />
                )}

            </div>
        </>
    );
};
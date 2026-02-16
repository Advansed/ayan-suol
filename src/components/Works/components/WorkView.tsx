import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonLabel, useIonRouter } from '@ionic/react';
import { arrowBackOutline, callOutline, locationOutline } from 'ionicons/icons';
import { WorkInfo, WorkStatus, CreateOfferData, OfferInfo } from '../types';
import { workFormatters, workStatusUtils } from '../utils';
import { useWorkStore } from '../../../Store/workStore';
import { passportGetters } from '../../../Store/passportStore';
import { companyGetters } from '../../../Store/companyStore';
import { transportGetters } from '../../../Store/transportStore';
import { useToast } from '../../Toast';
import { WizardHeader } from '../../Header/WizardHeader';
import { CounterOfferCard } from './CounterOfferCard';
import styles from './WorkCard.module.css';

interface WorkViewProps {
    work:           WorkInfo;
    onBack:         () => void;
    onOfferClick:   (work: WorkInfo ) => void;
    onStatusClick:  (work: WorkInfo ) => void;
    onMapClick:     (work: WorkInfo ) => void;
    onCounterOffer?: (offer: OfferInfo) => Promise<boolean>;
}

export const WorkView: React.FC<WorkViewProps> = ({ 
    work, onBack, 
    onOfferClick,
    onStatusClick,
    onMapClick,
    onCounterOffer,

}) => {
    const [workInfo, setWorkInfo] = useState(work);
    
    const works             = useWorkStore(state => state.works)

    const passportCompletion        = passportGetters.getCompletionPercentage()
    const companyCompletion         = companyGetters.getCompletionPercentage()
    const transportCompletion       = transportGetters.getCompletionPercentage()

    console.log( passportCompletion, companyCompletion, transportCompletion)

    const hist                      = useIonRouter()
    const toast                     = useToast()


    useEffect(()=>{
        console.log("work info ")
        console.log("CREATE", passportCompletion, companyCompletion)
        if((passportCompletion < 80 ))
        {
            onBack()
            toast.info("Надо сперва заполнить паспортные данные")
            hist.push("/tab3")
        } else
        if((companyCompletion < 80 ))
        {
            onBack()
            toast.info("Надо сперва заполнить данные организации")
            hist.push("/tab3")
        } else
        if((transportCompletion < 80 ))
        {
            onBack()
            toast.info("Надо заполнить данные по транспорту")
            hist.push("/tab3")
        }
    },[])

    useEffect(()=>{
        const w = works.find( w => w.guid === workInfo.guid )
        setWorkInfo( w as WorkInfo )
    },[ works ])

    const handleChat        = (work: WorkInfo, e: React.MouseEvent) => {
        e.stopPropagation();
        hist.push(`/tab2/${work.recipient}:${work.cargo}:${work.client}`);
    };

    const StatusClick = (work: WorkInfo) => {

        onStatusClick( work )

    }

    const handleCounterOffer = async (data: CreateOfferData, volume: number): Promise<void> => {
        if (!onCounterOffer) {
            // Если обработчик не передан, используем стандартную логику
            const transport = transportGetters.getData();
            const offerData: OfferInfo = {
                guid: workInfo.cargo,
                recipient: workInfo.recipient,
                price: data.price,
                weight: data.weight,
                volume: volume,
                transport: transport?.guid || '',
                comment: data.comment || '',
                status: 11 // WorkStatus.OFFERED
            };
            
            // Здесь можно добавить логику отправки через socket или API
            toast.info('Встречное предложение отправлено');
            return;
        }

        const transport = transportGetters.getData();
        const offerData: OfferInfo = {
            guid: workInfo.cargo,
            recipient: workInfo.recipient,
            price: data.price,
            weight: data.weight,
            volume: volume,
            transport: transport?.guid || '',
            comment: data.comment || '',
            status: 11 // WorkStatus.OFFERED
        };

        await onCounterOffer(offerData);
    };

    // Определяем теги для второй строки
    const getBottomTags = () => {
        const tags: Array<{ text: string; className: string }> = [];
        
        // Гарантированная оплата (если advance > 0)
        if (workInfo.advance > 0) {
            const isFullAdvance = workInfo.advance >= workInfo.price;
            tags.push({
                text: 'Гарантированная оплата',
                className: isFullAdvance ? styles.tagGreen : styles.tagOrange
            });
        }
        
        // Застраховано (если insurance > 0)
        if (workInfo.insurance > 0) {
            const isFullAdvance = workInfo.advance >= workInfo.price;
            tags.push({
                text: 'Застраховано',
                className: isFullAdvance ? styles.tagGreen : styles.tagOrange
            });
        }
        
        return tags;
    };

    const renderButtons     = ( work: WorkInfo) => {
        return <>
            <div>
                <div className="flex">
                    <IonButton
                        className   = "w-50 cr-button-2"
                        mode        = "ios"
                        fill        = "clear"
                        color       = "primary"
                        onClick     = { (e) => handleChat( work, e) }
                    >
                        <IonLabel className="fs-08">
                            {work.status === WorkStatus.NEW ? 'Чат' : 'Чат'}
                        </IonLabel>
                    </IonButton>
                    
                    <IonButton
                        className   = "w-50 cr-button-2"
                        mode        = "ios"
                        color       = "tertiary"
                        onClick     = {(e) => {
                            e.stopPropagation();
                            onMapClick(work);
                        }}
                    >
                        <IonLabel className="fs-08">Карта</IonLabel>
                    </IonButton>

                </div>
                <div className="flex">
                    
                    {( 
                        work.status === WorkStatus.NEW 
                    
                        ||  work.status === WorkStatus.TO_LOAD
                        ||  work.status === WorkStatus.LOADING
                        ||  work.status === WorkStatus.IN_WORK
                        ||  work.status === WorkStatus.UNLOADING
                        ||  work.status === WorkStatus.REJECTED

                    ) &&  (<>
                            <IonButton
                                className   = "w-100 "
                                mode        = "ios"
                                color       = "primary"
                                onClick     = {(e) => {
                                    e.stopPropagation();
                                    switch(work.status) {
                                        case WorkStatus.NEW:        onOfferClick( work );   break;
                                        case WorkStatus.TO_LOAD:     StatusClick( work );   break;
                                        case WorkStatus.LOADING:     StatusClick( work );   break;
                                        case WorkStatus.IN_WORK:     StatusClick( work );   break;
                                        case WorkStatus.UNLOADING:   StatusClick( work );   break;
                                        case WorkStatus.REJECTED:   onOfferClick( work );   break;
                                        default: break;
                                    }
                                    
                                }}
                            >
                                <IonLabel className="fs-1">{
                                    work.status ===  WorkStatus.NEW           ? "Я готов перевезти"  
                                    : work.status ===  WorkStatus.TO_LOAD       ? "Прибыл на погрузку"  
                                    : work.status ===  WorkStatus.LOADING       ? "Транспорт загружен"  
                                    : work.status ===  WorkStatus.IN_WORK       ? "Прибыл на точку"  
                                    : work.status ===  WorkStatus.UNLOADING     ? "Транспорт разгружен"  
                                    : work.status ===  WorkStatus.REJECTED      ? "Предложить"  
                                    : ""
                                }</IonLabel>
                            </IonButton>
                        </>)
                    }
                            
                </div>
            </div>
        </>                
    }

    const renderView        = ( work: WorkInfo) => {
        return <>
            {/* Header */}
            <div >
                <WizardHeader 
                    title   = { "Заказ ID " + workInfo.guid.substr(0, 8) }
                    onBack  = { onBack }
                />
            </div>

            <div className='ml-05 mr-05'>
                {/* Карточка встречного предложения для статуса "Торг" */}

                <div className={`${styles.workCard} mt-1`}>
                    {/* Верхняя строка: два тега "Торг", ID, цена */}
                    <div className={styles.topRow}>
                        <div className={styles.topRowLeft}>
                            <span className={`${styles.statusBadge} ${styles.statusBargaining}`}>
                                { workInfo.status }
                            </span>
                            <span className={'fs-08 cl-gray'}>
                                ID: {workFormatters.shortId(workInfo.guid)}
                            </span>
                        </div>
                        <div className={styles.topRowRight}>
                            <span className={`${styles.statusBadge} ${styles.statusBargaining}`}>
                                Торг
                            </span>
                            <span className={`${styles.statusBadge} ${styles.statusWaiting}`}>
                                ₽ {workInfo.price.toLocaleString('ru-RU').replace(/,/g, ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Вторая строка: теги */}
                    {getBottomTags().length > 0 && (
                        <div className={styles.tagsRow}>
                            {getBottomTags().map((tag, index) => (
                                <span key={index} className={`${styles.tag} ${tag.className}`}>
                                    { tag.text }
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Название груза */}
                    <div className={styles.cargoName}>
                        <span className={styles.cargoNameText}>
                            <b className='fs-09'>{workInfo.name}</b>
                        </span>
                    </div>

                    {/* Маршрут в две строки, как в дизайне */}
                    <div className={styles.routeSection + ' mt-05'}>
                        {/* Откуда + дата загрузки */}
                        <div className={styles.routeRow}>
                            <div className={styles.routeLeft}>
                                <IonIcon icon={locationOutline} className={`${styles.routeIcon} ${styles.routeIconGreen}`} />
                                <div className={styles.routeTextGroup}>
                                    <span className={styles.routeLabel}>Откуда:</span>
                                    <span className={styles.routeCity}>
                                        {workInfo.address?.city.city || 'Не указано'}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.routeRight}>
                                <span className={styles.routeDateLabel}>Дата загрузки:</span>
                                <span className={styles.routeDateValue}>
                                    {workFormatters.date(workInfo.pickup_date || '')}
                                </span>
                            </div>
                        </div>

                        {/* Куда + дата загрузки (как в макете) */}
                        <div className={styles.routeRow}>
                            <div className={styles.routeLeft}>
                                <IonIcon icon={locationOutline} className={`${styles.routeIcon} ${styles.routeIconRed}`} />
                                <div className={styles.routeTextGroup}>
                                    <span className={styles.routeLabel}>Куда:</span>
                                    <span className={styles.routeCity}>
                                        {workInfo.destiny?.city.city || 'Не указано'}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.routeRight}>
                                <span className={styles.routeDateLabel}>Дата загрузки:</span>
                                <span className={styles.routeDateValue}>
                                    {workFormatters.date(workInfo.pickup_date || '')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Детали груза */}
                    <div className={styles.cargoDetails}>
                        <div className={styles.cargoDetailsTitle}>Детали груза:</div>
                        <div className={styles.cargoDetailsList}>
                            <div className={styles.cargoDetailItem}>
                                Вес (т): <span className={styles.cargoDetailValue}>{workInfo.weight}</span>
                            </div>
                            <div className={styles.cargoDetailItem}>
                                Объем (м³): <span className={styles.cargoDetailValue}>{workInfo.volume}</span>
                            </div>
                        </div>
                        {workInfo.description && (
                            <div className={styles.cargoDescription}>
                                {workInfo.description}
                            </div>
                        )}
                    </div>

                    {/* Кнопки действий */}
                    {/* <div className="flex fl-space mt-05 pb-05">
                        <IonButton
                            className="w-100"
                            mode="ios"
                            color="danger"
                        >
                            <span className="fs-08">Обратиться в тех. поддержку</span>
                        </IonButton>
                    </div> */}

                    {/* { renderButtons( workInfo ) } */}

                </div>

                {workInfo.status === WorkStatus.OFFERED && (
                    <CounterOfferCard
                        work={workInfo}
                        onSubmit={handleCounterOffer}
                    />
                )}

            </div>
        </>
    }

    return (
        <>
            { workInfo && renderView( workInfo ) }
        </>
    );
};
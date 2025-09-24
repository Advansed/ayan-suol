/**
 * Главный компонент модуля Works
 */

import React from 'react';
import { WorkInfo, OfferInfo, WorkStatus } from './types';
import { WorksList, WorkView, WorkOffer } from './components';
import { WorkMap } from './components/WorkMap';
import { useWorks } from '../../Store/useWorks';
import { useWorkNavigation } from './hooks/useNavigation';
import { SaveData, WorkPage1 } from './components/WorkPage1';
import { useSocket } from '../../Store/useSocket';
import { useToken } from '../../Store/loginStore';

export const Works: React.FC = () => {
    const { works, isLoading, setOffer, setStatus, refreshWorks } = useWorks();
    const { emit }  = useSocket()
    const token     = useToken()

    const { currentPage, navigateTo,goBack } = useWorkNavigation()

    // Обработчики для списка
    const handleWorkClick = (work: WorkInfo) => {

        navigateTo({ type: 'view', work });

    };

    const handleOfferClick = (work: WorkInfo ) => {

        navigateTo({ type: 'offer', work });
      
    };

    const handleStatusClick = (work: WorkInfo ) => {

        if( work.status === WorkStatus.TO_LOAD ) { 
            navigateTo({ type: "page1", work }) 
        } else
        if( work.status === WorkStatus.IN_WORK ) { 
            setStatus( work )
            emit("send_message", {
                token:          token,
                recipient:      work.recipient,
                cargo:          work.cargo,
                message:        "Транспорт прибыл на точку разгрузки"
            })                
        } else 
        if( work.status === WorkStatus.UNLOADING ) { 
            setStatus( work )
            emit("send_message", {
                token:          token,
                recipient:      work.recipient,
                cargo:          work.cargo,
                message:        "Транспорт разгружен"
            })                
        } else 
        setStatus( work )

    };

    // Добавить обработчик после handleOfferClick
    const handleMapClick = (work: WorkInfo) => {

        navigateTo({ type: 'map', work });

    };

    const handleOfferSubmit = async (offer: OfferInfo ) => {

       const res = await setOffer( offer ) 
                  
        emit("send_message", {
              token:          token,
              recipient:      offer.recipient,
              cargo:          offer.guid,
              message:        "Сделал предложение: Сумма - " + offer.price.toFixed() + " рублей" ,
              image:          "",
          })

       return res 

    };

    const handleSavePage1 = async ( data:SaveData ) => {

        if( currentPage.type === "page1"){
            setStatus( currentPage.work )
            data.bodyPhotos.forEach( elem => {
                emit("send_message", {
                    token:          token,
                    recipient:      currentPage.work.recipient,
                    cargo:          currentPage.work.cargo,
                    image:          elem,
                })                
            });
            emit("send_message", {
                token:          token,
                recipient:      currentPage.work.recipient,
                cargo:          currentPage.work.cargo,
                message:        "Транспорт осмотрен, документы проверены, фото кузова приложено, транспорт готов к погрузке"  ,
                image:          "",
            })
        }
            
        return true
    
    };


    // Рендер страниц
    const renderPage = () => {
        switch (currentPage.type) {
            case 'list':
                return (
                    <WorksList
                        works           = { works }
                        isLoading       = { isLoading } 
                        onWorkClick     = { handleWorkClick }
                        onRefresh       = { refreshWorks }
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
                    />
                );

            case 'offer':
                return (
                    <WorkOffer
                        work            = { currentPage.work }
                        onBack          = { goBack }
                        onOffer         = { handleOfferSubmit }
                    />
                );

            // В renderPage() добавить новый случай:
            case 'map':
                return (
                    <WorkMap
                        work            = { currentPage.work }
                        onBack          = { goBack }
                    />
                );
            case 'page1':
                return (
                    <WorkPage1
                        work            = { currentPage.work }
                        onBack          = { goBack }
                        onSave          = { handleSavePage1 }   
                    />
                );
            default:
                return (
                    <WorksList
                        works           = { works }
                        isLoading       = { isLoading }
                        onWorkClick     = { handleWorkClick }
                    />
                );
        }
    };

    return (
        <div className="a-container">
            {renderPage()}
        </div>
    );
};
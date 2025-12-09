import React, { useEffect, useState }              from 'react';
import { CargoInfo, DriverInfo }        from '../../../Store/cargoStore';
import { WizardHeader }                 from '../../Header/WizardHeader';
import { IonButton, IonCard, IonIcon }  from '@ionic/react';
import { DriverCard }                   from './DriverCard';
import { useInvoices }                  from '../hooks/useInvoices';
import { chatboxEllipsesOutline }       from 'ionicons/icons';
import { CargoPage1, SaveData }         from './CargoPage1';
import { CargoPage2 }                   from './CargoPage2';
import { useSocket }                    from '../../../Store/useSocket';
import { useToken }                     from '../../../Store/loginStore';
import { CargoPage3, SaveData3 }        from './CargoPage3';
import { api }                          from '../../../Store/api';
import { CargoPage4, SaveData4 }        from './CargoPage4';

interface CargoInvoiceSectionsProps {
    cargo:      CargoInfo;
    onBack:     ()=>void;
}

interface Route1 {
    type:   string;
    info:   DriverInfo | undefined;
}

export const CargoInvoiceSections: React.FC<CargoInvoiceSectionsProps> = ({ cargo, onBack }) => {
    const { invoices, isLoading, contract, handleAccept,  handleReject, handleChat, get_contract, setContract, create_contract } = useInvoices({ info: cargo })
    const [ page, setPage ] = useState<Route1>({ type: 'main', info: undefined })
    const { emit } = useSocket()
    const token = useToken()

    useEffect(()=>{ console.log(contract)},[contract])

    const AcceptClick           = async(invoice: DriverInfo, data: any, status: number) => {   
        
        await handleAccept( invoice, status )
    
        if( status === 16 ) {
            data.sealPhotos.forEach(elem => {
                // emit("send_message", {
                //     token:          token,
                //     recipient:      invoice.recipient,
                //     cargo:          invoice.cargo,
                //     image:          elem,
                // })                    
                api("api/sendimage", {
                    token:          token,
                    recipient:      invoice.recipient,
                    cargo:          invoice.cargo,
                    image:          elem,
                })    
            });

            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Груз осмотрен и опломбирован, документы на груз переданы",
            })                
            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Транспорт отправлен в точку разгрузки",
            })                
        } else 
        if( status === 18 ) {
            data.sealPhotos.forEach(elem => {
                api("api/sendimage", {
                    token:          token,
                    recipient:      invoice.recipient,
                    cargo:          invoice.cargo,
                    image:          elem,
                })    
                // emit("send_message", {
                //     token:          token,
                //     recipient:      invoice.recipient,
                //     cargo:          invoice.cargo,
                //     image:          elem,
                // })                        
            });

            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Пломба цела, груз доставлен",
            })                
            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Разгрузка начата",
            })                
        } else 
        if( status === 20 ) {
            emit("send_message", {
                token:          token,
                recipient:      invoice.recipient,
                cargo:          invoice.cargo,
                message:        "Все работы выполнены",
            })                
        } 


        return true

    }

    const handleClick            = async( invoice:DriverInfo ) => {

        await get_contract( invoice )
        setPage({ type: "page4", info: invoice })
    }

    const handleClose           = async () => {
        setContract( undefined )
    }

    // Рендер секции инвойсов
    const renderInvoiceSection  = (
            invoices: DriverInfo[]
    ) => {

        if (!invoices || invoices.length === 0) {
            return <></>;
        }

        return (
            <>
                
                {invoices.map((invoice, index) => (

                    <IonCard className='ml-1 mr-1 mt-1 pt-1 pl-1 pr-1 pb-1'
                        key = { index }
                    >
                        <DriverCard
                            info                = { invoice }
                            cargo               = { cargo }    
                        />
                        
                        { renderButtons( invoice ) }

                    </IonCard>

                ))}
            </>
        );
    };

    const renderButtons         = (invoice:DriverInfo) => {
        switch (invoice.status) {

            case 'Заказано':
                return (
                    <div>
                        <div className='flex mt-1'>
                            <IonButton
                                className   = "w-50 cr-button-2"
                                mode        = "ios"
                                fill        = "clear"
                                color       = "primary"
                                onClick     = { () => handleChat( invoice ) }
                                disabled    = { isLoading }
                            >
                                <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                                <span className="ml-1 fs-08">Чат</span>
                            </IonButton>

                            <IonButton
                                className   = "w-50 cr-button-1"
                                mode        = "ios"
                                color       = "warning"
                                onClick     = { () => handleReject( invoice ) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1 fs-08">Отказать</span>
                            </IonButton>
                        </div>
                        <div className='flex mt-1'>

                            <IonButton
                                className   = "w-100"
                                mode        = "ios"
                                color       = "primary"
                                onClick     = { () => handleClick( invoice ) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1 fs-1">Принять предложение

                                </span>
                            </IonButton>

                        </div>
                    </div>
                );

            case 'Принято':
                return (
                    <div className='flex mt-1'>
                        <IonButton
                            className   = "w-50 cr-button-2"
                            mode        = "ios"
                            fill        = "clear"
                            color       = "primary"
                            onClick     = { () => handleChat( invoice) }
                            disabled    = { isLoading }
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className   = "w-50 cr-button-1"
                            mode        = "ios"
                            color       = "warning"
                            onClick     = { () => handleReject( invoice ) }
                            disabled    = { isLoading }
                        >
                            <span className="ml-1 fs-08">Отказать</span>
                        </IonButton>
                    </div>
                );
            
            case 'На погрузке':
                return (
                    <div>
                        <div className='flex mt-1'>
                            <IonButton
                                className   = "w-50 cr-button-2"
                                mode        = "ios"
                                fill        = "clear"
                                color       = "primary"
                                onClick     = { () => handleChat( invoice) }
                                disabled    = { isLoading }
                            >
                                <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                                <span className="ml-1 fs-08">Чат</span>
                            </IonButton>

                        </div>
                        <div className='flex mt-1'>

                            <IonButton
                                className   = "w-100"
                                mode        = "ios"
                                color       = "primary"
                                onClick     = { () => handleAccept( invoice, 14 ) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1 fs-1">Начать погрузку

                                </span>
                            </IonButton>

                        </div>
                    </div>

                );

            case 'Загружено':
                return (
                    <div>
                        <div className='flex mt-1'>
                            <IonButton
                                className   = "w-50 cr-button-2"
                                mode        = "ios"
                                fill        = "clear"
                                color       = "primary"
                                onClick     = { () => handleChat( invoice) }
                                disabled    = { isLoading }
                            >
                                <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                                <span className="ml-1 fs-08">Чат</span>
                            </IonButton>

                        </div>

                        <div>
                            <IonButton
                                className   = "w-100"
                                mode        = "ios"
                                color       = "primary"
                                onClick     = { () => setPage({ type: "page1", info: invoice }) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1 fs-1">Отправить транспорт</span>
                            </IonButton>
                        </div>
                    </div>
                );

            case 'Доставлено':
                return (
                    <div>
                        <div className='flex mt-1'>
                            <IonButton
                                className   = "w-50 cr-button-2"
                                mode        = "ios"
                                fill        = "clear"
                                color       = "primary"
                                onClick     = { () => handleChat( invoice) }
                                disabled    = { isLoading }
                            >
                                <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                                <span className="ml-1 fs-08">Чат</span>
                            </IonButton>

                        </div>
                        <div className='flex mt-1'>

                            <IonButton
                                className   = "w-100"
                                mode        = "ios"
                                color       = "primary"
                                onClick     = { () => setPage({ type: "page2", info: invoice }) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1">Начать разгрузку</span>
                            </IonButton>
                        </div>
                    </div>
                );

            case 'Разгружено':
                return (
                    <div>
                        <div className='flex mt-1'>
                            <IonButton
                                className   = "w-50 cr-button-2"
                                mode        = "ios"
                                fill        = "clear"
                                color       = "primary"
                                onClick     = { () => handleChat( invoice) }
                                disabled    = { isLoading }
                            >
                                <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                                <span className="ml-1 fs-08">Чат</span>
                            </IonButton>

           
                        </div>
                        <div>
                            <IonButton
                                className   = "w-100 mt-1"
                                mode        = "ios"
                                color       = "primary"
                                onClick     = { () => setPage({ type: "page3", info: invoice }) }
                                disabled    = { isLoading }
                            >
                                <span className="ml-1 fs-08">Завершить</span>
                            </IonButton>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const render                = () =>{
        return (
            <>
                <div className='ml-1 mr-1'>
                    <WizardHeader 
                        title   = "Заявки "
                        pages   = { cargo && cargo.name || '' }
                        onBack  = { onBack }
                    />

                </div>

                { renderInvoiceSection( invoices) }

            </>
        )
    }

    const renderPage1           = ( invoice: DriverInfo ) => {
        return (
            <>
                <CargoPage1 
                    info    = { invoice }
                    onBack  = { () => { setPage({type: "main", info: undefined})}}
                    onSave  = { (data: SaveData) => { return AcceptClick( invoice, data, 16 ) }}
                />
            </> 
        )
    }

    const renderPage2           = ( invoice: DriverInfo ) => {
        return (
            <>
                <CargoPage2
                    info    = { invoice }
                    onBack  = { () => { setPage({type: "main", info: undefined})}}
                    onSave  = { (data: SaveData) => { return AcceptClick( invoice, data, 18 ) }}
                />
            </> 
        )
    }

    const renderPage3           = ( invoice: DriverInfo ) => {
        return (
            <>
                <CargoPage3
                    info    = { invoice }
                    onBack  = { () => { setPage({type: "main", info: undefined})}}
                    onSave  = { (data: SaveData3) => { return AcceptClick( invoice, data, 20 ) }}
                />
            </> 
        )
    }

    const renderPage4           = ( invoice: DriverInfo ) => {
        return (
            <>
                <CargoPage4
                    info    = { invoice }
                    pdf     = { contract }
                    onBack  = { () => { setPage({type: "main", info: undefined})}}
                    onSave  = { (data: SaveData4) => { 
                        console.log('sign', data)
                        create_contract( invoice, data.sign )
                        return AcceptClick( invoice, data, 12 ) 
                    }}
                />
            </> 
        )
    }

    return (
        <>
        {
            page.type === 'main'
                ? render()
            : page.type === 'page1' 
                ? page.info && renderPage1( page.info )
            : page.type === 'page2' 
                ? page.info && renderPage2( page.info )
            : page.type === 'page3' 
                ? page.info && renderPage3( page.info )
            : page.type === 'page4' 
                ? page.info && renderPage4( page.info )
            : <></>
        }
         
      </>
    );
};

import React, { useEffect, useState, useRef } from "react";
import { getData, Store } from "./Store";
import { IonAlert, IonButton, IonIcon, IonLabel } from "@ionic/react";
import { addCircleOutline, arrowBackOutline } from "ionicons/icons";
import { CargoBody, CargoInfo } from "./CargoBody";
import DriverChat from "./DriverChat";
import "./Cargos.css";
import { CargoService } from "./CargoService";
import { DriverInfo, InvoiceSection } from "./DriverCard";
import socketService from "./Sockets";


export function Cargos() {
    const [page, setPage] = useState<any>(0)
    const [upd, setUpd] = useState(0)
    const [alert, setAlert] = useState<any>()

    function Upd() {
        setUpd(upd + 1)
    }

    const elem = <>
        <div className="a-container">
            {
                page === 0 
                    ? <List info={{ setPage: setPage, setAlert }} />
                : page === 1 
                    ? <CargoService mode="create" setPage={setPage} />
                : page.type === "edit"
                    ? <CargoService mode="edit" info={page} setPage={setPage} setUpd={Upd} />
                : page.type === "open"
                    ? <Page1 info={page} setPage={setPage} setUpd={Upd} />
                : page.type === "chat"
                    ? <DriverChat info={page} setPage={setPage} setUpd={Upd} />
                : <></>
            }
        </div>  

        <IonAlert
            isOpen={alert !== undefined}
            onDidDismiss={() => { setAlert(undefined) }}
            header="Вы точно хотите отменить публикацию?"
            className="custom-alert"
            buttons={[
                { 
                    text: 'Отмена',
                    role: 'cancel',
                    handler: () => {
                        console.log('Alert canceled');
                    },
                },
                {
                    text: 'Да',
                    role: 'confirm',
                    handler: async() => {
                        alert.token = Store.getState().login.token
                        const res = await getData("delCargo", alert)
                        if (res.success) {
                            const cargos = Store.getState().cargos
                            cargos.splice(cargos.indexOf(alert), 1)
                        }
                    },
                },
            ]}
        />
    </>

    return elem 
}

function List(props: { info: { setPage: (page: any) => void, setAlert: (alert: any) => void } }) {
    const [cargos, setCargos] = useState<any>([])
    const [ upd, setUpd ] = useState( 0 )
    const isMountedRef = useRef(true)  // Флаг для проверки монтирования
    const subscriptionIdRef = useRef<number | null>(null)  // Ref для ID подписки
    
    useEffect(() => {
        isMountedRef.current = true
        
        // Устанавливаем начальное состояние
        if (isMountedRef.current) {
            setCargos(Store.getState().cargos)
        }
        
        // Создаем уникальный ID для подписки
        Store.subscribe({ num: 11, type: "cargos", func: ()=>{
            setCargos( Store.getState().cargos)
            console.log("subscribe 11")
            setUpd( upd + 1)
        }})     

        // Cleanup функция
        return () => {
            isMountedRef.current = false
            if (subscriptionIdRef.current !== null) {
                Store.unSubscribe( 11 )
            }
        }
    }, []) // Пустой массив зависимостей
    
    console.log("List cargos")
    console.log( cargos)
    
    let elem = <></>

    if (cargos.length > 0) {
        for (let i = 0; i < cargos.length; i++) {
            elem = (
                <>
                    {elem}
                    <Item info={cargos[i]} setPage={props.info.setPage} />
                </>
            )
        }
    }

    return (
        <>
            <div className="ml-05 mt-1 a-center fs-09">
                <b>Мои заказы</b>
            </div>

            <div 
                className="c-card mt-1 ml-1 mr-1 flex"
                onClick={() => { props.info.setPage(1) }}
            >
                <IonIcon icon={addCircleOutline} className="w-15 h-15" />
                <div className="ml-1 a-center w-70">Создать новый груз</div>
            </div>

            {elem}
        </>
    )
}

function Item(props: { info: CargoInfo, setPage: (page: any) => void }) {
    return (
        <div className="cr-card mt-1" onClick={() => { 
            const infoWithType = { ...props.info, type: "open" };
            props.setPage(infoWithType); 
        }}>
            <CargoBody info={props.info} mode="view" />
        </div>
    );
}

function Page1(props: { info: any, setPage: (page: any) => void, setUpd: () => void }) {
    const [cargoInfo, setCargoInfo] = useState(props.info); // Локальное состояние для info
    const [invoices, setInvoices] = useState<DriverInfo[]>([]);
    
    // Подписка на Store
    useEffect(() => {
        // Устанавливаем начальное состояние из Store
        let jarr: any = []

        Store.getState().invoices.forEach(elem => {
            if (cargoInfo.guid === elem.cargo) jarr.push(elem);
        });
        console.log(jarr)

        setInvoices(jarr);

        Store.subscribe({ 
            num: 12, 
            type: "invoices", 
            func: () => {
                let jarr: any = []

                Store.getState().invoices.forEach(elem => {
                    if (cargoInfo.guid === elem.cargo) jarr.push(elem);
                });
                console.log(jarr)
        
                setInvoices(jarr);               
                console.log("subscribe 12 - invoices updated")
            }
        })     

        const socket = socketService.getSocket();
        const handlePublish = () => {
            console.log("publish")
            // Обновляем статус только если текущий статус "Новый"
            if (cargoInfo.status === "Новый") {
                setCargoInfo(prev => ({
                    ...prev,
                    status: "В ожидании"
                }));
            }
        };

        if (socket) {
            socket.on("Publish", handlePublish);
        }

        return () => {
            Store.unSubscribe(12);
            // Очистка socket listener
            if (socket) {
                socket.off("Publish", handlePublish);
            }
        }
    }, [cargoInfo.guid, cargoInfo.status]); // Добавляем зависимости

    // Обновляем локальное состояние при изменении props.info
    useEffect(() => {
        setCargoInfo(props.info);
    }, [props.info]);

    // Группируем предложения по статусу
    const groupedInvoices = {
        ordered: invoices.filter(inv => inv.status === "Заказано"),
        accepted: invoices.filter(inv => inv.status === "Принято"),
        delivered: invoices.filter(inv => inv.status === "Доставлено")
    };

    return (
        <div>
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon icon={arrowBackOutline} className="w-15 h-15"
                    onClick={() => props.setPage(0)}
                />
                <div className="a-center w-90 fs-09">
                    <b>{"В ожидании #" + cargoInfo.guid.substring(0, 8)}</b>
                </div>
            </div>

            {/* Карточка груза */}
            <div className="cr-card mt-1" onClick={() => { 
                props.setPage({ ...cargoInfo, type: "edit" }); 
            }}>
                <CargoBody info={cargoInfo} mode="view" />
                
                {/* Кнопки управления */}
                <div className="flex">
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="clear"
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            props.setPage({ ...cargoInfo, type: "edit" });
                            props.setUpd();
                        }}
                    >
                        <IonLabel className="fs-08">Изменить заказ</IonLabel>
                    </IonButton>
                    {cargoInfo.status === "Новый" && (
                        <IonButton
                            className="w-50 cr-button-2"
                            mode="ios"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();

                                socketService.emit("Publish", {
                                    token: Store.getState().login.token,
                                    guid: cargoInfo.guid
                                });
                            }}
                        >
                            <IonLabel className="fs-08"> Опубликовать </IonLabel>
                        </IonButton>
                    )}
                </div>
            </div>

            {/* Секции с предложениями */}
            <InvoiceSection 
                title="Предложения от водителей"
                invoices={groupedInvoices.ordered}
                mode="offered"
                setPage={props.setPage}
            />
            <InvoiceSection 
                title="Назначенные водители"
                invoices={groupedInvoices.accepted}
                mode="assigned"
                setPage={props.setPage}
            />
            <InvoiceSection 
                title="Доставленные"
                invoices={groupedInvoices.delivered}
                mode="completed"
            />
        </div>
    );
}
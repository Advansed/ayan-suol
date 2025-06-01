import React, { useEffect, useState, useRef, useCallback } from "react";
import { exec, getData, Store } from "./Store";
import { IonAlert, IonButton, IonIcon, IonLabel, IonLoading } from "@ionic/react";
import { addCircleOutline, arrowBackOutline, chatboxEllipsesOutline, cloudUploadOutline, personCircleOutline, trashBinOutline } from "ionicons/icons";
import { CargoBody, CargoInfo } from "./CargoBody";
import DriverChat from "./DriverChat";
import "./Cargos.css";
import { CargoService } from "./CargoService";
import { DriverInfo, InvoiceSection } from "./DriverCard";


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
    const isMountedRef = useRef(true)  // Флаг для проверки монтирования
    const subscriptionIdRef = useRef<number | null>(null)  // Ref для ID подписки
    
    useEffect(() => {
        isMountedRef.current = true
        
        // Устанавливаем начальное состояние
        if (isMountedRef.current) {
            setCargos(Store.getState().cargos)
        }
        
        // Создаем уникальный ID для подписки
        const subscriptionId = Date.now() + Math.random()
        subscriptionIdRef.current = subscriptionId
        
        // Подписка на изменения cargos с проверкой монтирования
        Store.subscribe({
            num: subscriptionId, 
            type: "cargos", 
            func: () => {
                if (isMountedRef.current) {
                    setCargos(Store.getState().cargos)
                    console.log("subscribe - component mounted")
                    console.log(Store.getState().cargos)
                }
            }
        })
        
        // Cleanup функция
        return () => {
            isMountedRef.current = false
            if (subscriptionIdRef.current !== null) {
                Store.unSubscribe(subscriptionIdRef.current)
            }
        }
    }, []) // Пустой массив зависимостей

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
    const info = props.info;
    const [load, setLoad] = useState<any>([]);
    const [invoices, setInvoices] = useState<DriverInfo[]>([]);
    const [upd, setUpd] = useState<any>([]);
    
    // Refs для отслеживания состояния компонента и управления запросами
    const isMountedRef = useRef(true)
    const abortControllerRef = useRef<AbortController | null>(null)
    const subscriptionIdRef = useRef<number | null>(null)

    // Функция для безопасного обновления состояния
    const safeSetState = useCallback((setter: () => void) => {
        if (isMountedRef.current) {
            setter()
        }
    }, [])

    // Подписка на Store с cleanup
    useEffect(() => {
        const subscriptionId = Date.now() + Math.random()
        subscriptionIdRef.current = subscriptionId

        Store.subscribe({
            num: subscriptionId, 
            type: "invoices", 
            func: () => {
                safeSetState(() => {
                    setInvoices(Store.getState().invoices);
                    setUpd(upd + 1);
                })
            }
        });

        return () => {
            if (subscriptionIdRef.current !== null) {
                Store.unSubscribe(subscriptionIdRef.current);
            }
        }
    }, [safeSetState, upd]);

    // Socket.IO подключение и загрузка данных
    useEffect(() => {
        isMountedRef.current = true
        
        const loadData = async () => {
            // Отменяем предыдущий запрос если он есть
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }

            // Создаем новый AbortController
            abortControllerRef.current = new AbortController()

            try {
                safeSetState(() => setLoad(true))
                
                // Подключаемся к Socket.IO
                const token = Store.getState().login.token;
                const userId = Store.getState().login.phone;
                
                // Выполняем запрос с возможностью отмены
                await execWithAbort(
                    "getInv", 
                    { 
                        token: Store.getState().login.token, 
                        guid: info.guid 
                    }, 
                    "invoices",
                    abortControllerRef.current.signal
                );
                
            } catch ( error:any ) {
                if (error.name !== 'AbortError') {
                    console.error('Error loading invoices:', error)
                }
            } finally {
                safeSetState(() => setLoad(false))
            }
        }

        // Функция для перезагрузки предложений
        const refreshInvoices = async () => {
            if (!isMountedRef.current) return;
            
            try {
                await execWithAbort(
                    "getInv", 
                    { 
                        token: Store.getState().login.token, 
                        guid: info.guid 
                    }, 
                    "invoices"
                );
            } catch (error) {
                console.error('Ошибка обновления предложений:', error);
            }
        };

        loadData()

        // Cleanup функция
        return () => {
            isMountedRef.current = false
            
            // Отменяем HTTP запросы
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            // Покидаем комнату груза и очищаем обработчики
        }
    }, [info.guid, safeSetState]);

    // Группируем предложения по статусу
    const groupedInvoices = {
        ordered: invoices.filter(inv => inv.status === "Заказано"),
        accepted: invoices.filter(inv => inv.status === "Принято"),
        delivered: invoices.filter(inv => inv.status === "Доставлено")
    };

    return (
        <div>
            <IonLoading isOpen={load} message={"Подождите..."} />
            
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon icon={arrowBackOutline} className="w-15 h-15"
                    onClick={() => props.setPage(0)}
                />
                <div className="a-center w-90 fs-09">
                    <b>{"В ожидании #" + info.guid.substring(0, 8)}</b>
                </div>
            </div>

            {/* Карточка груза */}
            <div className="cr-card mt-1" onClick={() => { 
                props.setPage({ ...info, type: "edit" }); 
            }}>
                <CargoBody info={info} mode="view" />
                
                {/* Кнопки управления */}
                <div className="flex">
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="clear"
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            props.setPage({ ...info, type: "edit" });
                            props.setUpd();
                        }}
                    >
                        <IonLabel className="fs-08">Изменить заказ</IonLabel>
                    </IonButton>
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
// Вспомогательная функция для выполнения exec с поддержкой AbortController
async function execWithAbort(method: string, params: any, name: string, signal?: AbortSignal) {
    // Добавляем signal к параметрам если поддерживается
    const paramsWithSignal = signal ? { ...params, signal } : params;
    
    try {
        const res = await getData(method, paramsWithSignal);
        
        // Проверяем, не был ли запрос отменен
        if (signal?.aborted) {
            throw new DOMException('Request aborted', 'AbortError');
        }
        
        console.log(method);
        console.log(res);
        Store.dispatch({ type: name, data: res.data });
        
    } catch (error) {
        // Пробрасываем ошибку для обработки в вызывающем коде
        throw error;
    }
}
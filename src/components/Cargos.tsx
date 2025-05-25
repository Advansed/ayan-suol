import React, { useEffect, useState } from "react";
import { exec, getData, Store } from "./Store";
import { IonAlert, IonButton, IonIcon, IonLabel, IonLoading } from "@ionic/react";
import { addCircleOutline, arrowBackOutline, chatboxEllipsesOutline, cloudUploadOutline, personCircleOutline, trashBinOutline } from "ionicons/icons";
import { CargoBody, CargoInfo } from "./CargoBody";
import styles from './DriverCard.module.css';
import DriverChat from "./DriverChat";
import socketService from "./Sockets";
import "./Cargos.css";
import { CargoService } from "./CargoService";

export function Cargos() {
    const [ page,   setPage ]   = useState<any>(0)
    const [ upd,    setUpd ]    = useState(0)
    const [ alert,  setAlert ]  = useState<any>()

    function Upd() {
        setUpd( upd + 1 )
    }

    const elem = <>
        <div className="a-container">
            {
                  page === 0 
                    ? <List info = {{ setPage: setPage, setAlert }}/>
                : page === 1 
                    ? <CargoService mode="create" setPage={setPage} />
                : page.type === "edit"
                    ? <CargoService mode="edit" info={page} setPage={setPage} setUpd={Upd} />
                : page.type === "open"
                    ? <Page1 info = { page } setPage = { setPage }  setUpd = { Upd }/>
                : page.type === "chat"
                    ? <DriverChat info = { page } setPage = { setPage }  setUpd = { Upd }/>
                : <></>
            }

        </div>  

        <IonAlert
                isOpen = { alert !== undefined }
                onDidDismiss={ ()=> { setAlert( undefined ) }}
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
                            const res = await getData("delCargo", alert )
                            if(res.success){
                                const cargos = Store.getState().cargos
                                cargos.splice( cargos.indexOf( alert ), 1 )
                
                            }
                
                        },
                    },
                ]}
        ></IonAlert>
        
    </>

    return elem 
}

function        List(props: { info: { setPage: (page: any) => void, setAlert: (alert: any) => void } }) {
  const [cargos, setCargos] = useState<any>([])
  
  useEffect(() => {

      setCargos(Store.getState().cargos)
      
      // Подписка на изменения cargos
      Store.subscribe({
          num: 101, 
          type: "cargos", 
          func: () => {
              setCargos(Store.getState().cargos)
              console.log("subscribe")
              console.log(Store.getState().cargos)
          }
      })
      
      // Очистка подписки при размонтировании
      return () => {
          Store.unSubscribe(101)
      }

  }, [])

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

function        Item(props: { info: CargoInfo, setPage: (page: any) => void }) {    return (
        <div className="cr-card mt-1" onClick={() => { 
            const infoWithType = { ...props.info, type: "open" };
            props.setPage(infoWithType); 
        }}>
            <CargoBody info={props.info} mode="view" />
        </div>
    );
}

function        Item1(props: { info, setPage, setUpd }) {
    const info = props.info;
  
    const elem = (
      <div 
        className="cr-card mt-1"
        onClick={() => { info.type = "open";  props.setPage(info);  }}
      >
        {/* Основное содержимое элемента заказа */}
        <CargoBody info={props.info} mode="view" />
  
        {/* Кнопки действий внизу */}
        <div className="flex">
          <IonButton
            className="w-50 cr-button-2"
            mode="ios"
            fill="clear"
            color="primary"
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем всплытие события клика
              info.type = "edit";
              props.setPage(info);
              props.setUpd()
            }}
          >
            <IonLabel className="fs-08">Изменить заказ</IonLabel>
          </IonButton>
          <IonButton
            className="w-50 cr-button-1"
            mode="ios"
            onClick={async (e) => {
              e.stopPropagation(); // Предотвращаем всплытие события клика
              if (info.status === "Новый") {
                const res = await getData("Publish", {
                  token: Store.getState().login.token,
                  guid: info.guid
                });
                console.log(res);
                if (res.success) {
                  exec("getCargos", {
                    token: Store.getState().login.token
                  }, "cargos");
                }    
                props.setPage(0);
              } else {
                const res = await getData("setStatus", {
                  token: Store.getState().login.token,
                  guid: info.guid,
                  status: "ОтменитьПубликацию"
                });
                console.log(res);
                if (res.success) {
                  exec("getCargos", {
                    token: Store.getState().login.token
                  }, "cargos");
                }    
                props.setPage(0);
              }
            }}
          >
            <IonLabel className="fs-08">
              {info.status === "Новый" ? "Опубликовать" : "Отменить"}
            </IonLabel>
          </IonButton>
        </div>
      </div>
    );
  
    return elem;
}

function        Page1(props:{ info, setPage, setUpd }){
    const info = props.info
    const [ load, setLoad ]         = useState<any>([])
    const [ invoices, setInvoices]  = useState<any>([])
    const [ upd,      setUpd]  = useState<any>([])

    async function Connect(){
      try {
            
        await socketService.connect( Store.getState().login.token );

          console.log('Socket подключен успешно');
            
            // Настройка обработчиков уведомлений
            setupSocketHandlers();
            
        } catch (error) {
            console.error('Ошибка подключения socket:', error);
        }
    }

    function setupSocketHandlers() {
      // Обработка новых сообщений в чате
      socketService.onMessage('newMessage', (data) => {
          // Обновляем состояние чата если нужно
          console.log('Новое сообщение через socket:', data);
      });
  
      // Обработка уведомлений о новых грузах для водителей
      socketService.onNotification('newCargoAvailable', (data) => {
          if (Store.getState().swap) { // Если пользователь - водитель
              // Можно добавить в состояние уведомлений
              Store.dispatch({ 
                  type: "notification", 
                  data: { 
                      type: "newCargo", 
                      message: `Новый груз: ${data.from} → ${data.to}` 
                  }
              });
          }
      });
  
      // Обработка предложений цены
      socketService.onNotification('newPriceOffer', (data) => {
          Store.dispatch({ 
              type: "notification", 
              data: { 
                  type: "priceOffer", 
                  message: `Новое предложение: ${data.price} руб.` 
              }
          });
      });
    }
  
    
    Store.subscribe({num: 102, type: "invoices", func: ()=>{


      setInvoices( Store.getState().invoices )
      setUpd( upd + 1 )
      console.log("subscribe 102")
     }})

    useEffect(()=>{

        Connect();

        exec("getInv", { token: Store.getState().login.token, guid: info.guid }, "invoices")

        return ()=>{
          Store.unSubscribe( 102 )
          socketService.disconnect()
          console.log( "disconnect" )
        }

    },[])

    let len = 0
    let items = <>
    </>

    for( let i = 0; i < invoices.length; i++ ){
      if(invoices[i].status === "Заказано") {
        len = len + 1
        if( len === 1) 
          items = <>                    
            <div  className="ml-1 mt-1">
              <b><strong>Предложения от водителей ({ len })</strong></b>
            </div>
          </>
        items = <>
          { 
            items 
          }
          <DriverCard info = { invoices[i]} setPage={ props.setPage} />
        </>
      }
    }

    for( let i = 0; i < invoices.length; i++ ){
      if(invoices[i].status === "Принято") {
        len = len + 1
        if( len === 1) 
          items = <>                    
            <div  className="ml-1 mt-1">
              <b><strong>Назначенные водители ({ len })</strong></b>
            </div>
          </>
        items = <>
          { 
            items 
          }
          <DriverCard1 info = { invoices[i]} 
            setPage={props.setPage} 
          />
        </>
      }
    }

    for( let i = 0; i < invoices.length; i++ ){
      if(invoices[i].status === "Доставлено") {
        len = len + 1
        if( len === 1) 
          items = <>                    
            <div  className="ml-1 mt-1">
              <b><strong>Доставленные ({ len })</strong></b>
            </div>
          </>
        items = <>
          { 
            items 
          }
          <DriverCard1 info = { invoices[i] } setPage = { props.setPage } />
        </>
      }
    }

    const elem = <>
        <div>
            <IonLoading isOpen = { load } message={"Подождите..."}/>
            <div className="flex ml-05 mt-05">
                <IonIcon icon = { arrowBackOutline } className="w-15 h-15"
                    onClick={()=>{
                        props.setPage( 0 )
                    }}
                />
                <div className="a-center w-90 fs-09"><b>{ "В ожидании #" + info.guid.substring(0, 8) }</b></div>
            </div>
            <Item1 info ={ info } setPage = { props.setPage } setUpd = { props.setUpd }/>
        </div>
        <div>
          { items }
          {/* <>                    
            <div  className="ml-1 mt-1">
              <b><strong>Доставленные заказы (N)</strong></b>
            </div>
          </>
          <DeliveryCard /> */}
        </div>
    </>


    
    return elem

}

const           DriverCard = (props:{ info, setPage }) => {

  const info = props.info ;
        function Curs(summ) {
        let str = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(summ);
        str = '₽ ' + str.replace('₽', '');
        return str;
    }
      return (
        <div className="cr-card mt-1"
            // onClick={() => { info.type = "open"; props.setPage(info); }}
        >
            <div className="flex fl-space">
              <div className="flex">
                <IonIcon icon = { personCircleOutline } color="primary" className="w-2 h-2"/>
                <div className="fs-09 ml-05">
                  <div><b>{ info.client }</b></div>
                  <div>⭐ { info.rating }</div>
                </div>
              </div>
              <div className="fs-09 cl-prim">
                <div><b>{ Curs( info.price ) }</b></div>
                <div className="cl-black fs-08"><b>{ info.weight + ' тонн' }</b></div>                
              </div>
            </div>

           <div className={styles.driverInfoRow}>
               🚚 <span className={styles.driverLabel}>&nbsp;Транспорт:</span>&nbsp;{ info.transport }
           </div>
           <div className={styles.driverInfoRow}>
               ⚖️ <span className={styles.driverLabel}>&nbsp;Грузоподъёмность:</span>&nbsp; { info.capacity }
           </div>
           <div className={styles.driverInfoRow}>
               📦 <span className={styles.driverLabel}>&nbsp;Выполнено заказов:</span>&nbsp;{ info.ratingCount }
           </div>

           <div className={styles.driverComment}>
               <b>Комментарий водителя:</b><br />
               { info.comment ? info.comment : 'Без комментов'}
           </div>

          <div className={styles.flexContainer}>
          <IonButton
              className="w-50 cr-button-2"
              mode="ios"
              fill="clear"
              color="primary"
              onClick={(e) => {
                // info.type = 'chat'
                info.type = "chat"; props.setPage(info); 
                e.stopPropagation(); // Предотвращаем всплытие события клика
              }}
            >
              <IonIcon icon = { chatboxEllipsesOutline} className="w-06 h-06"/>
              <span className="ml-1 fs-08"> Чат</span>
            </IonButton>
            {
              info.accepted
                ? <></>
                : <>
                    <IonButton
                      className="w-50 cr-button-1"
                      mode="ios"
                      color="primary"
                      onClick={async(e) => {
                        e.stopPropagation(); // Предотвращаем всплытие события клика
                        const res = await getData("setInv", {
                            token:    Store.getState().login.token,
                            id:       info.guid,
                            status:   "Принято"
                        })
                        console.log(res)
                        if( res.success )
                          exec("getInv", { token: Store.getState().login.token, guid: info.cargo }, "invoices")
                      }}
                    >
                      <span className="ml-1 fs-08"> Выбрать</span>
                    </IonButton>
                </>
            }
            <IonButton
              className="w-50 cr-button-1"
              mode="ios"
              color="warning"
              onClick={async(e) => {
                e.stopPropagation(); // Предотвращаем всплытие события клика
                const res = await getData("setInv", {
                    token:    Store.getState().login.token,
                    id:       info.guid,
                    status:   "Отказано"
                })
                console.log(res)
                if( res.success ){
                  exec("getInv", { token: Store.getState().login.token, guid: info.cargo }, "invoices")
                  console.log( "success")
                }
                  
              }}
            >
              <span className="ml-1 fs-08"> Отказать</span>
            </IonButton>
          </div>
  
      </div>
    )
};

const           DriverCard1 = (props:{ info, setPage }) => {

  const info = props.info ;
        function Curs(summ) {
        let str = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(summ);
        str = '₽ ' + str.replace('₽', '');
        return str;
    }
      return (
        <div className="cr-card mt-1"
            // onClick={() => { info.type = "open"; props.setPage(info); }}
        >
            <div className="flex fl-space">
              <div className="flex">
                <IonIcon icon = { personCircleOutline } color="primary" className="w-2 h-2"/>
                <div className="fs-09 ml-05">
                  <div><b>{ info.client }</b></div>
                  <div>⭐ { info.rating }</div>
                </div>
              </div>
              <div className="fs-09 cl-prim">
                <div><b>{ Curs( info.price ) }</b></div>
                <div className="cl-black fs-08"><b>{ info.weight + ' тонн' }</b></div>                
              </div>
            </div>

           <div className={styles.driverInfoRow}>
               🚚 <span className={styles.driverLabel}>&nbsp;Транспорт:</span>&nbsp;{ info.transport }
           </div>
           <div className={styles.driverInfoRow}>
               ⚖️ <span className={styles.driverLabel}>&nbsp;Грузоподъёмность:</span>&nbsp; { info.capacity }
           </div>
           <div className={styles.driverInfoRow}>
               📦 <span className={styles.driverLabel}>&nbsp;Выполнено заказов:</span>&nbsp;{ info.ratingCount }
           </div>

           <div className={styles.driverComment}>
               <b>Комментарий водителя:</b><br />
               { info.comment ? info.comment : 'Без комментов'}
           </div>

          <div className={styles.flexContainer}>
          <IonButton
              className="w-50 cr-button-2"
              mode="ios"
              fill="clear"
              color="primary"
              onClick={(e) => {
                info.type = "chat"; props.setPage(info); 
                e.stopPropagation(); // Предотвращаем всплытие события клика
              }}
            >
              <IonIcon icon = { chatboxEllipsesOutline} className="w-06 h-06"/>
              <span className="ml-1 fs-08"> Чат</span>
            </IonButton>
            {
              info.accepted
                ? <></>
                : <></>
            }
            <IonButton
              className="w-50 cr-button-1"
              mode="ios"
              color="warning"
              onClick={async(e) => {
                e.stopPropagation(); // Предотвращаем всплытие события клика
                const res = await getData("setInv", {
                    token:    Store.getState().login.token,
                    id:       info.guid,
                    status:   "Отказано"
                })
                console.log(res)
                if( res.success ){
                  exec("getInv", { token: Store.getState().login.token, guid: info.cargo }, "invoices")
                  console.log( "success")
                }
                  
              }}
            >
              <span className="ml-1 fs-08"> Отказать</span>
            </IonButton>
          </div>
  
      </div>
    )
};


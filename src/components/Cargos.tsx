import React, { useEffect, useState } from "react";
import { exec, getData, Store } from "./Store";
import { IonAlert, IonButton, IonCard, IonCardContent, IonIcon, IonInput, IonLabel, IonLoading, IonText, IonTextarea } from "@ionic/react";
import "./Cargos.css";
import { useHistory } from "react-router";
import { addCircleOutline, arrowBackOutline, calendarOutline, chatboxEllipsesOutline, chatbubbleOutline, cloudUploadOutline, locationOutline, personCircleOutline, trashBinOutline } from "ionicons/icons";

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
                    ? <NewService setPage = { setPage } />
                : page.type === "edit"
                    ? <Service info = { page } setPage = { setPage } setUpd = { Upd }/>
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

function        List(props:{ info }){
    const [ info, setInfo ]     = useState<any>([])
    const [ modal, setModal ]   = useState<any>()

    const hist = useHistory()

    useEffect(()=>{
        setInfo( Store.getState().cargos )    
    },[])

    Store.subscribe({num: 101, type: "cargos", func: ()=>{
        setInfo( Store.getState().cargos )
        console.log("subscribe")
        console.log( Store.getState().cargos )
    }})


    let elem = <></>

    if( info.length > 0 ) 
        for( let i = 0; i < info.length; i++ ) {
            elem = <>
               { elem }
               <Item info = { info[i] } setPage = { props.info.setPage }/>
            </>
        }

    return <>
        <div className="ml-05 mt-1 a-center fs-09">
            {/* <IonIcon icon = { arrowBackOutline } className="w-15 h-15" /> */}
            <b>Мои заказы</b>
        </div>

        <div className="c-card mt-1 ml-1 mr-1 flex"
            onClick={()=>{ props.info.setPage( 1 )}}
        >
            <IonIcon icon = { addCircleOutline} className="w-15 h-15"/>
            <div className="ml-1 a-center w-70">Создать новый груз</div>
        </div>
        { elem }

    </>
}

function        NewService(props: { setPage }) {
    const info = {
      guid:         "",  
      token:        Store.getState().login.token,
      name:         "",
      description:  "",
      address: {
        lat:        "",
        long:       "",
        address:    "",
        date:       "",
        city:       ""
      },
      destiny: {
        lat:        "",
        long:       "",
        address:    "",
        date:       "",
        city:       ""
      },
      dimensions:   "",
      face:         "",
      weight:       0,
      volume:       0,
      price:        0.00,
      phone:        "",
      files:        [],
    }
  
    const [load, setLoad] = useState(false)
    const [modal1, setModal1] = useState(false)
      
    const elem = (
      <>
        <IonLoading isOpen={load} message={"Подождите..."} />
        <div className="flex ml-05 mt-05">
          <IonIcon 
            icon={arrowBackOutline} 
            className="w-15 h-15"
            onClick={() => {
              props.setPage(0)
            }}
          />
          <div className="a-center w-90 fs-09"><b>Создать новый заказ</b></div>
        </div>
  
        <Body info={ info } />
  
        <div className="flex mt-05">
          <div className="w-50"></div>
          <div 
            className="cr-card flex w-50"
            onClick={async () => {
              setLoad(true)
              info.token = Store.getState().login.token
              console.log(info)
  
              const res = await getData("saveCargo", info)
                
              if( res.success ) {
                    props.setPage(0)
                    const params = { token: Store.getState().login.token };
                    exec("getCargos", params, "cargos");
              }
              setLoad(false)
              console.log(res)
            }}
          >
            <IonIcon icon={cloudUploadOutline} className="w-15 h-15" color="success" />
            <b className="fs-09 ml-1">Сохранить</b>
          </div>
          {/* <div 
            className="cr-card flex w-50"
            onClick={async () => {
              info.token = Store.getState().login.token
              const res = await getData("delCargos", info)
              if( res.success ) {
                props.setPage(0)
                const params = { token: Store.getState().login.token };
                exec("getCargos", params, "cargos");
              }
          
              console.log(res)
            }}
          >
            <IonIcon icon={trashBinOutline} className="w-15 h-15" color="danger" />
            <b className="fs-09 ml-1">Удалить</b>
          </div> */}
        </div>
      </>
    );
  
    return elem;
}

function        Body(props: { info }) {
    const info = props.info;
    
    return (
      <div className="h-80 scroll">
        <div className="cr-card mt-05">
          <div className="fs-09"><b>Основная информация</b></div>
          <div>
            <div className="fs-08 mt-05"> Название </div>
            <div className="c-input">
              <IonInput 
                className="custom-input"
                value={info?.name}
                onIonInput={(e) => {
                  info.name = (e.detail.value as string)
                }}
              />
            </div>
          </div>
          <div>
            <div className="fs-08 mt-05"> Город отправления </div>
            <div className="flex">
              <IonIcon icon={locationOutline} className="w-10 h-15" color="danger"/>
              <div className="c-input flex w-90">
                <IonInput 
                  className="custom-input"
                  value={info.address.city}
                  onIonInput={(e) => {
                    info.address.city = (e.detail.value as string)
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="fs-08 mt-05"> Город назначение </div>
            <div className="flex">
              <IonIcon icon={locationOutline} className="w-10 h-15" color="success"/>
              <div className="c-input flex w-90">
                <IonInput 
                  className="custom-input"
                  value={info.destiny.city}
                  onIonInput={(e) => {
                    info.destiny.city = (e.detail.value as string)
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex mt-05">
            <div className="w-50">
              <div className="fs-08"> Дата загрузки </div>
              <div className="flex">
                <div className="c-input ml-05">
                  <IonInput 
                    className="custom-input fs-08"
                    value={info.address.date.substring(0, 10)}
                    type="date"
                    onIonInput={(e) => {
                      info.address.date = e.detail.value as string
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-50 ml-05">
              <div className="fs-08"> Дата выгрузки </div>
              <div className="flex">
                <IonIcon icon={calendarOutline} className="w-2 h-2" color="success"/>
                <div className="c-input ml-05 mr-1">
                  <IonInput 
                    className="custom-input fs-08"
                    value={info.destiny.date.substring(0, 10)}
                    type="date"
                    onIonInput={(e) => {
                      info.destiny.date = e.detail.value as string
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="fs-08 mt-05"> Цена (₽) </div>
            <div className="flex">
              <div className="c-input flex w-100">
                <IonInput 
                  className="custom-input"
                  value={info.price}
                  onIonInput={(e) => {
                    info.price = parseFloat(e.detail.value as string)
                  }}                     
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="cr-card mt-05">
          <div className="fs-09"><b>Информация о грузе </b></div>
          <div>
            <div className="fs-08 mt-05"> Вес (тонна) </div>
            <div className="c-input">
              <IonInput 
                className="custom-input"
                value={info.price}
                onIonInput={(e) => {
                  info.weight = parseFloat(e.detail.value as string)
                }}                     
              />
            </div>
          </div>
          <div>
            <div className="fs-08 mt-05"> Объем </div>
            <div className="flex">
              <div className="c-input flex w-100">
                <IonInput 
                  className="custom-input"
                  value={info?.volume}
                  onIonInput={(e) => {
                    info.volume = parseFloat(e.detail.value as string)
                  }}                                                     
                />
              </div>
            </div>
          </div>
          <div>
            <div className="fs-08 mt-05"> Описание груза </div>
            <div className="flex">
              <div className="c-input flex w-100 fs-08">
                <IonTextarea 
                  value={info?.description}
                  onIonInput={(e) => {
                    info.description = (e.detail.value as string)
                  }}                                                     
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="cr-card mt-05">
          <div className="fs-09"><b>Адрес и контакты </b></div>
          <div>
            <div className="fs-08 mt-05"> Адрес погрузки </div>
            <div className="c-input">
              <IonInput 
                className="custom-input"
                value={info?.address.address}
                onIonInput={(e) => {
                  info.address.address = (e.detail.value as string)
                }}                                                     
              />
            </div>
          </div>
          <div>
            <div className="fs-08 mt-05"> Адрес разгрузки </div>
            <div className="flex">
              <div className="c-input flex w-100">
                <IonInput 
                  className="custom-input"
                  value={info?.destiny.address}
                  onIonInput={(e) => {
                    info.destiny.address = (e.detail.value as string)
                  }}                                                     
                />
              </div>
            </div>
          </div>
          <div>
            <div className="fs-08 mt-05"> Контактное лицо</div>
            <div className="c-input">
              <IonInput 
                className="custom-input"
                value={info?.face}
                onIonInput={(e) => {
                  info.face = (e.detail.value as string)
                }}                                                                             
              />
            </div>
          </div>
          <div>
            <div className="fs-08 mt-05"> Телефон </div>
            <div className="flex">
              <div className="c-input flex w-100">
                <IonInput 
                  className="custom-input"
                  value={info?.phone}
                  onIonInput={(e) => {
                    info.phone = (e.detail.value as string)
                  }}                                                     
                />
              </div>
            </div>
          </div>
        </div>
  
        <div className="cr-card mt-05">
          <div className="fs-09"><b> Статус заказа </b></div>
          <div className="flex">
            <div className="cr-chip">{info?.status}</div>
            <IonText class="ml-1 fs-07">{"ID: " + info?.guid.substring(0, 8)}</IonText>
          </div>
          <div className="fs-09">
            Ваш заказ в статусе "Новый", чтобы водители увидели ваш заказ его надо опубликовать
          </div>
        </div>
      </div>
    );
}
  
function        Service(props: { info, setPage, setUpd }) {
    const info = props.info;
    const [load, setLoad] = useState(false);
    const [modal1, setModal1] = useState(false);
  
    const elem = (
      <>
        <IonLoading isOpen={load} message={"Подождите..."} />
        <div className="flex ml-05 mt-05">
          <IonIcon 
            icon={arrowBackOutline} 
            className="w-15 h-15"
            onClick={() => {
              info.type = "open"
              props.setPage( info );
              props.setUpd()
              console.log( "backsd")
            }}
          />
          <div className="a-center w-90 fs-09"><b>Создать новый заказ</b></div>
        </div>
  
        <Body info={info} />
  
        <div className="flex mt-05">
          <div 
            className="cr-card flex w-50"
            onClick={async () => {
              setLoad(true);
              info.token = Store.getState().login.token;
              console.log(info);
  
              const res = await getData("saveCargo", info);
  
              setLoad(false);
              console.log(res);
  
              if (res.success) {
                const params = { token: Store.getState().login.token };
                exec("getCargos", params, "cargos");
              } else Store.dispatch({ type: "error", data: res.message })

            }}
          >
            <IonIcon icon={cloudUploadOutline} className="w-15 h-15" color="success" />
            <b className="fs-09 ml-1">Сохранить</b>
          </div>
          <div 
            className="cr-card flex w-50"
            onClick={async () => {
                setLoad( true )
                info.token = Store.getState().login.token;
                const res = await getData("delCargo", info);
                console.log(res);
                if(res.success){
                    exec("getCargos", {
                        token: Store.getState().login.token
                    }, "cargos");
                } else {
                        Store.dispatch({ type: "error", data: res.message })
                        console.log("error message ")
                }
                setLoad( false )
            }}
          >
            <IonIcon icon={trashBinOutline} className="w-15 h-15" color="danger" />
            <b className="fs-09 ml-1">Удалить</b>
          </div>
        </div>
  
        <div className="ml-1 mr-1">
          {
            info?.status === "Новый" || info?.status === "В ожидании" || info?.status === "Отменен"
              ? (
                <IonButton
                  mode="ios"
                  expand="block"
                  onClick={async () => {
                    console.log("click")
                    setLoad( false )
                    if (info.status === "Новый" || info.status === "Отменен") {
                      const res = await getData("setStatus", {
                        token: Store.getState().login.token,
                        guid: info.guid,
                        status: "В ожидании"
                      });
                      console.log(res);
                      if (res.success) {
                        console.log("exec statis");
                        info.status = "В ожидании";
                        exec("getCargos", {
                          token: Store.getState().login.token
                        }, "cargos");
                      } else {
                         Store.dispatch({ type: "error", data: res.message })
                         console.log("error message ")
                      }
                      props.setPage(0);
                    }
                    setLoad( false )
                  }}
                >
                  {
                    info.status === "Новый" || info.status === "Отменен"
                      ? "Опубликовать"
                      : "Снять публикацию"
                  }
                </IonButton>
              )
              : null
          }
        </div>
      </>
    );
  
    return elem;
}

 // Компонент для отображения информации о заказе
function        Body1(props: { info }) {
    const info = props.info;

    function Curs(summ) {
        let str = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(summ);
        str = '₽ ' + str.replace('₽', '');
        return str;
    }
    
    return (
      <>
        <div className="flex fl-space">
          <div className="flex">
            <div className="cr-chip">{info.status}</div>
            <IonText class="ml-1 fs-07">{"ID: " + info?.guid.substring(0, 6)}</IonText>
          </div>
          <div>
            <IonText className="fs-09 cl-prim">
              <b>{Curs(info.price)}</b>
            </IonText>
            <div className="fs-08 cl-black">
              <b>{ info.weight + ' тонн' }</b>
            </div>
          </div>
        </div>
        <div className="fs-08 mt-05">
          <b>{info.name}</b>
        </div>
        <div className="flex fl-space mt-05">
          <div className="flex">
            <IonIcon icon={locationOutline} color="danger"/>
            <div className="fs-08">
              <div className="ml-1 fs-09 cl-gray">Откуда:</div>
              <div className="ml-1 fs-09"><b>{info?.address.city}</b></div>                    
            </div>
          </div>
          <div>
            <div className="fs-08">
              <div className="ml-1 fs-09 cl-gray">Дата загрузки:</div>
              <div className="ml-1 fs-09"><b>{info?.address.date.substring(0, 10)}</b></div>                    
            </div>
          </div>
        </div>
        <div className="flex fl-space mt-05">
          <div className="flex">
            <IonIcon icon={locationOutline} color="success"/>
            <div className="fs-08">
              <div className="ml-1 fs-09 cl-gray">Куда:</div>
              <div className="ml-1 fs-09"><b>{info?.destiny.city}</b></div>                    
            </div>
          </div>
          <div>
            <div className="fs-08">
              <div className="ml-1 fs-09 cl-gray">Дата выгрузки:</div>
              <div className="ml-1 fs-09"><b>{info?.destiny.date.substring(0, 10)}</b></div>                    
            </div>
          </div>
        </div>
        <div>
          <div className="fs-08 mt-1 cr-detali">
            <b>Детали груза:</b>
            <div>
              {info.description}
            </div>
          </div>
        </div>
      </>
    );
}
  
  // Основной компонент элемента заказа
function        Item(props: { info, setPage }) {
    const info = props.info;
  
    const elem = (
        <div className="cr-card mt-1"
            onClick={() => { info.type = "open"; props.setPage(info); }}
        >
        
        {/* Основное содержимое элемента заказа */}
        <Body1 info={info} />
  
      </div>
    );
  
    return elem;
}

function        Item1(props: { info, setPage, setUpd }) {
    const info = props.info;
  
    const elem = (
      <div 
        className="cr-card mt-1"
        onClick={() => { info.type = "open";  props.setPage(info);  }}
      >
        {/* Основное содержимое элемента заказа */}
        <Body1 info={info} />
  
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


import styles from './DriverCard.module.css';
import DeliveryCard from "./cards/DeliveredOrder";
import DriverChat from "./DriverChat";
import socketService from "./Sockets";

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


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
import { DriverInfo, InvoiceSection } from "./DriverCard";

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

function        Page1(props: { info: any, setPage: (page: any) => void, setUpd: () => void }) {
  const info = props.info;
  const [load, setLoad] = useState<any>([]);
  const [invoices, setInvoices] = useState<DriverInfo[]>([]);
  const [upd, setUpd] = useState<any>([]);

  Store.subscribe({num: 102, type: "invoices", func: () => {
      setInvoices(Store.getState().invoices);
      setUpd(upd + 1);
  }});

  useEffect(() => {
      exec("getInv", { token: Store.getState().login.token, guid: info.guid }, "invoices");
      return () => Store.unSubscribe(102);
  }, []);

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
              mode="active"
              setPage={props.setPage}
          />
          <InvoiceSection 
              title="Назначенные водители"
              invoices={groupedInvoices.accepted}
              mode="active"
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
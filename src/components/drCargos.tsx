import React, { useEffect, useState } from 'react';
import './drCargos.css';
import { Store, useSelector } from './Store';
import { Cargo, CargoInfo } from './Cargo_';
import { IonButton, IonIcon, IonInput, IonLabel, IonLoading, IonTextarea } from '@ionic/react';
import Select from "react-tailwindcss-select";
import { useHistory } from 'react-router';
import socketService from './Sockets';
import { arrowBackOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import Lottie from 'lottie-react';

// Импортируем JSON данные анимации
import animationData from './drCargoEmpty.json';

// Типы для состояния страницы
interface PageState {
  info: CargoInfo;
  type: string
}

// Пропсы для основного компонента
interface DrCargosProps {
  // Можно добавить пропсы если нужно
}

// Пропсы для Page1
interface Page1Props {
  setPage: (page: PageState | number) => void;
}

export function DrCargos(props: DrCargosProps) {
  const [page, setPage] = useState<PageState | number>(0);

  const elem = (
    <div className="a-container bg-2">
      {
            page === 0 
              ? ( <Page1 setPage={setPage} />) 
          : typeof page === 'object' && page.type === "offer"
              ? (<Offer info = { page.info } setPage = { setPage } />)
          : typeof page === 'object' && page.type === "open"
              ? <Page2 info={ page.info } setPage={setPage} />
          : ( <></>) 
      }
    </div>
  );

  return elem;
}


function EmptyState() {
  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <div className="empty-state-text">
          <h3 className="fs-12 cl-gray a-center">
            Нет доступных заказов
          </h3>
          <p className="fs-09 cl-gray a-center mt-05">
            Доступные заказы появятся здесь, когда их опубликуют заказчики
          </p>
        </div>
      </div>
      <div className="lottie-container-bottom">
        <div className="lottie-wrapper">
          <Lottie 
            animationData={animationData} 
            loop={true}
            autoplay={true}
            style={{ 
              width: '100%',
              height: '100%',
              minWidth: '100vw'
            }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        </div>
      </div>
    </div>
  );
}


function Page1(props: Page1Props) {
  // Используем useSelector вместо useState + useEffect
  const works = useSelector((state) => {
      // Проверяем что данные являются массивом
      if (Array.isArray(state.works)) {
          return state.works
      }
      return []
  }, 2011)

  const hist = useHistory()

  // Рендерим список работ
  const renderWorks = () => {

      const jarr1: any = []
      const jarr2: any = []

      works.forEach( elem => {
    
        if(elem.status !== 'Выполнено') jarr1.push( elem )
        else jarr2.push( elem )

      });


      return  <>
        {
            jarr1.length > 0
                ? <>
                    <div className="a-center w-90 fs-09 mt-1">
                        <b>Доступные заказы</b>
                    </div>
                    {
                        jarr1.map((cargoItem: CargoInfo, index: number) => (
                            <div key={cargoItem.guid || index} className='cr-card mt-1'
                                onClick={()=>{
                                if( cargoItem.status === "В работе"){
                                    const infoWithType = { info: cargoItem, type: "open" }
                                    props.setPage( infoWithType ) 
                                }
                                }}
                            >
                                    
                                <CargoBody info={ cargoItem } mode="view" />
                                
                                {/* Кнопки управления */}

                                <div className="flex">
                                    <IonButton
                                        className="w-50 cr-button-2"
                                        mode="ios"
                                        fill="clear"
                                        color="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            hist.push("tab2/" + cargoItem.recipient + ':' + cargoItem.cargo + ':' + cargoItem.client)

                                        }}
                                    >
                                        <IonLabel className="fs-08">Чат с заказчиком</IonLabel>
                                    </IonButton>
                                    
                                    {cargoItem.status === "Новый" && (
                                        <IonButton
                                            className="w-50 cr-button-2"
                                            mode="ios"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                props.setPage({ info: cargoItem, type: "offer" })
                                            }}
                                        >
                                            <IonLabel className="fs-08">Предложить</IonLabel>
                                        </IonButton>
                                    )}
                                    
                                </div>
                            </div>
                        ))
                    }
                </>
                : <></>
        }
        {
            jarr2.length > 0
                ? <>
                    <div className="a-center w-90 fs-09 mt-1">
                        <b>Выполненные</b>
                    </div>
                    {
                        jarr2.map((cargoItem: CargoInfo, index: number) => (
                            <div key={cargoItem.guid || index} className='cr-card mt-1'
                                onClick={()=>{
                                if( cargoItem.status === "В работе"){
                                    const infoWithType = { info: cargoItem, type: "open" }
                                    props.setPage( infoWithType ) 
                                }
                                }}
                            >
                                    
                                <CargoBody info={ cargoItem } mode="view" />
                                {/* Кнопки управления */}
                                <div className="flex">
                                    <IonButton
                                        className="w-50 cr-button-2"
                                        mode="ios"
                                        fill="clear"
                                        color="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            hist.push("/tab2/chat1")
                                        }}
                                    >
                                        <IonLabel className="fs-08">Чат с заказчиком</IonLabel>
                                    </IonButton>
                                    
                                    {cargoItem.status === "Новый" && (
                                        <IonButton
                                            className="w-50 cr-button-2"
                                            mode="ios"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                props.setPage({ info: cargoItem, type: "offer" })
                                            }}
                                        >
                                            <IonLabel className="fs-08">Предложить</IonLabel>
                                        </IonButton>
                                    )}
                                </div>
                            </div>
                        ))
                    }
                </>
                : <></>
        }
        {
           (jarr1.length === 0 && jarr2.length === 0) 
                ? <EmptyState />
                : <></>
        }
      </>

  }

  return (
      <>
        <div className='bg-2 scroll'>
          {renderWorks()}
        </div>
      </>
  )
}

function Page2(props: { info: any, setPage: (page: any) => void }) {     
  const [cargoInfo, setCargoInfo] = useState(props.info); // Локальное состояние для info
  

  useEffect(()=>{
      const socket = socketService.getSocket()

      if( socket ){
        socket.on("delivered", (res) =>{
          if( res.success )
            props.setPage( 0 )
        })
      }

      return ()=>{
        if( socket ) socket.off( "dlivered" )
      }
  })

  return (     
      <>
          <div className="flex ml-05 mt-05">
              <IonIcon icon={arrowBackOutline} className="w-15 h-15"
                  onClick={() => props.setPage(0)}
              />
              <div className="a-center w-90 fs-09">
                  <b>{ "Заказ ID " + cargoInfo.guid.substr(0, 8) }</b>
              </div>
          </div>

          <div className='cr-card mt-1'>
              <Cargo info={ cargoInfo } mode="view" />
              
              {/* Информация о грузе */}
              <div className="borders-wp mt-1">
                  <div className="pl-1 pr-1 pt-1 pb-05">
                      <div className="fs-09 cl-gray pb-05 cl-black"> <b>Информация о грузе</b></div>
                      
                      <div className="flex fl-space">
                          <div className="w-50">
                              <div className="fs-08 ">Вес (т)</div>
                              <div className="fs-09 pt-05 borders-wp pl-1 pb-05">{cargoInfo.weight || '-'}</div>
                          </div>
                          <div className="w-50 pl-1">
                              <div className="fs-08 ">Объем (м³)</div>
                              <div className="fs-09 pt-05 borders-wp pl-1 pb-05">{cargoInfo.volume || '-'}</div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Адреса и контакты */}
              <div className="borders-wp mt-1">
                  <div className="pl-1 pr-1 pt-1 pb-05">
                      <div className="fs-09 cl-gray pb-1 cl-black"><b>Адреса и контакты</b></div>
                      
                      <div className="pb-1">
                          <div className="fs-08 ">Адрес погрузки</div>
                          <div className="fs-09 pt-05 a-right borders-wp pr-1 pb-05">{cargoInfo.address.city + ', ' + cargoInfo.address.address || '-'}</div>
                      </div>

                      <div className="pb-1">
                          <div className="fs-08 ">Адрес разгрузки</div>
                          <div className="fs-09 pt-05 a-right borders-wp pr-1 pb-05">{cargoInfo.destiny.city + ', ' + cargoInfo.destiny.address || '-'}</div>
                      </div>

                      <div className="pb-1">
                          <div className="fs-08 ">Контактное лицо</div>
                          <div className="fs-09 pt-05 a-right borders-wp pr-1 pb-05">{cargoInfo.face || '-'}</div>
                      </div>

                      <div className="pb-1">
                          <div className="fs-08 ">Телефон</div>
                          <div className="fs-09 pt-05 a-right borders-wp pr-1 pb-05">{cargoInfo.phone || '-'}</div>
                      </div>

                      {/* Чекбоксы */}
                      {/* <div className="pt-1">
                          <div className="flex pb-05">
                              <input 
                                  type="checkbox" 
                                  checked={true}
                                  disabled
                                  className="mr-05"
                              />
                              <div className="fs-08">
                                  Услуги водителя-экспедитора (сопровождение груза, оформление документов)
                              </div>
                          </div>

                          <div className="flex pb-05">
                              <input 
                                  type="checkbox" 
                                  checked={true}
                                  disabled
                                  className="mr-05"
                              />
                              <div className="fs-08">Помощь при погрузке</div>
                          </div>

                          <div className="flex pb-05">
                              <input 
                                  type="checkbox" 
                                  checked={true}
                                  disabled
                                  className="mr-05"
                              />
                              <div className="fs-08">Помощь при разгрузке</div>
                          </div>
                      </div> */}
                  </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex fl-space mt-05 pb-05">
                  <IonButton
                      className="w-50"
                      mode="ios"
                      color="danger"
                  >
                      <span className="fs-08">Обратиться в тех. поддержку</span>
                  </IonButton>

                  <IonButton
                      className="w-50"
                      mode="ios"
                      color="primary"
                      onClick={()=>{
                        socketService.emit("delivered", {
                            
                            token:      Store.getState().login.token,
                            guid:       cargoInfo.guid,  
                            recipient:  cargoInfo.recipient

                        })
                      }}
                  >
                      <span className="fs-08 cl-white">Заказ выполнен</span>
                  </IonButton>
              </div>
                                        
              <IonButton
                  className="w-100 cr-button-2"
                  mode="ios"
                  fill="clear"
                  color="primary"
                  // onClick={handleChat}
              >
                  <IonIcon icon={ chatboxEllipsesOutline } className="w-06 h-06"/>                  
                  <span className="ml-1 fs-08">Чат</span>                              
              </IonButton>
          </div>
      </>   
  ); 
}

function Offer( props: { info, setPage } ){
  const [ info, setInfo ] = useState({
      token:        Store.getState().login.token,
      guid:         props.info.cargo,
      recipient:    props.info.recipient,
      price:        props.info.price,
      transport:    { value: "Выберите..", label: "Выберите.." },
      weight:       props.info.weight,
      comment:      ""
  })
  const [ load, setLoad ] = useState( false )

  const options:any = []
  
  Store.getState().transport.forEach( elem => {
    options.push({ value: elem.guid, label: elem.name })
  });

  useEffect(()=>{
        
      const socket = socketService.getSocket();
        
      const handleOffer = (data) => {
          console.log("offer")
          console.log( data )
          // Обновляем статус только если текущий статус "Новый"
          setLoad(false)
          if( data.success){
              props.setPage( 0 )
          }
        };

        if (socket) {
            socket.on("set_offer", handleOffer);
        }

        return () => {
            if (socket) {
                socket.off("set_offer", handleOffer);
            }
        }
  },[])

  
  const elem = <>
    <IonLoading isOpen = { load } message={ " Подождите... " } />
    <div className='cr-card ml-1 mt-1'>
        <div className="fs-09"><b>Ваше предложение</b></div>
        <div className="fs-08 mt-1">Выбрать машину</div>
        <div className="c-input mt-05 fs-08">
            <Select options={ options } value={ info.transport } primaryColor="red" onChange={ (e)=>{
              setInfo( {...info, transport: e as any} )  
            } } 
                classNames={{
                    listItem: () => (
                        `sbl-item`
                    )
                }}
            />        
        </div>
        <div className="fs-08 mt-1">Вес который готовы забрать(т)</div>
            <div className="c-input mt-05">
                <IonInput
                    className   = "custom-input"
                    value       = { info.weight }
                    type        = "number"
                    onIonInput  = {(e) => {
                        info.weight = parseFloat( e.detail.value as string )
                    }}
                />
        </div>
        <div className="fs-08 mt-1">Предлагаемая цена (₽)</div>
            <div className="c-input mt-05">
                <IonInput
                    className   = "custom-input"
                    value       = { info.price }
                    type        = "number"
                    onIonInput  = {(e) => {
                        info.price = parseFloat( e.detail.value as string )
                    }}
                />
        </div>
        <div className="fs-08 mt-1">Комментарий к предложению</div>
            <div className="c-input mt-05">
                <IonTextarea
                    className   = "custom-input pt-05 pb-05 pl-05 pr-05"
                    value       = { info.comment }
                    onIonInput  = {(e) => {
                        info.comment = e.detail.value as string 
                    }}
                />
        </div>
        <div className='flex mt-05'>
            <IonButton
                className="w-50 cr-button-2"
                mode="ios"
                fill="clear"
                color="primary"
                onClick={(e) => {
                    e.stopPropagation();
                    props.setPage( 0 )
                }}
            >
                <IonLabel className="fs-08">Вернуться</IonLabel>
            </IonButton>                      
            <IonButton
                className="w-50 cr-button-2"
                mode="ios"
                color="primary"
                onClick={(e) => {
                    e.stopPropagation();
                    socketService.emit("set_offer", info)
                    setLoad( true)
                }}
            >
                <IonLabel className="fs-08">Предложить</IonLabel>
            </IonButton>                      
        </div>
    </div>
  </>

  return elem 
}
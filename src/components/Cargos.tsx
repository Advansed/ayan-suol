import React, { useEffect, useState } from "react";
import { getData, Store } from "./Store";
import { IonAlert, IonButton, IonCard, IonChip, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonText } from "@ionic/react";
import { Address, Maskito, TItem, TPanel, TService } from "./Classes";
import "./Cargos.css";
import { useHistory } from "react-router";
import { Files } from "./Files";
import { arrowBackOutline, locateOutline, locationOutline } from "ionicons/icons";

export function Cargos() {
    const [ page, setPage ] = useState(0)
    const [ serv, setServ ] = useState<any>()
    const [ alert, setAlert ] = useState<any>()


    const elem = <>
        <div className="a-container">
            {
                  page === 0 
                    ? <List info = {{ setPage: setPage, setServ: setServ, setAlert }}/>
                : page === 1 
                    ? <NewService setPage = { setPage } />
                : page === 2
                    ? <Service info = { serv } setPage = { setPage } />
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
    }})


    function ModalForm(){
        const [ value, setValue ] = useState({ date: "", sum: 0.00 })

        const elem = <>
            <IonCard className="c-card">
                <div className="fs-12">
                    Укажите дату отправки груза и сумму
                </div>
                <div className="flex fl-space mt-1">
                    <div>Дата отправки</div>
                    <div className="c-input">
                        <IonInput
                            type = "date"
                            value={ value.date }
                            placeholder="__.__.____"
                            onIonInput={ (e)=>{
                                setValue({...value, date: e.detail.value as string })
                            }}
                        >

                        </IonInput>

                    </div>
                </div>    
                <div className="flex fl-space mt-1">
                    <div>Сумма</div>
                    <div className="c-input">
                        <IonInput
                            className = "a-right"
                            type = "number"
                            placeholder="0.00"
                            value = { value.sum}
                            onIonInput={ (e)=>{
                                setValue({...value, sum: parseFloat( e.detail.value as string ) })
                            }}
                        >

                        </IonInput>

                    </div>
                </div>    
                <div className="flex mt-1">
                    <div className="w-50">
                        <IonButton
                            expand="block"
                            mode="ios"
                            color= "warning"
                            onClick={()=>{
                                setModal( undefined )
                            }}
                        >
                            Oтменить
                        </IonButton>
                    </div>
                    <div className="w-50">
                        <IonButton
                            expand="block"
                            mode = "ios"
                            color= "success"
                            onClick={async()=>{
                                modal.token = Store.getState().login.token
                                modal.date = value.date
                                modal.sum = value.sum
                                const res = await getData("SaveTransport", modal )
                                if(res.success){
                                    hist.push("/tab2")
                                } else Store.dispatch({ type: "error", data: res.error})
                                setModal( undefined )
                            }}  
                        >
                            Опубликовать
                        </IonButton>
                    </div>
                </div>
            </IonCard>        
        </>

        return elem 
    }

    let elem = <></>

    if( info.length > 0 ) 
        for( let i = 0; i < info.length; i++ ) {
            elem = <>
               { elem }
               <Item info = { info[i] } setPage = { props.info.setPage }/>
            </>
        }
    else 
        elem = <>
            <IonCard className="c-card">
                <div className=" fs-14 a-center"
                    onClick={()=>{
                        props.info.setPage( 1 )
                    }}
                >
                    Создать груз
                </div>
            </IonCard>
        </>

    return <>
        <div className="ml-05 mt-1 a-center fs-09">
            {/* <IonIcon icon = { arrowBackOutline } className="w-15 h-15" /> */}
            <b>Мои заказы</b>
        </div>
        { elem }
        <IonModal
            className="c-modal"
            isOpen= { modal !== undefined }
            onDidDismiss={ ()=> setModal( undefined )}
            // onClick = { ()=>{ setModal( false )}}
        >
            <div className="cr-div">
                <ModalForm />
            </div>
        </IonModal>

    </>
}


function        Service(props:{ info, setPage }){
    const info = props.info
    const [ modal,  setModal ]  = useState( false )
    const [ modal1, setModal1 ] = useState( false )

    const elem = <>
        <IonCard className="c-card">
            <div className="a-center fs-14 pb-1"> <b>Описание заказа</b> </div>
            <div className="bg-1">


                <div className=" flex pb-1 pt-1 cl-black "> 
                    <div className="circle-1 w-15 h-15 ml-1 w-20"></div>
                    <div className="ml-1 w-80 mr-1 roboto t-underline"
                        onClick={()=>{ setModal( true )}}
                    >
                        <div> { info.address.address } </div>
                        <div> { "lat: " + info.address.lat  + ", lng: " + info.address.long } </div>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="calendar.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        <IonLabel position="stacked"> Дата отправки </IonLabel>
                        <IonInput
                            type = "date"
                            value={ info?.date1 }
                            onIonInput = {(e)=>{
                                info.date1 = e.detail.value;
                            }}
                        >

                        </IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 pt-1 cl-black">
                    <div className="circle-1 w-15 h-15 ml-1 w-20"></div>
                    <div className="ml-1 w-80 mr-1 roboto t-underline"
                        onClick={()=>{ setModal1( true )}}
                    >
                        <div> { info.destiny.address } </div>
                        <div> { "lat: " + info.destiny.lat  + ", lng: " + info.destiny.long } </div>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="calendar1.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                    <IonLabel position="stacked"> Дата доставки </IonLabel>
                        <IonInput
                            type = "date"
                            value={ info?.date1 }
                            onIonInput = {(e)=>{
                                info.date1 = e.detail.value;
                            }}
                        >

                        </IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="grid 6.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        {/* <IonLabel position="stacked"> Габариты </IonLabel> */}
                        <IonInput
                            placeholder="ШхВхГ"
                            value={ info?.dimensions}
                            onIonInput = {(e)=>{
                                info.dimensions = e.detail.value as string ;
                            }}
                        ></IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="Weight.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        <IonLabel position="stacked"> Вес </IonLabel>
                        <IonInput
                            placeholder="Вес"
                            value={ info?.weight}
                            type = "number"
                            onIonInput = {(e)=>{
                                info.weight = parseInt(e.detail.value as string);
                            }}
                        >

                        </IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="donate.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        {/* <IonLabel position="stacked"> Цена </IonLabel> */}
                        <IonInput
                            placeholder="Цена"
                            value={ info?.price}
                            type="number"
                            onIonInput = {(e)=>{
                                info.price = parseFloat(e.detail.value as string);
                            }}
                        >

                        </IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="receipt1.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        <IonLabel position="stacked"> Описание </IonLabel>
                        <IonInput
                            placeholder="Описание"
                            value={ info?.name }
                            onIonInput = {(e)=>{
                                info.name = e.detail.value;
                            }}
                        >

                        </IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="phone.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        {/* <IonLabel position="stacked"> Телефон </IonLabel> */}
                        <Maskito  
                            placeholder= "+7 (XXX) XXX-XXXX"
                            mask = { ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/] }
                            value = { info?.phone }
                            onIonInput = {(e)=>{
                                info.login = e.detail.value;
                            }}
                        />
                    </div>                    
                </div>

                <div className="flex">
                    <IonButton
                        className="w-50"
                        color = "success"
                        onClick={async()=>{
                            console.log("save")
                            info.token = Store.getState().login.token
                            const res = await getData("SaveCargos", info )
                            console.log( res )
                            if(res.success){
                                let cargos = Store.getState().cargos
                                let index = -1
                                cargos.forEach((elem, ind) => {
                                    if(elem.guid === info.guid){
                                        index = ind
                                    }
                                });
                                if( index !== -1){
                                    cargos.splice(index, 1, info)
                                    Store.dispatch({type: "cargos", data: cargos})
                                    props.setPage( 0 )
                                }
                                console.log( cargos)
                                Store.dispatch({type: "cargos", data: cargos})
                                props.setPage( 0 )
                            } else Store.dispatch({ type: "error", data: res.error })
                        }}
                    >
                        <b>Сохранить</b>
                    </IonButton>
                    <IonButton
                        className="w-50"
                        color = "warning"
                        onClick={()=>{
                            props.setPage( 0 )
                            
                        }}
                    >
                        <b>Отменить</b>
                    </IonButton>
                </div>

            </div>
        </IonCard>

        <IonModal
            className="c-modal"
            isOpen = { modal }
            onDidDismiss={ ()=> setModal( false )}
        >
            <IonCard className="c-card mt-4">
                <div className="a-center fs-14">
                    <b> Адрес </b>
                </div>
                <div className="pb-4 cl-black">
                    <Address info = { info.address }
                    />
                </div>
                <div className="pt-4">
                    <div className="flex">
                        <IonButton
                            className="w-50"
                            onClick={()=>{
                                setModal( false )
                            }}
                        >
                            Сохранить
                        </IonButton>               
                        <IonButton
                            className="w-50"
                            onClick={()=>{
                                setModal( false )
                            }}
                        >
                            Отменить
                        </IonButton>               
                    </div>
                </div>
            </IonCard>

        </IonModal>

        <IonModal
            className="c-modal"
            isOpen = { modal1 }
            onDidDismiss={ ()=> setModal1( false )}
        >
            <IonCard className="c-card mt-4">
                <div className="a-center fs-14">
                    <b> Адрес </b>
                </div>
                <div className="pb-4 cl-black">
                    <Address info = { info.destiny }
                    />
                </div>
                <div className="pt-4">
                    <div className="flex">
                        <IonButton
                            className="w-50"
                            onClick={()=>{
                                setModal1( false )
                            }}
                        >
                            Сохранить
                        </IonButton>               
                        <IonButton
                            className="w-50"
                            onClick={()=>{
                                setModal1( false )
                            }}
                        >
                            Отменить
                        </IonButton>               
                    </div>
                </div>
            </IonCard>

        </IonModal>
    </>

    return elem
}


function        NewService(props:{ setPage }){

    const info = {
        token:                  Store.getState().login.token,
        name:                   "",
        address:            {
            lat:                "",
            long:               "",
            address:            "",
        },
        destiny:        {
            lat:                "",
            long:               "",
            address:            "",
        },
        dimensions:            "",
        weight:                 0,
        price:               0.00,
        phone:                 "",
        files:                 [],
    }

    const [ modal,  setModal ]  = useState( false )
    const [ modal1, setModal1 ] = useState( false )

    const elem = <>
        <div className="flex mt-05 ml-05">
            <div><IonIcon icon = { arrowBackOutline } className="w-15 h-15"/></div>
            <div className="a-center fs-09 w-90">
                <div><b>Создание заказа</b></div>                
            </div>
        </div>

        <div className="cr-card">
            <div>Название заказа</div>
            <div className="c-input">
                <IonInput
                
                />
            </div>
        </div>
        {/* <IonCard className="c-card">
            <div className="a-center fs-14 pb-1"> <b>Описание заказа</b> </div>
            <div className="bg-1">

                <div className=" flex pb-1 pt-1 cl-black ">
                    <div className="circle-1 w-15 h-15 ml-1 w-20"></div>
                    <div className="ml-1 w-80 mr-1 roboto t-underline"
                        onClick={()=>{ setModal( true )}}
                    >
                        <div> { info.address.address } </div>
                        <div> { "lat: " + info.address.lat  + ", lng: " + info.address.long } </div>
                    </div>                    
                </div>

                <div className=" flex pb-1 pt-1 cl-black">
                    <div className="circle-1 w-15 h-15 ml-1 w-20"></div>
                    <div className="ml-1 w-80 mr-1 roboto t-underline"
                        onClick={()=>{ setModal1( true )}}
                    >
                        <div> { info.destiny.address } </div>
                        <div> { "lat: " + info.destiny.lat  + ", lng: " + info.destiny.long } </div>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="grid 6.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        <IonInput
                            placeholder="ШхВхГ"
                            value={ info?.dimensions}
                            onIonInput = {(e)=>{
                                info.dimensions = e.detail.value as string ;
                            }}
                        ></IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="Weight.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        <IonInput
                            placeholder="Вес"
                            value={ info?.weight}
                            type = "number"
                            onIonInput = {(e)=>{
                                info.weight = parseInt( e.detail.value as string );
                            }}
                        >

                        </IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="donate.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        <IonInput
                            placeholder="Цена"
                            value={ info?.price}
                            type="number"
                            onIonInput = {(e)=>{
                                info.price = parseFloat( e.detail.value as string );
                            }}
                        >

                        </IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="receipt1.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        <IonInput
                            placeholder="Описание"
                            value={ info?.name }
                            onIonInput = {(e)=>{
                                info.name = e.detail.value as string ;
                            }}
                        >

                        </IonInput>
                    </div>                    
                </div>

                <div className=" flex pb-1 cl-black">
                    <img src="phone.svg" alt="" className="w-2 h-2 ml-1" />
                    <div className="ml-1 w-80 mr-1 t-underline">
                        <Maskito  
                            placeholder= "+7 (XXX) XXX-XXXX"
                            mask = { ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/] }
                            value = { info?.phone }
                            onIonInput = {(e)=>{
                                info.phone = e.detail.value;
                            }}
                        />
                    </div>                    
                </div>

                <div>
                    <Files  info = { info.files } />
                </div>
                <div className="flex">
                    <IonButton
                        className="w-50"
                        color = "success"
                        onClick={()=>{
                            props.setPage( 0 )
                        }}
                    >
                        <b>Сохранить</b>
                    </IonButton>
                    <IonButton
                        className="w-50"
                        color = "warning"
                        onClick={()=>{
                            props.setPage( 0 )
                            
                        }}
                    >
                        <b>Отменить</b>
                    </IonButton>
                </div>
            </div>
        </IonCard>
        <IonModal
            className="c-modal"
            isOpen = { modal }
            onDidDismiss={ ()=> setModal( false )}
        >
            <IonCard className="c-card mt-4">
                <div className="a-center fs-14">
                    <b> Адрес </b>
                </div>
                <div className="pb-4 cl-black">
                    <Address info = { info.address }
                    />
                </div>
                <div className="pt-4">
                    <div className="flex">
                        <IonButton
                            className="w-50"
                            onClick={()=>{
                                setModal( false )
                            }}
                        >
                            Сохранить
                        </IonButton>               
                        <IonButton
                            className="w-50"
                            onClick={()=>{
                                setModal( false )
                            }}
                        >
                            Отменить
                        </IonButton>               
                    </div>
                </div>
            </IonCard>

        </IonModal>
        <IonModal
            className="c-modal"
            isOpen = { modal1 }
            onDidDismiss={ ()=> setModal1( false )}
        >
            <IonCard className="c-card mt-4">
                <div className="a-center fs-14">
                    <b> Адрес </b>
                </div>
                <div className="pb-4 cl-black">
                    <Address info = { info.destiny }
                    />
                </div>
                <div className="pt-4">
                    <div className="flex">
                        <IonButton
                            className="w-50"
                            onClick={()=>{
                                setModal1( false )
                            }}
                        >
                            Сохранить
                        </IonButton>               
                        <IonButton
                            className="w-50"
                            onClick={()=>{
                                setModal1( false )
                            }}
                        >
                            Отменить
                        </IonButton>               
                    </div>
                </div>
            </IonCard>

        </IonModal> */}
    </>

    return elem
}

function        Item(props:{ info, setPage }){
    const info = props.info

    function Curs( summ ){
        let str = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( summ )
        str = '₽ ' + str.replace('₽', '')
        return str 
    }

    const elem = <>
        <div className="cr-card mt-1"
            onClick={()=>{
                props.setPage( 1 )
            }}
        >
            <div  className="flex fl-space">
                <div className="flex">
                    <div className="cr-chip" >{ info.status }</div>
                    <IonText class="ml-1 fs-07">{ "ID: " + info.guid.substring(0, 6) }</IonText>
                </div>
                <IonText className="fs-08 cl-prim">
                    <b> { Curs( info.price ) } </b>
                </IonText>
            </div>
            <div className="fs-08 mt-05">
                <b>{ info.name }</b>
            </div>
            <div className="flex fl-space mt-05">
                <div className="flex">
                    <IonIcon icon = { locationOutline } color="danger"/>
                    <div className="fs-08">
                        <div className="ml-1 fs-09 cl-gray">Откуда:</div>
                        <div className="ml-1 fs-09"><b>{ info.address.city }</b></div>                    
                    </div>
                </div>
                <div>
                    <div className="fs-08">
                        <div className="ml-1 fs-09 cl-gray">Дата загрузки:</div>
                        <div className="ml-1 fs-09"><b>{ info.address.date.substring(0, 10) }</b></div>                    
                    </div>
                </div>
            </div>
            <div className="flex fl-space mt-05">
                <div className="flex">
                    <IonIcon icon = { locationOutline } color="success"/>
                    <div className="fs-08">
                        <div className="ml-1 fs-09 cl-gray">Куда:</div>
                        <div className="ml-1 fs-09"><b>{ info.destiny.city }</b></div>                    
                    </div>
                </div>
                <div>
                    <div className="fs-08">
                        <div className="ml-1 fs-09 cl-gray">Дата выгрузки:</div>
                        <div className="ml-1 fs-09"><b>{ info.destiny.date.substring(0, 10) }</b></div>                    
                    </div>
                </div>
            </div>
            <div>
                <div className="fs-08 mt-1 cr-detali">Детали груза:</div>
                <div>
                    { info.description }
                </div>
            </div>
        </div>
    </>

    return elem
}
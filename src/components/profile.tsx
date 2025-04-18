import { useEffect, useState } from "react"
import { exec, getData, Store } from "./Store"
import { IonButton, IonCard, IonCheckbox, IonIcon, IonInput, IonLabel, IonLoading, IonSegment, IonSegmentButton, IonTextarea, IonToggle } from "@ionic/react"
import './profile.css'
import { arrowBackOutline, chevronForwardOutline, personOutline } from "ionicons/icons"
import { takePicture } from "./Files"
import { IInput } from "./Classes"


export function Profile() {
    const [ info,   setInfo ]   = useState<any>()
    const [ upd,    setUpd ]    = useState(0)
    const [ page,   setPage ]   = useState(0)

    let swap = Store.getState().swap
    
    useEffect(() => {

        setInfo( Store.getState().login )

    }, []);

    Store.subscribe({num: 301, type: "login", func: ()=>{
        setInfo(Store.getState().login )
    }})

    async function GetPhoto(){
        const res = await takePicture();
        resizeImageBase64(res.dataUrl, 200, 200)
    }

    async function Save( data ){
        
        data.token = Store.getState().login.token
        const res = await getData("profile", data )

    }

    function resizeImageBase64(base64String, maxWidth, maxHeight) {
        // Создаем элемент canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
      
        // Загружаем изображение из строки Base64
        const img = new Image();
        img.src = base64String;
      
        // Ждем загрузки изображения
        img.onload = function() {
          // Рассчитываем новые размеры, сохраняя пропорции
          let width = img.width;
          let height = img.height;
      
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
      
          // Устанавливаем размеры canvas
          canvas.width = width;
          canvas.height = height;
      
          // Рисуем изображение на canvas
          ctx?.drawImage(img, 0, 0, width, height);
      
          // Сохраняем изображение в Base64
          const newBase64 = canvas.toDataURL('image/jpeg', 0.9); // Качество 90%

          info.image = { dataUrl: newBase64, format: "jpeg" };
          console.log(info.image)
          setUpd(upd + 1)

          Save({ image: { dataUrl: newBase64, format: "jpeg" } })

        };
    }

    function Item(props: { info }){
        const info = props.info 
        const elem = <>
            <div className="flex mt-1 ml-1 mr-1 fl-space pb-1 pt-1 t-underline"
                onClick={()=>{
                    info.onClick()
                }}
            >
                <div className="ml-1">
                    { info?.title }
                </div>
                <IonIcon icon = { chevronForwardOutline } />
            </div>
        </>

        return elem
    }

    function Personal(){

        async function Save(){
            info.token = Store.getState().login.token
            const res = await getData("profile", info)
            console.log(res)
        }

        useEffect(()=>{
            return ()=>{
                Save()
            }
        }, [])

        const elem = <>
            <div>
    
                <div className=""
                    onClick={()=>{
                        setPage(0)
                    }}
                >
                    <IonIcon icon = { arrowBackOutline } className="ml-1 mt-1 w-15 h-15"/>
                </div>
    
                <div className="mt-1 ml-1 mr-1 fs-09">

                    <div className = "fs-12"> <b>Личные информация</b></div>
                    
                    <div className="mt-1">
                        <div>Имя, Фамилия</div>
                        <div className="c-input ">
                            <IonInput
                                placeholder="Имя"
                                value={ info?.name }
                                onIonInput={(e)=>{
                                    info.name = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>email</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="email"
                                value={ info?.email }
                                onIonInput={(e)=>{
                                    info.email = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Телефон</div>
                        <div className="c-input">
                            <IonInput
                                value={ info?.phone }
                                placeholder="Телефон"
                                readonly 
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>О себе</div>
                        <div className="c-input">
                            <IonTextarea
                                placeholder="о себе"
                            >
    
                            </IonTextarea>
                        </div>
                    </div>
                    
                </div>
        
            </div>
       </>
    
        return elem
    }
    
    function Transport(){
        const [info, setInfo] = useState<any>(Store.getState().transport);


        async function Save(){
            info.token = Store.getState().login.token
            const res = await getData("setTransport", info)
            console.log(res)
        }

        Store.subscribe({num: 201, type: "", func: ()=>{
            setInfo( Store.getState().transport )
        }})

        useEffect(()=>{

            setInfo( Store.getState().transport)
           
            return ()=>{
                Save()
            }
        }, [ ])

        const elem = <>
            <div>
    
                <div className=""
                    onClick={()=>{
                        setPage(0)
                    }}
                >
                    <IonIcon icon = { arrowBackOutline } className="ml-1 mt-1 w-15 h-15"/>
                </div>
    
                <div className="mt-1 ml-1 mr-1 fs-09">

                    <div className = "fs-12"> <b>Информация о транспорте</b></div>
                    
                    <div className="mt-1">
                        <div>Тип транспорта</div>
                        <div className="c-input ">
                            <IonInput
                                placeholder="Тип транспорта"
                                value={ info?.ТипТранспорта }
                                onIonInput={(e)=>{
                                    info.ТипТранспорта = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Грузоподъемность</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Грузоподъемность"
                                value={ info?.Грузоподъемность }
                                onIonInput={(e)=>{
                                    info.Грузоподъемность = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Год выпуска</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Год выпуска"
                                value={ info?.ГодВыпуска }
                                onIonInput={(e)=>{
                                    info.ГодВыпуска = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Гос. номер</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Гос. номер"
                                value={ info?.ГосНомер }
                                onIonInput={(e)=>{
                                    info.ГосНомер = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Опыт вождения</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Опыт вождения"
                                value={ info?.Опыт }
                                onIonInput={(e)=>{
                                    info.Опыт = e.detail.value as string;
                                    console.log( info )
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Документы</div>
                    </div>
                    
                </div>
        
            </div>
       </>
    
        return elem
    }

    function Password(){
        const [ load, setLoad ] = useState( false )
        const [info, setInfo] = useState<any>({
            oldpassword:    "",
            password1:      "",
            password2:      "",
        });



        const elem = <>
            <div>
                <IonLoading  isOpen = { load } message = "Подождите..."/>
                <div className=""
                    onClick={()=>{
                        setPage(0)
                    }}
                >
                    <IonIcon icon = { arrowBackOutline } className="ml-1 mt-1 w-15 h-15"/>
                </div>
    
                <div className="mt-1 ml-1 mr-1 fs-09">

                    <div className = "fs-12"> <b>Безопасность</b></div>
                    
                    <div className="mt-1">
                        <div>Старый пароль</div>
                        <div className="c-input ">
                            <IonInput
                                placeholder="Старый пароль"
                                value={ info?.oldpassword }
                                type= "password"
                                onIonInput={(e)=>{
                                    info.oldpassword = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Пароль</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Пароль"
                                value={ info?.password1 }
                                type= "password"
                                onIonInput={(e)=>{
                                    info.password1 = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Подтверждение пароля</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Пароль"
                                value={ info?.password2 }
                                type= "password"
                                onIonInput={(e)=>{
                                    info.password2 = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                </div>  

                <div className="ml-1 mr-1 mt-1 flex fl-space">
                    <div></div>
                    <IonButton
                        mode = "ios"
                        onClick={ async () =>{
                            setLoad( true)
                            if(info.password1 === info.password2 ){
                                console.log("set password")
                                info.token = Store.getState().login.token
                                const res = await getData("setPassword", info)
                                console.log(res)
                                if(res.success){
                                   setPage( 0 )
                                } else 
                                    alert(res.message)   
                                setLoad( false)   
                            }
                            else{
                                alert("Пароли не совпадают")
                                setLoad( false )
                            }
                        }}
                    >
                        Изменить пароль
                    </IonButton>                
                </div>      
            </div>
       </>
    
        return elem
    }

    function Notifications(){
        const [ load, setLoad ] = useState( false )
        const [info, setInfo] = useState<any>( Store.getState().login.notifications );

        async function Save(){
            const res = await getData("profile",{
                token: Store.getState().login.token,
                notifications: info
            })
            console.log(res)
        }

        useEffect(()=>{
            return ()=>{
                Save()
            }
        },[])
        const elem = <>
            <div>
                <IonLoading  isOpen = { load } message = "Подождите..."/>
                <div className=""
                    onClick={()=>{
                        setPage(0)
                    }}
                >
                    <IonIcon icon = { arrowBackOutline } className="ml-1 mt-1 w-15 h-15"/>
                </div>
    
                <div className="mt-1 ml-1 mr-1 fs-09">

                    <div className = "fs-12"> <b>Уведомления</b></div>
                    
                    <div className="flex fl-space">

                        <div className="mt-1">
                            <div>
                                <b>email уведомления</b>
                            </div>
                            <div className="fs-08 cl-gray">
                                Получать уведомления на email
                            </div>
                        </div>

                        <IonToggle  mode = "ios"
                            checked={ info.email }
                            onIonChange={(e)=>{ 
                                info.email = e.detail.checked
                            }}
                        />

                    </div>
                    
                    <div className="flex fl-space">

                        <div className="mt-1">
                            <div>
                                <b>SMS уведомления</b>
                            </div>
                            <div className="fs-08 cl-gray">
                                Получать уведомления на SMS
                            </div>
                        </div>

                        <IonToggle  mode = "ios"
                            checked={ info.sms }
                            onIonChange={(e)=>{ 
                                info.sms = e.detail.checked
                            }}
                        />

                    </div>

                    <div className="flex fl-space">

                        <div className="mt-1">
                            <div>
                                <b>Новые заказы</b>
                            </div>
                            <div className="fs-08 cl-gray">
                                Получать уведомления о новых заказах
                            </div>
                        </div>

                        <IonToggle  mode = "ios"
                            checked={ info.orders }
                            onIonChange={(e)=>{ 
                                info.orders = e.detail.checked
                            }}
                        />

                    </div>

                    <div className="flex fl-space">

                        <div className="mt-1">
                            <div>
                                <b>Маркетинговые уведомления</b>
                            </div>
                            <div className="fs-08 cl-gray">
                                Новости, акции, спецпредложения
                            </div>
                        </div>

                        <IonToggle  mode = "ios"
                            checked={ info.market }
                            onIonChange={(e)=>{ 
                                info.market = e.detail.checked
                                console.log( info )
                            }}
                        />

                    </div>

                </div>  

            </div>
       </>
    
        return elem
    }
    
    function Orgs(){
        const [info, setInfo] = useState<any>(Store.getState().orgs);


        async function Save(){
            info.token = Store.getState().login.token
            const res = await getData("setOrgs", info)
            console.log(res)
        }

        Store.subscribe({num: 201, type: "", func: ()=>{
            setInfo( Store.getState().orgs )
        }})

        useEffect(()=>{

            setInfo( Store.getState().orgs)
           
            return ()=>{
                Save()
            }
        }, [ ])

        const elem = <>
            <div>
    
                <div className=""
                    onClick={()=>{
                        setPage(0)
                    }}
                >
                    <IonIcon icon = { arrowBackOutline } className="ml-1 mt-1 w-15 h-15"/>
                </div>
    
                <div className="mt-1 ml-1 mr-1 fs-09">

                    <div className = "fs-12"> <b>Информация о компании</b></div>
                    
                    <div className="mt-1">
                        <div>Наименование</div>
                        <div className="c-input ">
                            <IonInput
                                placeholder="Наименование"
                                value={ info?.Наименование }
                                onIonInput={(e)=>{
                                    info.Наименование = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>ИНН</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="ИНН"
                                value={ info?.ИНН }
                                onIonInput={(e)=>{
                                    info.ИНН = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Телефон</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Телефон"
                                value={ info?.Телефон }
                                onIonInput={(e)=>{
                                    info.Телефон = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Адрес</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Адрес"
                                value={ info?.Адрес }
                                onIonInput={(e)=>{
                                    info.Адрес = e.detail.value as string;
                                }}
                            >
    
                            </IonInput>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Описание</div>
                        <div className="c-input">
                            <IonTextarea
                                placeholder="Описание"
                                value={ info?.Описание }
                                onIonInput={(e)=>{
                                    info.Описание = e.detail.value as string;
                                    console.log( info )
                                }}
                            >
    
                            </IonTextarea>
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Документы</div>
                    </div>
                    
                </div>
        
            </div>
       </>
    
        return elem
    }


    let elem = <>
        <div>
            <div className="h-3 bg-2 flex fl-center fs-14">
                <div className="">Мой профиль</div>  
            </div>

            <div className="borders ml-1 mr-1 mt-1">

                <div className="flex fl-space fs-08">
                    <div className="flex">
                        <IonIcon  icon = { personOutline } className="w-15 h-15"/>
                        <div className="ml-1"> { info?.name } </div>
                    </div>
                    <span> { swap ?  "Водитель" : "Заказчик"} </span>
                </div>

                <div className="flex mt-1 fl-space">
                    <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
                        <div className="a-center">
                            <b> { info?.ratings?.orders } </b>
                        </div>
                        <div className="fs-07 a-center mt-05">
                            Выполнено заказов
                        </div>

                    </div>
                    <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
                        <div className="a-center">
                            <b> { info?.ratings?.rate } </b>
                        </div>
                        <div className="fs-07 a-center mt-05">
                            Рейтинг
                        </div>
                    </div>
                    
                    {
                        swap 
                            ? <>
                                <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
                                    <div className="a-center">
                                        <b> { info?.ratings?.invoices } </b>
                                    </div>
                                    <div className="fs-07 a-center mt-05">
                                        Заявки
                                    </div>
                                </div>
                            
                            </>
                            : <>
                                <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
                                    <div className="a-center">
                                        <b> { info?.ratings?.payd } </b>
                                    </div>
                                    <div className="fs-07 a-center mt-05">
                                        Оплачено
                                    </div>
                                </div>
                            </>
                    }
                </div>
            </div>

            {
                swap 
                   ? <>

                        <Item info = {{ title: "Купить заявки", onClick: ()=>{}}}/>

                        <Item info = {{ title: "Личные данные", onClick: ()=>{ setPage(1)}}}/>

                        <Item info = {{ title: "Транспорт",     onClick: ()=>{ setPage(2)}}}/>

                        <Item info = {{ title: "Безопасность",  onClick: ()=>{ setPage(3)}}}/>

                        <Item info = {{ title: "Уведомления",   onClick: ()=>{ setPage(4)}}}/>

                    </>
                   : <>

                        <Item info = {{ title: "Личные данные", onClick: ()=>{ setPage(1)}}}/>

                        <Item info = {{ title: "Компания",      onClick: ()=>{ setPage(5)}}}/>

                        <Item info = {{ title: "Безопасность",  onClick: ()=>{ setPage(3)}}}/>

                        <Item info = {{ title: "Уведомления",   onClick: ()=>{ setPage(4)}}}/>

                    </>
            }


            <div className="p-bottom w-100">
                <IonSegment value={ swap ? "driver" : "customer" }
                    className="w-100"
                    mode = "ios"
                    onIonChange={(e)=>{ 
                        swap = e.detail.value === "driver" ? true : false
                        Store.dispatch({ type: "swap", data: swap })
                    }}
                >
                    <IonSegmentButton value="customer">
                    <IonLabel>Я заказчик</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="driver">
                    <IonLabel>Я водитель</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                <IonButton
                    className="h-4"
                    expand="block"
                    mode = "ios"
                >
                    Готово
                </IonButton>
            </div>

        </div>
    </>

    elem = <>
        {
              page === 0 ? elem
            : page === 1 ? <Personal />
            : page === 2 ? <Transport />
            : page === 3 ? <Password />
            : page === 4 ? <Notifications />
            : page === 5 ? <Orgs />
            : <></>
        }
    </>

    return elem
}


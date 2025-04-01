import { useEffect, useRef, useState } from "react"
import { getData, Store } from "./Store"
import { IonButton, IonCard, IonCheckbox, IonChip, IonIcon, IonInput, IonModal } from "@ionic/react"
import './profile.css'
import { addOutline, cameraOutline, trashOutline } from "ionicons/icons"
import { takePicture } from "./Files"
import { createGesture, Gesture } from '@ionic/core';


export function Profile() {
    const [ info, setInfo ] = useState<any>()
    const [ upd, setUpd ] = useState(0)

    
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

    return (
        <IonCard className="c-card">

            <div className="flex mr-1">
                <img src = { info?.image?.dataUrl } alt="as" className="p-img"/>
                <div className="ml-1 p-icon">
                    <IonIcon icon = { cameraOutline }  className="w-4 h-4" color="dark"
                        onClick={()=>{
                            GetPhoto()
                        }}
                    />
                </div>
                
            </div>

            <div className=" flex pb-1 mt-1">
                <img src="receipt1.svg" alt="" className="w-2 h-2 ml-1 white-svg"  />
                <div className="ml-1 w-80 mr-1 t-underline">
                    <IonInput
                        placeholder="ФИО"
                        value={ info?.dimensions}
                        onIonInput = {(e)=>{
                            info.name = e.detail.value as string ;
                        }}
                    ></IonInput>
                </div>                    
            </div>
            <div className=" flex pb-1 mt-1">
                <img src="receipt1.svg" alt="" className="w-2 h-2 ml-1 white-svg"  />
                <div className="ml-1 w-80 mr-1 t-underline">
                    <IonInput
                        placeholder="ФИО"
                        value={ info?.dimensions}
                        onIonInput = {(e)=>{
                            info.name = e.detail.value as string ;
                        }}
                    ></IonInput>
                </div>                    
            </div>

            <div className="mt-1">
                <div className="fs-11">Электронная почта </div>
                <div className="c-input ml-1 mt-05">
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

            <div className="mt-1">
                <div className="fs-11">Пароль </div>
                <div className="c-input ml-1 mt-05">
                    <IonInput
                        placeholder="Пароль"
                        value={ info?.password }
                        type="password"
                        onIonInput={(e)=>{
                            info.password = e.detail.value as string;
                        }}
                    >
                    </IonInput>
                </div>
            </div>     

            <div className="mt-1">
                <div className="fs-11"> Транспорт </div>
                    <div className="pt-1 pb-1 a-right mr-1">
                        <IonCheckbox
                            checked = { info?.driver } 
                            onIonChange={(e) => {
                                console.log(e )
                                info.driver = e.detail.checked
                            }}
                            >
                            Стать водителем
                        </IonCheckbox>
                    </div>
                <div>
                    
                </div>
            </div>     

            <div className="mt-1">
                <IonButton
                    expand="block"
                    color={"tertiary"}
                    onClick={()=>{
                        console.log( info )
                        Save({
                            name:       info.name,
                            email:      info.email,
                            password:   info.password,
                            driver:     info.driver,
                            tags:       info.tags
                        })

                        Store.dispatch({ type: "swap", data: info.driver })
                    }}
                >
                      Сохранить      
                </IonButton>
            </div>  
            
        </IonCard>
    )
}
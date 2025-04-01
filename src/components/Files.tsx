import { createGesture, IonIcon, IonModal } from "@ionic/react"
import { cameraOutline, trashOutline } from "ionicons/icons"
import { useEffect, useRef, useState } from "react"
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import './Files.css'

export async function    takePicture() {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });
    //const imageUrl = "data:image/jpeg;base64," + image.base64String;
    let arr = image.dataUrl?.split(";")
    if(arr !== undefined) {
        arr = arr[0].split("/")
        image.format = arr[1]
    }
    return image
  
}

export function Files(props: { info }){
    const info = props.info;

    const [ upd, setUpd ] = useState( 0 )

    const targetRef = useRef<HTMLDivElement | null>(null);

    async function GetFoto() {
        const imageUrl = await takePicture();
        Resize( imageUrl, 400, 400)
    }

    function Resize(url, maxWidth, maxHeight) {
        // Создаем элемент canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
      
        // Загружаем изображение из строки Base64
        const img = new Image();
        img.src = url.dataUrl;
      
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
          url.dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Качество 90%

          props.info.push( url )
          setUpd(upd + 1)
  
        };
    }


    function File( props: { file, ind }) {

        const boxRef = useRef<HTMLDivElement | null>(null);
      
        useEffect(() => {
            
            if (boxRef.current) {
                const gesture = createGesture({
                    el: boxRef.current,
                    gestureName: 'draggable',
                    threshold: 0,
                    onStart: () => {
                        // Начало жеста
                        console.log('Drag started');
                    },
                    onMove: (ev) => {
                        // Перемещение элемента
                        boxRef.current!.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
                    },
                    onEnd: (ev) => {
                        // Окончание жеста
    
                        console.log( ev )
    
                        const boxRect = boxRef.current!.getBoundingClientRect();
                        const targetRect = targetRef.current!.getBoundingClientRect();
                  
                        if (
                            ev.currentX >= targetRect.left &&
                            ev.currentX <= targetRect.right &&
                            ev.currentY >= targetRect.top &&
                            ev.currentY <= targetRect.bottom
                        ) {
                            info.splice( props.ind, 1 );
                            setUpd( upd + 1 )
                        } else {
                            boxRef.current!.style.transform = 'translate(0, 0)';
                        }                        
                    },
                });
                
                gesture.enable();
            }
        }, []);
      
        const elem = <>
            <div className="f-icon"
                ref = { boxRef }
                onClick={()=>{
                    console.log("get foto ")
                }}
            >
                <img src= { props.file.dataUrl } alt="Икон" />
            </div>
        </>
    
        return elem
    }

    let items = <></>

    for (let i = 0; i < props.info.length; i++){
        items = <>
            { items }
            <File file={ props.info[i] } ind = { i }/>
        </>
    }

    const elem = <>
        <div className="cl-black ml-1"> Добавить фото</div>
        <div className="f-list mt-05 ml-1">
            { items }
        </div>
        <div className="flex fl-space ml-1 mr-1 pb-1 mt-1">
            <Add  getFoto = { GetFoto } />
            <div 
                className=""
                ref = { targetRef }
                onClick={()=>{
                    //props.getFoto()    
                }}
            >
                <IonIcon icon = { trashOutline }  className="w-3 h-3" color="dark"/>
            </div>
        </div>


    </>

    return elem
}


function Add(props:{  getFoto }){

    const elem = <>
        <div className=""
            onClick={()=>{
                props.getFoto()    
            }}
        >
            <IonIcon icon = { cameraOutline }  className="w-3 h-3" color="dark"/>
        </div>
    </>
    return elem
}


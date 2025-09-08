import React, { useState } from "react";
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { cameraOutline, sendOutline } from "ionicons/icons";
import { jsPDF } from "jspdf";
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { IonButton, IonChip, IonIcon, IonLoading, IonModal } from "@ionic/react";
import { Store, getData } from "./Store";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { RenderCurrentScaleProps, RenderZoomInProps, RenderZoomOutProps, zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

defineCustomElements(window)

export async function    takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt
    });
    //const imageUrl = "data:image/jpeg;base64," + image.base64String;
    let arr = image.dataUrl?.split(";")
    if(arr !== undefined) {
        arr = arr[0].split("/")
        image.format = arr[1]
    }
    return image
  
}

export async function toPDF( pages, name ) {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    for(let i = 0; i < pages.length; i++){
        const img = new Image();
        img.src = pages[i].dataUrl;
        await img.decode();
        let wt = img.width;
        let ht = img.height; 

        let k = 1
        if(wt > 1000) k = 1000 / wt
        if(ht > 1000 && (1000 / ht) < k) k = 1000 / ht


        wt = Math.floor(wt * k)
        ht = Math.floor(ht * k)

        const canvas = document.createElement("canvas");
            
        const ctx = canvas.getContext("2d");

        canvas.width = wt;
        canvas.height = ht;
            
        ctx?.drawImage(img, 0, 0, wt, ht);

            // Show resized image in preview element
        const dataurl = canvas.toDataURL( 'image/jpeg' );
            
        k = wt /210
        if( ht / 297 > k ) k = ht / 297

        if(i > 0) doc.addPage();

        doc.addImage( dataurl, "jpeg", 0, 0, Math.floor(wt / k), Math.floor(ht / k) );

    }

    return doc.output("datauristring",{ filename: name})
}

export function PDFDoc( props ){
    const [ pages ] = useState<any>(1)
    const [ page, setPage ] = useState(1)
    const [ message, setMessage ] = useState("")

    const zoomPluginInstance = zoomPlugin();
    const { CurrentScale, ZoomIn, ZoomOut } = zoomPluginInstance;

    const base64toBlob = (data: string) => {
        
        const jarr = data.split(",")

        const base64WithoutPrefix = jarr[1] //data.substr('data:application/pdf;base64,'.length);
    
        const bytes = atob(base64WithoutPrefix);

        let length = bytes.length;
        const out = new Uint8Array(length);
    
        while (length--) {
            out[length] = bytes.charCodeAt(length);
        }
    
        return new Blob([out], { type: 'application/pdf' });
    };

    const blob = base64toBlob( props.url );
    const url = URL.createObjectURL(blob);

    return <>
        <div className="h-3 pl-2 w-100 bg-2 flex">
            <div>PDF view</div>
            <div className="ml-1">
                <ZoomOut>
                    {(props: RenderZoomOutProps) => (
                        <IonButton
                            onClick={props.onClick}
                        >
                            -
                        </IonButton>
                    )}
                </ZoomOut>
            </div>
            <div className="ml-1">
                <CurrentScale>
                    {(props: RenderCurrentScaleProps) => <>{`${Math.round(props.scale * 100)}%`}</>}
                </CurrentScale>
            </div>
            <div className="ml-1">
                <ZoomIn>
                    {(props: RenderZoomInProps) => (
                        <IonButton
                            onClick={props.onClick}
                        >
                            +
                        </IonButton>
                    )}
                </ZoomIn>
            </div>
            <div className="ml-1">
                <IonButton
                    /* eslint-disable */
                    onClick={()=>{ 
                        async function send() {
                            const res = await getData('SendMail', {
                                token: Store.getState().login.token,
                                type: props.title,
                                name: props.name,
                                email: Store.getState().profile.email,
                                image: props.url,
                            } )
                            console.log(res)
                            setMessage(res.message)
                        }
                        send()
                    }}
                ><IonIcon icon = { sendOutline }/></IonButton>
            </div>
        </div>
        <p className="m-stack fs-bold fs-2 cl-prim">{ message }</p>
        <div className="f-scroll"> 
            {/* <Viewer fileUrl={ url } plugins={ [ zoomPluginInstance ] } /> */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
                <div>
                    <Viewer
                        fileUrl={ url }
                        plugins={[
                            zoomPluginInstance,
                        ]}
                    />
                </div>
            </Worker>
        </div>
    </>
}


export function Files(props: { info, name, check, title }) {
    const [ upd,    setUpd] = useState( 0 )
    const [ modal,  setModal] = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ modal1, setModal1] = useState( false )
    const [ load ] = useState( false)

    async function getFoto(){
        try {
            const imageUrl = await takePicture();

            if(imageUrl.format === "pdf") props.info.length = 0
            else if( props.info.length > 0 && props.info[0].format === "pdf" ) props.info.length = 0

            props.info.push( imageUrl )
                
        } catch (error) {
            console.log( error )
        }
        setUpd(upd + 1)   
    }

    async function openPDF(){
        try {
            const res = await FilePicker.pickFiles({types: ['application/pdf'], readData: true})

            if(res.files[0]?.data){
                props.info.length = 0
                props.info.push( { dataUrl: "data:application/pdf;base64," + res.files[0]?.data, format: 'pdf'})
                setUpd(upd + 1)
            }

        } catch (error) {
            console.log( error )
        }

    }
    
    async function PDF(){

        const pdf = await toPDF( props.info,  props.name + ".pdf")

        props.info.length = 0;
        props.info.push( { dataUrl: pdf, format: "pdf" } )
        setUpd( upd + 1 )
    }

    const elem = <>
        <div>
            <div className="flex fl-space t-underline ml-1 mr-1 fs-09">
                <div className= { props.check ? "mr-1" : "mr-1" }>
                    { props.check ? " * " + props.title : props.title }
                </div>
            </div>
                
            <div className={ "flex fl-wrap" }>

                { props.info.map((e, ind) =>{
                    return e.format === "pdf"
                        ? <img key = { ind as number } src = { "assets/pdf.png" } alt="" className="w-4 h-4 ml-1 mt-1 s-point"
                            onClick = {()=>{ setModal( e );  }}
                        />
                        : <img key = { ind as number } src = { e.dataUrl } alt="" className="w-4 h-4 ml-1 mt-1 s-point"
                            onClick = {()=>{ setModal( e );  }}
                        />
                        
                    })}
                    
                <div
                    onClick={()=>{ setModal1( true ) }}
                    className="ml-1 mt-1 s-photo"
                >
                    <IonIcon icon = { cameraOutline } color="warning" slot="icon-only" className="w-3 h-3 "/>
                </div>                        

            </div>
        </div> 
        <IonLoading isOpen = { load } message = "Подождите..."/>
        <IonModal
            className="w-100 h-100"
            isOpen = { modal !== undefined }
            onDidDismiss={ () => setModal( undefined )}
        >
            <div className="w-100 h-100">
                {  
                    modal?.format === "pdf" 
                        ? <PDFDoc url = { modal?.dataUrl } name  = { props.name } title = { props.title }/>
                        : <img src={ modal?.dataUrl } alt = "" />
                }
            </div>
        </IonModal>
        <IonModal
            className="w-100 h-100"
            isOpen = { modal1 }
            onDidDismiss={ () => setModal1( false )}
        >
            <div className="w-100 h-100">
                <div className="ml-1 mt-1 mr-1 cl-prim fs-09">
                    { props.title }
                </div>
                <div className="ml-1 mt-1 mr-1 cl-prim">
                    <div className="flex fl-space fs-09">
                        <div>
                            <b>Прикрепите заранее подготовленный pdf-файл</b>
                        </div>
                        <img src="assets/addPDF1.png" alt="addPDF" className="s-photo-3"/>
                    </div>
                    <div className="flex fl-space fs-09">
                        <div className="mt-05">
                            <b>или сфотографируйте все страницы документа</b>
                        </div>
                        <div className="s-photo-3">
                            <IonIcon icon = { cameraOutline } color="warning" slot="icon-only" className="w-2 h-2 "/>
                        </div>
                    </div>
                </div>
                <div className="flex fl-wrap">
                    <img key = { 100 } src = "assets/addPDF1.png" alt="pdf"  className="ml-1 s-photo-1 mt-1"
                        onClick={()=>{
                            openPDF()
                            setModal1( false )
                        }}              
                    />
                    <div
                        onClick={()=>{ 
                            getFoto() 
                        }}
                        className="ml-1 mt-1 s-photo"
                    >
                        <IonIcon icon = { cameraOutline } color="warning" slot="icon-only" className="w-3 h-3 "/>
                    </div>   
                    <div
                        onClick={()=>{ 
                            props.info.pop();    
                            setUpd(upd + 1)
                        }}
                        className="ml-1 mt-1 s-photo"
                    >
                        <img src="assets/delFile.png" alt="delFile"  className="w-3 h-3"/>
                    </div>   
                </div>
                <div className="ml-1 mt-1 mr-1 cl-prim">
                </div>
                <div className="flex fl-wrap">
                    { props.info.map((e, ind) =>{
                        return e.format === "pdf"
                            ? <img key = { ind as number } src = { "assets/pdf.png" } alt="" className="w-4 h-4 ml-1 mt-1 s-point"
                                onClick = {()=>{ setModal( e ); console.log(e) }}
                            />
                            : <img key = { ind as number } src = { e.dataUrl } alt="" className="w-4 h-4 ml-1 mt-1 s-point"
                                onClick = {()=>{ setModal( e ); console.log(e) }}
                            />
                            
                        })
                    }
                </div>
                <div className="ml-1 mt-1 mr-1">
                    <IonButton
                        expand = "block"
                        onClick={()=>{ 
                            if(props.info.length > 1 )
                                PDF()
                            setModal1( false )}
                        }
                    >
                        Закрыть
                    </IonButton>
                </div>
            </div>
        </IonModal>

    </>
    return elem
}

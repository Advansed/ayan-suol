import { useEffect, useState } from "react";
import { TItem, TPanel } from "./Classes";
import { getData, Store } from "./Store";
import { IonButton, IonCard, IonIcon, IonInput, IonLabel, IonModal } from "@ionic/react";
import { chatboxOutline, closeOutline, cloudDownloadOutline, cloudUploadOutline, createOutline, trashOutline } from "ionicons/icons";


export function Publics() { 
    const [ info,   setInfo ] = useState<any>([])
    const [ page,   setPage ] = useState( 0 )
    const [ modal,  setModal ] = useState<any>( )

    useEffect(()=>{
        setInfo( Store.getState().transports )    

    },[])

    Store.subscribe({ num: 301, type: "transports", func : ()=>{
        setInfo( Store.getState().transports )

    } })
    
    function List() {
        let elem = <></>

        class Item extends TItem {
            constructor(props) {
                super(props)
            }

            onClick1 = (info)=>{
                
            }
            onClick2 = (info)=>{
                
            }
            onClick3 = (info)=>{
                setModal( info )    
            }

            buttons = ()=>{
                return (
                    <div className="flex  mt-1">
                        {/* { this.Lenta() } */}
                        <div className="c1-button ml-1"
                            onClick = {()=>{ this.onClick1( this.state.info ); }}
                        >
                            <IonIcon icon = { closeOutline }  className="w-25 h-25" color = "dark"/>
                            <IonLabel className="fs-09">Отменить</IonLabel>
                        </div>

                        <div className="c1-button ml-2"
                            onClick = {()=>{ this.onClick2( this.state.info ); }}
                        >
                                <IonIcon icon = { chatboxOutline }  className="w-25 h-25" color = "dark"/>
                            <IonLabel className="fs-09">Чат</IonLabel>
                        </div>
                        <div className="c1-button ml-2"
                            onClick = {()=>{ this.onClick3( this.state.info ); }}
                        >    
                            <IonIcon icon = { cloudDownloadOutline }  className="w-25 h-25" color = "dark"/>
                            <IonLabel className="fs-09">Предложения</IonLabel>
                        </div>            
                    </div>
                )
            }

        }

        for (let i = 0; i < info.length; i++) {
            elem = (
                <>
                    {elem}
                    <Item info = { info[i] }/>
                </>
            )
        }

        return elem 
    }

    function ModalForm() {
        const  [ info, setInfo ] = useState<any>([])

        async function load() {
            const res = await getData("getOffers", {
                token:  Store.getState().login.token,
                guid:   modal.guid
            })

            if(res.success){
                setInfo( res.data )
            }            
        }

        useEffect(()=>{
            load()
        },[])

        function Item(props:{ info }) {
            const info = props.info
            return (
                <IonCard>
                    <div className="flex">
                        <div className="c-img">
                            <img src={ info.files[0].dataUrl } alt=" alt" />
                        </div>
                        <div>{ "Наименование" }</div>
                    </div>

                </IonCard>
            )
        }

        let elem = <></>

        for (let i = 0; i < info.length; i++) {
            elem = (
                <>
                    {elem}
                    <Item info = { info[i] }/>
                </>
            )
        }
        return elem 
    }

    const elem = <>
        <div className="a-container">
            <TPanel info ={{
                title: "Заказы",
                onClick1: ()=>{
                    setPage( 0 )
                },
                onClick2: ()=>{
                    setPage(1)
                }
            }} />
            {
                page === 0
                    ? <List  />
                : <></>
            }
        </div>
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

    return elem 

}
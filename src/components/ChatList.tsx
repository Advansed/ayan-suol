import { useEffect, useState } from "react"
import { IonRefresher, IonRefresherContent } from '@ionic/react'
import socketService from "./Sockets"
import { Store } from "./Store"
import { useHistory } from "react-router"

export function ChatList(){
    const [ info, setInfo ] = useState<any>([])
    const hist = useHistory()

    function its( str: string):string {
        const jarr = str.split(" ")
        let its = ""
        jarr.forEach(elem => {
            its = its + elem.substring(0, 1)
        });
        return its
    }

    function loadChats() {
        const socket = socketService.getSocket()
        if(socket) {
            socket.emit("get_chats", {
                token: Store.getState().login.token
            })
        }
    }

    function refresh(event: CustomEvent) {
        loadChats()
        event.detail.complete()
    }

    useEffect(()=>{
        const socket = socketService.getSocket()
        
        if(socket) {
            loadChats()
            socket.on("get_chats", (res)=>{
                setInfo( res.data )
            })
        }
    },[])

    let elem = <></>

    for(let i = 0; i < info.length; i++){
        elem = <>
            { elem }
                <div className="cr-card mt-1"
                    onClick={()=>{
                        hist.push("/tab2/" + info[i].recipient + ':' + info[i].cargo + ':' + info[i].rec_name )
                    }}
                >
                    <div className="flex fl-space">
                        <div className="ml-05">
                            <div className="fs-09 cl-black"> <b>{ "Груз:" + info[i].cargo_name }</b> </div>
                            <div className="fs-07 cl-gray"> Водитель </div>
                            <div className="cr-status-1">{ info[i].rec_name }</div>
                            {/* TODO: Добавить план - кнопка/иконка для планирования */}
                            {/* TODO: Добавить мысли - поле для заметок */}
                        </div>
                        <div className="circle w-3 h-3 mr-05">
                            { its( info[i].rec_name ) }
                        </div>
                    </div>
                </div>
        </>
    }

    return <>
        <div className="h-100">
            <div className="chat-header">
                <div className="flex fl-center">
                    <div className="fs-12 fw-bold">Чаты</div>
                </div>
            </div>
            <div className="pt-1">
                <IonRefresher slot="fixed" onIonRefresh={refresh}>
                    <IonRefresherContent />
                </IonRefresher>
                <div>   
                    { elem }
                </div>
            </div>
        </div>
    </>
}
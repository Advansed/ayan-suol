import { useEffect, useState } from "react"
import socketService from "./Sockets"
import { Store } from "./Store"
import { useHistory } from "react-router"


export function ChatList(){
    const [ info, setInfo ] = useState<any>([])

    const hist = useHistory()

    function its( str: string):string {
        const jarr = str.split(" ")
        let     its   = ""
        jarr.forEach(elem => {
            its = its + elem.substring(0, 1)
        });
        return its
    }

    useEffect(()=>{
        const socket = socketService.getSocket()
        
        if(socket) {
            socket.emit("get_chats", {
                token: Store.getState().login.token
            })
            socket.on("get_chats", (res)=>{
                console.log("get_chats")
                console.log( res )
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
                        </div>
                        <div className="circle w-3 h-3 mr-05">
                            { its( info[i].rec_name ) }
                        </div>
                    </div>
                </div>
        </>
    }

    return <>
        <div className="bg-2 h-100 pt-1">
            <div>   
                { elem }
            </div>
        </div>
    </>
}
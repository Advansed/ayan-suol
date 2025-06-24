import { useState, useRef, useEffect } from 'react';
// import OrderCard from '../card/OrderCard';
import styles from './style.module.css';
import { getData, Store } from '../Store';
import socketService from '../Sockets';


const DriverChat = (props) => {
  const [info, setInfo] = useState<any>([])
  const [socketData, setsocketData] = useState<any>([])
  const socket = socketService.getSocket();

  console.log(socket, 'asdkaskdasd')
  async function load() {
    const res = await getData("chatGet", {
      token: Store.getState().login.token,
      recId: props.info.recId,
      cargo: props.info.cargo
    })

    const socket = socketService.getSocket();

    if(socket){
      setsocketData(socket)
    }

    if (res.success) {
      setInfo(res.data)
    }
  }

  useEffect(() => {
    load()
    return () => { }
  }, [])

  const elem = <>
    <div> Чат </div>
  </>

  return elem
};

export default DriverChat;
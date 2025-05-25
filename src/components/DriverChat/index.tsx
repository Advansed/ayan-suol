import { useState, useRef, useEffect } from 'react';
import OrderCard from '../card/OrderCard';
import styles from './style.module.css';
import { getData, Store } from '../Store';

const DriverChat = (props) => {
  const [ info, setInfo ] = useState<any>([])

  async function load(){
    const res = await getData("chatGet", {
        token:  Store.getState().login.token,
        recId:  props.info.recId,
        cargo:  props.info.cargo
    })

    if(res.success) {
      setInfo( res.data )
    }
  }

  useEffect(()=>{
    load()
    return ()=>{}
  },[])

  const elem = <>
    <div> Чат </div>
  </>

  return elem
};

export default DriverChat;
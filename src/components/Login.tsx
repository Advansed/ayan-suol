import React, { useEffect, useState } from 'react';
import './Login.css'; // Подключаем файл стилей
import { IonButton, IonCard, IonInput, IonLabel, IonLoading } from '@ionic/react';
import { getData, Phone, Store } from './Store';
import { Maskito } from './Classes';

const       Login = () => {
  const [ page, setPage ] = useState( 0 );
  const [ load, setLoad ] = useState( false );

  async function Auth( info ){
    setLoad( true)
    if( info.login !== ""  ){
        if( info.password!== ""  ){
            const res = await getData("login", {
                login:      Phone(info.login),
                password:   info.password,
            } )
            console.log( res )
            if(res.success){
                localStorage.setItem( "serv-tm1.phone", info.login )
                localStorage.setItem( "serv-tm1.pass",  info.password )

                Store.dispatch({type: "login",  data: res.data })
                Store.dispatch({type: "auth",   data: true });
                Store.dispatch({type: "swap",   data: res.data.driver });
            } else {
                Store.dispatch({type: "message", data: {type: "error", message: res.message }})
            }
        
        } else 
            Store.dispatch({type: "message", data: {type: "error", message: "Пароль не может быть пустым"}})

    } else 
        Store.dispatch({type: "message", data: {type: "error", message: "Логин не может быть пустым"}})

    setLoad( false )
  }

  async function Reg( params ){
    const info = params
    if( params.code !== ""  ){
        if( params.name!== ""  ){
            const res = await getData("Registration", params )
            if(res.success){
                if(res.data !== undefined){
                    Store.dispatch({type: "login",  data: res.data })
                    Store.dispatch({type: "auth",   data: true });
                } else {
                    if(res.message === "Отправлен СМС на ваш телефон"){
                        Store.dispatch({type: "login",  data: { token: "",code: params.code, name: params.name , email: params.email ? params.email : "" } })
                        setPage(3)
                    } 
                    if(res.message === "СМС верен"){
                        setPage(4)
                    } 
                }
                
            } else {
                Store.dispatch({type: "message", data: {type: "error", message: res.message}})
            }
        
        } else 
            Store.dispatch({type: "message", data: {type: "error", message: "Заполните имя"}})

    } else 
        Store.dispatch({type: "message", message: {type: "error", message: "Номер телефона не может быть пустым"}})
  }
  
  const elem = <>
    <IonLoading isOpen = { load } message={"Подождите..."} />
    {
        page === 0 
            ? <Ahthorization  setPage = { setPage } Auth = { Auth}/>
        : page === 1 
            ? <Registration setPage = { setPage } Reg = { Reg }/>
        : page === 2 
            ? <Restore setPage = { setPage }/>
        : page === 3 
            ? <SMS Reg = { Reg } setPage = { setPage} />
        : page === 4
            ? <Password Reg = { Reg } />
        : <></>
    }
  </>
  return elem 
};

function    Ahthorization (props:{ setPage, Auth }) {
    const [ info , setInfo ] = useState<any>({ login: "", password: "" });
    const [ upd, setUpd ] = useState( 0 )

    useEffect(()=>{

        const login = localStorage.getItem("serv-tm1.phone") 
        const pass = localStorage.getItem("serv-tm1.pass") 

        console.log( login )
        if( login !== null && pass !== null){
            setInfo({ login: login, password: pass})
            setUpd( upd + 1 )
        }   
    },[])

    const maskitoOptions:any = {
        mask: [/\d/, /\d/, '.', /\d/, /\d/],
    };
    
    const elem = <>
        <div className='container'>

            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Авторизация</h2>
                </div>
                <div className='l-input a-left'>
                    <Maskito  
                        placeholder= "+7 (XXX) XXX-XXXX"
                        mask = { ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/] }
                        value = { info?.login }
                        onIonInput = {(e)=>{
                            info.login = e.detail.value;
                        }}
                    />
                </div>
                <div className='l-input mt-1 a-left'>
                    <IonInput
                        placeholder='Пароль'
                        type='password'
                        autocomplete='off'
                        value={ info?.password }
                        onIonInput={(e)=>{
                            info.password = e.detail.value;
                        }}
                    >
                    </IonInput>
                </div>
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        className='l-button'
                        onClick={()=>{
                            props.Auth( info );
                        }}
                    >
                      <b>  Войти   </b>  
                    </IonButton>
                </div>
                <div>
                    <div className='mt-1'>
                    <IonLabel
                        onClick={()=>{
                            props.setPage( 2 )
                        }}
                    >
                        Забыли пароль? <b className='c-white'>Восстановить</b>
                    </IonLabel>
                    </div>
                    <div className='mt-1'>
                    <IonLabel className='mt-1'
                        onClick={()=>{
                            props.setPage( 1 )
                        }}
                    >
                        Нет аккаунта? <b className='c-white'>Регистрация</b>
                    </IonLabel>
                    </div>
                </div>
                
            </IonCard>

        </div>
    </>

    return elem
}

function    Registration ( props:{ setPage, Reg } ) {
    const [ info ] = useState<any>(new Object());

    const elem = <>
        <div className='container'>

            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Регистрация</h2>
                </div>
                <div className='l-input'>
                    <Maskito  
                        placeholder= "+7 (XXX) XXX-XXXX"
                        mask = { ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/] }
                        value = { info?.code }
                        onIonInput = {(e)=>{
                            info.code = e.detail.value;
                        }}
                    />
                </div>
                <div className='l-input mt-1'>
                    <IonInput
                        placeholder='Имя'
                        type='text'
                        value={ info?.name}
                        onIonInput={(e)=>{
                            info.name = e.detail.value;
                        }}
                    >
                    </IonInput>
                </div>
                <div className='l-input mt-1'>
                    <IonInput
                        placeholder='email'
                        type='email'
                        onIonInput={(e)=>{
                            info.email = e.detail.value;
                        }}
                    >
                    </IonInput>
                </div>
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        onClick={()=>{
                            props.Reg( info );
                        }}
                        className='l-button'
                    >
                       <b> Зарегистрироваться  </b>
                    </IonButton>
                </div>
                <div>
                    <div className='mt-1'
                        onClick={()=>{
                            props.setPage( 0 )
                        }}
                    >
                        <IonLabel className='mt-1'>
                            Есть аккаунт? <b className='c-white'>Авторизироваться</b>
                        </IonLabel>
                    </div>
                </div>
                
            </IonCard>
        </div>
    </>
    return elem;
}

function    SMS(props:{ Reg, setPage }){
    const [ value, setValue ] = useState("");

    const elem = <>
        <div className='container'>

            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Проверка СМС</h2>
                </div>
                <div className='l-input'>
                    <IonInput
                        placeholder='SMS'
                        type='text'
                        autocomplete="off" autocorrect="off" autocapitalize="off"
                        inputMode='text'
                        value={ value }
                        onIonInput={(e)=>{
                            setValue( e.detail.value as string );
                        }}
                    >
                    </IonInput>
                </div>
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        onClick={()=>{
                            let info  = Store.getState().login;
                            info.sms = value;
                            console.log( info )
                            props.Reg( info)
                        }}
                        color="warning"
                    >
                        Отправить      
                    </IonButton>
                </div>
                <div>
                    <div className='mt-1'
                        onClick={()=>{
                            props.setPage( 0 )
                        }}
                    >
                        <IonLabel className='mt-1'>
                            Есть аккаунт? <a href='#'>Авторизироваться</a>
                        </IonLabel>
                    </div>
                </div>

            </IonCard>
            
        </div>
        
    </>

    return elem
}

function    Password(props:{ Reg }){
    const [ value, setValue ] = useState("");
    const [ value1, setValue1 ] = useState("");

    const elem = <>
        <div className='container'>

            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Подтверждение пароли</h2>
                </div>
                <div className='l-input'>
                    <IonInput
                        placeholder='Пароль'
                        type='password'
                        autocomplete="off" autocorrect="off" autocapitalize="off"
                        inputMode='text'
                        value={ value }
                        onIonInput={(e)=>{
                            setValue( e.detail.value as string );
                        }}
                    >
                    </IonInput>
                </div>
                <div className='l-input mt-1'>
                    <IonInput
                        placeholder='Подтверждение пароля'
                        type='password'
                        autocomplete="off" autocorrect="off" autocapitalize="off"
                        inputMode='text'
                        value={ value1 }
                        onIonInput={(e)=>{
                            setValue1( e.detail.value as string );
                        }}
                    >
                    </IonInput>
                
                </div>
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        onClick={()=>{
                            let info  = Store.getState().login;
                            info.password = value;
                            if(  value === value1 ){
                                props.Reg( info )
                            } else {
                                Store.dispatch({type: "message", message: {error: true, message: "Пароли не совпадают"}})
                            }
                        }}
                        color="warning"
                    >
                        Отправить      
                    </IonButton>
                </div>
                
            </IonCard>
            
        </div>
        
    </>

    return elem
}

function    Restore(props:{ setPage }){
    const [ info, setIfo ] = useState<any>({login: "", password: ""})
    const elem = <>
        <div className='container'>
             <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Восстановить пароль</h2>
                </div>
                <div className='l-input'>
                    <Maskito  

                        placeholder= "+7 (XXX) XXX-XXXX"
                        mask = { ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/] }
                        value = { info?.login }
                        onIonInput = {(e)=>{
                            info.login = e.detail.value;
                        }}
                    />
                </div>
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        onClick={()=>{
                        }}
                        className='l-button'
                    >
                        <b> Восстановить </b>    
                    </IonButton>
                </div>
                <div>
                    <div className='mt-1'>
                    <IonLabel
                        onClick={()=>{
                            props.setPage( 0 )
                        }}
                    >
                        <b className='c-white'>Авторизироваться</b>
                    </IonLabel>
                    </div>
                    <div className='mt-1'>
                    <IonLabel className='mt-1'
                        onClick={()=>{
                            props.setPage( 1 )
                        }}
                    >
                        Нет аккаунта? <b className='c-white'>Регистрация</b>
                    </IonLabel>
                    </div>
                </div>
                
            </IonCard>
        </div>
   
    </>

    return elem 
}

export default Login;
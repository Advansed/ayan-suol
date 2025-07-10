import React, { useEffect, useState } from 'react';
import './Login.css';
import { IonButton, IonCard, IonInput, IonLabel, IonLoading, IonSpinner } from '@ionic/react';
import { Phone, Store } from '../Store';
import { Maskito } from '../Classes';
import socketService from '../Sockets';
import Registration from './Registration';
import Restore from './Restore';

// Типы для безопасности
interface LoginInfo {
    login: string;
    password: string;
}

// Валидационные функции
const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
    return phoneRegex.test(phone);
};


const Login: React.FC = () => {
    const [page, setPage] = useState(0);
    const [load, setLoad] = useState(false);


    const elem = (
        <>
            <IonLoading isOpen={load} message={"Подождите..."} />
            {page === 0 && <Authorization setPage={setPage} />}
            {page === 1 && <Registration setPage={setPage} />}
            {page === 2 && <Restore setPage={setPage} />}
        </>
    );

    return elem;
};

// Компонент авторизации с улучшенной типизацией
const Authorization: React.FC<{ setPage: (page: number) => void  }> = ({ setPage }) => {
    const [info, setInfo] = useState<LoginInfo>({ login: "", password: "" });
    const [message, setMessage] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        const login = localStorage.getItem("serv-tm1.phone");
        // Не загружаем пароль из localStorage для безопасности
        
        if (login) {
            setInfo(prev => ({ ...prev, login }));
        }

        console.log(" useeffect login")

        const socket = socketService.getSocket();
        
        if(socket) {
            socket.on('authorization', (res) => {
                setIsAuthenticating( false )
                if( res.success) {
                    console.log('Авторизация через сокет успешна');
                    console.log(res)
                    Store.dispatch({ type: "login", data: res.data });
                    Store.dispatch({ type: "auth", data: true });
                    if(res.data.driver){
                        console.log("swap")
                        Store.dispatch({ type: "swap", data: true})
                    }
                } else {
                    setMessage( res.message )
                }
                
            });
        }

        return () => {
            if(socket){
                socket.off("authorization");
            }
        };
    }, []);

    const handleSocketAuth = () => {
        if (!info.login.trim() || !info.password.trim()) {
            setMessage("Заполните все поля");
            return;
        }

        if (!validatePhone(info.login)) {
            setMessage("Некорректный формат номера телефона");
            return;
        }

        setIsAuthenticating(true);
        setMessage('');
        
        // Отправляем данные через сокет
        const params = {
            login:      Phone(info.login),
            password:   info.password
        }
        console.log( params )
        socketService.emit("authorization", params );
    };

    return (
        <div className='container'>
            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Авторизация</h2>
                </div>
                <form>
                    <div className='l-input a-left'>
                        <Maskito
                            placeholder="+7 (XXX) XXX-XXXX"
                            mask={['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                            value={info.login}
                            onIonInput={(e) => {
                                setInfo(prev => ({ ...prev, login: e.detail.value || "" }));
                            }}
                        />
                    </div>
                    
                    <div className='l-input mt-1 a-left'>
                        <IonInput
                            placeholder='Пароль'
                            type='password'
                            autocomplete='current-password'
                            value={info.password}
                            onIonInput={(e) => {
                                setInfo(prev => ({ ...prev, password: e.detail.value || "" }));
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSocketAuth();
                                }
                            }}
                        />
                    </div>
                </form>
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        className='l-button'
                        onClick={handleSocketAuth}
                        disabled={!info.login.trim() || !info.password.trim() || isAuthenticating}
                    >
                        {isAuthenticating ? (
                            <>
                                <IonSpinner name="crescent" />
                                <span className="ml-05">Вход...</span>
                            </>
                        ) : (
                            <b>Войти</b>
                        )}
                    </IonButton>
                </div>
                
                {message && (
                    <div className='mt-1'>
                        <p className='fs-11 cl-red a-center'>{message}</p>
                    </div>
                )}

                <div>
                    <div className='mt-1'>
                        <IonLabel onClick={() => setPage(2)}>
                            Забыли пароль? <b className='c-white'>Восстановить</b>
                        </IonLabel>
                    </div>
                    <div className='mt-1'>
                        <IonLabel onClick={() => setPage(1)}>
                            Нет аккаунта? <b className='c-white'>Регистрация</b>
                        </IonLabel>
                    </div>
                </div>
            </IonCard>
        </div>
    );
};


export default Login;
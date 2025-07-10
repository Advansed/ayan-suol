import React, { useEffect, useState, useCallback, useRef } from 'react';
import { IonButton, IonCard, IonInput, IonLabel, IonSpinner } from '@ionic/react';
import { Store, Phone } from '../Store';
import { Maskito } from '../Classes';
import socketService from '../Sockets';

interface RegistrationInfo {
    code: string;
    name: string;
    email: string;
}

const Registration: React.FC<{ setPage: (page: number) => void }> = ({ setPage }) => {
    // Используем правильное состояние React
    const [info, setInfo] = useState<RegistrationInfo>({ 
        code: "", 
        name: "", 
        email: "" 
    });
    const [order, setOrder] = useState<any>({ 
        status: '', 
        check_id: '', 
        call: '', 
        token: "" 
    });

    // Ref для сохранения фокуса
    const phoneInputRef = useRef<HTMLIonInputElement>(null);

    const Page1 = () => {
        const [message, setMessage] = useState("");
        const [isLoading, setIsLoading] = useState(false);

        // Правильный обработчик изменения телефона
        const handlePhoneChange = useCallback((e: CustomEvent) => {
            const value = e.detail.value || "";
            info.code = value
            setInfo( info );
        }, []);

        // Правильный обработчик изменения имени
        const handleNameChange = useCallback((e: CustomEvent) => {
            const value = e.detail.value || "";
            info.name = value
            setInfo( info );
        }, []);

        // Правильный обработчик изменения email
        const handleEmailChange = useCallback((e: CustomEvent) => {
            const value = e.detail.value || "";
            info.email = value;
            setInfo( info );
        }, []);

        const handleSubmit = useCallback(async () => {
            const phone: string = Phone(info.code);
            if (phone.length !== 12) {
                setMessage("Заполните телефон");
                return;
            }
            if (info.name.length === 0) {
                setMessage("Заполните ФИО");
                return;
            }

            setIsLoading(true);
            setMessage("");

            try {
                socketService.emit("check_registration", {
                    code: phone,
                    name: info.name.trim(),
                    email: info.email.trim()
                });
            } catch (error) {
                setMessage("Ошибка отправки данных");
                setIsLoading(false);
            }
        }, [info]);

        useEffect(() => {
            const socket = socketService.getSocket();

            const handleRegistrationResponse = (data: any) => {
                setIsLoading(false);
                console.log(data.data);
                if (data.success) {
                    setOrder({
                        status: data.data.status,
                        check_id: data.data.check_id,
                        call: data.data.call_phone,
                        token: data.data.token
                    });
                } else {
                    setMessage(data.data?.message || "Ошибка регистрации");
                }
            };
            if(socket){
                socket.on("check_registration", handleRegistrationResponse);
                
                socket.on('save_password', (res) => {
                    if(res.success){
                        console.log('Восстановление через сокет успешна');
                        console.log(res)
                        Store.dispatch({ type: "login", data: res.data });
                        Store.dispatch({ type: "auth", data: true });
                        if(res.data.driver){
                            console.log("swap")
                            Store.dispatch({ type: "swap", data: true})
                        }
                    }
                });

            }

            return () => {
                if(socket){
                    socket.off("check_registration", handleRegistrationResponse);
                    socket.off("save_password")
                }
                
            };
        }, []);

        return (
            <div className='container'>
                <IonCard className="login-container">
                    <div className='a-center'>
                        <h2>Регистрация</h2>
                    </div>

                    <div className='l-input'>
                        <Maskito
                            placeholder="+7 (XXX) XXX-XXXX"
                            mask={['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                            value={info.code}
                            onIonInput={handlePhoneChange}
                        />
                    </div>

                    <div className='l-input mt-1'>
                        <IonInput
                            placeholder='Имя и Фамилия'
                            type='text'
                            value={info.name}
                            onIonInput={handleNameChange}
                        />
                    </div>

                    <div className='l-input mt-1'>
                        <IonInput
                            placeholder='Email (необязательно)'
                            type='email'
                            value={info.email}
                            onIonInput={handleEmailChange}
                        />
                    </div>

                    {message && (
                        <div>
                            <p className='cl-red fs-11'>{message}</p>
                        </div>
                    )}

                    <div className='mt-1'>
                        <IonButton
                            expand="block"
                            onClick={handleSubmit}
                            className='l-button'
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span style={{ marginLeft: '8px' }}>Регистрация...</span>
                                </>
                            ) : (
                                <b>Зарегистрироваться</b>
                            )}
                        </IonButton>
                    </div>

                    <div>
                        <div className='mt-1' onClick={() => setPage(0)}>
                            <IonLabel>
                                Есть аккаунт? <b className='c-white'>Авторизироваться</b>
                            </IonLabel>
                        </div>
                    </div>
                </IonCard>
            </div>
        );
    };

    const Page2 = () => {
        const formatPhoneDisplay = (phone: string): string => {
            if (!phone || phone.length < 10) return phone;
            return `${phone.substring(0, 2)} (${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8, 10)}-${phone.substring(10)}`;
        };

        return (
            <div className='container'>
                <IonCard className="login-container">
                    <div className='a-center'>
                        <h2>Регистрация</h2>
                    </div>

                    <div className='fs-11 a-center'>
                        Для верификации номера позвоните по этот бесплатный номер
                    </div>

                    <div className='a-center fs-14 mt-2'>
                        <b>{formatPhoneDisplay(order.call)}</b>
                    </div>

                    <div className='mt-1'>
                        <IonButton
                            expand="block"
                            onClick={() => {
                                window.open('tel:' + order.call);
                                setOrder(prevOrder => ({ ...prevOrder, status: 'CALL' }));
                            }}
                            className='l-button'
                        >
                            <b>Позвонить</b>
                        </IonButton>
                    </div>

                    <div>
                        <div className='mt-1' onClick={() => setPage(0)}>
                            <IonLabel>
                                Есть аккаунт? <b className='c-white'>Авторизироваться</b>
                            </IonLabel>
                        </div>
                    </div>
                </IonCard>
            </div>
        );
    };

    const Page3 = () => {
        const [message, setMessage] = useState("");
        const [isChecking, setIsChecking] = useState(false);

        const handleCheck = useCallback(() => {
            setIsChecking(true);
            setMessage("");
            socketService.emit("test_call", order);
        }, [order]);

        useEffect(() => {
            const socket = socketService.getSocket();

            const handleTestCallResponse = (data: any) => {
                setIsChecking(false);
                console.log(data.data);
                if (data.data.check_status === 400) {
                    setMessage(data.data.check_status_text);
                }
                if (data.data.check_status === 401) {
                    setOrder(prevOrder => ({ ...prevOrder, status: 'PASS' }));
                }
            };

            socket?.on("test_call", handleTestCallResponse);

            return () => {
                socket?.off("test_call", handleTestCallResponse);
            };
        }, []);

        const formatPhoneDisplay = (phone: string): string => {
            if (!phone || phone.length < 10) return phone;
            return `${phone.substring(0, 2)} (${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8, 10)}-${phone.substring(10)}`;
        };

        return (
            <div className='container'>
                <IonCard className="login-container">
                    <div className='a-center'>
                        <h2>Регистрация</h2>
                    </div>

                    <div className='fs-11 a-center'>
                        Надо проверить результаты верификации
                    </div>

                    <div className='a-center fs-14 mt-2'>
                        <b>{formatPhoneDisplay(order.call)}</b>
                    </div>

                    {message && (
                        <div>
                            <p className='cl-red fs-11'>{message}</p>
                        </div>
                    )}

                    <div className='mt-1'>
                        <IonButton
                            expand="block"
                            onClick={handleCheck}
                            className='l-button'
                            disabled={isChecking}
                        >
                            {isChecking ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span style={{ marginLeft: '8px' }}>Проверка...</span>
                                </>
                            ) : (
                                <b>Проверить</b>
                            )}
                        </IonButton>
                    </div>

                    <div>
                        <div className='mt-1' onClick={() => setPage(0)}>
                            <IonLabel>
                                Есть аккаунт? <b className='c-white'>Авторизироваться</b>
                            </IonLabel>
                        </div>
                    </div>
                </IonCard>
            </div>
        );
    };

    const Page4 = () => {
        const [message, setMessage] = useState("");
        const [pwd, setPwd] = useState({ 
            token: order.token, 
            password: "", 
            password1: "" 
        });
        const [isLoading, setIsLoading] = useState(false);

        // Правильные обработчики для паролей
        const handlePasswordChange = useCallback((e: CustomEvent) => {
            const value = e.detail.value || "";
            setPwd(prevPwd => ({
                ...prevPwd,
                password: value
            }));
        }, []);

        const handlePassword1Change = useCallback((e: CustomEvent) => {
            const value = e.detail.value || "";
            setPwd(prevPwd => ({
                ...prevPwd,
                password1: value
            }));
        }, []);

        const handleSavePassword = useCallback(() => {
            if (pwd.password !== pwd.password1) {
                setMessage("пароль и подтверждение не совпадают");
                return;
            }
            if (pwd.password.length < 6) {
                setMessage("пароль должен содержать минимум 6 символов");
                return;
            }

            setIsLoading(true);
            setMessage("");
            socketService.emit("save_password", {
                token: pwd.token,
                password: pwd.password
            });
        }, [pwd]);

        useEffect(() => {
            const socket = socketService.getSocket();

            const handlePasswordSaved = (data: any) => {
                setIsLoading(false);
                console.log(data.data);
                if (data.success) {
                    Store.dispatch({ type: "login", data: data.data });
                    Store.dispatch({ type: "auth", data: true });
                } else {
                    setMessage(data.message || "Ошибка сохранения пароля");
                }
            };

            socket?.on("save_password", handlePasswordSaved);

            return () => {
                socket?.off("save_password", handlePasswordSaved);
            };
        }, []);

        return (
            <div className='container'>
                <IonCard className="login-container">
                    <div className='a-center'>
                        <h2>Регистрация</h2>
                    </div>

                    <div className='fs-11 a-center'>
                        Сделайте пароль и подтвердите его
                    </div>

                    <div className='l-input mt-1'>
                        <IonInput
                            placeholder='Пароль'
                            type='password'
                            value={pwd.password}
                            onIonInput={handlePasswordChange}
                        />
                    </div>

                    <div className='l-input mt-1'>
                        <IonInput
                            placeholder='Подтверждение'
                            type='password'
                            value={pwd.password1}
                            onIonInput={handlePassword1Change}
                        />
                    </div>

                    {message && (
                        <div>
                            <p className='cl-red fs-11'>{message}</p>
                        </div>
                    )}

                    <div className='mt-1'>
                        <IonButton
                            expand="block"
                            onClick={handleSavePassword}
                            className='l-button'
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span style={{ marginLeft: '8px' }}>Сохранение...</span>
                                </>
                            ) : (
                                <b>Сохранить</b>
                            )}
                        </IonButton>
                    </div>

                    <div>
                        <div className='mt-1' onClick={() => setPage(0)}>
                            <IonLabel>
                                Есть аккаунт? <b className='c-white'>Авторизироваться</b>
                            </IonLabel>
                        </div>
                    </div>
                </IonCard>
            </div>
        );
    };

    // Отображение нужной страницы
    const renderCurrentPage = () => {
        switch (order.status) {
            case '':
                return <Page1 />;
            case 'OK':
                return <Page2 />;
            case 'CALL':
                return <Page3 />;
            case 'PASS':
                return <Page4 />;
            default:
                return <Page1 />;
        }
    };

    return renderCurrentPage();
};

export default Registration;
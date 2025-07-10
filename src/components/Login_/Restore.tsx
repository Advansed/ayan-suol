import React, { useEffect, useState, useCallback } from 'react';
import { IonButton, IonCard, IonInput, IonLabel, IonSpinner } from '@ionic/react';
import { Store, Phone } from '../Store';
import { Maskito } from '../Classes';
import socketService from '../Sockets';

interface RestoreInfo {
    phone: string;
}

const Restore: React.FC<{ setPage: (page: number) => void }> = ({ setPage }) => {
    const [info, setInfo] = useState<RestoreInfo>({ 
        phone: "" 
    });
    const [order, setOrder] = useState<any>({ 
        status: '', 
        check_id: '', 
        call: '', 
        token: "",
        user_data: null
    });

    const Page1 = () => {
        const [message, setMessage] = useState("");
        const [isLoading, setIsLoading] = useState(false);

        const handlePhoneChange = useCallback((e: CustomEvent) => {
            const value = e.detail.value || "";
            info.phone = value;
            setInfo( info );
        }, []);

        const handleSubmit = useCallback(async () => {
            const phone: string = Phone(info.phone);
            if (phone.length !== 12) {
                setMessage("Введите корректный номер телефона");
                return;
            }

            setIsLoading(true);
            setMessage("");

            try {
                socketService.emit("check_restore", {
                    phone: phone
                });
            } catch (error) {
                setMessage("Ошибка отправки данных");
                setIsLoading(false);
            }
        }, [info]);

        useEffect(() => {
            const socket = socketService.getSocket();

            const handleRestoreResponse = (data: any) => {
                setIsLoading(false);
                console.log('check_restore response:', data);
                if (data.success) {
                    setOrder({
                        status: data.data.status,
                        check_id: data.data.check_id,
                        call: data.data.call_phone,
                        token: data.data.token,
                        user_data: data.data.user_data
                    });
                } else {
                    setMessage(data.message || "Пользователь с таким номером не найден");
                }
            };

            socket?.on("check_restore", handleRestoreResponse);

            return () => {
                socket?.off("check_restore", handleRestoreResponse);
            };
        }, []);

        return (
            <div className='container'>
                <IonCard className="login-container">
                    <div className='a-center'>
                        <h2>Восстановление пароля</h2>
                    </div>

                    <div className='fs-11 a-center mb-2'>
                        Введите номер телефона, привязанный к вашему аккаунту
                    </div>

                    <div className='l-input'>
                        <Maskito
                            placeholder="+7 (XXX) XXX-XXXX"
                            mask={['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                            value={info.phone}
                            onIonInput={handlePhoneChange}
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
                                    <span style={{ marginLeft: '8px' }}>Проверка...</span>
                                </>
                            ) : (
                                <b>Восстановить пароль</b>
                            )}
                        </IonButton>
                    </div>

                    <div>
                        <div className='mt-1' onClick={() => setPage(0)}>
                            <IonLabel>
                                Вспомнили пароль? <b className='c-white'>Авторизироваться</b>
                            </IonLabel>
                        </div>
                        <div className='mt-1' onClick={() => setPage(1)}>
                            <IonLabel>
                                Нет аккаунта? <b className='c-white'>Регистрация</b>
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
                        <h2>Восстановление пароля</h2>
                    </div>

                    <div className='fs-11 a-center'>
                        Для подтверждения личности позвоните по этому бесплатному номеру
                    </div>

                    <div className='a-center fs-14 mt-2'>
                        <b>{formatPhoneDisplay(order.call)}</b>
                    </div>

                    {order.user_data && (
                        <div className='a-center mt-2'>
                            <p className='fs-09 cl-gray'>
                                Восстановление пароля для: {order.user_data.name}
                            </p>
                        </div>
                    )}

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
                                Вспомнили пароль? <b className='c-white'>Авторизироваться</b>
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

        console.log( order )

        const handleCheck = useCallback(() => {
            setIsChecking(true);
            setMessage("");
            socketService.emit("test_restore_call", order);
        }, [order]);

        useEffect(() => {
            const socket = socketService.getSocket();

            const handleTestCallResponse = (data: any) => {
                setIsChecking(false);
                console.log('test_restore_call response:', data);
                if (data.data.check_status === 400) {
                    setMessage(data.data.check_status_text || "Звонок не подтвержден");
                }
                if (data.data.check_status === 401) {
                    setOrder(prevOrder => ({ ...prevOrder, status: 'PASS' }));
                }
            };

            socket?.on("test_restore_call", handleTestCallResponse);

            return () => {
                socket?.off("test_restore_call", handleTestCallResponse);
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
                        <h2>Восстановление пароля</h2>
                    </div>

                    <div className='fs-11 a-center'>
                        Проверяем результаты верификации
                    </div>

                    <div className='a-center fs-14 mt-2'>
                        <b>{formatPhoneDisplay(order.call)}</b>
                    </div>

                    {message && (
                        <div>
                            <p className='cl-red fs-11 a-center'>{message}</p>
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
                                Вспомнили пароль? <b className='c-white'>Авторизироваться</b>
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
                setMessage("Пароли не совпадают");
                return;
            }
            if (pwd.password.length < 4) {
                setMessage("Пароль должен содержать минимум 4 символов");
                return;
            }

            setIsLoading(true);
            setMessage("");
            console.log( pwd )
            socketService.emit("save_password", {
                token: pwd.token,
                password: pwd.password,
                phone: info.phone
            });
        }, [pwd, info.phone]);


        return (
            <div className='container'>
                <IonCard className="login-container">
                    <div className='a-center'>
                        <h2>Новый пароль</h2>
                    </div>

                    <div className='fs-11 a-center'>
                        Установите новый пароль для вашего аккаунта
                    </div>

                    {order.user_data && (
                        <div className='a-center mt-1 mb-2'>
                            <p className='fs-09 cl-gray'>
                                Аккаунт: {order.user_data.name}
                            </p>
                        </div>
                    )}

                    <div className='l-input mt-1'>
                        <IonInput
                            placeholder='Новый пароль'
                            type='password'
                            autocomplete="new-password"
                            value={pwd.password}
                            onIonInput={handlePasswordChange}
                        />
                    </div>

                    <div className='l-input mt-1'>
                        <IonInput
                            placeholder='Подтверждение пароля'
                            type='password'
                            autocomplete="new-password"
                            value={pwd.password1}
                            onIonInput={handlePassword1Change}
                        />
                    </div>

                    {message && (
                        <div>
                            <p className='cl-red fs-11 a-center'>{message}</p>
                        </div>
                    )}

                    <div className='mt-1'>
                        <IonButton
                            expand="block"
                            onClick={handleSavePassword}
                            className='l-button'
                            disabled={isLoading || !pwd.password || !pwd.password1}
                        >
                            {isLoading ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span style={{ marginLeft: '8px' }}>Сохранение...</span>
                                </>
                            ) : (
                                <b>Восстановить пароль</b>
                            )}
                        </IonButton>
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

export default Restore;
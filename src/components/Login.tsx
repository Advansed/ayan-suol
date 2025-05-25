import React, { useEffect, useState } from 'react';
import './Login.css';
import { IonButton, IonCard, IonInput, IonLabel, IonLoading } from '@ionic/react';
import { getData, Phone, Store } from './Store';
import { Maskito } from './Classes';

// Типы для безопасности
interface LoginInfo {
    login: string;
    password: string;
}

interface RegistrationInfo {
    code: string;
    name: string;
    email?: string;
}

interface SMSInfo extends RegistrationInfo {
    sms: string;
}

interface PasswordInfo extends SMSInfo {
    password: string;
}

interface RestoreInfo {
    login: string;
}

// Валидационные функции
const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
    return phoneRegex.test(phone);
};

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
    return password.length >= 6; // Минимум 6 символов
};

const Login: React.FC = () => {
    const [page, setPage] = useState(0);
    const [load, setLoad] = useState(false);

    // Функция авторизации с улучшенной обработкой ошибок
    const Auth = async (info: LoginInfo) => {
        setLoad(true);
        
        try {
            // Валидация входных данных
            if (!info.login.trim()) {
                Store.dispatch({ type: "message", data: { type: "error", message: "Номер телефона не может быть пустым" } });
                return;
            }
            
            if (!validatePhone(info.login)) {
                Store.dispatch({ type: "message", data: { type: "error", message: "Некорректный формат номера телефона" } });
                return;
            }
            
            if (!info.password.trim()) {
                Store.dispatch({ type: "message", data: { type: "error", message: "Пароль не может быть пустым" } });
                return;
            }

            const res = await getData("login", {
                login: Phone(info.login),
                password: info.password,
            });

            console.log(res);
            
            if (res.success) {
                // Безопасное хранение данных (только токен)
                localStorage.setItem("serv-tm1.phone", info.login);
                // НЕ сохраняем пароль в localStorage для безопасности
                localStorage.setItem("serv-tm1.token", res.data.token);

                Store.dispatch({ type: "login", data: res.data });
                Store.dispatch({ type: "auth", data: true });
                Store.dispatch({ type: "swap", data: res.data.driver });
            } else {
                Store.dispatch({ type: "message", data: { type: "error", message: res.message } });
            }
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            Store.dispatch({ type: "message", data: { type: "error", message: "Ошибка подключения к серверу" } });
        } finally {
            setLoad(false);
        }
    };

    // Функция регистрации с улучшенной валидацией
    const Reg = async (params: RegistrationInfo | SMSInfo | PasswordInfo) => {
        setLoad(true);
        
        try {
            // Валидация номера телефона
            if (!('code' in params) || !params.code.trim()) {
                Store.dispatch({ type: "message", data: { type: "error", message: "Номер телефона не может быть пустым" } });
                return;
            }
            
            if (!validatePhone(params.code)) {
                Store.dispatch({ type: "message", data: { type: "error", message: "Некорректный формат номера телефона" } });
                return;
            }

            // Валидация имени
            if (!params.name.trim()) {
                Store.dispatch({ type: "message", data: { type: "error", message: "Имя не может быть пустым" } });
                return;
            }

            // Валидация email (если указан)
            if (params.email && !validateEmail(params.email)) {
                Store.dispatch({ type: "message", data: { type: "error", message: "Некорректный формат email" } });
                return;
            }

            const res = await getData("Registration", params);
            
            if (res.success) {
                if (res.data !== undefined) {
                    Store.dispatch({ type: "login", data: res.data });
                    Store.dispatch({ type: "auth", data: true });
                } else {
                    if (res.message === "Отправлен СМС на ваш телефон") {
                        Store.dispatch({ 
                            type: "login", 
                            data: { 
                                token: "", 
                                code: params.code, 
                                name: params.name, 
                                email: params.email || "" 
                            } 
                        });
                        setPage(3);
                    }
                    if (res.message === "СМС верен") {
                        setPage(4);
                    }
                }
            } else {
                Store.dispatch({ type: "message", data: { type: "error", message: res.message } });
            }
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            Store.dispatch({ type: "message", data: { type: "error", message: "Ошибка подключения к серверу" } });
        } finally {
            setLoad(false);
        }
    };

    const elem = (
        <>
            <IonLoading isOpen={load} message={"Подождите..."} />
            {page === 0 && <Authorization setPage={setPage} Auth={Auth} />}
            {page === 1 && <Registration setPage={setPage} Reg={Reg} />}
            {page === 2 && <Restore setPage={setPage} />}
            {page === 3 && <SMS Reg={Reg} setPage={setPage} />}
            {page === 4 && <Password Reg={Reg} />}
        </>
    );

    return elem;
};

// Компонент авторизации с улучшенной типизацией
const Authorization: React.FC<{ setPage: (page: number) => void; Auth: (info: LoginInfo) => void }> = ({ setPage, Auth }) => {
    const [info, setInfo] = useState<LoginInfo>({ login: "", password: "" });
    const [upd, setUpd] = useState(0);

    useEffect(() => {
        const login = localStorage.getItem("serv-tm1.phone");
        // Не загружаем пароль из localStorage для безопасности
        
        if (login) {
            setInfo(prev => ({ ...prev, login }));
            setUpd(prev => prev + 1);
        }
    }, []);

    const handleSubmit = () => {
        Auth(info);
    };

    return (
        <div className='container'>
            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Авторизация</h2>
                </div>
                
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
                                handleSubmit();
                            }
                        }}
                    />
                </div>
                
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        className='l-button'
                        onClick={handleSubmit}
                        disabled={!info.login.trim() || !info.password.trim()}
                    >
                        <b>Войти</b>
                    </IonButton>
                </div>
                
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

// Компонент регистрации с улучшенной валидацией
const Registration: React.FC<{ setPage: (page: number) => void; Reg: (info: RegistrationInfo) => void }> = ({ setPage, Reg }) => {
    const [info, setInfo] = useState<RegistrationInfo>({ code: "", name: "", email: "" });

    const handleSubmit = () => {
        Reg(info);
    };

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
                        onIonInput={(e) => {
                            setInfo(prev => ({ ...prev, code: e.detail.value || "" }));
                        }}
                    />
                </div>
                
                <div className='l-input mt-1'>
                    <IonInput
                        placeholder='Имя и Фамилия'
                        type='text'
                        value={info.name}
                        onIonInput={(e) => {
                            setInfo(prev => ({ ...prev, name: e.detail.value || "" }));
                        }}
                    />
                </div>
                
                <div className='l-input mt-1'>
                    <IonInput
                        placeholder='Email (необязательно)'
                        type='email'
                        value={info.email}
                        onIonInput={(e) => {
                            setInfo(prev => ({ ...prev, email: e.detail.value || "" }));
                        }}
                    />
                </div>
                
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        onClick={handleSubmit}
                        className='l-button'
                        disabled={!info.code.trim() || !info.name.trim()}
                    >
                        <b>Зарегистрироваться</b>
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

// Компонент SMS с улучшенной обработкой
const SMS: React.FC<{ Reg: (info: SMSInfo) => void; setPage: (page: number) => void }> = ({ Reg, setPage }) => {
    const [value, setValue] = useState("");

    const handleSubmit = () => {
        if (!value.trim()) {
            Store.dispatch({ type: "message", data: { type: "error", message: "Введите код из SMS" } });
            return;
        }

        const info = Store.getState().login;
        Reg({ ...info, sms: value });
    };

    return (
        <div className='container'>
            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Проверка SMS</h2>
                    <div className='fs-09 mt-1'>
                        Введите 4-значный код, отправленный на ваш телефон
                    </div>
                </div>
                
                <div className='l-input'>
                    <IonInput
                        placeholder='0000'
                        type='text'
                        autocomplete="one-time-code"
                        inputMode='numeric'
                        maxlength={4}
                        value={value}
                        onIonInput={(e) => {
                            const newValue = e.detail.value || "";
                            // Только цифры
                            if (/^\d{0,4}$/.test(newValue)) {
                                setValue(newValue);
                            }
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                    />
                </div>
                
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        onClick={handleSubmit}
                        color="warning"
                        disabled={value.length !== 4}
                    >
                        Подтвердить
                    </IonButton>
                </div>
                
                <div>
                    <div className='mt-1' onClick={() => setPage(0)}>
                        <IonLabel>
                            Вернуться к <b className='c-white'>авторизации</b>
                        </IonLabel>
                    </div>
                </div>
            </IonCard>
        </div>
    );
};

// Компонент установки пароля с валидацией
const Password: React.FC<{ Reg: (info: PasswordInfo) => void }> = ({ Reg }) => {
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");

    const handleSubmit = () => {
        if (!validatePassword(password1)) {
            Store.dispatch({ 
                type: "message", 
                data: { type: "error", message: "Пароль должен содержать минимум 6 символов" } 
            });
            return;
        }

        if (password1 !== password2) {
            Store.dispatch({ 
                type: "message", 
                data: { type: "error", message: "Пароли не совпадают" } 
            });
            return;
        }

        const info = Store.getState().login;
        Reg({ ...info, password: password1 });
    };

    return (
        <div className='container'>
            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Создание пароля</h2>
                    <div className='fs-09 mt-1'>
                        Пароль должен содержать минимум 6 символов
                    </div>
                </div>
                
                <div className='l-input'>
                    <IonInput
                        placeholder='Пароль'
                        type='password'
                        autocomplete="new-password"
                        value={password1}
                        onIonInput={(e) => {
                            setPassword1(e.detail.value || "");
                        }}
                    />
                </div>
                
                <div className='l-input mt-1'>
                    <IonInput
                        placeholder='Подтверждение пароля'
                        type='password'
                        autocomplete="new-password"
                        value={password2}
                        onIonInput={(e) => {
                            setPassword2(e.detail.value || "");
                        }}
                    />
                </div>
                
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        onClick={handleSubmit}
                        color="warning"
                        disabled={!password1 || !password2 || password1 !== password2}
                    >
                        Создать аккаунт
                    </IonButton>
                </div>
            </IonCard>
        </div>
    );
};

// Компонент восстановления пароля
const Restore: React.FC<{ setPage: (page: number) => void }> = ({ setPage }) => {
    const [info, setInfo] = useState<RestoreInfo>({ login: "" });

    const handleSubmit = async () => {
        if (!info.login.trim()) {
            Store.dispatch({ 
                type: "message", 
                data: { type: "error", message: "Введите номер телефона" } 
            });
            return;
        }

        if (!validatePhone(info.login)) {
            Store.dispatch({ 
                type: "message", 
                data: { type: "error", message: "Некорректный формат номера телефона" } 
            });
            return;
        }

        // Здесь должен быть вызов API для восстановления пароля
        console.log("Восстановление пароля для:", info.login);
    };

    return (
        <div className='container'>
            <IonCard className="login-container">
                <div className='a-center'>
                    <h2>Восстановление пароля</h2>
                </div>
                
                <div className='l-input'>
                    <Maskito
                        placeholder="+7 (XXX) XXX-XXXX"
                        mask={['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                        value={info.login}
                        onIonInput={(e) => {
                            setInfo(prev => ({ ...prev, login: e.detail.value || "" }));
                        }}
                    />
                </div>
                
                <div className='mt-1'>
                    <IonButton
                        expand="block"
                        onClick={handleSubmit}
                        className='l-button'
                        disabled={!info.login.trim()}
                    >
                        <b>Восстановить</b>
                    </IonButton>
                </div>
                
                <div>
                    <div className='mt-1'>
                        <IonLabel onClick={() => setPage(0)}>
                            <b className='c-white'>Авторизироваться</b>
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
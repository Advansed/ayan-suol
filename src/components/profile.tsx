import { useEffect, useState, useRef, useCallback } from "react"
import { getData, Store } from "./Store"
import { IonButton, IonIcon, IonInput, IonLabel, IonLoading, IonSegment, IonSegmentButton, IonSpinner, IonTextarea, IonToggle } from "@ionic/react"
import './profile.css'
import { arrowBackOutline, chevronForwardOutline, personOutline } from "ionicons/icons"
import { takePicture } from "./Files"
import socketService from "./Sockets"
import Transport from "./Transport"
import { Orgs } from "./Orgs"

export function Profile() {
    const [info, setInfo]       = useState<any>()
    const [upd, setUpd]         = useState(0)
    const [page, setPage]       = useState(0)
    
    // Refs для управления состоянием компонента
    const isMountedRef          = useRef(true)
    const subscriptionIdRef     = useRef<number | null>(null)
    const abortControllerRef    = useRef<AbortController | null>(null)

    let swap = Store.getState().swap
    
    // Безопасное обновление состояния
    const safeSetState = useCallback((setter: () => void) => {
        if (isMountedRef.current) {
            setter()
        }
    }, [])

    useEffect(() => {
        isMountedRef.current = true
        
        // Устанавливаем начальное состояние
        safeSetState(() => {
            setInfo(Store.getState().login)
        })

        // Создаем уникальный ID для подписки
        const subscriptionId = Date.now() + Math.random()
        subscriptionIdRef.current = subscriptionId

        // Подписка с проверкой состояния
        Store.subscribe({
            num: subscriptionId, 
            type: "login", 
            func: () => {
                safeSetState(() => {
                    setInfo(Store.getState().login)
                })
            }
        })

        // Cleanup функция
        return () => {
            isMountedRef.current = false
            if (subscriptionIdRef.current !== null) {
                Store.unSubscribe(subscriptionIdRef.current)
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [safeSetState]);

    // Безопасная функция для получения фото
    const GetPhoto = useCallback(async () => {
        if (!isMountedRef.current) return

        try {
            const res = await takePicture();
            if (isMountedRef.current) {
                resizeImageBase64( res.dataUrl! , 200, 200)
            }
        } catch (error) {
            console.error('Error getting photo:', error)
        }
    }, [])

    // Безопасная функция сохранения с AbortController
    const Save = useCallback(async (data: any) => {
        if (!isMountedRef.current) return

        // Отменяем предыдущий запрос
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        // Создаем новый AbortController
        abortControllerRef.current = new AbortController()

        try {
            data.token = Store.getState().login.token
            const res = await getData("profile", {
                ...data,
                signal: abortControllerRef.current.signal
            })
            
            if (isMountedRef.current && res.success) {
                console.log('Profile saved successfully')
            }
        } catch (error: any ) {
            if (error.name !== 'AbortError' && isMountedRef.current) {
                console.error('Error saving profile:', error)
            }
        }
    }, [])

    function resizeImageBase64(base64String: string, maxWidth: number, maxHeight: number) {
        if (!isMountedRef.current) return

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
      
        const img = new Image();
        img.src = base64String;
      
        img.onload = function() {
            if (!isMountedRef.current) return

            let width = img.width;
            let height = img.height;
      
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
      
            canvas.width = width;
            canvas.height = height;
      
            ctx?.drawImage(img, 0, 0, width, height);
      
            const newBase64 = canvas.toDataURL('image/jpeg', 0.9);

            if (isMountedRef.current) {
                info.image = { dataUrl: newBase64, format: "jpeg" };
                console.log(info.image)
                setUpd(upd + 1)
                Save({ image: { dataUrl: newBase64, format: "jpeg" } })
            }
        };
    }

    function Item(props: { info: any }) {
        const info = props.info 
        return (
            <div className="flex mt-1 ml-1 mr-1 fl-space pb-1 pt-1 t-underline"
                onClick={() => {
                    if (info?.onClick) {
                        info.onClick()
                    }
                }}
            >
                <div className="ml-1">
                    {info?.title}
                </div>
                <IonIcon icon={chevronForwardOutline} />
            </div>
        )
    }

    function Personal() {
        // Refs для управления состоянием
        const personalMountedRef = useRef(true)
        const [isSaving, setIsSaving] = useState(false)
        const [hasChanges, setHasChanges] = useState(false)
        const [localInfo, setLocalInfo] = useState({ ...info })
    
        // Функция сохранения через Socket.IO
        const personalSave = useCallback(async () => {
            if (!personalMountedRef.current || !localInfo || isSaving) return
    
            setIsSaving(true)
    
            try {
                const saveData = {
                    ...localInfo,
                    token: Store.getState().login.token
                }
                
                // Отправляем данные через Socket.IO
                const success = socketService.emit('profile', saveData)
                
                if (!success) {
                    console.error('Socket not connected, unable to save profile')
                    Store.dispatch({ 
                        type: "message", 
                        data: { type: "error", message: "Нет подключения к серверу" } 
                    })
                    setIsSaving(false)
                }
            } catch (error) {
                console.error('Error saving personal info:', error)
                Store.dispatch({ 
                    type: "message", 
                    data: { type: "error", message: "Ошибка при сохранении" } 
                })
                setIsSaving(false)
            }
        }, [localInfo, isSaving])
    
        useEffect(() => {
            personalMountedRef.current = true
    
            // Настройка обработчиков Socket событий
            const socket = socketService.getSocket()
            if (socket) {
                // Обработчик успешного сохранения профиля
                socket.on('profile', (response) => {
                    if (personalMountedRef.current) {
                        setIsSaving(false)
                        
                        if (response.success) {
                            console.log('Profile saved successfully:', response.data)
                            setHasChanges(false)
                            
                            // Обновляем оригинальные данные
                            Object.assign(info, localInfo)
                            
                            Store.dispatch({ type: "login", data: response.data })
                        } else {
                            console.error('Error saving profile:', response.message)
                            Store.dispatch({ 
                                type: "message", 
                                data: { type: "error", message: response.message } 
                            })
                        }
                    }
                })
            }
    
            return () => {
                personalMountedRef.current = false
                
                // Убираем обработчики событий
                if (socket) {
                    socket.off('profile')
                }
            }
        }, [localInfo])
    
        // Обработчик изменения полей
        const handleFieldChange = useCallback((field: string, value: string) => {
            setLocalInfo(prev => {
                const updated = { ...prev, [field]: value }
                
                // Проверяем, есть ли изменения
                const changed = JSON.stringify(updated) !== JSON.stringify(info)
                setHasChanges(changed)
                
                return updated
            })
        }, [info])
    
        // Сброс изменений
        const handleReset = useCallback(() => {
            setLocalInfo({ ...info })
            setHasChanges(false)
        }, [info])
    
        return (
            <div>
                <div className=""
                    onClick={() => {
                        setPage(0)
                    }}
                >
                    <IonIcon icon={arrowBackOutline} className="ml-1 mt-1 w-15 h-15"/>
                </div>
    
                <div className="mt-1 ml-1 mr-1 fs-09">
                    <div className="fs-12"> 
                        <b>Личная информация</b>
                    </div>
                    
                    <div className="mt-1">
                        <div>Имя, Фамилия</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Имя"
                                value={localInfo?.name}
                                onIonInput={(e) => {
                                    handleFieldChange('name', e.detail.value as string)
                                }}
                            />
                        </div>
                    </div>
                    
                    <div className="mt-05">
                        <div>Email</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="email"
                                type="email"
                                value={localInfo?.email}
                                onIonInput={(e) => {
                                    handleFieldChange('email', e.detail.value as string)
                                }}
                            />
                        </div>
                    </div>
                    
                    <div className="mt-05">
                        <div>Телефон</div>
                        <div className="c-input">
                            <IonInput
                                value={localInfo?.phone}
                                placeholder="Телефон"
                                readonly 
                            />
                        </div>
                    </div>
                    
                    <div className="mt-05">
                        <div>О себе</div>
                        <div className="c-input">
                            <IonTextarea
                                placeholder="О себе"
                                value={localInfo?.description}
                                onIonInput={(e) => {
                                    handleFieldChange('description', e.detail.value as string)
                                }}
                                rows={4}
                            />
                        </div>
                    </div>
    
                    {/* Кнопки управления */}
                    <div className="mt-2 flex fl-space">
                        <IonButton
                            fill="clear"
                            color="medium"
                            onClick={handleReset}
                            disabled={!hasChanges || isSaving}
                        >
                            Отменить
                        </IonButton>
                        
                        <IonButton
                            onClick={personalSave}
                            disabled={!hasChanges || isSaving}
                            className="ml-1"
                        >
                            {isSaving ? (
                                <>
                                    <IonSpinner name="crescent" className="mr-05" />
                                    Сохранение...
                                </>
                            ) : (
                                'Сохранить'
                            )}
                        </IonButton>
                    </div>
                </div>
            </div>
        )
    }

    function Password() {
        const [load, setLoad] = useState(false)
        const [passwordInfo, setPasswordInfo] = useState<any>({
            oldpassword: "",
            password1: "",
            password2: "",
        });

        // Refs для управления состоянием
        const passwordMountedRef = useRef(true)
        const passwordAbortControllerRef = useRef<AbortController | null>(null)

        useEffect(() => {
            passwordMountedRef.current = true

            return () => {
                passwordMountedRef.current = false
                if (passwordAbortControllerRef.current) {
                    passwordAbortControllerRef.current.abort()
                }
            }
        }, [])

        const handlePasswordChange = async () => {
            if (!passwordMountedRef.current) return

            if (passwordAbortControllerRef.current) {
                passwordAbortControllerRef.current.abort()
            }

            passwordAbortControllerRef.current = new AbortController()

            try {
                if (passwordMountedRef.current) {
                    setLoad(true)
                }

                if (passwordInfo.password1 === passwordInfo.password2) {
                    const saveData = {
                        ...passwordInfo,
                        token: Store.getState().login.token,
                        signal: passwordAbortControllerRef.current.signal
                    }
                    
                    const res = await getData("setPassword", saveData)
                    
                    if (passwordMountedRef.current) {
                        console.log('Password change result:', res)
                        if (res.success) {
                            setPage(0)
                        } else {
                            alert(res.message)
                        }
                    }
                } else {
                    if (passwordMountedRef.current) {
                        alert("Пароли не совпадают")
                    }
                }
            } catch (error: any) {
                if (error.name !== 'AbortError' && passwordMountedRef.current) {
                    console.error('Error changing password:', error)
                    alert('Ошибка при изменении пароля')
                }
            } finally {
                if (passwordMountedRef.current) {
                    setLoad(false)
                }
            }
        }

        return (
            <div>
                <IonLoading isOpen={load} message="Подождите..."/>
                <div className=""
                    onClick={() => {
                        setPage(0)
                    }}
                >
                    <IonIcon icon={arrowBackOutline} className="ml-1 mt-1 w-15 h-15"/>
                </div>

                <div className="mt-1 ml-1 mr-1 fs-09">
                    <div className="fs-12"> <b>Безопасность</b></div>
                    
                    <div className="mt-1">
                        <div>Старый пароль</div>
                        <div className="c-input ">
                            <IonInput
                                placeholder="Старый пароль"
                                value={passwordInfo?.oldpassword}
                                type="password"
                                onIonInput={(e) => {
                                    setPasswordInfo(prev => ({
                                        ...prev,
                                        oldpassword: e.detail.value as string
                                    }));
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Пароль</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Пароль"
                                value={passwordInfo?.password1}
                                type="password"
                                onIonInput={(e) => {
                                    setPasswordInfo(prev => ({
                                        ...prev,
                                        password1: e.detail.value as string
                                    }));
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Подтверждение пароля</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Пароль"
                                value={passwordInfo?.password2}
                                type="password"
                                onIonInput={(e) => {
                                    setPasswordInfo(prev => ({
                                        ...prev,
                                        password2: e.detail.value as string
                                    }));
                                }}
                            />
                        </div>
                    </div>
                </div>  

                <div className="ml-1 mr-1 mt-1 flex fl-space">
                    <div></div>
                    <IonButton
                        mode="ios"
                        onClick={handlePasswordChange}
                        disabled={load}
                    >
                        Изменить пароль
                    </IonButton>                
                </div>      
            </div>
        )
    }

    function Notifications() {
        const [load, setLoad] = useState(false)
        const [notificationInfo, setNotificationInfo] = useState<any>(
            Store.getState().login.notifications || {}
        );

        // Refs для управления состоянием
        const notificationMountedRef = useRef(true)
        const notificationAbortControllerRef = useRef<AbortController | null>(null)

        // Безопасная функция сохранения
        const notificationSave = useCallback(async () => {
            if (!notificationMountedRef.current) return

            if (notificationAbortControllerRef.current) {
                notificationAbortControllerRef.current.abort()
            }

            notificationAbortControllerRef.current = new AbortController()

            try {
                const saveData = {
                    token: Store.getState().login.token,
                    notifications: notificationInfo,
                    signal: notificationAbortControllerRef.current.signal
                }
                const res = await getData("profile", saveData)
                
                if (notificationMountedRef.current) {
                    console.log('Notifications saved:', res)
                }
            } catch (error: any) {
                if (error.name !== 'AbortError' && notificationMountedRef.current) {
                    console.error('Error saving notifications:', error)
                }
            }
        }, [notificationInfo])

        useEffect(() => {
            notificationMountedRef.current = true

            return () => {
                notificationMountedRef.current = false
                if (notificationAbortControllerRef.current) {
                    notificationAbortControllerRef.current.abort()
                }
                // Сохраняем только если есть изменения
                if (notificationInfo) {
                    notificationSave()
                }
            }
        }, [notificationSave])

        return (
            <div>
                <IonLoading isOpen={load} message="Подождите..."/>
                <div className=""
                    onClick={() => {
                        setPage(0)
                    }}
                >
                    <IonIcon icon={arrowBackOutline} className="ml-1 mt-1 w-15 h-15"/>
                </div>

                <div className="mt-1 ml-1 mr-1 fs-09">
                    <div className="fs-12"> <b>Уведомления</b></div>
                    
                    <div className="flex fl-space">
                        <div className="mt-1">
                            <div>
                                <b>email уведомления</b>
                            </div>
                            <div className="fs-08 cl-gray">
                                Получать уведомления на email
                            </div>
                        </div>

                        <IonToggle mode="ios"
                            checked={notificationInfo.email}
                            onIonChange={(e) => { 
                                setNotificationInfo(prev => ({
                                    ...prev,
                                    email: e.detail.checked
                                }));
                            }}
                        />
                    </div>
                    
                    <div className="flex fl-space">
                        <div className="mt-1">
                            <div>
                                <b>SMS уведомления</b>
                            </div>
                            <div className="fs-08 cl-gray">
                                Получать уведомления на SMS
                            </div>
                        </div>

                        <IonToggle mode="ios"
                            checked={notificationInfo.sms}
                            onIonChange={(e) => { 
                                setNotificationInfo(prev => ({
                                    ...prev,
                                    sms: e.detail.checked
                                }));
                            }}
                        />
                    </div>

                    <div className="flex fl-space">
                        <div className="mt-1">
                            <div>
                                <b>Новые заказы</b>
                            </div>
                            <div className="fs-08 cl-gray">
                                Получать уведомления о новых заказах
                            </div>
                        </div>

                        <IonToggle mode="ios"
                            checked={notificationInfo.orders}
                            onIonChange={(e) => { 
                                setNotificationInfo(prev => ({
                                    ...prev,
                                    orders: e.detail.checked
                                }));
                            }}
                        />
                    </div>

                    <div className="flex fl-space">
                        <div className="mt-1">
                            <div>
                                <b>Маркетинговые уведомления</b>
                            </div>
                            <div className="fs-08 cl-gray">
                                Новости, акции, спецпредложения
                            </div>
                        </div>

                        <IonToggle mode="ios"
                            checked={notificationInfo.market}
                            onIonChange={(e) => { 
                                setNotificationInfo(prev => ({
                                    ...prev,
                                    market: e.detail.checked
                                }));
                            }}
                        />
                    </div>
                </div>  
            </div>
        )
    }
    
    function Orgs_() {
        const [orgInfo, setOrgInfo] = useState<any>(Store.getState().orgs);

        // Refs для управления состоянием
        const orgMountedRef = useRef(true)
        const orgAbortControllerRef = useRef<AbortController | null>(null)
        const orgSubscriptionIdRef = useRef<number | null>(null)

        // Безопасная функция сохранения
        const orgSave = useCallback(async () => {
            if (!orgMountedRef.current) return

            if (orgAbortControllerRef.current) {
                orgAbortControllerRef.current.abort()
            }

            orgAbortControllerRef.current = new AbortController()

            try {
                const saveData = {
                    ...orgInfo,
                    token: Store.getState().login.token,
                    signal: orgAbortControllerRef.current.signal
                }
                const res = await getData("setOrgs", saveData)
                
                if (orgMountedRef.current) {
                    console.log('Organization info saved:', res)
                }
            } catch (error: any) {
                if (error.name !== 'AbortError' && orgMountedRef.current) {
                    console.error('Error saving organization info:', error)
                }
            }
        }, [orgInfo])

        useEffect(() => {
            orgMountedRef.current = true

            // Создаем уникальный ID для подписки
            const subscriptionId = Date.now() + Math.random()
            orgSubscriptionIdRef.current = subscriptionId

            setOrgInfo(Store.getState().orgs)

            // Подписка на изменения orgs
            Store.subscribe({
                num: subscriptionId, 
                type: "orgs", 
                func: () => {
                    if (orgMountedRef.current) {
                        setOrgInfo(Store.getState().orgs)
                    }
                }
            })
           
            return () => {
                orgMountedRef.current = false
                if (orgSubscriptionIdRef.current !== null) {
                    Store.unSubscribe(orgSubscriptionIdRef.current)
                }
                if (orgAbortControllerRef.current) {
                    orgAbortControllerRef.current.abort()
                }
                // Сохраняем только если есть данные для сохранения
                if (orgInfo) {
                    orgSave()
                }
            }
        }, [orgSave])

        return (
            <div>
                <div className=""
                    onClick={() => {
                        setPage(0)
                    }}
                >
                    <IonIcon icon={arrowBackOutline} className="ml-1 mt-1 w-15 h-15"/>
                </div>

                <div className="mt-1 ml-1 mr-1 fs-09">
                    <div className="fs-12"> <b>Информация о компании</b></div>
                    
                    <div className="mt-1">
                        <div>Наименование</div>
                        <div className="c-input ">
                            <IonInput
                                placeholder="Наименование"
                                value={orgInfo?.Наименование}
                                onIonInput={(e) => {
                                    if (orgInfo) {
                                        orgInfo.Наименование = e.detail.value as string;
                                        setOrgInfo({...orgInfo});
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>ИНН</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="ИНН"
                                value={orgInfo?.ИНН}
                                onIonInput={(e) => {
                                    if (orgInfo) {
                                        orgInfo.ИНН = e.detail.value as string;
                                        setOrgInfo({...orgInfo});
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Телефон</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Телефон"
                                value={orgInfo?.Телефон}
                                onIonInput={(e) => {
                                    if (orgInfo) {
                                        orgInfo.Телефон = e.detail.value as string;
                                        setOrgInfo({...orgInfo});
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Адрес</div>
                        <div className="c-input">
                            <IonInput
                                placeholder="Адрес"
                                value={orgInfo?.Адрес}
                                onIonInput={(e) => {
                                    if (orgInfo) {
                                        orgInfo.Адрес = e.detail.value as string;
                                        setOrgInfo({...orgInfo});
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Описание</div>
                        <div className="c-input">
                            <IonTextarea
                                placeholder="Описание"
                                value={orgInfo?.Описание}
                                onIonInput={(e) => {
                                    if (orgInfo) {
                                        orgInfo.Описание = e.detail.value as string;
                                        setOrgInfo({...orgInfo});
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-05">
                        <div>Документы</div>
                    </div>
                </div>
            </div>
        )
    }

    let elem = (
        <div>
            <div className="h-3 bg-2 flex fl-center fs-14">
                <div className="">Мой профиль</div>  
            </div>

            <div className="borders ml-1 mr-1 mt-1">
                <div className="flex fl-space fs-08">
                    <div className="flex">
                        <IonIcon icon={personOutline} className="w-15 h-15"/>
                        <div className="ml-1"> {info?.name} </div>
                    </div>
                    <span> {swap ? "Водитель" : "Заказчик"} </span>
                </div>

                <div className="flex mt-1 fl-space">
                    <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
                        <div className="a-center">
                            <b> {info?.ratings?.orders} </b>
                        </div>
                        <div className="fs-07 a-center mt-05">
                            Выполнено заказов
                        </div>
                    </div>
                    <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
                        <div className="a-center">
                            <b> {info?.ratings?.rate} </b>
                        </div>
                        <div className="fs-07 a-center mt-05">
                            Рейтинг
                        </div>
                    </div>
                    
                    {swap ? (
                        <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
                            <div className="a-center">
                                <b> {info?.ratings?.invoices} </b>
                            </div>
                            <div className="fs-07 a-center mt-05">
                                Заявки
                            </div>
                        </div>
                    ) : (
                        <div className="bg-3 pb-05 pt-05 pl-05 pr-05">
                            <div className="a-center">
                                <b> {info?.ratings?.payd} </b>
                            </div>
                            <div className="fs-07 a-center mt-05">
                                Оплачено
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {swap ? (
                <>
                    <Item info={{ title: "Купить заявки", onClick: () => {} }}/>
                    <Item info={{ title: "Личные данные", onClick: () => { setPage(1) }}}/>
                    <Item info={{ title: "Транспорт", onClick: () => { setPage(2) }}}/>
                    <Item info={{ title: "Безопасность", onClick: () => { setPage(3) }}}/>
                    <Item info={{ title: "Уведомления", onClick: () => { setPage(4) }}}/>
                </>
            ) : (
                <>
                    <Item info={{ title: "Личные данные", onClick: () => { setPage(1) }}}/>
                    <Item info={{ title: "Компания", onClick: () => { setPage(5) }}}/>
                    <Item info={{ title: "Безопасность", onClick: () => { setPage(3) }}}/>
                    <Item info={{ title: "Уведомления", onClick: () => { setPage(4) }}}/>
                </>
            )}

            <div className="p-bottom w-100">
                <IonSegment 
                    value={swap ? "driver" : "customer"}
                    className="w-100"
                    mode="ios"
                    onIonChange={(e) => { 
                        swap = e.detail.value === "driver" ? true : false
                        Store.dispatch({ type: "swap", data: swap })

                        socketService.emit("set_driver", { token: Store.getState().login.token })
                        
                    }}
                >
                    <IonSegmentButton value="customer">
                        <IonLabel>Я заказчик</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="driver">
                        <IonLabel>Я водитель</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                <IonButton
                    className="h-4"
                    expand="block"
                    mode="ios"
                >
                    Готово
                </IonButton>
            </div>
        </div>
    )

    elem = (
        <>
            {page === 0 ? elem
            : page === 1 ? <Personal />
            : page === 2 ? <Transport setPage={ setPage } />
            : page === 3 ? <Password />
            : page === 4 ? <Notifications />
            : page === 5 ? <Orgs setPage={ setPage } />
            : <></>}
        </>
    )

    return elem
}
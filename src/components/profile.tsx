import { useEffect, useRef, useState } from "react"
import { getData, Store } from "./Store"
import { IonButton, IonCard, IonCheckbox, IonChip, IonIcon, IonInput, IonModal } from "@ionic/react"
import './profile.css'
import { addOutline, cameraOutline, trashOutline } from "ionicons/icons"
import { takePicture } from "./Files"
import { createGesture, Gesture } from '@ionic/core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Switch } from "@mui/material"

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    // width: '100%',
    minWidth: 400,
    // margin:'16px',
    bgcolor: 'background.paper',
    // border: '2px solid #000',
    borderRadius: 5,
    boxShadow: 24,
    p: 4,
};


export function Profile() {
    const [info, setInfo] = useState<any>()
    const [upd, setUpd] = useState(0);
    const [typeClient, setTypeClient] = useState('company');

    //companyInputs
    const [innText, setInnText] = useState<string>('');
    const [nameCompanyText, setNameCompanyText] = useState<string>('');

    //companyInputs 
    const [typeTransportText, setTypeTransport] = useState<string>('');
    const [loadCapacityText, setLoadCapacityText] = useState<string>('');

    // Modal
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openModalSettings, setOpenModalSettings] = useState<boolean>(false);
    // WhichDropdown
    const [whichDropDown, setWhichDropDown] = useState<number>(-1);

    const disabledCompany = innText.length == 0 || nameCompanyText.length == 0 ? true : false;
    const disabledCargos = typeTransportText.length == 0 || loadCapacityText.length == 0 ? true : false;

    const regCompanyObj = {
        userId: '1',
        inn: innText,
        nameCompany: nameCompanyText,
    }

    const regCargosObj = {
        userId: '1',
        typeCargos: typeTransportText,
        loadCapacity: loadCapacityText,
    }

    useEffect(() => {

        setInfo(Store.getState().login)

    }, []);


    Store.subscribe({
        num: 301, type: "login", func: () => {
            setInfo(Store.getState().login)
        }
    })

    async function GetPhoto() {
        const res = await takePicture();
        resizeImageBase64(res.dataUrl, 200, 200)
    }

    async function Save(data) {

        data.token = Store.getState().login.token
        const res = await getData("profile", data)

    }


    // default inputs - ionInputs
    // 

    const regCompanyContainer = () => {
        return (
            <div className="p-reg-container">
                <div className="p-reg-container-title">Регистрация юридического лица</div>
                <div className="p-regInput-text">ИНН</div>
                <input className={'p-regInput'} value={innText} onChange={(e) => setInnText(e.target.value)} />
                <div className="p-regInput-text">Название Компании</div>
                <input className={'p-regInput'} value={nameCompanyText} onChange={(e) => setNameCompanyText(e.target.value)} />
                <button className={!disabledCompany ? 'p-regInput-save-button' : 'p-regInput-save-button-disabled'}>
                    Сохранить
                </button>
            </div>
        )
    }

    const regCargosContainer = () => {
        return (
            <div className="p-reg-container">
                <div className="p-reg-container-title">Регистрация Прицепа</div>
                <div className="p-regInput-text">Тип транспорта</div>
                <input className={'p-regInput'} value={typeTransportText} onChange={(e) => setTypeTransport(e.target.value)} />
                <div className="p-regInput-text">Грузоподъемность</div>
                <input className={'p-regInput'} value={loadCapacityText} onChange={(e) => setLoadCapacityText(e.target.value)} />
                <button className={!disabledCargos ? 'p-regInput-save-button' : 'p-regInput-save-button-disabled'}>
                    Сохранить
                </button>
            </div>
        )
    }

    function resizeImageBase64(base64String, maxWidth, maxHeight) {
        // Создаем элемент canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Загружаем изображение из строки Base64
        const img = new Image();
        img.src = base64String;

        // Ждем загрузки изображения
        img.onload = function () {
            // Рассчитываем новые размеры, сохраняя пропорции
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            // Устанавливаем размеры canvas
            canvas.width = width;
            canvas.height = height;

            // Рисуем изображение на canvas
            ctx?.drawImage(img, 0, 0, width, height);

            // Сохраняем изображение в Base64
            const newBase64 = canvas.toDataURL('image/jpeg', 0.9); // Качество 90%

            info.image = { dataUrl: newBase64, format: "jpeg" };
            console.log(info.image)
            setUpd(upd + 1)

            Save({ image: { dataUrl: newBase64, format: "jpeg" } })

        };
    }

    const oldBody = () => {
        return (
            <div className='a-container'>
                <IonCard className="c-card">

                    <div className="flex mr-1">
                        <img src={info?.image?.dataUrl} alt="as" className="p-img" />
                        <div className="ml-1 p-icon">
                            <IonIcon icon={cameraOutline} className="w-4 h-4" color="dark"
                                onClick={() => {
                                    GetPhoto()
                                }}
                            />
                        </div>

                    </div>

                    <div className=" flex pb-1 mt-1">
                        <img src="receipt1.svg" alt="" className="w-2 h-2 ml-1 white-svg" />
                        <div className="ml-1 w-80 mr-1 t-underline">
                            <IonInput
                                placeholder="ФИО"
                                value={info?.dimensions}
                                onIonInput={(e) => {
                                    info.name = e.detail.value as string;
                                }}
                            ></IonInput>
                        </div>
                    </div>
                    <div className=" flex pb-1 mt-1">
                        <img src="receipt1.svg" alt="" className="w-2 h-2 ml-1 white-svg" />
                        <div className="ml-1 w-80 mr-1 t-underline">
                            <IonInput
                                placeholder="ФИО"
                                value={info?.dimensions}
                                onIonInput={(e) => {
                                    info.name = e.detail.value as string;
                                }}
                            ></IonInput>
                        </div>
                    </div>

                    <div className="mt-1">
                        <div className="fs-11">Электронная почта </div>
                        <div className="c-input ml-1 mt-05">
                            <IonInput
                                placeholder="email"
                                value={info?.email}
                                onIonInput={(e) => {
                                    info.email = e.detail.value as string;
                                }}
                            >
                            </IonInput>
                        </div>
                    </div>

                    <div className="mt-1">
                        <div className="fs-11">Пароль </div>
                        <div className="c-input ml-1 mt-05">
                            <IonInput
                                placeholder="Пароль"
                                value={info?.password}
                                type="password"
                                onIonInput={(e) => {
                                    info.password = e.detail.value as string;
                                }}
                            >
                            </IonInput>
                        </div>
                    </div>

                    <div className="mt-1">
                        <div className="fs-11"> Транспорт </div>
                        <div className="pt-1 pb-1 a-right mr-1">
                            <IonCheckbox
                                checked={info?.driver}
                                onIonChange={(e) => {
                                    console.log(e)
                                    info.driver = e.detail.checked
                                }}
                            >
                                Стать водителем
                            </IonCheckbox>
                        </div>
                        <div>

                        </div>
                    </div>
                    <div className="mt-1">
                        <IonButton
                            expand="block"
                            color={"tertiary"}
                            onClick={() => {
                                console.log(info)
                                Save({
                                    name: info.name,
                                    email: info.email,
                                    password: info.password,
                                    driver: info.driver,
                                    tags: info.tags
                                })

                                Store.dispatch({ type: "swap", data: info.driver })
                            }}
                        >
                            Сохранить
                        </IonButton>
                    </div>
                </IonCard>
            </div>
        )
    }

    const buyOrders = () => {
        return (
            <div className='p-settingsContainer'>
                <div className="p-connect-title-container">
                    <div className="p-connects-title-image" />
                    <div className="p-connects-title">Бонусные коннекты</div>
                </div>
                <div>
                    <div className="p-connects-line-container">
                        <div>
                            Выполнено заказов: 5/10
                        </div>
                        <div>
                            +5 коннектов
                        </div>
                    </div>
                    <div className="p-connects-line"/> 
                    <div className="p-connects-line-container">
                        <div>
                            Рейтинг: 4.7/5.0
                        </div>
                        <div>
                            +10 коннектов
                        </div>
                    </div>
                    <div className="p-connects-line"/> 
                    <div className="p-connects-line-container">
                        <div>
                            Приглашено водителей: 0/3
                        </div>
                        <div>
                            +15 коннектов
                        </div>
                    </div>
                    <div className="p-connects-line"/> 
                </div>
                <div className="p-connects-invite-button">
                    Пригласить водителя
                </div>

                <div className="p-connects-rate-title">
                    Расход коннектов:
                </div>
                <div>
                    <div className="p-connects-rate-text">
                        -До 10 000 Р: 1 коннект
                    </div>
                    <div className="p-connects-rate-text">
                        -10 001 - 50 000 Р: 2 коннекта
                    </div>
                    <div className="p-connects-rate-text">
                        -50 001 - 100 000 Р: 3 коннекта
                    </div>
                    <div className="p-connects-rate-text">
                        -100 001 - 200 000 Р: 4 коннекта
                    </div>
                    <div className="p-connects-rate-text">
                        -Свыше 200 000 Р: 5 коннектов
                    </div>
                </div>
                <div className="p-connects-rate-button">
                    Подробнее о системе коннектов
                </div>

                <div className="p-connects-buy-container">
                    <div className="p-connects-title">
                        Пополнение баланса коннектов
                    </div>
                    <div className="p-connects-buy-title-description">
                        Выберите подходящий пакет коннектов или укажите нужное количество
                    </div>
                    <div className="p-roleChoose">
                        <button
                            className={'p-ActiveButton'}
                            // onClick={() => setTypeClient('company')}
                            >
                            Готовые пакеты
                        </button>
                        <button
                            className={'p-Button'}
                            // onClick={() => setTypeClient('cargos')}
                            >
                            Свое количество</button>
                    </div>
                    <div className="p-connects-pack">
                        <div>
                            <div>
                                Стартовый
                            </div>
                            <div>
                                400 Р
                            </div>
                        </div>
                        <div>
                            <div>
                                img
                            </div>
                            <div>
                                20 коннектов
                            </div>
                            <div>
                                20 р за коннект
                            </div>
                        </div>
                    </div>
                    <div className="p-connects-pack">
                        <div>
                            <div>
                                Стандартный
                            </div>
                            <div>
                                <div>1000 Р</div>
                                900 Р
                            </div>
                        </div>
                        <div>
                            <div>
                                img
                            </div>
                            <div>
                                20 коннектов
                            </div>
                            <div>
                                20 р за коннект
                            </div>
                        </div>
                        <div>
                            Скидка 10%
                        </div>
                    </div>
                    <div className="p-connects-pack">
                        <div>
                            <div>
                                Профессиональный
                            </div>
                            <div>
                                <div>2400 Р</div>
                                1800 Р
                            </div>
                        </div>
                        <div>
                            <div>
                                img
                            </div>
                            <div>
                                120 коннектов
                            </div>
                            <div>
                                15 р за коннект
                            </div>
                        </div>
                        <div>
                            Скидка 10%
                        </div>
                    </div>
                </div>
                <div>
                    <select>
                        <option>Центральный ФО</option>
                        <option>Северо-Западный ФО (скидка 5%)</option>
                        <option>Южный ФО (скидка 10%)</option>
                        <option>Северо-Кавказский ФО (скидка 15%)</option>
                        <option>Приволжский ФО (скидка 10%)</option>
                        <option>Уральский ФО (скидка 10%)</option>
                        <option>Сибирский ФО (скидка 15%)</option>
                        <option>Дальневосточный ФО (скидка 20%)</option>
                    </select>
                </div>
            </div>
        )
    }

    const personalInfo = () => {
        return (
            <div className='p-settingsContainer'>
                <div>Личная Информация</div>
                <div>
                    <div className="p-settingsContainer-label-text">Имя</div>
                    <input className={'p-regInput'} placeholder="Иван" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Фамилия</div>
                    <input className={'p-regInput'} placeholder="Петров" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Email</div>
                    <input className={'p-regInput'} placeholder="Ivan.Petr@mail.ru" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Телефон</div>
                    <input className={'p-regInput'} placeholder="+7 (123) 456 - 78 - 99" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">О себе</div>
                    <input className={'p-regInput'} placeholder="Профессиональный водитель с 8-летним опытом перевозки негабаритных грузов. Специализируюсь на промышленном оборудовании и металлоконструкциях." />
                </div>
            </div>
        )
    }
    const vehicleInfo = () => {
        return (
            <div className='p-settingsContainer'>
                <div>Информация о транспорте</div>
                <div>
                    <div className="p-settingsContainer-label-text">Тип транспорта</div>
                    <input className={'p-regInput'} placeholder="Volvo" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Грузоподъемность (т)</div>
                    <input className={'p-regInput'} placeholder="20 тонн" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Год выпуска</div>
                    <input className={'p-regInput'} placeholder="2020" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Гос. номер</div>
                    <input className={'p-regInput'} placeholder="Ф123 БВ 14" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Опыт вождения</div>
                    <input className={'p-regInput'} placeholder="10 лет" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Документы</div>
                    {/* <input className={'p-regInput'} /> */}
                </div>
            </div>
        )
    }
    const securityInfo = () => {
        return (
            <div className='p-settingsContainer'>
                <div>Безопасность</div>
                <div>
                    <div className="p-settingsContainer-label-text">Текущий пароль</div>
                    <input className={'p-regInput'} placeholder="Иван" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Новый пароль</div>
                    <input className={'p-regInput'} placeholder="Петров" />
                </div>
                <div>
                    <div className="p-settingsContainer-label-text">Подтверждение пароля</div>
                    <input className={'p-regInput'} placeholder="Ivan.Petr@mail.ru" />
                </div>
            </div>
        )
    }
    const notificationInfo = () => {
        return (
            <div className='p-settingsContainer'>
                <div>Настройки уведомлений</div>
                <div className="p-settingsContainer-flex-row">
                    <div>
                        <div className="p-settingsContainer-label-text">Emial-уведомления</div>
                        <div className="p-settingsContainer-label-description">Получать уведомления на email</div>
                    </div>
                    <div>
                        <Switch
                        // disabled defaultChecked
                        />
                    </div>
                </div>
                <div className="p-settingsContainer-flex-row">
                    <div>
                        <div className="p-settingsContainer-label-text">SMS-уведомления</div>
                        <div className="p-settingsContainer-label-description">Получать уведомления по SMS</div>
                    </div>
                    <div>
                        <Switch
                        // disabled defaultChecked
                        />
                    </div>
                </div>
                <div className="p-settingsContainer-flex-row">
                    <div>
                        <div className="p-settingsContainer-label-text">Новые заказы</div>
                        <div className="p-settingsContainer-label-description">Уведомления о новых заказах, соответствующих вашим критериям</div>
                    </div>
                    <div>
                        <Switch
                        // disabled defaultChecked
                        />
                    </div>
                </div>
                <div className="p-settingsContainer-flex-row">
                    <div>
                        <div className="p-settingsContainer-label-text">Маркетинговые уведомления</div>
                        <div className="p-settingsContainer-label-description">Новости, акции и специальные предложения</div>
                    </div>
                    <div>
                        <Switch
                        // disabled defaultChecked
                        />
                    </div>
                </div>
            </div>
        )
    }


    const body = () => {
        if (!info) {
            return
        }

        const dropdownItems = typeClient == 'cargos' ? [
            {
                id: 0,
                text: 'Купить заявки'
            },
            {
                id: 1,
                text: 'Личные данные'
            },
            {
                id: 2,
                text: 'Транспорт'
            },
            {
                id: 3,
                text: 'Безопасность'
            },
            {
                id: 4,
                text: 'Уведомления'
            },
            {
                id: 5,
                text: 'Регистрация Прицепа'
            },
        ] : [
            {
                id: 100,
                text: 'Личные данные'
            },
            {
                id: 101,
                text: 'Компания'
            },
            {
                id: 102,
                text: 'Безопасность'
            },
            {
                id: 103,
                text: 'Уведомления'
            },
            {
                id: 104,
                text: 'Регистрация юридического лица'
            }
        ]

        return (
            <div className='a-container' style={{ background: 'white', padding: 12, color: 'black' }}>
                <div className="p-topBar">
                    <div className="p-topBar-text">Мой профиль</div>
                </div>
                <div>
                    <div className="p-container">
                        <div className="p-container-flex">
                            <div className="p-container-flex">
                                <img src='profileImg.jpeg' width={40} height={40} />
                                <div>
                                    <div className="p-container-Name"></div>
                                    <div className="p-container-Name">Фамилия</div>
                                </div>
                            </div>
                            <div>
                                <div className="p-container-Name">Водитель</div>
                            </div>
                        </div>
                        <div className="p-StatCard-container-flex">
                            <div className="p-StatCard">
                                <div className="p-StatCard-title">124</div>
                                <div className="p-StatCard-text">Выполнено заказов</div>
                            </div>
                            <div className="p-StatCard">
                                <div className="p-StatCard-title">4,9</div>
                                <div className="p-StatCard-text">Рейтинг</div>
                            </div>
                            <div className="p-StatCard">
                                <div className="p-StatCard-title">15</div>
                                <div className="p-StatCard-text">Заявки</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-container-dropdown">
                        {dropdownItems.map((l: any) => {
                            return (
                                <div className="p-container-dropdown-item" onClick={() => { setWhichDropDown(l.id); setOpenModalSettings(true) }}>
                                    <div>{l.text}</div>
                                    <div><img src='chevron-down.svg' /></div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="p-roleChoose">
                        <button
                            className={typeClient == 'company' ? 'p-ActiveButton' : 'p-Button'}
                            onClick={() => setTypeClient('company')}>
                            Я заказчик
                        </button>
                        <button
                            className={typeClient == 'cargos' ? 'p-ActiveButton' : 'p-Button'}
                            onClick={() => setTypeClient('cargos')}>
                            Я водитель</button>
                    </div>
                </div>

                <div className="p-BottomBar">
                    <div className="p-BottomBar-text">Готово</div>
                </div>
                <Modal
                    open={openModalSettings}
                    onClose={() => setOpenModalSettings(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={modalStyle}>
                        {whichDropDown === 0 && buyOrders()}
                        {whichDropDown === 1 && personalInfo()}
                        {whichDropDown === 2 && vehicleInfo()}
                        {whichDropDown === 3 && securityInfo()}
                        {whichDropDown === 4 && notificationInfo()}
                        {whichDropDown === 5 && regCargosContainer()}
                        {whichDropDown === 104 && regCompanyContainer()}
                        {/* regCompanyContainer() */}
                    </Box>
                </Modal>
                {/* <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={modalStyle}>
                    </Box>
                </Modal> */}
            </div>
        )
    }

    return body();
}
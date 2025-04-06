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

    const body = () => {
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
                                    <div className="p-container-Name">{info.name}</div>
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
                        <div className="p-container-dropdown-item" onClick={()=>setWhichDropDown(0)}>
                            <div>Купить заявки</div>
                            <div><img src='chevron-down.svg' /></div>
                        </div>
                        <div className={whichDropDown == 0 ? 'p-container-hidden-item-active' : "p-container-hidden-item"}>
                            testText
                        </div>
                        <div className="p-container-dropdown-item" onClick={()=>setWhichDropDown(1)}>
                            <div>Личные данные</div>
                            <div><img src='chevron-down.svg' /></div>
                        </div>
                        <div className={whichDropDown == 1 ? 'p-container-hidden-item-active' : "p-container-hidden-item"}>
                            testText
                        </div>
                        <div className="p-container-dropdown-item" onClick={()=>setWhichDropDown(2)}>
                            <div>Транспорт</div>
                            <div><img src='chevron-down.svg' /></div>
                        </div>
                        <div className={whichDropDown == 2 ? 'p-container-hidden-item-active' : "p-container-hidden-item"}>
                            testText
                        </div>
                        <div className="p-container-dropdown-item" onClick={()=>setWhichDropDown(3)}>
                            <div>Безопасность</div>
                            <div><img src='chevron-down.svg' /></div>
                        </div>
                        <div className={whichDropDown == 3 ? 'p-container-hidden-item-active' : "p-container-hidden-item"}>
                            testText
                        </div>
                        <div className="p-container-dropdown-item" onClick={()=>setWhichDropDown(4)}>
                            <div>Уведомления</div>
                            <div><img src='chevron-down.svg' /></div>
                        </div>
                        <div className={whichDropDown == 4 ? 'p-container-hidden-item-active' : "p-container-hidden-item"}>
                            testText
                        </div>
                    </div>



                    {/* <div className="p-roleChooseText">
                    Настройте аккаунт для доступа<br />
                    к платформе грузоперевозок
                </div> */}
                    <div className="p-roleChoose">
                        <button
                            className={typeClient == 'company' ? 'p-ActiveButton' : 'p-Button'}
                            onClick={() => { setTypeClient('company'); setOpenModal(true) }}>
                            Я заказчик
                        </button>
                        <button
                            className={typeClient == 'cargos' ? 'p-ActiveButton' : 'p-Button'}
                            onClick={() => { setTypeClient('cargos'); setOpenModal(true) }}>
                            Я водитель</button>
                    </div>
                </div>

                <div className="p-BottomBar">
                    <div className="p-BottomBar-text">Готово</div>
                </div>
                <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={modalStyle}>
                        {/* <Typography id="modal-modal-title" variant="h6" component="h2">
                            Text in a modal
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        </Typography> */}
                        {typeClient == 'company' ? regCompanyContainer() : null}
                        {typeClient == 'cargos' ? regCargosContainer() : null}
                    </Box>
                </Modal>
            </div>
        )
    }

    return body();
}
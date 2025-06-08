import { useMemo, useState } from "react";
import { CargoBody, CargoInfo } from "./CargoBody";
import { getData, Store } from "./Store";
import { IonIcon, IonLoading } from "@ionic/react";
import { arrowBackOutline, cloudUploadOutline, trashBinOutline } from "ionicons/icons";
import socketService from "./Sockets";

interface CargoServiceProps {
    mode: 'create' | 'edit';
    info?: CargoInfo;
    setPage: (page: any) => void;
    setUpd?: () => void;
}


export function CargoService({ mode, info: initialInfo, setPage, setUpd }: CargoServiceProps) {
    const [load, setLoad] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Создаем или используем существующую информацию
    const info = useMemo(() => {
        if (mode === 'create') {
            return {
                token:          Store.getState().login.token,
                guid:           "",
                name:           "",
                description:    "",
                address: {
                    city:       "",
                    date:       "",
                    address:    "",
                },
                destiny: {
                    city:       "",
                    date:       "",
                    address:    "",
                },
                weight:         0.000,
                volume:         0.000,
                price:          0.00,
                phone:          "",
                face:           "",
                status:         "",
            };
        }
        return { ...initialInfo, token: Store.getState().login.token };
    }, [mode, initialInfo]);

    // Валидация формы
    const validateForm = (info: any): string[] => {
        const errors: string[] = [];
        if (!info.name.trim()) errors.push("Название обязательно");
        if (!info.address.city.trim()) errors.push("Город отправления обязателен");
        if (!info.destiny.city.trim()) errors.push("Город назначения обязателен");
        if (info.price <= 0) errors.push("Цена должна быть больше 0");
        if (info.weight <= 0) errors.push("Вес должен быть больше 0");
        return errors;
    };

    // Обработчики событий
    const handleSave = async () => {
        const errors = validateForm(info);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }
        setValidationErrors([]);
        setLoad(true);
        try {

            socketService.emit("saveCargo", info )
            console.log("emit save")

            setPage( 0 )

        } finally {
            setLoad(false);
        }
    };


    const handleDelete = async () => {
        // Логика удаления
    };

    
    const handleBack = () => {
        if (mode === 'create') {
            setPage(0);
        } else {
            setPage({ ...info, type: "open" });
            setUpd?.();
        }
    };

    return (
        <>
            <IonLoading isOpen={load} message={"Подождите..."} />
            
            {/* Header */}
            <div className="flex ml-05 mt-05">
                <IonIcon icon={ arrowBackOutline } className="w-15 h-15" onClick={handleBack} />
                <div className="a-center w-90 fs-09">
                    <b>{mode === 'create' ? 'Создать новый заказ' : 'Редактировать заказ'}</b>
                </div>
            </div>

            {/* Ошибки валидации */}
            {validationErrors.length > 0 && (
                <div className="cr-card mt-05" style={{backgroundColor: '#ffe6e6'}}>
                    <div className="fs-09" style={{color: '#d32f2f'}}>
                        <b>Ошибки валидации:</b>
                        <ul>
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Форма */}
            <CargoBody info={info} mode="edit" />

            {/* Кнопки действий */}
            <div className="flex mt-05">
                <div className="cr-card flex w-50" onClick={handleSave}>
                    <IonIcon icon={ cloudUploadOutline } className="w-15 h-15" color="success" />
                    <b className="fs-09 ml-1">Сохранить</b>
                </div>
                {mode === 'edit' && (
                    <div className="cr-card flex w-50" onClick={handleDelete}>
                        <IonIcon icon={ trashBinOutline } className="w-15 h-15" color="danger" />
                        <b className="fs-09 ml-1">Удалить</b>
                    </div>
                )}
            </div>
        </>
    );
}

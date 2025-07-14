import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonLoading } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import Select from "react-tailwindcss-select";
import { WorkInfo, CreateOfferData, DriverTransport } from '../types';
import { Store } from '../../Store';
import socketService from '../../Sockets';
import { workFormatters } from '../utils';
import './WorkOffer.css';

interface SelectOption {
    value: string;
    label: string;
}

interface WorkOfferProps {
    work: WorkInfo;
    onBack: () => void;
}

export const WorkOffer: React.FC<WorkOfferProps> = ({ work, onBack }) => {
    const [formData, setFormData] = useState<CreateOfferData>({
        workId: work.guid,
        transportId: "",
        price: work.price,
        weight: work.weight,
        comment: ""
    });
    
    const [selectedTransport, setSelectedTransport] = useState<SelectOption>({ 
        value: "Выберите..", 
        label: "Выберите.." 
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Формируем опции транспорта
    const transportOptions: SelectOption[] = Store.getState().transport.map((elem: DriverTransport) => ({
        value: elem.guid,
        label: elem.name
    }));

    useEffect(() => {
        const socket = socketService.getSocket();
        
        const handleOffer = (data: any) => {
            setLoading(false);
            if (data.success) {
                onBack();
            } else {
                setError("Ошибка при отправке предложения");
            }
        };

        if (socket) {
            socket.on("set_offer", handleOffer);
        }

        return () => {
            if (socket) {
                socket.off("set_offer", handleOffer);
            }
        };
    }, [onBack]);

    const handleSubmit = () => {
        // Валидация
        if (selectedTransport.value === "Выберите..") {
            setError("Выберите транспорт");
            return;
        }
        
        if (!formData.price || formData.price <= 0) {
            setError("Укажите корректную цену");
            return;
        }
        
        if (!formData.weight || formData.weight <= 0) {
            setError("Укажите корректный вес");
            return;
        }

        setError("");
        setLoading(true);

        // Формируем данные для отправки
        const offerData = {
            token: Store.getState().login.token,
            guid: work.cargo,
            recipient: work.recipient,
            price: formData.price,
            weight: formData.weight,
            volume: work.volume,
            transport: selectedTransport.value,
            comment: formData.comment
        };

        const socket = socketService.getSocket();
        if (socket) {
            console.log( offerData )
            socket.emit("set_offer", offerData);
        } else {
            setLoading(false);
            setError("Ошибка подключения");
        }
    };

    const handleReset = () => {
        setFormData({
            workId: work.guid,
            transportId: "",
            price: work.price,
            weight: work.weight,
            comment: ""
        });
        setSelectedTransport({ value: "Выберите..", label: "Выберите.." });
        setError("");
    };

    const hasChanges = () => {
        return selectedTransport.value !== "Выберите.." ||
               formData.price !== work.price ||
               formData.weight !== work.weight ||
               formData.comment !== "";
    };

    return (
        <div className="work-offer-info">
            <IonIcon 
                icon={arrowBackOutline} 
                className="back-icon" 
                onClick={onBack}
            />
            
            <div className="content">
                <div className="title"><b>Создание предложения</b></div>
                
                {/* Информация о работе */}
                <div className="work-info-section">
                    <div className="work-info-item">
                        <span className="work-info-label">Маршрут:</span>
                        <span className="work-info-value">
                            {work.address?.city} → {work.destiny?.city}
                        </span>
                    </div>
                    <div className="work-info-item">
                        <span className="work-info-label">Груз:</span>
                        <span className="work-info-value">{work.name}</span>
                    </div>
                    <div className="work-info-item">
                        <span className="work-info-label">Вес/Объем:</span>
                        <span className="work-info-value">
                            {workFormatters.weight(work.weight)} / {workFormatters.volume(work.volume)}
                        </span>
                    </div>
                    <div className="work-info-item">
                        <span className="work-info-label">Цена заказчика:</span>
                        <span className="work-info-value">
                            {workFormatters.currency(work.price)}
                        </span>
                    </div>
                </div>

                {/* Форма предложения */}
                <div className="field">
                    <div className="label">Выберите транспорт</div>
                    <div className="transport-select">
                        <Select
                            value={selectedTransport}
                            onChange={(value: any) => {
                                setSelectedTransport(value || { value: "Выберите..", label: "Выберите.." });
                                setFormData({...formData, transportId: value?.value || ""});
                            }}
                            options={transportOptions}
                            primaryColor={"blue"}
                            classNames={{
                                menuButton: () => "flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none bg-white hover:border-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/20",
                                menu: "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
                                listItem: () => "list-none py-1.5 px-2 hover:bg-blue-500 hover:text-white"
                            }}
                        />
                    </div>
                </div>

                <div className="field">
                    <div className="label">Ваша цена (₽)</div>
                    <div className="offer-input-wrapper">
                        <input
                            type="number"
                            className="custom-text-input"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                            placeholder="Введите цену"
                        />
                    </div>
                </div>

                <div className="field">
                    <div className="label">Вес (тонн)</div>
                    <div className="offer-input-wrapper">
                        <input
                            type="number"
                            className="custom-text-input"
                            value={formData.weight}
                            onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                            placeholder="Введите вес"
                            step="0.1"
                        />
                    </div>
                </div>

                <div className="field">
                    <div className="label">Комментарий (необязательно)</div>
                    <div className="offer-input-wrapper">
                        <textarea
                            className="custom-textarea"
                            value={formData.comment}
                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                            placeholder="Дополнительная информация..."
                            rows={4}
                        />
                    </div>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div className="buttons">
                    <IonButton
                        onClick={handleSubmit}
                        disabled={!hasChanges() || loading}
                    >
                        Отправить предложение
                    </IonButton>
                    <IonButton
                        fill="outline"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Сбросить
                    </IonButton>
                </div>
            </div>

            <IonLoading
                isOpen={loading}
                message="Отправка предложения..."
            />
        </div>
    );
};
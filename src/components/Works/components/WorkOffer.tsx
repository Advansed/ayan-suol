import React, { useState, useEffect } from 'react';
import { IonButton, IonInput, IonLabel, IonLoading, IonTextarea } from '@ionic/react';
import Select from "react-tailwindcss-select";
import { WorkInfo, CreateOfferData, DriverTransport } from '../types';
import { Store } from '../../Store';
import socketService from '../../Sockets';
import { SelectValue } from 'react-tailwindcss-select/dist/components/type';

// Тип для опций селекта
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
        // Формируем данные для отправки
        const offerData = {
            token: Store.getState().login.token,
            guid: work.cargo,        // ID груза
            recipient: work.recipient,
            price: formData.price,
            transport: selectedTransport,
            weight: formData.weight,
            comment: formData.comment
        };
        
        socketService.emit("set_offer", offerData);
        setLoading(true);
    };

    const handleTransportChange = ( option ) => {
        if (option) {

            setSelectedTransport( option );
            setFormData({...formData, transportId: option.value});
        }
    };

    return (
        <>
            <IonLoading isOpen={loading} message="Подождите..." />
            
            <div className='cr-card ml-1 mt-1'>
                <div className="fs-09"><b>Ваше предложение</b></div>
                
                {/* Выбор транспорта */}
                <div className="fs-08 mt-1">Выбрать машину</div>
                <div className="c-input mt-05 fs-08">
                    <Select 
                        options={transportOptions} 
                        value={selectedTransport} 
                        primaryColor="red" 
                        onChange={ handleTransportChange }
                        classNames={{
                            listItem: () => "sbl-item"
                        }}
                    />
                </div>
                
                {/* Вес */}
                <div className="fs-08 mt-1">Вес который готовы забрать(т)</div>
                <div className="c-input mt-05">
                    <IonInput
                        className="custom-input"
                        value={formData.weight}
                        type="number"
                        onIonInput={(e) => {
                            setFormData({...formData, weight: parseFloat(e.detail.value as string) || 0});
                        }}
                    />
                </div>
                
                {/* Цена */}
                <div className="fs-08 mt-1">Предлагаемая цена (₽)</div>
                <div className="c-input mt-05">
                    <IonInput
                        className="custom-input"
                        value={formData.price}
                        type="number"
                        onIonInput={(e) => {
                            setFormData({...formData, price: parseFloat(e.detail.value as string) || 0});
                        }}
                    />
                </div>
                
                {/* Комментарий */}
                <div className="fs-08 mt-1">Комментарий к предложению</div>
                <div className="c-input mt-05">
                    <IonTextarea
                        className="custom-input pt-05 pb-05 pl-05 pr-05"
                        value={formData.comment}
                        onIonInput={(e) => {
                            setFormData({...formData, comment: e.detail.value as string});
                        }}
                    />
                </div>
                
                {/* Кнопки */}
                <div className='flex mt-05'>
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="clear"
                        color="primary"
                        onClick={onBack}
                    >
                        <IonLabel className="fs-08">Вернуться</IonLabel>
                    </IonButton>
                    
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={!formData.transportId || formData.transportId === "Выберите.."}
                    >
                        <IonLabel className="fs-08">Предложить</IonLabel>
                    </IonButton>
                </div>
            </div>
        </>
    );
};
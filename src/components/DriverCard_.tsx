import { IonButton, IonCheckbox, IonIcon } from "@ionic/react";
import { Store } from "./Store";
import { chatboxEllipsesOutline, personCircleOutline } from "ionicons/icons";
import styles from './DriverCard.module.css';
import "./Cargos.css";
import socketService from "./Sockets";
import { useState } from "react";
import { Rating } from "./Rating";
import { useHistory } from "react-router";


export interface DriverInfo {
    guid: string;
    cargo: string;
    recipient: string;
    client: string;
    weight: number;
    status: 'Заказано' | 'Принято' | 'Доставлено' | 'Отказано';
    transport: string;
    capacity: string;
    rating: number;
    ratingCount: number;
    rate:      number; 
    comment?: string;
    price: number;
    accepted?: boolean;
}

interface DriverCardProps {
    info: DriverInfo;
    mode: 'offered' | 'assigned' | 'delivered' | 'completed';
    setPage?: (page: any) => void;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'RUB' 
    }).format(amount).replace('₽', '₽ ');
}

export const DriverCard1 = ({ info, mode, setPage }: DriverCardProps) => {

    const hist = useHistory()
    
    const handleChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        hist.push("tab2/" + info.recipient + ':' + info.cargo + ':' + info.client)
    };

    const handleAccept = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            
            socketService.emit('set_inv', {
                token:      Store.getState().login.token,
                recipient:  info.recipient,
                id:         info.guid,
                status:     "Принято"
            });

        } catch (error) {

            console.error("Ошибка при принятии заказа:", error);

        }
    };

    const handleReject = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            
            socketService.emit('completed', {
                token:      Store.getState().login.token,
                id:         info.guid
            });

        } catch (error) {

            console.error("Ошибка при принятии заказа:", error);

        }
    };

    const shouldShowAcceptButton = mode === 'offered' && !info.accepted;
    const shouldShowCompleteButton = mode === 'completed' && !info.accepted;

    return (
        <div className="cr-card mt-1">
            {/* Информация о водителе */}
            <div className="flex fl-space">
                <div className="flex">
                    <IonIcon icon={ personCircleOutline } color="primary" className="w-2 h-2"/>
                    <div className="fs-09 ml-05">
                        <div><b>{info.client}</b></div>
                        <div>⭐ {info.rating}</div>
                    </div>
                </div>
                <div className="fs-09 cl-prim">
                    <div><b>{formatCurrency(info.price)}</b></div>
                    <div className="cl-black fs-08">
                        <b>{info.weight + ' тонн'}</b>
                    </div>                
                </div>
            </div>

            {/* Детали транспорта */}
            <div className={styles.driverInfoRow}>
                🚚 <span className={styles.driverLabel}>&nbsp;Транспорт:</span>&nbsp;{info.transport}
            </div>
            <div className={styles.driverInfoRow}>
                ⚖️ <span className={styles.driverLabel}>&nbsp;Грузоподъёмность:</span>&nbsp;{info.capacity}
            </div>
            <div className={styles.driverInfoRow}>
                📦 <span className={styles.driverLabel}>&nbsp;Выполнено заказов:</span>&nbsp;{info.ratingCount}
            </div>

            {/* Комментарий */}
            <div className={styles.driverComment}>
                <b>Комментарий водителя:</b><br />
                {info.comment || 'Без комментариев'}
            </div>

            {/* Кнопки действий */}
            <div className={styles.flexContainer}>

                <IonButton
                    className="w-50 cr-button-2"
                    mode="ios"
                    fill="clear"
                    color="primary"
                    onClick={handleChat}
                >
                    <IonIcon icon={ chatboxEllipsesOutline } className="w-06 h-06"/>
                    <span className="ml-1 fs-08">Чат</span>
                </IonButton>

                <IonButton
                    className="w-50 cr-button-1"
                    mode="ios"
                    color="primary"
                    onClick={handleAccept}
                >
                    <span className="ml-1 fs-08">Выбрать</span>
                </IonButton>

                <IonButton
                    className="w-50 cr-button-1"
                    mode="ios"
                    color="warning"
                    onClick={handleReject}
                >
                    <span className="ml-1 fs-08">Отказать</span>
                </IonButton>

            </div>

        </div>
    );
};

export const DriverCard2 = ({ info, mode, setPage }: DriverCardProps) => {
    
    const handleChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (setPage) {
            setPage({ ...info, type: "chat" });
        }
    };

    const handleReject = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            
            socketService.emit('completed', {
                token:      Store.getState().login.token,
                id:         info.guid
            });

        } catch (error) {

            console.error("Ошибка при принятии заказа:", error);

        }
    };

    const shouldShowAcceptButton = mode === 'offered' && !info.accepted;
    const shouldShowCompleteButton = mode === 'completed' && !info.accepted;

    return (
        <div className="cr-card mt-1">
            {/* Информация о водителе */}
            <div className="flex fl-space">
                <div className="flex">
                    <IonIcon icon={ personCircleOutline } color="primary" className="w-2 h-2"/>
                    <div className="fs-09 ml-05">
                        <div><b>{info.client}</b></div>
                        <div>⭐ {info.rating}</div>
                    </div>
                </div>
                <div className="fs-09 cl-prim">
                    <div><b>{formatCurrency(info.price)}</b></div>
                </div>
            </div>

            {/* Детали транспорта */}
            <div className={styles.driverInfoRow}>
                🚚 <span className={styles.driverLabel}>&nbsp;Транспорт:</span>&nbsp;{info.transport}
            </div>
            <div className={styles.driverInfoRow}>
                ⚖️ <span className={styles.driverLabel}>&nbsp;Взято груза :</span>&nbsp;{info.weight + ' тонн' }
            </div>


            {/* Кнопки действий */}
            <div className={styles.flexContainer}>

                <IonButton
                    className="w-50 cr-button-2"
                    mode="ios"
                    fill="clear"
                    color="primary"
                    onClick={handleChat}
                >
                    <IonIcon icon={ chatboxEllipsesOutline } className="w-06 h-06"/>
                    <span className="ml-1 fs-08">Чат</span>
                </IonButton>

                <IonButton
                    className="w-50 cr-button-1"
                    mode="ios"
                    color="warning"
                    onClick={handleReject}
                >
                    <span className="ml-1 fs-08">Отказать</span>
                </IonButton>

            </div>
        </div>
    );
};

export const DriverCard3 = ({ info, mode, setPage }: DriverCardProps) => {
    // Состояние чекбоксов
    const [checkboxes, setCheckboxes] = useState({
        delivered: false,      // Груз доставлен в целости и сохранности
        documents: false       // Все документы подписаны
    });

    // Состояние рейтинга
    const [rating, setRating] = useState(0);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB' 
        }).format(amount).replace('₽', '₽ ');
    };

    const handleReject = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            socketService.emit('completed', {
                token:          Store.getState().login.token,
                id:             info.guid,
                recipient:      info.recipient,
                rating:         rating, // Отправляем рейтинг
                tasks:          checkboxes // Отправляем состояние задач
            });
        } catch (error) {
            console.error("Ошибка при принятии заказа:", error);
        }
    };

    const handleCheckboxChange = (key: keyof typeof checkboxes, checked: boolean) => {
        setCheckboxes(prev => ({
            ...prev,
            [key]: checked
        }));
    };

    // Проверяем, все ли чекбоксы отмечены и установлен рейтинг
    const allTasksCompleted = Object.values(checkboxes).every(value => value) && rating > 0;

    return (
        <div className="cr-card mt-1">
            {/* Заголовок */}

            {/* Информация о водителе */}
            <div className="flex fl-space mb-1">
                <div className="flex">
                    <IonIcon icon={personCircleOutline} color="primary" className="w-2 h-2"/>
                    <div className="fs-09 ml-05">
                        <div><b>{(info.client)}</b></div>
                        <div className="flex">
                            <span>⭐ {info.rating}</span>
                            {/* <span className="ml-1 fs-08 cl-gray">({info.reviewsCount || 12} отзывов)</span> */}
                        </div>
                    </div>
                </div>
                <div className="fs-09 cl-prim">
                    <div><b>{formatCurrency(info.price)}</b></div>
                </div>
            </div>

            {/* Детали транспорта */}
            <div className="flex mb-05 fs-08">
                <span>🚚</span>
                <span className="ml-05"><b>Транспорт:</b> {info.transport}</span>
            </div>
            <div className="flex mb-1 fs-08">
                <span>⚖️</span>
                <span className="ml-05"><b>Вес груза:</b> {info.weight} тонн</span>
            </div>

            {/* Чекбоксы задач */}
            <div className="mt-1 mb-1">

                {/* Груз доставлен в целости и сохранности */}
                <div className="flex mb-05">
                    <IonCheckbox
                        checked={checkboxes.delivered}
                        onIonChange={(e) => handleCheckboxChange('delivered', e.detail.checked)}
                        className="mr-05"
                    />
                    <div className="fs-08">
                        <div>Груз доставлен в целости и сохранности</div>
                        <div className="fs-07 cl-gray">
                            Отсутствуют видимые повреждения, которые могли возникнуть при транспортировке
                        </div>
                    </div>
                </div>

                {/* Все документы подписаны */}
                <div className="flex mb-1">
                    <IonCheckbox
                        checked={checkboxes.documents}
                        onIonChange={(e) => handleCheckboxChange('documents', e.detail.checked)}
                        className="mr-05"
                    />
                    <div className="fs-08">
                        <div>Все документы подписаны</div>
                        <div className="fs-07 cl-gray">
                            Товарно-транспортная накладная и акт приема-передачи подписаны заказчиком
                        </div>
                    </div>
                </div>
            </div>

            {/* Оценка качества услуг */}
            <div className="mt-1 mb-1">
                <Rating 
                    value={rating}
                    onChange={setRating}
                    label="Оцените качество услуг"
                    size="medium"
                    showText={true}
                />
            </div>

            {/* Кнопки действий */}
            <div className="mt-1">
            
                <IonButton
                    mode="ios"
                    color="primary"
                    expand="block"
                    disabled={!allTasksCompleted}
                    onClick={handleReject}
                    style={{
                        '--background': allTasksCompleted ? '' : '#e0e0e0',
                        '--color': allTasksCompleted ? '' : '#999'
                    }}
                >
                    <span className="fs-08">Подтвердить выполнение заказа</span>
                </IonButton>
            </div>
        </div>
    );
};

export const DriverCard4 = ({ info, mode, setPage }: DriverCardProps) => {
    
    const handleChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (setPage) {
            setPage({ ...info, type: "chat" });
        }
    };

    return (
        <div className="cr-card mt-1">
            {/* Информация о водителе */}
            <div className="flex fl-space">
                <div className="flex">
                    <IonIcon icon={ personCircleOutline } color="primary" className="w-2 h-2"/>
                    <div className="fs-09 ml-05">
                        <div><b>{info.client}</b></div>
                        <div>⭐ {info.rating}</div>
                    </div>
                </div>
                <div className="fs-09 cl-prim">
                    <div><b>{formatCurrency(info.price)}</b></div>
                </div>
            </div>

            {/* Детали транспорта */}
            <div className={styles.driverInfoRow}>
                🚚 <span className={styles.driverLabel}>&nbsp;Транспорт:</span>&nbsp;{info.transport}
            </div>
            <div className={styles.driverInfoRow}>
                ⚖️ <span className={styles.driverLabel}>&nbsp;Доставлено :</span>&nbsp;{info.weight + ' тонн' }
            </div>


            {/* Кнопки действий */}
            <div className={styles.flexContainer}>

                <IonButton
                    className="w-50 cr-button-2"
                    mode="ios"
                    fill="clear"
                    color="primary"
                    onClick={handleChat}
                >
                    <IonIcon icon={ chatboxEllipsesOutline } className="w-06 h-06"/>
                    <span className="ml-1 fs-08">Чат</span>
                </IonButton>

            </div>
        </div>
    );
};

// 4. ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ СЕКЦИЙ
export const InvoiceSection = ({ title, invoices, mode, setPage }: {
    title: string;
    invoices: DriverInfo[];
    mode: 'offered' | 'assigned' | 'delivered' | 'completed';
    setPage?: (page: any) => void;
}) => {
    if (invoices.length === 0) return null;

    return (
        <>
        {
            mode === 'offered'
                ? <>
                    <div className="ml-1 mt-1">
                        <b><strong>{title} ({invoices.length})</strong></b>
                    </div>
                    {invoices.map((invoice, index) => (
                        <DriverCard1 
                            key={invoice.guid || index}
                            info={invoice} 
                            mode={mode} 
                            setPage={setPage} 
                        />
                    ))}
                </>
            : mode === 'assigned' 
                ? <>
                    <div className="ml-1 mt-1">
                        <b><strong>{title} ({invoices.length})</strong></b>
                    </div>
                    {invoices.map((invoice, index) => (
                        <DriverCard2
                            key={invoice.guid || index}
                            info={invoice} 
                            mode={mode} 
                            setPage={setPage} 
                        />
                    ))}
                </>
            : mode === 'delivered'
                ? <>
                    <div className="ml-1 mt-1">
                        <b><strong>{title} ({invoices.length})</strong></b>
                    </div>
                    {invoices.map((invoice, index) => (
                        <DriverCard3
                            key={invoice.guid || index}
                            info={invoice} 
                            mode={mode} 
                            setPage={setPage} 
                        />
                    ))}
                </>
                : <>
                    <div className="ml-1 mt-1">
                        <b><strong>{title} ({invoices.length})</strong></b>
                    </div>
                    {invoices.map((invoice, index) => (
                        <DriverCard4
                            key={invoice.guid || index}
                            info={invoice} 
                            mode={mode} 
                            setPage={setPage} 
                        />
                    ))}
                </>
        }
        </>
    );
};

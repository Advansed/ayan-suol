import { IonButton, IonIcon } from "@ionic/react";
import { exec, getData, Store } from "./Store";
import { chatboxEllipsesOutline, personCircleOutline } from "ionicons/icons";
import styles from './DriverCard.module.css';
import "./Cargos.css";


export interface DriverInfo {
    guid: string;
    cargo: string;
    client: string;
    weight: number;
    status: 'Заказано' | 'Принято' | 'Доставлено' | 'Отказано';
    transport: string;
    capacity: string;
    rating: number;
    ratingCount: number;
    comment?: string;
    price: number;
    accepted?: boolean;
}

interface DriverCardProps {
    info: DriverInfo;
    mode: 'active' | 'completed';
    setPage?: (page: any) => void;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'RUB' 
    }).format(amount).replace('₽', '₽ ');
}

export const DriverCard = ({ info, mode, setPage }: DriverCardProps) => {
    
    const handleChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (setPage) {
            setPage({ ...info, type: "chat" });
        }
    };

    const handleAccept = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            const res = await getData("setInv", {
                token: Store.getState().login.token,
                id: info.guid,
                status: "Принято"
            });
            
            if (res.success) {
                exec("getInv", { 
                    token: Store.getState().login.token, 
                    guid: info.cargo 
                }, "invoices");
            }
        } catch (error) {
            console.error("Ошибка при принятии заказа:", error);
        }
    };

    const handleReject = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            const res = await getData("setInv", {
                token: Store.getState().login.token,
                id: info.guid,
                status: "Отказано"
            });
            
            if (res.success) {
                exec("getInv", { 
                    token: Store.getState().login.token, 
                    guid: info.cargo 
                }, "invoices");
            }
        } catch (error) {
            console.error("Ошибка при отказе от заказа:", error);
        }
    };

    const shouldShowAcceptButton = mode === 'active' && !info.accepted;
    const shouldShowRejectButton = mode === 'active' || mode === 'completed';

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

                {shouldShowAcceptButton && (
                    <IonButton
                        className="w-50 cr-button-1"
                        mode="ios"
                        color="primary"
                        onClick={handleAccept}
                    >
                        <span className="ml-1 fs-08">Выбрать</span>
                    </IonButton>
                )}

                {shouldShowRejectButton && (
                    <IonButton
                        className="w-50 cr-button-1"
                        mode="ios"
                        color="warning"
                        onClick={handleReject}
                    >
                        <span className="ml-1 fs-08">Отказать</span>
                    </IonButton>
                )}
            </div>
        </div>
    );
};

// 4. ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ СЕКЦИЙ
export const InvoiceSection = ({ title, invoices, mode, setPage }: {
    title: string;
    invoices: DriverInfo[];
    mode: 'active' | 'completed';
    setPage?: (page: any) => void;
}) => {
    if (invoices.length === 0) return null;

    return (
        <>
            <div className="ml-1 mt-1">
                <b><strong>{title} ({invoices.length})</strong></b>
            </div>
            {invoices.map((invoice, index) => (
                <DriverCard 
                    key={invoice.guid || index}
                    info={invoice} 
                    mode={mode} 
                    setPage={setPage} 
                />
            ))}
        </>
    );
};

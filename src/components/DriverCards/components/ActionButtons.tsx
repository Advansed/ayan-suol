import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { chatboxEllipsesOutline } from 'ionicons/icons';
import { ActionButtonsProps } from '../types';

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    mode,
    isLoading,
    canComplete,
    onAccept,
    onReject,
    onComplete,
    onChat
}) => {
    const renderButtons = () => {
        switch (mode) {
            case 'offered':
                return (
                    <>
                        <IonButton
                            className="w-50 cr-button-2"
                            mode="ios"
                            fill="clear"
                            color="primary"
                            onClick={onChat}
                            disabled={isLoading}
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className="w-50 cr-button-1"
                            mode="ios"
                            color="primary"
                            onClick={onAccept}
                            disabled={isLoading}
                        >
                            <span className="ml-1 fs-08">Выбрать</span>
                        </IonButton>

                        <IonButton
                            className="w-50 cr-button-1"
                            mode="ios"
                            color="warning"
                            onClick={onReject}
                            disabled={isLoading}
                        >
                            <span className="ml-1 fs-08">Отказать</span>
                        </IonButton>
                    </>
                );

            case 'assigned':
                return (
                    <>
                        <IonButton
                            className="w-50 cr-button-2"
                            mode="ios"
                            fill="clear"
                            color="primary"
                            onClick={onChat}
                            disabled={isLoading}
                        >
                            <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                            <span className="ml-1 fs-08">Чат</span>
                        </IonButton>

                        <IonButton
                            className="w-50 cr-button-1"
                            mode="ios"
                            color="warning"
                            onClick={onReject}
                            disabled={isLoading}
                        >
                            <span className="ml-1 fs-08">Отказать</span>
                        </IonButton>
                    </>
                );

            case 'delivered':
                return (
                    <IonButton
                        mode="ios"
                        color="primary"
                        expand="block"
                        disabled={!canComplete || isLoading}
                        onClick={onComplete}
                        style={{
                            '--background': canComplete ? '' : '#e0e0e0',
                            '--color': canComplete ? '' : '#999'
                        }}
                    >
                        <span className="fs-08">
                            {isLoading ? 'Подтверждение...' : 'Подтвердить выполнение заказа'}
                        </span>
                    </IonButton>
                );

            case 'completed':
                return (
                    <IonButton
                        className="w-50 cr-button-2"
                        mode="ios"
                        fill="clear"
                        color="primary"
                        onClick={onChat}
                        disabled={isLoading}
                    >
                        <IonIcon icon={chatboxEllipsesOutline} className="w-06 h-06"/>
                        <span className="ml-1 fs-08">Чат</span>
                    </IonButton>
                );

            default:
                return null;
        }
    };

    return (
        <div className="mt-1 flex">
            {renderButtons()}
        </div>
    );
};
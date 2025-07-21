import React, { useState, useRef, useCallback, useMemo } from "react";
import { useIonViewDidEnter, useIonViewDidLeave } from "@ionic/react";
import socketService from "./Sockets";
import { Store } from "./Store";
import { IonIcon, IonInput, IonRefresher, IonRefresherContent, useIonRouter } from "@ionic/react";
import './Chats.css'
import { arrowBackOutline } from "ionicons/icons";

interface ChatsProps {
    name: string;
}

// Мемоизированный компонент сообщения
const MessageComponent = React.memo(({ message, isSent, userInitials }: { 
    message: any; 
    isSent: boolean; 
    userInitials: string; 
}) => {
    if (isSent) {
        return (
            <div className="flex fl-space mt-05">
                <div></div>
                <div className="chat-sent">
                    <div className="flex fl-space">
                        <div className="circle w-2 h-2">{"Я"}</div>
                        <div className="mr-1">{message.time}</div>
                    </div>
                    <div className="mt-05">
                        {message.message}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex fl-space mt-05">
            <div className="chat-receipt">
                <div className="flex fl-space">
                    <div className="circle w-2 h-2">{userInitials}</div>
                    <div className="mr-1">{message.time}</div>
                </div>
                <div className="mt-05">
                    {message.message}
                </div>
            </div>
        </div>
    );
});

// Мемоизированный список сообщений  
const MessagesList = React.memo(({ info, userInitials }: { 
    info: any[]; 
    userInitials: string; 
}) => {
    return (
        <>
            {info.map((messageGroup: any, index: number) => (
                <div key={`group-${index}`} className="ml-1 mt-1">
                    <div className="fs-08">
                        {messageGroup.date}
                    </div>
                    {(messageGroup.message || []).map((msg: any, msgIndex: number) => (
                        <MessageComponent
                            key={`${messageGroup.date}-${msgIndex}`}
                            message={msg}
                            isSent={msg.sent}
                            userInitials={userInitials}
                        />
                    ))}
                </div>
            ))}
        </>
    );
});

// Мемоизированный заголовок чата
const ChatHeader = React.memo(({ onBack, userName, userInitials }: {
    onBack: () => void;
    userName: string;
    userInitials: string;
}) => {
    return (
        <div className="chat-header bg-2">
            <div onClick={onBack}>
                <IonIcon icon={arrowBackOutline} className="h-2 w-2 ml-1" />
            </div>
            <div className="cr-card">
                <div className="flex fl-space">
                    <div className="ml-05">
                        <div className="fs-09 cl-black">
                            <b>Информация о водителе</b>
                        </div>
                        <div className="fs-07 cl-gray">Контактное лицо</div>
                        <div className="cr-status-3">{userName}</div>
                    </div>
                    <div className="circle w-3 h-3 mr-05">
                        {userInitials}
                    </div>
                </div>
            </div>
        </div>
    );
});

// Мемоизированный футер чата
const ChatFooter = React.memo(({ 
    value, 
    onValueChange, 
    onSend, 
    onKeyUp
}: {
    value: string;
    onValueChange: (val: string) => void;
    onSend: () => void;
    onKeyUp: (e: any) => void;
}) => {
    return (
        <div className="chat-footer bg-2 pl-05 pr-05">
            <div className="l-input mr-1">
                <IonInput
                    type="text"
                    mode="ios"
                    value={value}
                    placeholder="Введите сообщение..."
                    onIonInput={(e) => onValueChange(e.detail.value as string)}
                    onKeyUp={onKeyUp}
                />
            </div>
            <button 
                onClick={onSend}
                disabled={!value.trim()}
                className="send-button"
                style={{
                    background: !value.trim() ? '#ccc' : 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '3em',
                    height: '3em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: !value.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '1.2em'
                }}
            >
                →
            </button>
        </div>
    );
});

export function Chats(props: ChatsProps) {
    const [info, setInfo] = useState<any>([]);
    const [value, setValue] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    
    const hist = useIonRouter();
    const socketRef = useRef<any>(null);

    // Мемоизируем разбор имени
    const { arr, userName, userInitials } = useMemo(() => {
        const arr = props.name.split(":");
        const userName = arr[2] || '';
        
        const jarr = userName.split(" ");
        let initials = "";
        jarr.forEach(elem => {
            initials = initials + elem.substring(0, 1);
        });
        
        return { arr, userName, userInitials: initials };
    }, [props.name]);

    // Мемоизируем параметры для сокета
    const socketParams = useMemo(() => ({
        token: Store.getState().login.token,
        recipient: arr[0],
        cargo: arr[1]
    }), [arr]);

    // Функция загрузки чата
    function loadChat() {
        const socket = socketService.getSocket();
        if (socket) {
            socket.emit("get_chat", socketParams);
        }
    }

    // Функция refresh
    function refresh(event: CustomEvent) {
        loadChat();
        event.detail.complete();
    }

    // Настройка сокет соединения
    const setupSocketConnection = useCallback(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        socketRef.current = socket;
        
        // Подписываемся на события чата
        const handleChatData = (res: any) => {
            if (res.success) {
                setInfo(res.data);
            } else {
                setInfo([]);
            }
        };

        const handleNewMessage = (res: any) => {
            loadChat();
        };

        socket.on("get_chat", handleChatData);
        socket.on("send_message", handleNewMessage);

        // Загружаем данные чата
        loadChat();
    }, [socketParams]);

    // Очистка ресурсов
    const cleanup = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.off("get_chat");
            socketRef.current.off("send_message");
        }
        setInfo([]);
        setValue("");
    }, []);

    // Мемоизированная функция отправки сообщения
    const sendMessage = useCallback(() => {
        if (!value.trim() || !socketRef.current) return;
        
        socketRef.current.emit("send_message", {
            token: Store.getState().login.token,
            cargo: arr[1],
            recipient: arr[0],
            message: value
        });
        
        setValue("");
    }, [value, arr]);

    // Мемоизированный обработчик нажатия Enter
    const handleKeyUp = useCallback((e: any) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    }, [sendMessage]);

    // Мемоизированный обработчик изменения значения
    const handleValueChange = useCallback((newValue: string) => {
        setValue(newValue);
    }, []);

    // Мемоизированный обработчик возврата
    const handleBack = useCallback(() => {
        hist.push("/tab2");
    }, [hist]);

    // Lifecycle хуки Ionic
    useIonViewDidEnter(() => {
        setIsVisible(true);
        setupSocketConnection();
    });

    useIonViewDidLeave(() => {
        setIsVisible(false);
        cleanup();
    });

    // Не отрисовываем компонент, если он не активен
    if (!isVisible) {
        return null;
    }

    return (
        <div>
            <ChatHeader 
                onBack={handleBack}
                userName={userName}
                userInitials={userInitials}
            />
            
            <div className="chat-body1 bg-2">
                <IonRefresher slot="fixed" onIonRefresh={refresh}>
                    <IonRefresherContent />
                </IonRefresher>
                <MessagesList info={info} userInitials={userInitials} />
            </div>
            
            <ChatFooter
                value={value}
                onValueChange={handleValueChange}
                onSend={sendMessage}
                onKeyUp={handleKeyUp}
            />
        </div>
    );
}

export default Chats;
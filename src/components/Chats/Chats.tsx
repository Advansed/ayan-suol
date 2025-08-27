import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useIonViewDidEnter, useIonViewDidLeave } from "@ionic/react";
import { IonIcon, IonRefresher, IonRefresherContent, useIonRouter } from "@ionic/react";
import { arrowBackOutline, sendSharp } from "ionicons/icons";
import { Store } from "../Store";
import socketService from "../Sockets";
import "./Chats.css";

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
                        <div className="chat-avatar chat-avatar-sent">Я</div>
                        <div className="chat-time">{message.time}</div>
                    </div>
                    <div className="chat-message-text">
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
                    <div className="chat-avatar chat-avatar-receipt">{userInitials}</div>
                    <div className="chat-time">{message.time}</div>
                </div>
                <div className="chat-message-text">
                    {message.message}
                </div>
            </div>
            <div></div>
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
                    <div className="chat-date-separator">
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

// Компонент пустого состояния
const EmptyState = React.memo(() => {
    return (
        <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">Начните общение</div>
        </div>
    );
});

// Мемоизированный заголовок чата
const ChatHeader = React.memo(({ onBack, userName, userInitials }: {
    onBack: () => void;
    userName: string;
    userInitials: string;
}) => {
    return (
        <div className="chat-header">
            <div className="chat-header-content">
                <div className="chat-header-back" onClick={onBack}>
                    <IonIcon icon={arrowBackOutline} />
                </div>
                <div className="chat-header-user">
                    <div className="chat-header-avatar">{userInitials}</div>
                    <div className="chat-header-name">{userName}</div>
                </div>
            </div>
        </div>
    );
});

// Мемоизированный футер с полем ввода
const ChatFooter = React.memo(({ value, onChange, onSend, onKeyPress }: {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onKeyPress: (e: React.KeyboardEvent) => void;
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Автоматическое изменение высоты textarea
    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [value, adjustHeight]);

    return (
        <div className="chat-footer">
            <div className="chat-input-container">
                <div className="chat-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        className="chat-input"
                        placeholder="Введите сообщение..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyPress={onKeyPress}
                        rows={1}
                    />
                </div>
                <button 
                    className={`chat-send-button ${!value.trim() ? 'chat-send-disabled' : ''}`}
                    onClick={onSend}
                    disabled={!value.trim()}
                >
                    <IonIcon icon={sendSharp} />
                </button>
            </div>
        </div>
    );
});

export function Chats(props: ChatsProps) {
    const [info, setInfo] = useState<any>([]);
    const [value, setValue] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    
    const hist = useIonRouter();
    const socketRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Прокрутка к последнему сообщению
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Функция загрузки чата
    const loadChat = useCallback(() => {
        const socket = socketService.getSocket();
        if (socket) {
            socket.emit("get_chat", socketParams);
        }
    }, [socketParams]);

    // Функция refresh
    const refresh = useCallback((event: CustomEvent) => {
        loadChat();
        event.detail.complete();
    }, [loadChat]);

    // Настройка сокет соединения
    const setupSocketConnection = useCallback(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        socketRef.current = socket;
        
        const handleChatData = (res: any) => {
            if (res.success) {
                setInfo(res.data);
                setTimeout(scrollToBottom, 100);
            } else {
                setInfo([]);
            }
        };

        const handleNewMessage = (res: any) => {
            loadChat();
        };

        socket.on("get_chat", handleChatData);
        socket.on("send_message", handleNewMessage);
        loadChat();
    }, [loadChat, scrollToBottom]);

    // Очистка ресурсов
    const cleanup = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.off("get_chat");
            socketRef.current.off("send_message");
        }
        setInfo([]);
        setValue("");
    }, []);

    // Отправка сообщения
    const sendMessage = useCallback(() => {
        if (!value.trim() || !socketRef.current) return;
        
        socketRef.current.emit("send_message", {
            token:          Store.getState().login.token,
            cargo:          arr[1],
            recipient:      arr[0],
            message:        value
        });
        
        setValue("");
        setTimeout(scrollToBottom, 100);
    }, [value, arr, scrollToBottom]);

    // Обработчик нажатия клавиш
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    // Обработчик изменения значения
    const handleValueChange = useCallback((newValue: string) => {
        setValue(newValue);
    }, []);

    // Обработчик возврата
    const handleBack = useCallback(() => {
        hist.push("/tab2");
    }, [hist]);

    // Lifecycle хуки
    useIonViewDidEnter(() => {
        setIsVisible(true);
        setupSocketConnection();
    });

    useIonViewDidLeave(() => {
        setIsVisible(false);
        cleanup();
    });

    if (!isVisible) {
        return null;
    }

    return (
        <div className="chat-container">
            <ChatHeader 
                onBack={handleBack}
                userName={userName}
                userInitials={userInitials}
            />
            
            <div className="chat-body">
                <IonRefresher slot="fixed" onIonRefresh={refresh}>
                    <IonRefresherContent />
                </IonRefresher>
                
                {info.length === 0 ? (
                    <EmptyState />
                ) : (
                    <MessagesList info={info} userInitials={userInitials} />
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <ChatFooter 
                value={value}
                onChange={handleValueChange}
                onSend={sendMessage}
                onKeyPress={handleKeyPress}
            />
        </div>
    );
}

export default Chats;
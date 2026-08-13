import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { IonIcon, useIonRouter } from "@ionic/react";
import { arrowBackOutline, cameraSharp, sendSharp } from "ionicons/icons";
import "./Chats.css";
import { useChats } from "../../Store/useChats";
import { chatActions } from "../../Store/chatStore";
import { loginGetters } from "../../Store/loginStore";
import { takePicture } from "../Files";
import { PhotoPreview } from "./PhotoPreview";
import { resolveImageSrc } from "../../utils/fileUpload";
import { useChatStore } from "../../Store/chatStore";

interface ChatsProps {
    name: string;
}

// Мемоизированный компонент сообщения
const MessageComponent = React.memo(({ message, isSent, userInitials, clickMessage }: { 
    message: any; 
    isSent: boolean; 
    userInitials: string; 
    clickMessage: (url: string) => void
}) => {
    const renderContent = () => {
        if (message.image) {
            const imageSrc = resolveImageSrc(message.image);
            return (
                <div className="chat-image-container"
                    onClick = { () => { clickMessage( imageSrc ) } }
                >
                    <img 
                        src={imageSrc} 
                        alt="Изображение" 
                        className="chat-image"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    {message.message && (
                        <div className="chat-message-text">
                            { message.message }
                        </div>
                    )}
                </div>
            );
        }
        
        return (
            <div className="chat-message-text">
                {message.message}
            </div>
        );
    };

    return (
        <div className={`chat-row ${isSent ? 'chat-row-sent' : 'chat-row-in'}`}>
            <div className={isSent ? 'chat-sent' : 'chat-receipt'}>
                {renderContent()}
                {message.time && <div className="chat-time">{message.time}</div>}
            </div>
        </div>
    );
});

// Компонент для создания фотографий с камеры
const ImageUploadButton = React.memo(({ onImageSelect }: { 
    onImageSelect: (image: any) => void; 
}) => {
    const handleTakePicture = useCallback(async () => {
        try {
            const image = await takePicture();
            
            if( image)
                onImageSelect( image.dataUrl );
            
        } catch (error) {
            console.error('Ошибка при создании фотографии:', error);
            alert('Не удалось создать фотографию');
        }
    }, [onImageSelect]);

    return (
        <button 
            type        = "button"
            className   = "chat-send-button"
            onClick     = { handleTakePicture }
            title       = "Сделать фото"
        >
            <IonIcon icon={ cameraSharp } className="chat-icon-2" color = "light" />
        </button>
    );
});

// Мемоизированный список сообщений  
const MessagesList = React.memo(({ messages, userInitials, clickMessage }: { 
    messages: any[]; 
    userInitials: string; 
    clickMessage: (url: string) => void
}) => {
    // Преобразуем плоский список сообщений в сгруппированный по датам
    const groupedMessages = useMemo(() => {
        const groups: any[] = [];
        let currentDate = '';
        let currentGroup: any = null;

        messages.forEach((msg) => {
            const messageDate = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : '';
            
            if (messageDate !== currentDate) {
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                currentDate = messageDate;
                currentGroup = {
                    date: messageDate,
                    messages: []
                };
            }
            
            if (currentGroup) {
                currentGroup.messages.push({
                    ...msg,
                    time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }) : '',
                    sent: msg.sender === loginGetters.getUserId()
                });
            }
        });

        if (currentGroup) {
            groups.push(currentGroup);
        }

        return groups;
    }, [messages]);

    return (
        <>
            {groupedMessages.map((messageGroup: any, index: number) => (
                <div key={`group-${index}`} className="chat-message-group">
                    <div className="chat-date-separator" data-date={messageGroup.date}>
                        {messageGroup.date}
                    </div>
                    {(messageGroup.messages || []).map((msg: any, msgIndex: number) => (
                        <MessageComponent
                            key             = { `${messageGroup.date}-${msgIndex}` }
                            message         = { msg }
                            isSent          = { msg.sent }
                            userInitials    = { userInitials }
                            clickMessage    = { clickMessage }
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
const ChatHeader = React.memo(({ onBack, userName, userInitials, subtitle }: {
    onBack: () => void;
    userName: string;
    userInitials: string;
    subtitle?: string;
}) => {
    return (
        <div className="chat-thread-header">
            <button type="button" className="chat-header-back chat-back-mobile-only" onClick={onBack} aria-label="Назад">
                <IonIcon icon={arrowBackOutline} />
            </button>
            <div className="chat-header-avatar">{userInitials}</div>
            <div className="chat-header-meta">
                <div className="chat-header-name">{userName || 'Чат'}</div>
                {subtitle && <div className="chat-header-sub">{subtitle}</div>}
            </div>
        </div>
    );
});

// Мемоизированный футер с полем ввода
const ChatFooter = React.memo(({ 
    value, 
    selectedImage, 
    onChange, 
    onSend, 
    onKeyPress, 
    onImageSelect 
}: {
    value: string;
    selectedImage:  string | null;
    onChange:       ( value: string ) => void;
    onSend:         ( ) => void;
    onKeyPress:     ( e: React.KeyboardEvent ) => void;
    onImageSelect:  ( dataUrl: string ) => void;
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
                {/* <ImageUploadButton onImageSelect={onImageSelect} /> */}
                
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
                    className   = { `chat-send-button ${!value.trim() && !selectedImage ? 'chat-send-disabled' : ''}` }
                    onClick     = { onSend}
                    disabled    = { !value.trim() && !selectedImage }
                >
                    <IonIcon icon={sendSharp}  className="chat-icon-1" />
                </button>
            </div>
        </div>
    );
});

export function Chats(props: ChatsProps) {
    const [value, setValue]                 = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);  
    const [isOpen, setOpen]                 = useState<string>("")
    const hist                              = useIonRouter();
    const messagesEndRef                    = useRef<HTMLDivElement>(null);

    const { 
        currentMessages,
        sendImage, 
        sendMessage, 
        loadMessages, 
        markAsRead,
        setCurrentChat,
        clearCurrentChat
    } = useChats();

    // Мемоизируем разбор имени
    const chats = useChatStore((s) => s.chats);

    const { recipient, cargo, userName, userInitials, orderLine } = useMemo(() => {
        const arr       = props.name.split(":");
        const recipient = arr[0] || '';
        const cargo     = arr[1] || '';
        const userName  = decodeURIComponent(arr.slice(2).join(':') || '');
        const stored = chats.find((c) => c.recipient === recipient && c.cargo === cargo);
        const cargoName = stored?.cargo_name || '';
        const orderId = cargo ? `ЗК-${String(cargo).slice(0, 6).toUpperCase()}` : '';
        const orderLine = orderId && cargoName ? `${orderId} · ${cargoName}` : cargoName || orderId;
        const initial = (userName || stored?.rec_name || '?').trim().charAt(0).toUpperCase();

        return {
            recipient,
            cargo,
            userName: userName || stored?.rec_name || '',
            userInitials: initial,
            orderLine,
        };
    }, [props.name, chats]);

    // Установка текущего чата при монтировании
    useEffect(() => {
        if (recipient && cargo) {
            chatActions.ensureChat(recipient, cargo, { rec_name: userName });
        }
        setCurrentChat(recipient, cargo);
        
        return () => {
            clearCurrentChat();
        };
    }, [recipient, cargo, userName, setCurrentChat, clearCurrentChat]);

    // Пометка сообщений как прочитанных
    useEffect(() => {
        if (currentMessages && currentMessages.length > 0) {
            const unreadMessages = currentMessages.filter(msg => !msg.isRead);
            if (unreadMessages.length > 0) {
                const guids = unreadMessages.map(msg => ({ guid: msg.id }));
                markAsRead(recipient, cargo, guids);
            }
        }
    }, [currentMessages, recipient, cargo, markAsRead]);

    // Прокрутка к последнему сообщению
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const handleImageSelect = useCallback(( image: string ) => {
        setSelectedImage( image );
    }, []);

    // Компонент предпросмотра изображения
    const ImagePreview = useMemo(() => {
        if (!selectedImage) return null;
        
        return (
            <div className="chat-image-preview">
                <img 
                    src = { selectedImage } 
                    alt = "Предпросмотр" 
                    className = "chat-preview-image"
                />
                <button 
                    className="chat-remove-image"
                    onClick={() => setSelectedImage(null)}
                    title="Удалить изображение"
                >
                    ×
                </button>
            </div>
        );
    }, [selectedImage]);
    
    // Загрузка сообщений (ручное обновление в шапке)
    // Загрузка при смене чата. loadMessages должен быть стабильным (useChats + useToast), иначе
    // после каждого ответа get_messages эффект срабатывает снова и уходит в цикл emit.
    useEffect(() => {
        loadMessages(recipient, cargo);
    }, [recipient, cargo, loadMessages]);

    // Отправка сообщения
    const handleSendMessage = useCallback(async () => {
        if (!value.trim() && !selectedImage) return;
        
        const success = await sendMessage( recipient, cargo, value.trim() || '', '');

        if (success) {
            setValue("");
            setSelectedImage(null);
            setTimeout(scrollToBottom, 100);
        }
    }, [value, selectedImage, recipient, cargo, sendMessage, scrollToBottom]);

    // Обработчик нажатия клавиш
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Обработчик изменения значения
    const handleValueChange = useCallback((newValue: string) => {
        setValue(newValue);
    }, []);

    // Обработчик возврата
    const handleBack = useCallback(() => {
        hist.push("/chats");
    }, [hist]);

    // Прокрутка при изменении сообщений
    useEffect(() => {
        if (currentMessages && currentMessages.length > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [currentMessages, scrollToBottom]);

    useEffect(() => {
        return () => {
            setValue("");
            setSelectedImage(null);
        };
    }, []);

    return (
        <div className="chat-container">
            <ChatHeader
                onBack={handleBack}
                userName={userName}
                userInitials={userInitials}
                subtitle={orderLine ? `В сети · ${orderLine}` : undefined}
            />
            {orderLine && (
                <div className="chat-order-banner">Заказ {orderLine}</div>
            )}

            <div className="chat-page-content">
                <div className="chat-body">
                    {ImagePreview}

                    {(!currentMessages || currentMessages.length === 0) && !selectedImage ? (
                        <EmptyState />
                    ) : (
                        <MessagesList
                            messages={currentMessages || []}
                            userInitials={userInitials}
                            clickMessage={(url: string) => setOpen(url)}
                        />
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="chat-page-footer">
                <ChatFooter
                    value={value}
                    selectedImage={selectedImage || null}
                    onChange={handleValueChange}
                    onSend={handleSendMessage}
                    onKeyPress={handleKeyPress}
                    onImageSelect={handleImageSelect}
                />
            </div>
            
            <PhotoPreview
                imageUrl = { isOpen }
                closeModal = { () => setOpen( "" ) }
            />
        </div>
    );
}

export default Chats;
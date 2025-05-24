import { useState, useRef, useEffect } from 'react';
import OrderCard from '../card/OrderCard';
import styles from './style.module.css';

const DriverChat = (props) => {
  const chat_ = [
    {
      guidId: 1,
      chatId: 3,
      userId: 2,
      receipentId: 3,
      userName: 'ИА',
      userType: 'client',
      message: 'Добрый день! Нам нужно перевезти промышленное оборудование из Москвы в Санкт-Петербург. Общий вес около 12 тонн. Готовы заплатить 120,000 ₽. Возможно ли организовать перевозку на 15 апреля?',
      status: true,
      send: true,
      created_at: '09:00:00',
    },
    {
      guidId: 2,
      chatId: 3,
      userId: 3,
      userName: 'Алексей',
      userType: 'employee',
      message: 'Здравствуйте! Да, я могу выполнить перевозку 15 апреля. У меня есть тягач Volvo с полуприцепом, опыт перевозки негабаритных грузов более 5 лет. Но стоимость будет 135,000 ₽, так как в этот день у меня уже есть предварительная договоренность на другой заказ.',
      status: true,
      send: false,
      created_at: '09:15:00',
    },
  ];

  const [chat, setChat] = useState(chat_);
  const [messageText, setMessageText] = useState('');
  const [priceOffer, setPriceOffer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messageInputRef = useRef(null);
  const messagesAreaRef = useRef(null);
  
  const userIdAccount = 3;
  const userNameAccount = 'Алексей';
  
  // const order = props.order;
  
  const chatInfo = {
    customerName: 'Иванов Алексей',
    customerShortName: 'ИА',
    customerRating: 4.9,
    customerReviews: 12,
  };

  // Автопрокрутка чата вниз при добавлении новых сообщений
  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const generateGuidId = () => {
    return Math.max(...chat.map(msg => msg.guidId)) + 1;
  };

  // Отправка обычного сообщения
  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage = {
      guidId: generateGuidId(),
      chatId: 3,
      userId: userIdAccount,
      receipentId: 2,
      userName: userNameAccount,
      userType: 'employee',
      message: messageText.trim(),
      status: true,
      send: false,
      created_at: getCurrentTime(),
    };

    setChat(prevChat => [...prevChat, newMessage]);
    setMessageText('');
    
    // Фокус обратно на поле ввода
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  // Отправка предложения цены
  const handleSendPriceOffer = async () => {
    const price = parseInt(priceOffer.replace(/\D/g, ''));
    
    if (!price || price <= 0) {
      alert('Введите корректную цену');
      return;
    }

    setIsLoading(true);

    const priceMessage = {
      guidId: generateGuidId(),
      chatId: 3,
      userId: userIdAccount,
      receipentId: 2,
      userName: userNameAccount,
      userType: 'employee',
      message: `Предлагаю цену: ${price.toLocaleString('ru-RU')} ₽`,
      status: true,
      send: false,
      created_at: getCurrentTime(),
      messageType: 'price_offer',
      priceValue: price
    };

    setChat(prevChat => [...prevChat, priceMessage]);
    setPriceOffer('');
    
    // Имитация отправки на сервер
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Обработка нажатия Enter в текстовом поле
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Форматирование цены при вводе
  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      setPriceOffer(parseInt(value).toLocaleString('ru-RU'));
    } else {
      setPriceOffer('');
    }
  };

  // Быстрые ответы
  const quickReplies = [
    'Согласен на условия',
    'Нужно обсудить детали',
    'Могу предложить другую дату',
    'Рассмотрю ваше предложение'
  ];

  const handleQuickReply = (replyText) => {
    setMessageText(replyText);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header} onClick={()=>{
        // props.info.type = "open"
        props.setPage( 0 );
      }}>
        <h1 className={styles.title}>Заказ ID 12460</h1>
      </header>
      
      <OrderCard
        type="new"
        price={120000}
        id="12460"
        from="Казань"
        to="Уфа"
        loadDate="01.04.2025"
        unloadDate="03.04.2025"
        buttonShow={false}
      />

      <section className={styles.customerInfo}>
        <div className={styles.customerCard}>
          <div>
            <b>Информация о заказчике</b>
            <div>Контактное лицо</div>
            <div className='flex gap-8px'>
              <p className={styles.customerName}>{chatInfo.customerName}</p>
              <p className={styles.rating}>⭐ {chatInfo.customerRating} ({chatInfo.customerReviews} отзывов)</p>
            </div>
            <button className={styles.reviewsButton}>Посмотреть отзывы</button>
          </div>
          <div className={styles.avatar}>{chatInfo.customerShortName}</div>
        </div>
      </section>

      <section 
        className={styles.messages} 
        id="messagesArea"
        ref={messagesAreaRef}
      >
        {chat.map((message, index) => (
          <div 
            key={message.guidId} 
            className={userIdAccount === message.userId ? styles.messageTo : styles.messageFrom}
          >
            <div className={styles.messageContent}>
              <div className={styles.avatarSmall}>
                {userIdAccount === message.userId 
                  ? userNameAccount.slice(0, 2) 
                  : message.userName.slice(0, 2)
                }
              </div>
              <div className={styles.messageText}>
                {message.messageType === 'price_offer' ? (
                  <div className={styles.priceOfferMessage}>
                    💰 {message.message}
                  </div>
                ) : (
                  message.message
                )}
                <div className={styles.messageTime}>
                  {message.created_at}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Быстрые ответы */}
      <div className={styles.quickReplies}>
        {quickReplies.map((reply, index) => (
          <button
            key={index}
            className={styles.quickReplyButton}
            onClick={() => handleQuickReply(reply)}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Секция предложения цены */}
      <div className={styles.actionSection}>
        <input 
          type="text" 
          className={styles.priceInput} 
          placeholder="Введите цену в ₽"
          value={priceOffer}
          onChange={handlePriceChange}
        />
        <button 
          className={styles.submitButton}
          onClick={handleSendPriceOffer}
          disabled={!priceOffer || isLoading}
        >
          {isLoading ? 'Отправка...' : 'Предложить цену'}
        </button>
      </div>

      {/* Секция ввода сообщения */}
      <div className={styles.messageInputSection}>
        <textarea 
          ref={messageInputRef}
          rows={3} 
          className={styles.messageInput} 
          placeholder="Введите сообщение..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isLoading}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default DriverChat;
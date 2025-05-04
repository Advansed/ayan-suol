// import OrderCard from '../../card/ordercard';
import OrderCard from '../../card/OrderCard';
import styles from './style.module.css';

export default function DriverChat() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* <button className={styles.backButton}>←</button> */}
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
              <p className={styles.customerName}>Иванов Алексей</p>
              <p className={styles.rating}>⭐ 4,9 (12 отзывов)</p>
            </div>
            <button className={styles.reviewsButton}>Посмотреть отзывы</button>
          </div>
          <div className={styles.avatar}>ИА</div>
        </div>
      </section>

      <section className={styles.messages}>
        <div className={styles.messageFrom}>
          <div className={styles.messageContent}>
            <div className={styles.avatarSmall}>ИА</div>
            Добрый день! Нам нужно перевезти промышленное оборудование из Москвы в Санкт-Петербург. Общий вес около 12 тонн. Готовы заплатить 120,000 ₽. Возможно ли организовать перевозку на 15 апреля?
          </div>
        </div>

        <div className={styles.messageTo}>
          <div className={styles.messageContent}>
            <div className={styles.avatarSmall}>Вы</div>
            Здравствуйте! Да, я могу выполнить перевозку 15 апреля. У меня есть тягач Volvo с полуприцепом, опыт перевозки негабаритных грузов более 5 лет. Но стоимость будет 135,000 ₽, так как в этот день у меня уже есть предварительная договоренность на другой заказ.
          </div>
        </div>
      </section>

      <div className={styles.actionSection}>
        <input type="text" className={styles.priceInput} placeholder="₽" />
        <button className={styles.submitButton}>Предложить цену 2 заявки</button>
      </div>
      <div className={styles.messageInputSection}>
        <textarea rows={3} type="text" className={styles.messageInput} placeholder="Введите сообщение..." />
        <button className={styles.sendButton}>➤</button>
      </div>
    </div>
  );
}

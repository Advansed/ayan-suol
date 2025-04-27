import styles from './style.module.css';

export default function DriverChat() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* <button className={styles.backButton}>←</button> */}
        <h1 className={styles.title}>Заказ ID 12460</h1>
      </header>

      <section className={styles.orderCard}>
        <div className={styles.status}>
          <span className={styles.newBadge}>Новый</span>
          <span className={styles.orderId}>ID:12460</span>
          <span className={styles.price}>₽ 120 000</span>
        </div>

        <div className={styles.routeInfo}>
          <div>
            <p className={styles.label}>Откуда:</p>
            <p className={styles.location}>Казань</p>
          </div>
          <div>
            <p className={styles.label}>Куда:</p>
            <p className={styles.location}>Уфа</p>
          </div>
          <div>
            <p className={styles.label}>Дата загрузки:</p>
            <p className={styles.date}>01.04.2025 13:00 - 15:00</p>
          </div>
          <div>
            <p className={styles.label}>Дата выгрузки:</p>
            <p className={styles.date}>03.04.2025 13:00 - 15:00</p>
          </div>
        </div>

        <div className={styles.detailsBox}>
          <p className={styles.detailsTitle}>Детали груза:</p>
          <p className={styles.detailsText}>
            Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.
          </p>
        </div>
      </section>

      <section className={styles.customerInfo}>
        <h2>Информация о заказчике</h2>
        <div className={styles.customerCard}>
          <div className={styles.avatar}>ИА</div>
          <div>
            <p className={styles.customerName}>Иванов Алексей</p>
            <p className={styles.rating}>⭐ 4,9 (12 отзывов)</p>
            <button className={styles.reviewsButton}>Посмотреть отзывы</button>
          </div>
        </div>
      </section>

      <section className={styles.messages}>
        <div className={styles.messageFrom}>
          <div className={styles.avatarSmall}>ИА</div>
          <div className={styles.messageContent}>
            Добрый день! Нам нужно перевезти промышленное оборудование из Москвы в Санкт-Петербург. Общий вес около 12 тонн. Готовы заплатить 120,000 ₽. Возможно ли организовать перевозку на 15 апреля?
          </div>
        </div>

        <div className={styles.messageTo}>
          <div className={styles.avatarSmall}>Вы</div>
          <div className={styles.messageContent}>
            Здравствуйте! Да, я могу выполнить перевозку 15 апреля. У меня есть тягач Volvo с полуприцепом, опыт перевозки негабаритных грузов более 5 лет. Но стоимость будет 135,000 ₽, так как в этот день у меня уже есть предварительная договоренность на другой заказ.
          </div>
        </div>
      </section>

      <div className={styles.actionSection}>
        <input type="text" className={styles.priceInput} placeholder="₽" />
        <button className={styles.submitButton}>Предложить цену 2 заявки</button>
      </div>
      <div className={styles.messageInputSection}>
        <input type="text" className={styles.messageInput} placeholder="Введите сообщение..." />
        <button className={styles.sendButton}>➤</button>
      </div>
    </div>
  );
}

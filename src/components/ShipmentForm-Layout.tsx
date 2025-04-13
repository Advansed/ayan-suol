// ShipmentForm.jsx
import React from 'react';
import styles from './ShipmentForm.module.css';

const ShipmentForm = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton}>←</button>
        <h1>Предложение для перевозки #12458</h1>
      </div>

      <div className={styles.statusSection}>
        <span className={styles.status}>Новый</span>
        <span className={styles.id}>ID: 12460</span>
        <span className={styles.price}>₽ 120 000</span>
      </div>

      <div className={styles.routeSection}>
        <h2>Перевозка промышленного оборудования</h2>
        <div className={styles.routeDetails}>
          <div className={styles.routePoint}>
            <span className={styles.label}>Откуда:</span>
            <span className={styles.value}>Казань</span>
            <span className={styles.date}>Дата загрузки: 01.04.2025 13:00-15:00</span>
          </div>
          <div className={styles.routePoint}>
            <span className={styles.label}>Куда:</span>
            <span className={styles.value}>Уфа</span>
            <span className={styles.date}>Дата выгрузки: 03.04.2025 13:00-15:00</span>
          </div>
        </div>
        <div className={styles.cargoDetails}>
          <p>Промышленное оборудование, общий вес около 15 тонн. Требуется тента с погрузчиком и опыт перевозки негабаритных грузов.</p>
        </div>
      </div>

      <div className={styles.cargoInfoSection}>
        <h2>Информация о грузе</h2>
        <div className={styles.cargoInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Вес (т)</span>
            <span className={styles.value}>15</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Объем (м³)</span>
            <span className={styles.value}>45</span>
          </div>
        </div>
      </div>

      <div className={styles.contactSection}>
        <h2>Информация о заказчике</h2>
        <div className={styles.contactInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Контактное лицо</span>
            <span className={styles.value}>Иванов Алексей</span>
          </div>
          <div className={styles.rating}>
            <span className={styles.stars}>★ 4,9 (12 отзывов)</span>
            <button className={styles.viewReviews}>Посмотреть отзывы</button>
          </div>
        </div>
      </div>

      <div className={styles.offerSection}>
        <h2>Ваше предложение</h2>
        <div className={styles.offerInput}>
          <span className={styles.label}>Предлагаемая цена (₽)</span>
          <input type="text" defaultValue="100 000" />
        </div>
        <div className={styles.calculation}>
          <div className={styles.calculationItem}>
            <span>Комиссия сервиса (5%)</span>
            <span>-5 000 ₽</span>
          </div>
          <div className={`${styles.calculationItem} ${styles.total}`}>
            <span>Вы получите</span>
            <span>95 000 ₽</span>
          </div>
        </div>
        <div className={styles.commentSection}>
          <textarea placeholder="Опишите детали вашего предложения, особенности транспорта или другую важную информацию"></textarea>
        </div>
      </div>

      <button className={styles.submitButton}>Отправить предложение за 3 заявки</button>
    </div>
  );
};

export default ShipmentForm;
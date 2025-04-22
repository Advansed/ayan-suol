import React from 'react';
import styles from './MyOrder.module.css';
// import { FaMapMarkerAlt } from 'react-icons/fa';

export function MyOrders(){
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Мои заказы</h2>

      <div className={styles.card}>
        <div className={styles.statusRow}>
          <span className={styles.status}>В работе</span>
          <span className={styles.id}>ID:12460</span>
          <span className={styles.price}>₽ 120 000</span>
        </div>

        <h3 className={styles.orderTitle}>Перевозка промышленного оборудования</h3>

        <div className={styles.locations}>
          <div>
            <p className={styles.label}>
                {/* <FaMapMarkerAlt color="#4285F4" /> */}
                 Откуда: <strong>Казань</strong></p>
            <p className={styles.date}>Дата загрузки: <strong>01.04.2025</strong> <span className={styles.time}>13:00 - 15:00</span></p>
          </div>
          <div>
            <p className={styles.label}>
                {/* <FaMapMarkerAlt color="#EA4335" /> */}
                 Куда: <strong>Уфа</strong></p>
            <p className={styles.date}>Дата выгрузки: <strong>03.04.2025</strong> <span className={styles.time}>13:00 - 15:00</span></p>
          </div>
        </div>

        <div className={styles.details}>
          <p><strong>Детали груза:</strong></p>
          <p>Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.</p>
        </div>

        <button className={styles.button}>Связаться с заказчиком</button>
      </div>
      <h2 className={styles.titleDone}>Выполенные заказы</h2>

      <div className={styles.card}>
        <div className={styles.statusRow}>
          <span className={styles.statusDone}>Выполненно</span>
          <span className={styles.id}>ID:12460</span>
          <span className={styles.price}>₽ 120 000</span>
        </div>

        <h3 className={styles.orderTitle}>Перевозка промышленного оборудования</h3>

        <div className={styles.locations}>
          <div>
            <p className={styles.label}>
                {/* <FaMapMarkerAlt color="#4285F4" /> */}
                 Откуда: <strong>Казань</strong></p>
            <p className={styles.date}>Дата загрузки: <strong>01.04.2025</strong> <span className={styles.time}>13:00 - 15:00</span></p>
          </div>
          <div>
            <p className={styles.label}>
                {/* <FaMapMarkerAlt color="#EA4335" /> */}
                 Куда: <strong>Уфа</strong></p>
            <p className={styles.date}>Дата выгрузки: <strong>03.04.2025</strong> <span className={styles.time}>13:00 - 15:00</span></p>
          </div>
        </div>

        <div className={styles.details}>
          <p><strong>Детали груза:</strong></p>
          <p>Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.</p>
        </div>

        <button className={styles.button}>Связаться с заказчиком</button>
      </div>
    </div>
  );
};

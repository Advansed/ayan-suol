import React from 'react';
import styles from './DriverCard.module.css';

const DriverCard = () => {
    return (
        <div className={styles.driverCard}>
            {/* <div className={styles.driverHeader}>Назначенные водители (2)</div> */}

            <div className={styles.driverInfo}>
                <div className={styles.driverAvatar}>Ават<br />арка</div>
                <div className={styles.driverNameRating}>
                    <span className={styles.driverName}>Иванов Сергей</span>
                    <span className={styles.driverRating}>⭐ 4.9 (12 отзывов)</span>
                </div>
                <div className={styles.driverPrice}>₽25 000</div>
            </div>

            <div className={styles.driverInfoRow}>
                🚚 <span className={styles.driverLabel}>&nbsp;Транспорт:</span>&nbsp;Тягач Volvo FH с полуприцепом
            </div>
            <div className={styles.driverInfoRow}>
                ⚖️ <span className={styles.driverLabel}>&nbsp;Грузоподъёмность:</span>&nbsp;5 тонн
            </div>
            <div className={styles.driverInfoRow}>
                📦 <span className={styles.driverLabel}>&nbsp;Выполнено заказов:</span>&nbsp;124
            </div>

            <div className={styles.driverComment}>
                <b>Комментарий водителя:</b><br />
                Промышленное оборудование, общий вес около 15 тонн. Требуется тягач с полуприцепом и опыт перевозки негабаритных грузов.
            </div>

            <button className={styles.driverButton}>
                💬 Связаться
            </button>
        </div>
    );
};

export default DriverCard;
